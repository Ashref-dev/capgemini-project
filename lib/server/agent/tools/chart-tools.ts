import { tool } from "ai"
import { z } from "zod"

// Tolerate models that emit a JSON-encoded string for an array field (observed with owl-alpha).
function coerceJsonArray<Schema extends z.ZodTypeAny>(arraySchema: Schema) {
  return z.preprocess((value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as unknown
      } catch {
        return value
      }
    }
    return value
  }, arraySchema)
}

export const createBarChart = tool({
  description: "Create a bar chart visualization. Use for comparing values across categories.",
  inputSchema: z.object({
    data: coerceJsonArray(
      z.array(
        z.object({
          xAxisLabel: z.string(),
          series: z.array(
            z.object({
              seriesName: z.string(),
              value: z.number(),
            })
          ),
        })
      )
    ),
    title: z.string(),
    description: z.string().optional(),
    yAxisLabel: z.string().optional(),
  }),
  execute: async (args) => args,
})

export const createLineChart = tool({
  description: "Create a line chart visualization. Use for trends over time or sequential comparisons.",
  inputSchema: z.object({
    data: coerceJsonArray(
      z.array(
        z.object({
          xAxisLabel: z.string(),
          series: z.array(
            z.object({
              seriesName: z.string(),
              value: z.number(),
            })
          ),
        })
      )
    ),
    title: z.string(),
    description: z.string().optional(),
    yAxisLabel: z.string().optional(),
  }),
  execute: async (args) => args,
})

export const createPieChart = tool({
  description: "Create a pie chart visualization. Use for proportions or distribution shares.",
  inputSchema: z.object({
    data: coerceJsonArray(
      z.array(
        z.object({
          label: z.string(),
          value: z.number(),
        })
      )
    ),
    title: z.string(),
    description: z.string().optional(),
  }),
  execute: async (args) => args,
})

export const createTable = tool({
  description: "Create an interactive table with sorting, filtering, and search. Use for displaying detailed data.",
  inputSchema: z.object({
    title: z.string(),
    description: z.string().optional(),
    columns: coerceJsonArray(
      z.array(
        z.object({
          key: z.string(),
          label: z.string(),
          type: z.enum(["string", "number", "date", "boolean"]).optional().default("string"),
        })
      )
    ),
    data: coerceJsonArray(
      z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])))
    ),
  }),
  execute: async (args) => args,
})
