export type EvaluationResult = { key: string; score: number | boolean; comment?: string }

export function correctnessEvaluator(args: {
  outputs: { answer: string; tools: string[] }
  referenceOutputs?: { contains?: string[]; tools?: string[]; citation?: boolean }
}): EvaluationResult {
  const ref = args.referenceOutputs ?? {}
  const out = args.outputs.answer.toLowerCase()
  const expected = ref.contains ?? []
  const matched = expected.filter((s) => out.includes(s.toLowerCase()))
  const score = expected.length === 0 ? 1 : matched.length / expected.length

  return {
    key: "correctness",
    score,
    comment: expected.length
      ? `Matched ${matched.length}/${expected.length}: ${matched.join(", ")}`
      : "No required substrings",
  }
}

export function toolUsageEvaluator(args: {
  outputs: { answer: string; tools: string[] }
  referenceOutputs?: { tools?: string[] }
}): EvaluationResult {
  const expectedTools = args.referenceOutputs?.tools ?? []

  if (expectedTools.length === 0) {
    return { key: "tool_usage", score: 1, comment: "No tools required" }
  }

  const calledSet = new Set(args.outputs.tools)
  const matched = expectedTools.filter((t) => calledSet.has(t))

  return {
    key: "tool_usage",
    score: matched.length / expectedTools.length,
    comment: `Called ${matched.length}/${expectedTools.length} expected tools (${matched.join(", ")})`,
  }
}

const CITATION_REGEX = /\[(partner|project)_document#\d+-chunk-\d+\]/i

export function citationEvaluator(args: {
  outputs: { answer: string; tools: string[] }
  referenceOutputs?: { citation?: boolean }
}): EvaluationResult {
  if (!args.referenceOutputs?.citation || !process.env.OPENROUTER_KEY) {
    return {
      key: "citation",
      score: 1,
      comment: args.referenceOutputs?.citation ? "Skipped because OPENROUTER_KEY is missing" : "Not required",
    }
  }

  const found = CITATION_REGEX.test(args.outputs.answer)

  return {
    key: "citation",
    score: found ? 1 : 0,
    comment: found ? "Citation found" : "No [docKind#docId-chunk-N] citation",
  }
}
