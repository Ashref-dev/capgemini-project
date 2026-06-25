import { describe, expect, test } from "bun:test"

import { createBarChart, createPieChart, createTable } from "./chart-tools"

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

describe("chart-tools JSON-string coercion", () => {
  test("createBarChart parses a JSON-string data field", () => {
    const data = [
      { xAxisLabel: "BIAT", series: [{ seriesName: "Score", value: 40 }] },
      { xAxisLabel: "ESPRIT", series: [{ seriesName: "Score", value: 72 }] },
    ]
    const parsed = inputSchemaOf(createBarChart).parse({
      data: JSON.stringify(data),
      title: "Scores",
    }) as { data: unknown[] }

    expect(parsed.data).toHaveLength(2)
  })

  test("createBarChart still accepts a real array", () => {
    const parsed = inputSchemaOf(createBarChart).parse({
      data: [{ xAxisLabel: "BIAT", series: [{ seriesName: "Score", value: 40 }] }],
      title: "Scores",
    }) as { data: unknown[] }

    expect(parsed.data).toHaveLength(1)
  })

  test("createPieChart parses a JSON-string data field", () => {
    const parsed = inputSchemaOf(createPieChart).parse({
      data: JSON.stringify([
        { label: "Supplier", value: 11 },
        { label: "Customer", value: 8 },
      ]),
      title: "Répartition",
    }) as { data: unknown[] }

    expect(parsed.data).toHaveLength(2)
  })

  test("createTable parses JSON-string columns and data", () => {
    const parsed = inputSchemaOf(createTable).parse({
      title: "Comparatif",
      columns: JSON.stringify([{ key: "name", label: "Nom" }]),
      data: JSON.stringify([{ name: "BIAT" }]),
    }) as { columns: unknown[]; data: unknown[] }

    expect(parsed.columns).toHaveLength(1)
    expect(parsed.data).toHaveLength(1)
  })
})
