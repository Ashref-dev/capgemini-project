import { describe, expect, it } from "bun:test"
import type { UIMessage } from "ai"

import {
  isPlanPayload,
  selectCurrentStep,
  selectLatestPlan,
  type PlanModel,
} from "./plan-selector"

type MessagePart = UIMessage["parts"][number]

const textPart = (text: string): MessagePart => ({
  type: "text",
  text,
})

const planPart = (output: unknown, toolCallId: string): MessagePart => ({
  type: "tool-createPlan",
  toolCallId,
  state: "output-available",
  input: {},
  output,
})

const dynamicPlanPart = (output: unknown, toolCallId: string): MessagePart => ({
  type: "dynamic-tool",
  toolName: "createPlan",
  toolCallId,
  state: "output-available",
  input: {},
  output,
})

const assistantMessage = (id: string, parts: MessagePart[]): UIMessage => ({
  id,
  role: "assistant",
  parts,
})

const discoveryPlan: PlanModel = {
  objective: "Analyser le portefeuille",
  steps: [
    { id: "step-1", title: "Collecter les données", status: "pending" },
    { id: "step-2", title: "Calculer les scores", status: "pending", note: "Priorité élevée" },
  ],
}

const deliveryPlan: PlanModel = {
  objective: "Préparer la synthèse",
  steps: [
    { id: "step-1", title: "Vérifier les risques", status: "completed" },
    { id: "step-2", title: "Rédiger les recommandations", status: "in_progress" },
  ],
}

describe("selectLatestPlan", () => {
  it("returns null when no createPlan tool part exists", () => {
    const messages = [assistantMessage("message-1", [textPart("Bonjour")])]

    const plan = selectLatestPlan(messages)

    expect(plan).toBeNull()
  })

  it("returns a single valid plan from a modern createPlan tool part", () => {
    const messages = [assistantMessage("message-1", [textPart("Analyse"), planPart(discoveryPlan, "call-1")])]

    const plan = selectLatestPlan(messages)

    expect(plan).toEqual(discoveryPlan)
  })

  it("returns the newest valid plan across messages", () => {
    const messages = [
      assistantMessage("message-1", [planPart(discoveryPlan, "call-1")]),
      assistantMessage("message-2", [dynamicPlanPart(deliveryPlan, "call-2")]),
    ]

    const plan = selectLatestPlan(messages)

    expect(plan).toEqual(deliveryPlan)
  })
})

describe("selectCurrentStep", () => {
  it("prefers the first in-progress step over pending steps", () => {
    const plan: PlanModel = {
      objective: "Suivre le plan",
      steps: [
        { id: "step-1", title: "Terminer la collecte", status: "pending" },
        { id: "step-2", title: "Analyser les tendances", status: "in_progress" },
      ],
    }

    const current = selectCurrentStep(plan)

    expect(current).toEqual({
      step: plan.steps[1],
      index: 1,
      total: 2,
      completed: 0,
      done: false,
    })
  })

  it("selects the first step when every step is pending", () => {
    const current = selectCurrentStep(discoveryPlan)

    expect(current).toEqual({
      step: discoveryPlan.steps[0],
      index: 0,
      total: 2,
      completed: 0,
      done: false,
    })
  })

  it("marks the plan done and selects the last step when every step is completed", () => {
    const plan: PlanModel = {
      objective: "Finaliser",
      steps: [
        { id: "step-1", title: "Valider", status: "completed" },
        { id: "step-2", title: "Partager", status: "completed" },
      ],
    }

    const current = selectCurrentStep(plan)

    expect(current).toEqual({
      step: plan.steps[1],
      index: 1,
      total: 2,
      completed: 2,
      done: true,
    })
  })
})

describe("isPlanPayload", () => {
  it("rejects malformed plan payloads", () => {
    const malformedPayloads: unknown[] = [
      { objective: "", steps: [{ id: "step-1", title: "Collecter", status: "pending" }] },
      { objective: "Analyser", steps: [{ id: "step-1", status: "pending" }] },
      { objective: "Analyser", steps: [{ id: "step-1", title: "Collecter", status: "unknown" }] },
    ]

    const results = malformedPayloads.map(isPlanPayload)

    expect(results).toEqual([false, false, false])
  })
})
