import type { UIMessage } from "ai"
import { and, desc, eq } from "drizzle-orm"

import { extractMessageText, extractToolParts } from "./message-utils"
import { db } from "@/lib/server/db/config"
import { chatMessages, chatThreads } from "@/lib/server/db/schema"

export async function ensureThreadForUser(userId: number, userType: string, messages: UIMessage[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")
  const fallbackTitle = extractMessageText(latestUserMessage ?? messages[0] ?? { id: "", role: "user", parts: [] })
    .slice(0, 80)
    .trim()

  const existingThread = await db
    .select({ id: chatThreads.id })
    .from(chatThreads)
    .where(and(eq(chatThreads.userId, userId), eq(chatThreads.userType, userType)))
    .orderBy(desc(chatThreads.updatedAt))
    .limit(1)

  if (existingThread[0]) {
    await db
      .update(chatThreads)
      .set({ updatedAt: new Date() })
      .where(eq(chatThreads.id, existingThread[0].id))

    return existingThread[0].id
  }

  const inserted = await db
    .insert(chatThreads)
    .values({
      userId,
      userType,
      title: fallbackTitle || "New partnership conversation",
      updatedAt: new Date(),
    })
    .returning({ id: chatThreads.id })

  return inserted[0].id
}

export async function persistIncomingMessages(threadId: number, messages: UIMessage[]) {
  const existingRows = await db
    .select({ id: chatMessages.id, role: chatMessages.role, content: chatMessages.content })
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(chatMessages.id)

  const existingSignatures = new Set(existingRows.map((row) => `${row.role}:${row.content ?? ""}`))

  const values = messages
    .map((message) => {
      const content = extractMessageText(message) || null
      const parts = extractToolParts(message)

      return {
        role: message.role,
        content,
        parts: parts.length > 0 ? parts : null,
      }
    })
    .filter((message) => {
      const signature = `${message.role}:${message.content ?? ""}`

      if (existingSignatures.has(signature)) {
        return false
      }

      existingSignatures.add(signature)
      return message.content || message.parts
    })
    .map((message) => ({
      threadId,
      role: message.role,
      content: message.content,
      parts: message.parts,
    }))

  if (values.length > 0) {
    await db.insert(chatMessages).values(values)
  }
}

export async function persistAssistantResponse(threadId: number, responseMessages: Array<{ role: string; content?: string | null; parts?: unknown }>) {
  const values = responseMessages
    .filter((message) => message.role === "assistant" || message.role === "tool")
    .map((message) => ({
      threadId,
      role: message.role,
      content: message.content ?? null,
      parts: message.parts ?? null,
    }))

  if (values.length > 0) {
    await db.insert(chatMessages).values(values)
    await db.update(chatThreads).set({ updatedAt: new Date() }).where(eq(chatThreads.id, threadId))
  }
}
