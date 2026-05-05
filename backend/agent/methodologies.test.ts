import { describe, it, expect } from "bun:test"
import {
  selectMethodologies,
  buildMethodologyPrompt,
  METHODOLOGIES,
} from "./methodologies"

describe("selectMethodologies", () => {
  it("returns Activity-Decay Churn for churn-related questions", () => {
    const result = selectMethodologies("can you compute churn risk for BIAT?")
    expect(result.map((m) => m.id)).toContain("activity-decay-churn")
  })

  it("returns Revenue Decomposition for revenue questions", () => {
    const result = selectMethodologies("show me revenue decomposition for Q3")
    expect(result.map((m) => m.id)).toContain("revenue-decomposition")
  })

  it("returns Margin Waterfall for margin questions", () => {
    expect(
      selectMethodologies("what's our margin?").map((m) => m.id)
    ).toContain("margin-waterfall")
  })

  it("returns multiple methodologies when message matches several", () => {
    const result = selectMethodologies(
      "compare the margin and churn between Vendor A and Vendor B"
    )
    const ids = result.map((m) => m.id)
    expect(ids).toContain("margin-waterfall")
    expect(ids).toContain("activity-decay-churn")
    expect(ids).toContain("vendor-performance-index")
  })

  it("returns [] for hello", () => {
    expect(selectMethodologies("hello")).toEqual([])
  })

  it("returns [] for empty string", () => {
    expect(selectMethodologies("")).toEqual([])
  })

  it("matches case-insensitive", () => {
    expect(
      selectMethodologies("CHURN RISK").map((m) => m.id)
    ).toContain("activity-decay-churn")
  })

  it("does not match substrings (whole-word only)", () => {
    expect(
      selectMethodologies("marginal benefit").map((m) => m.id)
    ).not.toContain("margin-waterfall")
  })
})

describe("buildMethodologyPrompt", () => {
  it("returns empty string when no matches", () => {
    expect(buildMethodologyPrompt([])).toBe("")
  })

  it("includes all chips and instructions when methodologies provided", () => {
    const matched = METHODOLOGIES.filter(
      (m) => m.id === "activity-decay-churn"
    )
    const prompt = buildMethodologyPrompt(matched)
    expect(prompt).toContain("Activity-Decay Churn")
    expect(prompt).toContain("declareMethodology")
    expect(prompt).toContain("Risk Scoring")
  })
})

describe("METHODOLOGIES registry integrity", () => {
  it("has 9 entries", () => {
    expect(METHODOLOGIES.length).toBe(9)
  })

  it("each entry has non-empty fields", () => {
    for (const m of METHODOLOGIES) {
      expect(m.id).toBeTruthy()
      expect(m.name).toBeTruthy()
      expect(m.triggerKeywords.length).toBeGreaterThan(0)
      expect(m.chips.length).toBeGreaterThan(0)
      expect(m.rationale.length).toBeGreaterThan(20)
      expect(m.instructions.length).toBeGreaterThan(80)
    }
  })

  it("all ids are unique", () => {
    const ids = METHODOLOGIES.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
