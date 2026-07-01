import { EVAL_DATASET, type EvalCase } from "./dataset"
import { citationEvaluator, correctnessEvaluator, toolUsageEvaluator, type EvaluationResult } from "./evaluators"

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

function numericScore(score: EvaluationResult["score"] | undefined): number {
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

// LangSmith experiment upload was removed intentionally. To re-add it in the
// future, push these local results to a LangSmith dataset/experiment here via
// the `langsmith` Client + `evaluate` from `langsmith/evaluation`.
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
  process.exit(passRate >= PASS_RATE_THRESHOLD ? 0 : 1)
}

void main().catch((error: unknown) => {
  console.error("[evals] Fatal:", error)
  process.exit(2)
})
