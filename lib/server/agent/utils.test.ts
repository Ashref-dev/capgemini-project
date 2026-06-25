import { describe, expect, it } from "bun:test"
import { withTimeout } from "./utils"

describe("withTimeout", () => {
  it("resolves with value when promise settles before deadline", async () => {
    const result = await withTimeout(Promise.resolve("ready"), 1_000, "fast task")

    expect(result).toBe("ready")
  })

  it("rejects with labeled timeout error when promise exceeds deadline", async () => {
    const neverSettles = new Promise<string>(() => {})

    await expect(withTimeout(neverSettles, 5, "slow task")).rejects.toThrow(
      "slow task timed out after 5ms"
    )
  })

  it("clears the timeout timer after the wrapped promise resolves", async () => {
    const result = await withTimeout(Promise.resolve(42), 60_000, "cleanup task")

    expect(result).toBe(42)
  })
})
