import * as hub from "langchain/hub/node"

let cached: { text: string; version: string; fetchedAt: number } | null = null
const CACHE_TTL_MS = 60_000
let warnedFallback = false

export async function loadSystemPrompt(localFallback: string): Promise<{ text: string; version: string }> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { text: cached.text, version: cached.version }
  }

  const apiKey = process.env.LANGSMITH_API_KEY
  if (!apiKey) {
    if (!warnedFallback) {
      console.warn("[prompt] LANGSMITH_API_KEY missing — using local SYSTEM_PROMPT fallback")
      warnedFallback = true
    }
    return { text: localFallback, version: "local" }
  }

  try {
    const promptName = process.env.LANGSMITH_PROMPT_NAME ?? "chatbot-system:production"
    const pulled = await hub.pull(promptName)

    let text: string
    if (typeof pulled === "string") {
      text = pulled
    } else if (pulled && typeof (pulled as { invoke?: unknown }).invoke === "function") {
      const rendered = await (pulled as { invoke: (input: object) => Promise<{ toString: () => string }> }).invoke({})
      text = rendered.toString()
    } else if (pulled && typeof (pulled as unknown as { template?: string }).template === "string") {
      text = (pulled as unknown as { template: string }).template
    } else {
      throw new Error("Unable to extract text from pulled prompt")
    }

    cached = { text, version: promptName, fetchedAt: Date.now() }
    return { text, version: promptName }
  } catch (error) {
    if (!warnedFallback) {
      console.warn("[prompt] LangSmith Hub pull failed, using local fallback:", error instanceof Error ? error.message : String(error))
      warnedFallback = true
    }
    return { text: localFallback, version: "local-fallback" }
  }
}
