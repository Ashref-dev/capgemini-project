import { describe, expect, test } from "bun:test"

import { askClarification, declareMethodology } from "./meta-tools"

function inputSchemaOf(toolLike: unknown): { parse: (value: unknown) => unknown } {
  if (
    typeof toolLike === "object" &&
    toolLike !== null &&
    "inputSchema" in toolLike &&
    typeof (toolLike as { inputSchema: { parse?: unknown } }).inputSchema.parse === "function"
  ) {
    return (toolLike as { inputSchema: { parse: (value: unknown) => unknown } }).inputSchema
  }
  throw new Error("tool has no parseable inputSchema")
}

describe("meta-tools string-array coercion", () => {
  test("declareMethodology accepts a comma-separated assumptions string", () => {
    const parsed = inputSchemaOf(declareMethodology).parse({
      methodologies: ["Strategic-Fit Scoring", "Activity-Decay Churn Model"],
      rationale: "Multi-dimensional analysis across scoring and churn.",
      assumptions: "TND, fiscal year 2024, consolidated figures",
    }) as { assumptions: string[] }

    expect(parsed.assumptions).toEqual([
      "TND",
      "fiscal year 2024",
      "consolidated figures",
    ])
  })

  test("declareMethodology accepts a methodologies string", () => {
    const parsed = inputSchemaOf(declareMethodology).parse({
      methodologies: "Peer Benchmark; Revenue Decomposition",
      rationale: "Benchmark partners and decompose revenue.",
    }) as { methodologies: string[] }

    expect(parsed.methodologies).toEqual(["Peer Benchmark", "Revenue Decomposition"])
  })

  test("declareMethodology still accepts a proper array", () => {
    const parsed = inputSchemaOf(declareMethodology).parse({
      methodologies: ["Strategic-Fit Scoring"],
      rationale: "Single methodology is enough here.",
      assumptions: ["TND", "fiscal year 2024"],
    }) as { assumptions: string[] }

    expect(parsed.assumptions).toEqual(["TND", "fiscal year 2024"])
  })

  test("askClarification coerces an options string", () => {
    const parsed = inputSchemaOf(askClarification).parse({
      question: "Which period should I analyze?",
      reason: "The range is ambiguous.",
      options: "2023, 2024",
    }) as { options: string[] }

    expect(parsed.options).toEqual(["2023", "2024"])
  })
})
