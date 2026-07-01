import * as aiSdk from "ai"; import { consumeStream, convertToModelMessages, type UIMessage } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"; import { and, eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { OPENROUTER_MODEL_ID } from "@/lib/server/agent/config"; import { buildMethodologyPrompt, selectMethodologies } from "@/lib/server/agent/methodologies"
import { extractResponseText, extractTextFromParts, extractTextFromUIMessage, markPartsAborted } from "@/lib/server/agent/message-utils"; import { formatOpenRouterError, getOpenRouterStatusCode } from "@/lib/server/agent/openrouter-errors"
import { ensureThreadForUser, persistAssistantResponse, persistIncomingMessages } from "@/lib/server/agent/persistence"; import { loadSystemPrompt } from "@/lib/server/agent/prompt"; import { SYSTEM_PROMPT } from "@/lib/server/agent/system-prompt"
import { tools } from "@/lib/server/agent/tools"; import { isRecord } from "@/lib/server/agent/utils"; import { getSessionUser } from "@/lib/server/auth/session"; import { db } from "@/lib/server/db/config"; import { chatMessages, chatThreads } from "@/lib/server/db/schema"

// Effectively unlimited agentic budget; per-tool timeouts and bounded queries prevent hangs.
const MAX_AGENT_STEPS = 1000

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_KEY! })
// LangSmith observability (tracing via wrapAISDK + provider options) was removed
// intentionally. To re-add it in the future, wrap `aiSdk` with LangSmith's
// `wrapAISDK` here and attach `createLangSmithProviderOptions` to streamText.

type PersistedAssistantPart = {
  type: string
  text?: string
  toolName?: string
  toolCallId?: string
  state?: string
  input?: unknown
  output?: unknown
  errorText?: string
  partial?: boolean
}

function getStringField(record: Record<string, unknown>, field: string) {
  const value = record[field]
  return typeof value === "string" ? value : undefined
}

function toPersistedAssistantPart(part: unknown): PersistedAssistantPart | null {
  if (!isRecord(part) || typeof part.type !== "string") return null
  if (part.type === "text") {
    const text = getStringField(part, "text")
    return text === undefined ? null : { type: "text", text }
  }

  const toolName = getStringField(part, "toolName")
  if (!toolName) return null

  const toolCallId = getStringField(part, "toolCallId")
  const toolPart = {
    type: part.dynamic === true ? "dynamic-tool" : `tool-${toolName}`,
    toolName,
    input: part.input,
    ...(toolCallId === undefined ? {} : { toolCallId }),
  }

  if (part.type === "tool-call") {
    return { ...toolPart, state: "input-available" }
  }

  if (part.type === "tool-result") {
    return { ...toolPart, state: "output-available", output: part.output }
  }

  if (part.type === "tool-error") {
    const errorText = part.error instanceof Error ? part.error.message : String(part.error ?? "Tool execution failed.")
    return { ...toolPart, state: "output-error", errorText }
  }

  return null
}

function mergePartialTextWithStepParts(text: string, parts: readonly PersistedAssistantPart[]) {
  if (parts.length === 0) {
    return [{ type: "text", text, partial: true }]
  }

  return [...parts.filter((part) => part.type !== "text"), { type: "text", text, partial: true }]
}

function toolStatePriority(state: string | undefined): number {
  if (state === "output-available" || state === "output-error") return 2
  if (state === "input-available") return 1
  return 0
}

// Key tool parts by toolCallId so a tool-result upgrades its tool-call in
// place: dedupes the call while preserving text/tool order for interleaving.
function mergeAssistantParts(
  existing: readonly PersistedAssistantPart[],
  incoming: readonly PersistedAssistantPart[]
): PersistedAssistantPart[] {
  const merged: PersistedAssistantPart[] = [...existing]
  const indexByToolCallId = new Map<string, number>()
  merged.forEach((part, index) => {
    if (typeof part.toolCallId === "string") indexByToolCallId.set(part.toolCallId, index)
  })

  for (const part of incoming) {
    if (typeof part.toolCallId === "string" && indexByToolCallId.has(part.toolCallId)) {
      const index = indexByToolCallId.get(part.toolCallId)!
      const current = merged[index]
      if (toolStatePriority(part.state) >= toolStatePriority(current.state)) {
        merged[index] = { ...current, ...part, input: part.input ?? current.input }
      }
      continue
    }

    if (typeof part.toolCallId === "string") {
      indexByToolCallId.set(part.toolCallId, merged.length)
    }
    merged.push(part)
  }

  return merged
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  if (!process.env.OPENROUTER_KEY) {
    return NextResponse.json({ error: "OPENROUTER_KEY is not configured" }, { status: 500 })
  }

  try {
    const body = (await req.json()) as { messages?: UIMessage[] }
    const incomingMessages = body.messages ?? []

    if (incomingMessages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    const userId = Number(user.sub)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user identifier" }, { status: 400 })
    }

    const threadId = await ensureThreadForUser(userId, user.userType, incomingMessages)
    await persistIncomingMessages(threadId, incomingMessages)

    const uiMessages = incomingMessages.map((msg) => ({
      ...msg,
      parts: msg.parts ?? [{ type: "text" as const, text: (msg as unknown as { content?: string }).content || "" }],
    }))

    const modelMessages = await convertToModelMessages(uiMessages, { tools })
    const { text: baseSystemPrompt } = await loadSystemPrompt(SYSTEM_PROMPT)
    const latestUserMessage = incomingMessages
      .slice()
      .reverse()
      .find((message) => message.role === "user")
    const userText = latestUserMessage ? extractTextFromUIMessage(latestUserMessage) : ""
    const matchedMethodologies = selectMethodologies(userText)
    const methodologyAddendum = buildMethodologyPrompt(matchedMethodologies)
    const finalSystemPrompt = baseSystemPrompt + methodologyAddendum

    if (matchedMethodologies.length > 0) {
      console.info(
        "[chat] methodology addendum injected:",
        matchedMethodologies.map((methodology) => methodology.id).join(", ")
      )
    }

    let assistantMessageId: string | null = null
    let accumulatedText = ""
    let accumulatedParts: PersistedAssistantPart[] = []

    const ensureAssistantMessageId = () => {
      assistantMessageId ??= `asst_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      return assistantMessageId
    }

    const upsertAssistantMessage = async (content: string, parts: unknown) => {
      await db
        .insert(chatMessages)
        .values({
          threadId,
          messageId: ensureAssistantMessageId(),
          role: "assistant",
          content,
          parts,
        })
        .onConflictDoUpdate({
          target: [chatMessages.threadId, chatMessages.messageId],
          targetWhere: sql`${chatMessages.messageId} is not null`,
          set: { content, parts },
        })
    }

    const result = aiSdk.streamText({
      model: openrouter.chat(OPENROUTER_MODEL_ID),
      system: finalSystemPrompt,
      messages: modelMessages,
      tools,
      abortSignal: req.signal,
      stopWhen: ({ steps }) => steps.length >= MAX_AGENT_STEPS,
      onChunk: async ({ chunk }) => {
        if (chunk.type !== "text-delta") {
          return
        }

        accumulatedText += chunk.text ?? ""

        try {
          await upsertAssistantMessage(accumulatedText, mergePartialTextWithStepParts(accumulatedText, accumulatedParts))
        } catch (error) {
          console.error("[chat] partial persistence failed:", error)
        }
      },
      onError: async ({ error }) => {
        console.error("OpenRouter stream error:", formatOpenRouterError(error), error)
      },
      onStepFinish: async (event) => {
        try {
          const stepParts = event.content.map(toPersistedAssistantPart).filter((part): part is PersistedAssistantPart => part !== null)
          accumulatedParts = mergeAssistantParts(accumulatedParts, stepParts)
          const stepContent = extractTextFromParts(accumulatedParts) || accumulatedText || event.text
          accumulatedText = stepContent || accumulatedText
          await upsertAssistantMessage(accumulatedText, accumulatedParts)
        } catch (error) {
          console.error("[chat] step persistence failed:", error)
        }
      },
      onAbort: async () => {
        if (!assistantMessageId) return

        try {
          const abortedParts = markPartsAborted(
            accumulatedParts.length > 0 ? accumulatedParts : [{ type: "text", text: accumulatedText, partial: true }],
            true
          )
          await upsertAssistantMessage(accumulatedText, abortedParts)
        } catch (error) {
          console.error("[chat] abort persistence failed:", error)
        }
      },
      onFinish: async (event) => {
        try {
          const eventRecord: unknown = event
          const isAborted = isRecord(eventRecord) && typeof eventRecord.isAborted === "boolean" ? eventRecord.isAborted : false

          if (assistantMessageId) {
            // Keep accumulatedParts: model response messages carry only raw
            // tool-call parts, so persisting those dropped charts on reload.
            const finalParts =
              accumulatedParts.length > 0 ? accumulatedParts : [{ type: "text", text: accumulatedText }]
            const finalContent = extractTextFromParts(finalParts) || accumulatedText

            await db
              .update(chatMessages)
              .set({
                content: finalContent,
                parts: markPartsAborted(finalParts, isAborted),
              })
              .where(and(eq(chatMessages.threadId, threadId), eq(chatMessages.messageId, assistantMessageId)))
          } else {
            const responseMessages = event.response.messages.map((message) => ({
              role: message.role,
              content: extractResponseText(message.content),
              parts: Array.isArray(message.content) ? message.content : null,
            }))
            await persistAssistantResponse(threadId, responseMessages)
          }

          await db.update(chatThreads).set({ updatedAt: new Date() }).where(eq(chatThreads.id, threadId))
        } catch (error) {
          console.error("[chat] onFinish persistence failed:", error)
        }
      },
    })

    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
      onError: formatOpenRouterError,
    })
  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json(
      { error: formatOpenRouterError(error) },
      { status: getOpenRouterStatusCode(error) ?? 500 }
    )
  }
}
