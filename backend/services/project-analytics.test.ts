import { describe, expect, it } from "bun:test"

import * as analytics from "./project-analytics"

const missingProjectId = 99999

async function expectRejectsWithMessage(action: () => Promise<unknown>, expectedMessage: string): Promise<void> {
  let thrownError: unknown = null

  try {
    await action()
  } catch (error) {
    thrownError = error
  }

  expect(thrownError).toBeInstanceOf(Error)
  expect((thrownError as Error).message).toContain(expectedMessage)
}

describe("project-analytics", () => {
  it("analyzeProjectHealth throws for nonexistent project", async () => {
    await expectRejectsWithMessage(() => analytics.analyzeProjectHealth(missingProjectId), "not found")
  })

  it("identifyAtRiskProjects returns an array", async () => {
    const result = await analytics.identifyAtRiskProjects()

    expect(Array.isArray(result)).toBe(true)
  })

  it("forecastProjectDelay throws for nonexistent project", async () => {
    await expectRejectsWithMessage(() => analytics.forecastProjectDelay(missingProjectId), "not found")
  })

  it("recommendStaffing throws for nonexistent project", async () => {
    await expectRejectsWithMessage(() => analytics.recommendStaffing(missingProjectId), "not found")
  })

  it("findCriticalPath throws for nonexistent project", async () => {
    await expectRejectsWithMessage(() => analytics.findCriticalPath(missingProjectId), "not found")
  })

  it("crossEntityAnalysis throws when no IDs are given", async () => {
    await expectRejectsWithMessage(() => analytics.crossEntityAnalysis({}), "at least one")
  })

  it("exports callable analytics functions", () => {
    expect(typeof analytics.analyzeProjectHealth).toBe("function")
    expect(typeof analytics.identifyAtRiskProjects).toBe("function")
    expect(typeof analytics.forecastProjectDelay).toBe("function")
    expect(typeof analytics.recommendStaffing).toBe("function")
    expect(typeof analytics.findCriticalPath).toBe("function")
    expect(typeof analytics.crossEntityAnalysis).toBe("function")
  })
})
