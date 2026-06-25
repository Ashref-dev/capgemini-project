import { describe, expect, it } from "bun:test"
import { tool, type ToolExecutionOptions } from "ai"
import { z } from "zod"

import { withToolTimeout } from "./tool-timeout"

const toolOptions: ToolExecutionOptions = {
  toolCallId: "test-call",
  messages: [],
}

describe("withToolTimeout", () => {
  it("returns the French timeout error when execute exceeds the deadline", async () => {
    const slowTool = tool({
      description: "Slow test tool",
      inputSchema: z.object({ value: z.string() }),
      execute: async ({ value }) => {
        await new Promise((resolve) => setTimeout(resolve, 30))
        return { value }
      },
    })

    const wrappedTool = withToolTimeout("slowTool", slowTool, 5)

    const result = await wrappedTool.execute({ value: "delayed" }, toolOptions)

    expect(result).toEqual({ error: "L'outil a mis trop de temps à répondre. Veuillez réessayer." })
  })

  it("passes through normal execute results unchanged", async () => {
    const fastTool = tool({
      description: "Fast test tool",
      inputSchema: z.object({ value: z.string() }),
      execute: async ({ value }) => ({ value, status: "ready" }),
    })

    const wrappedTool = withToolTimeout("fastTool", fastTool, 1_000)

    const result = await wrappedTool.execute({ value: "instant" }, toolOptions)

    expect(result).toEqual({ value: "instant", status: "ready" })
  })
})
