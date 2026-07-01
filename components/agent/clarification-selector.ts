import type { UIMessage } from "ai"

export interface ClarificationModel {
  question: string
  reason?: string
  options: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getClarificationOutput(part: unknown): unknown | null {
  if (!isRecord(part) || part["state"] !== "output-available") {
    return null
  }

  if (part["type"] === "tool-askClarification") {
    return part["output"]
  }

  if (part["type"] === "dynamic-tool" && part["toolName"] === "askClarification") {
    return part["output"]
  }

  return null
}

function toClarification(output: unknown): ClarificationModel | null {
  if (!isRecord(output) || typeof output["question"] !== "string") {
    return null
  }

  const reason = typeof output["reason"] === "string" ? output["reason"] : undefined
  const rawOptions = output["options"]
  const options = Array.isArray(rawOptions)
    ? rawOptions.filter((option): option is string => typeof option === "string")
    : []

  return { question: output["question"], reason, options }
}

// Active only when the LAST message is the assistant's clarification: that is
// the single state where the agent is still waiting for a reply. Once the user
// answers (a newer message exists) it is no longer the last message, so the
// pinned chip disappears on its own.
export function selectActiveClarification(
  messages: ReadonlyArray<UIMessage>,
): ClarificationModel | null {
  const last = messages[messages.length - 1]

  if (!last || last.role !== "assistant") {
    return null
  }

  for (let partIndex = last.parts.length - 1; partIndex >= 0; partIndex -= 1) {
    const model = toClarification(getClarificationOutput(last.parts[partIndex]))

    if (model) {
      return model
    }
  }

  return null
}
