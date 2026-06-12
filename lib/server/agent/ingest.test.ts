import { describe, expect, it } from "bun:test"
import { ingestDocument } from "./ingest"
import { searchDocuments } from "./rag"

describe("ingest module", () => {
  it("returns chunksInserted: 0 for empty text without DB call", async () => {
    const result = await ingestDocument("project_document", 99999, "")
    expect(result).toEqual({ chunksInserted: 0 })
  })

  it("returns chunksInserted: 0 for whitespace-only text", async () => {
    const result = await ingestDocument("project_document", 99999, "   \n   ")
    expect(result).toEqual({ chunksInserted: 0 })
  })
})

describe("rag module", () => {
  it("returns [] for empty query", async () => {
    const result = await searchDocuments({ query: "" })
    expect(result).toEqual([])
  })

  it("returns [] for whitespace query", async () => {
    const result = await searchDocuments({ query: "   " })
    expect(result).toEqual([])
  })
})

if (process.env.RUN_NETWORK_TESTS === "1" && process.env.OPENROUTER_KEY) {
  describe("ingest+search end-to-end (network)", () => {
    const TEST_DOC_ID = 88888
    const TEST_SOURCE = "project_document" as const

    it("ingests then searches a document", async () => {
      const text = "The Capgemini partnership with BIAT focuses on digital transformation and cloud migration. ".repeat(20)
      const ingested = await ingestDocument(TEST_SOURCE, TEST_DOC_ID, text)
      expect(ingested.chunksInserted).toBeGreaterThan(0)

      const results = await searchDocuments({
        query: "What does the BIAT partnership focus on?",
        topK: 3,
        sourceKind: TEST_SOURCE,
        documentId: TEST_DOC_ID,
      })
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.score).toBeGreaterThan(0)
      expect(results[0]?.citation).toMatch(/^project_document#88888-chunk-\d+$/)
    }, 60_000)

    it("re-ingest is idempotent (no duplicates)", async () => {
      const text = "Idempotency test content for re-ingestion. ".repeat(50)
      const first = await ingestDocument(TEST_SOURCE, TEST_DOC_ID, text)
      const second = await ingestDocument(TEST_SOURCE, TEST_DOC_ID, text)
      expect(first.chunksInserted).toBe(second.chunksInserted)
    }, 90_000)
  })
}
