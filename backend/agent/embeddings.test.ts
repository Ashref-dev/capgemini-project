import { describe, it, expect } from "bun:test"
import { embedTexts, embedQuery, EmbeddingError, OPENROUTER_DIMENSIONS } from "./embeddings"

describe("embedTexts", () => {
  it("returns [] for empty array without HTTP call", async () => {
    const result = await embedTexts([])
    expect(result).toEqual([])
  })

  it("throws EmbeddingError when OPENROUTER_KEY is missing", async () => {
    const original = process.env.OPENROUTER_KEY
    delete process.env.OPENROUTER_KEY
    try {
      await expect(embedTexts(["hello"])).rejects.toThrow("OPENROUTER_KEY missing")
    } finally {
      if (original !== undefined) process.env.OPENROUTER_KEY = original
    }
  })
})

describe("embedQuery", () => {
  it("throws EmbeddingError on empty query", async () => {
    await expect(embedQuery("")).rejects.toThrow("query must be a non-empty string")
  })

  it("throws EmbeddingError when OPENROUTER_KEY is missing", async () => {
    const original = process.env.OPENROUTER_KEY
    delete process.env.OPENROUTER_KEY
    try {
      await expect(embedQuery("hello")).rejects.toThrow("OPENROUTER_KEY missing")
    } finally {
      if (original !== undefined) process.env.OPENROUTER_KEY = original
    }
  })
})

describe("OPENROUTER_DIMENSIONS", () => {
  it("is 2048 (matches document_embeddings schema)", () => {
    expect(OPENROUTER_DIMENSIONS).toBe(2048)
  })
})

if (process.env.RUN_NETWORK_TESTS === "1" && process.env.OPENROUTER_KEY) {
  describe("embedTexts (network)", () => {
    it("returns 2048-dim vectors for real input", async () => {
      const result = await embedTexts(["hello world"])
      expect(result.length).toBe(1)
      expect(result[0]?.length).toBe(2048)
    }, 30_000)
  })
}
