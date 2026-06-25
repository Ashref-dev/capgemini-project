import { describe, expect, it } from "bun:test"
import type { UIMessage } from "ai"

import { groupToolParts } from "./tool-grouping"

type MessagePart = UIMessage["parts"][number]

const textPart = (text: string): MessagePart => ({
  type: "text",
  text,
})

const pendingToolPart = (toolName: string, toolCallId: string): MessagePart => ({
  type: `tool-${toolName}`,
  toolCallId,
  state: "input-available",
  input: { toolName },
})

const successfulToolPart = (toolName: string, toolCallId: string): MessagePart => ({
  type: `tool-${toolName}`,
  toolCallId,
  state: "output-available",
  input: { toolName },
  output: { ok: true },
})

const errorToolPart = (toolName: string, toolCallId: string): MessagePart => ({
  type: `tool-${toolName}`,
  toolCallId,
  state: "output-error",
  input: { toolName },
  errorText: "Tool execution failed.",
})

describe("groupToolParts", () => {
  it("groups three consecutive generic tool parts into one collapsible run", () => {
    const first = successfulToolPart("scorePartner", "call-1")
    const second = successfulToolPart("queryAnalytics", "call-2")
    const third = successfulToolPart("predictChurn", "call-3")

    const segments = groupToolParts([first, second, third])

    expect(segments).toEqual([
      {
        kind: "tool-run",
        parts: [first, second, third],
        collapsible: true,
      },
    ])
  })

  it("groups two consecutive generic tool parts into a non-collapsible run", () => {
    const first = successfulToolPart("queryPartners", "call-1")
    const second = successfulToolPart("getPartnerDetails", "call-2")

    const segments = groupToolParts([first, second])

    expect(segments).toEqual([
      {
        kind: "tool-run",
        parts: [first, second],
        collapsible: false,
      },
    ])
  })

  it("breaks generic tool runs when a rich tool part appears between them", () => {
    const before = successfulToolPart("queryPartners", "call-1")
    const rich = successfulToolPart("createTable", "call-2")
    const after = successfulToolPart("scorePartner", "call-3")

    const segments = groupToolParts([before, rich, after])

    expect(segments).toEqual([
      { kind: "tool-run", parts: [before], collapsible: false },
      { kind: "passthrough", part: rich },
      { kind: "tool-run", parts: [after], collapsible: false },
    ])
  })

  it("breaks generic tool runs when a text part appears between them", () => {
    const before = successfulToolPart("queryPartners", "call-1")
    const text = textPart("Voici les résultats intermédiaires.")
    const after = successfulToolPart("scorePartner", "call-2")

    const segments = groupToolParts([before, text, after])

    expect(segments).toEqual([
      { kind: "tool-run", parts: [before], collapsible: false },
      { kind: "passthrough", part: text },
      { kind: "tool-run", parts: [after], collapsible: false },
    ])
  })

  it("groups pending and error generic tool parts with successful generic parts", () => {
    const pending = pendingToolPart("queryAnalytics", "call-1")
    const failed = errorToolPart("predictChurn", "call-2")
    const succeeded = successfulToolPart("summarizePartnerPortfolio", "call-3")

    const segments = groupToolParts([pending, failed, succeeded])

    expect(segments).toEqual([
      {
        kind: "tool-run",
        parts: [pending, failed, succeeded],
        collapsible: true,
      },
    ])
  })
})
