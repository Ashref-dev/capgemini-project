import type { UIMessage } from "ai"

import { isRecord } from "./utils"

export type PersistedToolResult = {
  type: string
  toolCallId?: string
  input?: unknown
  output?: unknown
  state?: string
}

export function extractMessageText(message: UIMessage) {
  if (message.parts && message.parts.length > 0) {
    return message.parts
      .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim()
  }
  return (message as unknown as { content?: string }).content || ""
}

export function extractTextFromUIMessage(message: { parts?: Array<{ type: string; text?: string }>; content?: string }): string {
  if (typeof message.content === "string") return message.content
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text ?? "")
      .join("\n")
  }
  return ""
}

export function extractToolParts(message: UIMessage): PersistedToolResult[] {
  if (!message.parts) return []
  return message.parts
    .filter((part) => part.type.startsWith("tool-"))
    .map((part) => {
      const invocation = part as UIMessage["parts"][number] & {
        toolCallId?: string
        input?: unknown
        output?: unknown
        state?: string
      }

      return {
        type: part.type,
        toolCallId: invocation.toolCallId,
        input: invocation.input,
        output: invocation.output,
        state: invocation.state,
      }
    })
}

export function extractResponseText(content: unknown) {
  if (typeof content === "string") {
    return content
  }

  if (!Array.isArray(content)) {
    return null
  }

  return content
    .map((part) => {
      if (typeof part === "object" && part !== null && "type" in part && part.type === "text" && "text" in part && typeof part.text === "string") {
        return part.text
      }

      return null
    })
    .filter((part): part is string => part !== null)
    .join("\n")
}

export function extractTextFromParts(parts: unknown) {
  return extractResponseText(parts) ?? ""
}

export function markPartsAborted(parts: unknown, isAborted: boolean) {
  if (!isAborted || !Array.isArray(parts)) {
    return parts
  }

  return parts.map((part) => (isRecord(part) ? { ...part, aborted: true } : part))
}
