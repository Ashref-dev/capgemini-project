import { tool } from "ai"
import { z } from "zod"

// Weak models sometimes emit an array field as a JSON-encoded string, or as a
// single object instead of a one-element array. Tolerate both so a malformed
// tool call renders instead of failing validation.
function coerceJsonArray<Schema extends z.ZodTypeAny>(arraySchema: Schema) {
  return z.preprocess((value) => {
    let parsed: unknown = value

    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed) as unknown
      } catch {
        return parsed
      }
    }

    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return [parsed]
    }

    return parsed
  }, arraySchema)
}

const DATA_ARRAY_HINT = " Pass `data` as a real JSON array of objects, never as a stringified string."

export const createBarChart = tool({
  description: "Create a bar chart visualization. Use for comparing values across categories." + DATA_ARRAY_HINT,
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
  description: "Create a line chart visualization. Use for trends over time or sequential comparisons." + DATA_ARRAY_HINT,
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
  description: "Create a pie chart visualization. Use for proportions or distribution shares." + DATA_ARRAY_HINT,
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
  description: "Create an interactive table with sorting, filtering, and search. Use for displaying detailed data. Pass `columns` and `data` as real JSON arrays, never as stringified strings.",
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
