import { Client, type Example, type Run } from "langsmith"
import { evaluate, type EvaluationResult, type EvaluatorT } from "langsmith/evaluation"

import { EVAL_DATASET, type EvalCase } from "./dataset"
import { citationEvaluator, correctnessEvaluator, toolUsageEvaluator } from "./evaluators"

const BASE_URL = process.env.EVAL_BASE_URL ?? "http://localhost:3000"
const ADMIN_EMAIL = process.env.EVAL_USER_EMAIL ?? "karim.mejri@capgemini.com"
const ADMIN_PASSWORD = process.env.EVAL_USER_PASSWORD ?? "Capgemini2024!"
const PASS_RATE_THRESHOLD = 0.7

type AgentRunOutput = { answer: string; tools: string[] }
type StreamPayload = {
  type?: string
  text?: string
  toolName?: string
  delta?: string
}
type EvalRunResult = {
  case: EvalCase
  output: AgentRunOutput
  evaluations: EvaluationResult[]
  error?: string
}
type LangSmithEvaluatorArgs = {
  run: Run
  example: Example
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  referenceOutputs?: Record<string, unknown>
}

async function login(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      userType: "employee",
    }),
  })

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`)
  }

  const setCookie = res.headers.get("set-cookie")

  if (!setCookie) {
    throw new Error("No session cookie returned")
  }

  const match = setCookie.match(/session_token=[^;]+/)

  if (!match) {
    throw new Error("No session_token cookie")
  }

  return match[0]
}

function parseStreamPayload(payload: string): StreamPayload | null {
  try {
    const parsed: unknown = JSON.parse(payload)

    if (typeof parsed !== "object" || parsed === null) {
      return null
    }

    return parsed as StreamPayload
  } catch {
    return null
  }
}

function applyStreamPayload(parsed: StreamPayload, answerParts: string[], tools: Set<string>): void {
  if (parsed.type === "text-delta" && typeof parsed.delta === "string") {
    answerParts.push(parsed.delta)
    return
  }

  if (parsed.type === "text-delta" && typeof parsed.text === "string") {
    answerParts.push(parsed.text)
    return
  }

  if (parsed.type === "text" && typeof parsed.text === "string") {
    answerParts.push(parsed.text)
    return
  }

  if (parsed.type?.startsWith("tool-input-start") && parsed.toolName) {
    tools.add(parsed.toolName)
    return
  }

  if (parsed.type?.includes("tool") && parsed.toolName) {
    tools.add(parsed.toolName)
  }
}

function processStreamLine(line: string, answerParts: string[], tools: Set<string>): void {
  if (!line.startsWith("data: ")) {
    return
  }

  const payload = line.slice(6).trim()

  if (!payload || payload === "[DONE]") {
    return
  }

  const parsed = parseStreamPayload(payload)

  if (parsed) {
    applyStreamPayload(parsed, answerParts, tools)
  }
}

async function runAgent(question: string, cookie: string): Promise<AgentRunOutput> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      messages: [{ role: "user", content: question }],
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "<empty>")
    throw new Error(`Chat failed: ${res.status} ${body.slice(0, 200)}`)
  }

  const reader = res.body?.getReader()

  if (!reader) {
    throw new Error("No stream body")
  }

  const decoder = new TextDecoder()
  const tools = new Set<string>()
  const answerParts: string[] = []
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      processStreamLine(line, answerParts, tools)
    }
  }

  if (buffer) {
    processStreamLine(buffer, answerParts, tools)
  }

  return { answer: answerParts.join(""), tools: Array.from(tools) }
}

function buildFailureEvaluations(): EvaluationResult[] {
  return [
    { key: "correctness", score: 0 },
    { key: "tool_usage", score: 0 },
    { key: "citation", score: 0 },
  ]
}

function numericScore(score: EvaluationResult["score"]): number {
  if (typeof score === "number") {
    return score
  }

  if (typeof score === "boolean") {
    return score ? 1 : 0
  }

  return 0
}

function averageEvaluationScore(evaluations: EvaluationResult[]): number {
  if (evaluations.length === 0) {
    return 0
  }

  return evaluations.reduce((total, evaluation) => total + numericScore(evaluation.score), 0) / evaluations.length
}

function getEvaluationScore(evaluations: EvaluationResult[], key: string): number {
  return numericScore(evaluations.find((evaluation) => evaluation.key === key)?.score)
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const strings = value.filter((item): item is string => typeof item === "string")
  return strings.length === value.length ? strings : undefined
}

function coerceAgentRunOutput(outputs: Record<string, unknown>): AgentRunOutput {
  return {
    answer: typeof outputs.answer === "string" ? outputs.answer : "",
    tools: asStringArray(outputs.tools) ?? [],
  }
}

function coerceReferenceOutputs(referenceOutputs: Record<string, unknown> | undefined): EvalCase["expected"] {
  if (!referenceOutputs) {
    return {}
  }

  return {
    contains: asStringArray(referenceOutputs.contains),
    tools: asStringArray(referenceOutputs.tools),
    citation: typeof referenceOutputs.citation === "boolean" ? referenceOutputs.citation : undefined,
  }
}

function createLangSmithExamples(): Example[] {
  return EVAL_DATASET.map((evalCase) => ({
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    dataset_id: "local-intelliconnect-evals",
    inputs: evalCase.input,
    outputs: evalCase.expected,
    runs: [],
  }))
}

function printSummary(results: EvalRunResult[]): number {
  console.log("\n=== Eval Summary ===")
  console.log("ID                | correctness | tool_usage | citation | avg")
  console.log("------------------|-------------|------------|----------|------")

  let totalScore = 0
  let totalEvals = 0

  for (const result of results) {
    const correctness = getEvaluationScore(result.evaluations, "correctness")
    const toolUsage = getEvaluationScore(result.evaluations, "tool_usage")
    const citation = getEvaluationScore(result.evaluations, "citation")
    const avg = (correctness + toolUsage + citation) / 3
    totalScore += avg
    totalEvals += 1

    console.log(
      `${result.case.id.padEnd(18)}| ${correctness.toFixed(2).padStart(11)} | ${toolUsage
        .toFixed(2)
        .padStart(10)} | ${citation.toFixed(2).padStart(8)} | ${avg.toFixed(2)}`,
    )
  }

  const passRate = totalEvals > 0 ? totalScore / totalEvals : 0
  console.log("------------------|-------------|------------|----------|------")
  console.log(`Pass rate: ${(passRate * 100).toFixed(1)}%`)

  return passRate
}

async function pushToLangSmith(results: EvalRunResult[]): Promise<void> {
  if (!process.env.LANGSMITH_API_KEY || process.env.LANGSMITH_TRACING !== "true") {
    return
  }

  try {
    const client = new Client()
    console.log("\n[evals] Pushing results to LangSmith…")
    const langSmithCorrectnessEvaluator = ((args: LangSmithEvaluatorArgs) =>
      correctnessEvaluator({
        outputs: coerceAgentRunOutput(args.outputs),
        referenceOutputs: coerceReferenceOutputs(args.referenceOutputs),
      })) satisfies EvaluatorT
    const langSmithToolUsageEvaluator = ((args: LangSmithEvaluatorArgs) =>
      toolUsageEvaluator({
        outputs: coerceAgentRunOutput(args.outputs),
        referenceOutputs: coerceReferenceOutputs(args.referenceOutputs),
      })) satisfies EvaluatorT
    const langSmithCitationEvaluator = ((args: LangSmithEvaluatorArgs) =>
      citationEvaluator({
        outputs: coerceAgentRunOutput(args.outputs),
        referenceOutputs: coerceReferenceOutputs(args.referenceOutputs),
      })) satisfies EvaluatorT
    const langSmithEvaluators: EvaluatorT[] = [
      langSmithCorrectnessEvaluator,
      langSmithToolUsageEvaluator,
      langSmithCitationEvaluator,
    ]

    await evaluate(
      (inputs: { question: string }): Record<string, unknown> => {
        const result = results.find((candidate) => candidate.case.input.question === inputs.question)
        return result ? result.output : { answer: "", tools: [] }
      },
      {
        data: createLangSmithExamples(),
        evaluators: langSmithEvaluators,
        experimentPrefix: "intelliconnect-evals",
        client,
      },
    )
    console.log("[evals] LangSmith push complete")
  } catch (error) {
    console.warn("[evals] LangSmith push failed:", error instanceof Error ? error.message : String(error))
  }
}

async function main(): Promise<void> {
  console.log(`\n[evals] Starting eval run against ${BASE_URL}`)
  console.log(`[evals] Dataset: ${EVAL_DATASET.length} cases`)

  const cookie = await login()
  console.log(`[evals] Logged in as ${ADMIN_EMAIL}`)

  const results: EvalRunResult[] = []

  for (const evalCase of EVAL_DATASET) {
    process.stdout.write(`[evals] Running ${evalCase.id}... `)

    try {
      const output = await runAgent(evalCase.input.question, cookie)
      const evaluations = [
        correctnessEvaluator({ outputs: output, referenceOutputs: evalCase.expected }),
        toolUsageEvaluator({ outputs: output, referenceOutputs: evalCase.expected }),
        citationEvaluator({ outputs: output, referenceOutputs: evalCase.expected }),
      ]
      results.push({ case: evalCase, output, evaluations })
      console.log(`avg=${averageEvaluationScore(evaluations).toFixed(2)}`)
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error)
      console.log(`ERROR: ${err}`)
      results.push({
        case: evalCase,
        output: { answer: "", tools: [] },
        evaluations: buildFailureEvaluations(),
        error: err,
      })
    }
  }

  const passRate = printSummary(results)
  await pushToLangSmith(results)
  process.exit(passRate >= PASS_RATE_THRESHOLD ? 0 : 1)
}

void main().catch((error: unknown) => {
  console.error("[evals] Fatal:", error)
  process.exit(2)
})
