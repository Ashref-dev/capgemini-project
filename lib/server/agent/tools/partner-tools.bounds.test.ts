import { beforeEach, describe, expect, it, mock } from "bun:test"

import {
  clientPartners,
  marketingPartners,
  partnerEvents,
  partnerKpis,
  partnerMeetings,
  partners,
  partnerStatusHistory,
  technologyPartners,
  universityPartners,
} from "@/lib/server/db/schema"

type TableLabel =
  | "clientPartners"
  | "marketingPartners"
  | "partnerEvents"
  | "partnerKpis"
  | "partnerMeetings"
  | "partners"
  | "partnerStatusHistory"
  | "technologyPartners"
  | "universityPartners"
  | "unknown"

type PartnerRow = {
  readonly id: number
  readonly categories: string
  readonly name: string
  readonly legalName: string | null
  readonly description: string | null
  readonly partnerSubcategory: string | null
  readonly partnershipStatus: string | null
  readonly satisfactionScore: number | null
  readonly lastEventDate: string | null
}

class QueryTrace {
  public limitValue: number | null = null
  public whereApplied = false

  public constructor(
    public readonly projection: unknown,
    public table: TableLabel = "unknown"
  ) {}
}

const traces: QueryTrace[] = []

const partnerRows: readonly PartnerRow[] = Array.from({ length: 60 }, (_value, index) => ({
  id: index + 1,
  categories: index % 2 === 0 ? "supplier" : "university",
  name: `Partner ${String(index + 1).padStart(2, "0")}`,
  legalName: null,
  description: index === 0 ? "Cloud transformation and enterprise AI enablement" : "General partnership profile",
  partnerSubcategory: index === 0 ? "cloud" : null,
  partnershipStatus: "actif",
  satisfactionScore: 80,
  lastEventDate: "2026-06-01",
}))

function tableLabel(table: unknown): TableLabel {
  switch (table) {
    case clientPartners:
      return "clientPartners"
    case marketingPartners:
      return "marketingPartners"
    case partnerEvents:
      return "partnerEvents"
    case partnerKpis:
      return "partnerKpis"
    case partnerMeetings:
      return "partnerMeetings"
    case partners:
      return "partners"
    case partnerStatusHistory:
      return "partnerStatusHistory"
    case technologyPartners:
      return "technologyPartners"
    case universityPartners:
      return "universityPartners"
    default:
      return "unknown"
  }
}

function rowsForTable(table: TableLabel): readonly unknown[] {
  switch (table) {
    case "partners":
      return partnerRows
    case "universityPartners":
      return [{ partnerId: 1, institutionType: "Engineering school", specialties: ["cloud", "ai"] }]
    case "technologyPartners":
      return [{ partnerId: 1, vendorType: "Cloud", technologies: ["kubernetes"], certificationLevel: "gold", partnershipModel: "reseller" }]
    case "marketingPartners":
      return [{ partnerId: 1, marketingType: "events" }]
    case "clientPartners":
      return [{ partnerId: 1, industry: "banking", clientType: "enterprise" }]
    case "partnerEvents":
    case "partnerKpis":
    case "partnerMeetings":
    case "partnerStatusHistory":
    case "unknown":
      return []
  }
}

class QueryBuilder implements PromiseLike<readonly unknown[]> {
  private readonly trace: QueryTrace

  public constructor(projection: unknown) {
    this.trace = new QueryTrace(projection)
  }

  public from(table: unknown): this {
    this.trace.table = tableLabel(table)
    traces.push(this.trace)
    return this
  }

  public where(..._conditions: unknown[]): this {
    this.trace.whereApplied = true
    return this
  }

  public orderBy(..._columns: unknown[]): this {
    return this
  }

  public limit(value: number): this {
    this.trace.limitValue = value
    return this
  }

  public then<TResult1 = readonly unknown[], TResult2 = never>(
    onfulfilled?: ((value: readonly unknown[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.resolveRows()).then(onfulfilled, onrejected)
  }

  private resolveRows(): readonly unknown[] {
    const rows = rowsForTable(this.trace.table)
    return this.trace.limitValue === null ? rows : rows.slice(0, this.trace.limitValue)
  }
}

const db = {
  select: (projection?: unknown): QueryBuilder => new QueryBuilder(projection),
}

mock.module("@/lib/server/db/config", () => ({ db }))
mock.module("@/lib/server/db/dw-config", () => ({
  dwPool: {
    query: async (): Promise<{ readonly rows: readonly unknown[] }> => ({ rows: [] }),
  },
}))

function tracesFor(table: TableLabel): readonly QueryTrace[] {
  return traces.filter((trace) => trace.table === table)
}

describe("partner agent tool query bounds", () => {
  beforeEach(() => {
    traces.length = 0
  })

  it("predictChurn bounds the base partner query when partnerId is absent", async () => {
    const { predictChurn } = await import("./partner-tools")

    const result = await predictChurn.execute({ limit: 7 })

    expect(result).toHaveProperty("total", 7)
    expect(tracesFor("partners")[0]?.limitValue).toBe(7)
  })

  it("recommendPartners constrains subtype lookups to candidate partner IDs", async () => {
    const { recommendPartners } = await import("./partner-tools")

    const result = await recommendPartners.execute({ need: "cloud ai banking", limit: 5 })

    const subtypeTraces = [
      ...tracesFor("universityPartners"),
      ...tracesFor("technologyPartners"),
      ...tracesFor("marketingPartners"),
      ...tracesFor("clientPartners"),
    ]

    expect(result).toHaveProperty("need", "cloud ai banking")
    expect(tracesFor("partners")[0]?.limitValue).toBe(500)
    expect(subtypeTraces).toHaveLength(4)
    expect(subtypeTraces.every((trace) => trace.whereApplied)).toBe(true)
  })

  it("scorePartner returns one scored result per requested partner ID in batch mode", async () => {
    const { scorePartner } = await import("./partner-tools")

    const result = await scorePartner.execute({ partnerIds: [1, 2, 3] })

    if (typeof result !== "object" || result === null || !("partners" in result) || !Array.isArray(result.partners)) {
      throw new Error("Expected scorePartner batch mode to return a partners array")
    }

    const scoredPartnerIds = result.partners.map((partner) => {
      if (typeof partner !== "object" || partner === null || !("partnerId" in partner) || typeof partner.partnerId !== "number") {
        throw new Error("Expected each scored partner to include a numeric partnerId")
      }

      return partner.partnerId
    })

    expect(scoredPartnerIds).toEqual([1, 2, 3])
  })
})
