import { tool } from "ai"
import { z } from "zod"

// Tolerate models that emit a delimited string instead of a string array (observed with owl-alpha).
function coerceStringArray<Schema extends z.ZodTypeAny>(arraySchema: Schema) {
  return z.preprocess((value) => {
    if (typeof value === "string") {
      return value
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }
    return value
  }, arraySchema)
}

export const declareMethodology = tool({
  description:
    "Declare the analytical methodologies you will use BEFORE answering an analytical question. Use for scoring, churn, benchmarks, financial breakdowns, multi-step reports. Skip for trivial single-fact lookups.",
  inputSchema: z.object({
    methodologies: coerceStringArray(z.array(z.string().min(2)).min(1).max(6)).describe(
      "Short methodology names, e.g. 'Gross-to-Net Margin Waterfall', 'Strategic-Fit Scoring', 'Activity-Decay Churn Model'."
    ),
    rationale: z
      .string()
      .min(10)
      .describe("One-sentence reason why these methodologies fit the user's question."),
    assumptions: coerceStringArray(z.array(z.string()).default([])).describe(
      "Optional explicit assumptions (e.g. 'TND, fiscal year 2024', 'consolidated figures')."
    ),
  }),
  execute: async ({ methodologies, rationale, assumptions }) => ({
    methodologies,
    rationale,
    assumptions,
  }),
})

export const createPlan = tool({
  description:
    "Publish or update an ordered analysis plan as a checklist. Call once at the start with all steps in 'pending', then re-emit with updated statuses as you make progress. Use for any task with 3+ logical steps.",
  inputSchema: z.object({
    objective: z.string().min(5).describe("One-line objective of the analysis."),
    steps: z
      .array(
        z.object({
          id: z.string().min(1).describe("Stable id, e.g. 'identify-target', 'pull-financials'."),
          title: z.string().min(3).describe("Human-readable step title."),
          status: z
            .enum(["pending", "in_progress", "completed", "blocked"])
            .describe("Current state of this step."),
          note: z.string().optional().describe("Optional short note (e.g. why blocked)."),
        })
      )
      .min(2)
      .max(12),
  }),
  execute: async ({ objective, steps }) => ({ objective, steps }),
})

export const askClarification = tool({
  description:
    "Ask ONE targeted clarification when essential information is genuinely missing or ambiguous (date range, currency, scope, comparison universe, period type). NEVER use this to ask whether a named entity exists or to confirm its identity — call queryPartners (fuzzy search) and searchDocuments FIRST, and only consider an entity missing after a real search returns zero matches. After calling this tool, STOP — wait for the user reply before doing any more work.",
  inputSchema: z.object({
    question: z.string().min(5).describe("The single clarification question, plain language."),
    reason: z
      .string()
      .min(5)
      .describe("Why this question must be answered before proceeding."),
    options: coerceStringArray(z.array(z.string().min(1)).max(8))
      .optional()
      .describe("Optional shortlist of likely answers the UI will render as one-click chips."),
  }),
  execute: async ({ question, reason, options }) => ({ question, reason, options: options ?? [] }),
})
