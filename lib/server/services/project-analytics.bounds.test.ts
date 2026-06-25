import { beforeEach, describe, expect, it, mock } from "bun:test"

import { milestones, partners, projects, projectTasks } from "@/lib/server/db/schema"

type TableLabel = "milestones" | "partners" | "projects" | "projectTasks" | "unknown"

type ProjectSummaryRow = {
  readonly projectId: number
  readonly projectName: string
  readonly partnerName: string | null
}

type ProjectRow = {
  readonly id: number
  readonly name: string
  readonly status: string
  readonly startDate: string
  readonly endDate: string
  readonly percentComplete: number
  readonly updatedAt: Date
}

class QueryTrace {
  public limitValue: number | null = null

  public constructor(
    public readonly projection: unknown,
    public table: TableLabel = "unknown"
  ) {}
}

const traces: QueryTrace[] = []
let projectFetchCount = 0

const projectSummaries: readonly ProjectSummaryRow[] = Array.from({ length: 75 }, (_value, index) => ({
  projectId: index + 1,
  projectName: `Delivery Project ${index + 1}`,
  partnerName: `Partner ${index + 1}`,
}))

const projectRows: readonly ProjectRow[] = projectSummaries.map((row) => ({
  id: row.projectId,
  name: row.projectName,
  status: "on_hold",
  startDate: "2024-01-01",
  endDate: "2024-02-01",
  percentComplete: 0,
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
}))

function tableLabel(table: unknown): TableLabel {
  switch (table) {
    case milestones:
      return "milestones"
    case partners:
      return "partners"
    case projects:
      return "projects"
    case projectTasks:
      return "projectTasks"
    default:
      return "unknown"
  }
}

function hasProjectionKey(projection: unknown, key: string): boolean {
  return typeof projection === "object" && projection !== null && key in projection
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

  public leftJoin(..._joinArgs: unknown[]): this {
    return this
  }

  public where(..._conditions: unknown[]): this {
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
    if (this.trace.table === "projects" && hasProjectionKey(this.trace.projection, "projectId")) {
      return this.applyLimit(projectSummaries)
    }

    if (this.trace.table === "projects") {
      projectFetchCount += 1
      return projectRows.slice(0, 1)
    }

    return []
  }

  private applyLimit(rows: readonly unknown[]): readonly unknown[] {
    return this.trace.limitValue === null ? rows : rows.slice(0, this.trace.limitValue)
  }
}

const db = {
  select: (projection?: unknown): QueryBuilder => new QueryBuilder(projection),
}

mock.module("@/lib/server/db/config", () => ({ db }))

function projectSummaryTrace(): QueryTrace | undefined {
  return traces.find((trace) => trace.table === "projects" && hasProjectionKey(trace.projection, "projectId"))
}

describe("project analytics query bounds", () => {
  beforeEach(() => {
    traces.length = 0
    projectFetchCount = 0
  })

  it("identifyAtRiskProjects caps per-project health fan-out", async () => {
    const { identifyAtRiskProjects } = await import("./project-analytics")

    const result = await identifyAtRiskProjects()

    expect(projectSummaryTrace()?.limitValue).toBe(50)
    expect(projectFetchCount).toBe(50)
    expect(result).toHaveLength(20)
  })
})
