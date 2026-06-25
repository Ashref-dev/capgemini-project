import type { UIMessage } from "ai"

export type StepStatus = "pending" | "in_progress" | "completed" | "blocked"

export interface PlanStep {
  id: string
  title: string
  status: StepStatus
  note?: string
}

export interface PlanModel {
  objective: string
  steps: PlanStep[]
}

export interface CurrentStepInfo {
  step: PlanStep | null
  index: number
  total: number
  completed: number
  done: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isStepStatus(value: unknown): value is StepStatus {
  return (
    value === "pending" || value === "in_progress" || value === "completed" || value === "blocked"
  )
}

function isPlanStep(value: unknown): value is PlanStep {
  if (!isRecord(value)) {
    return false
  }

  const note = value["note"]

  return (
    typeof value["id"] === "string" &&
    typeof value["title"] === "string" &&
    isStepStatus(value["status"]) &&
    (note === undefined || typeof note === "string")
  )
}

export function isPlanPayload(value: unknown): value is PlanModel {
  if (!isRecord(value) || typeof value["objective"] !== "string") {
    return false
  }

  const steps = value["steps"]

  return value["objective"].trim().length > 0 && Array.isArray(steps) && steps.length > 0 && steps.every(isPlanStep)
}

function getCreatePlanOutput(part: unknown): unknown | null {
  if (!isRecord(part) || part["state"] !== "output-available") {
    return null
  }

  if (part["type"] === "tool-createPlan") {
    return part["output"]
  }

  if (part["type"] === "dynamic-tool" && part["toolName"] === "createPlan") {
    return part["output"]
  }

  return null
}

export function selectLatestPlan(messages: ReadonlyArray<UIMessage>): PlanModel | null {
  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const message = messages[messageIndex]

    if (!message) {
      continue
    }

    for (let partIndex = message.parts.length - 1; partIndex >= 0; partIndex -= 1) {
      const output = getCreatePlanOutput(message.parts[partIndex])

      if (isPlanPayload(output)) {
        return output
      }
    }
  }

  return null
}

export function selectCurrentStep(plan: PlanModel | null): CurrentStepInfo {
  if (!plan || plan.steps.length === 0) {
    return { step: null, index: -1, total: 0, completed: 0, done: false }
  }

  const total = plan.steps.length
  const completed = plan.steps.filter((step) => step.status === "completed").length
  const activeIndex = plan.steps.findIndex((step) => step.status === "in_progress")
  const currentIndex = activeIndex >= 0 ? activeIndex : plan.steps.findIndex((step) => step.status === "pending")

  if (currentIndex >= 0) {
    return {
      step: plan.steps[currentIndex] ?? null,
      index: currentIndex,
      total,
      completed,
      done: false,
    }
  }

  const doneIndex = total - 1

  return {
    step: plan.steps[doneIndex] ?? null,
    index: doneIndex,
    total,
    completed,
    done: true,
  }
}
