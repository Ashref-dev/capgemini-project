import { and, eq, sql } from "drizzle-orm"
import { db } from "@/lib/server/db/config"
import { documentEmbeddings } from "@/lib/server/db/schema"
import { embedQuery } from "./embeddings"
import type { SourceKind } from "./ingest"

export type SearchResult = {
  sourceKind: SourceKind
  documentId: number
  chunkIndex: number
  chunkText: string
  score: number
  citation: string
}

/**
 * Vector similarity search over document embeddings.
 * Returns top-K chunks ordered by cosine distance (smallest first = most similar).
 */
export async function searchDocuments(args: {
  query: string
  topK?: number
  sourceKind?: SourceKind
  documentId?: number
}): Promise<SearchResult[]> {
  const { query, topK = 6, sourceKind, documentId } = args

  if (!query || query.trim().length === 0) return []

  const queryEmbedding = await embedQuery(query)
  const filters = []

  if (sourceKind) filters.push(eq(documentEmbeddings.sourceKind, sourceKind))
  if (documentId !== undefined) filters.push(eq(documentEmbeddings.documentId, documentId))

  const distanceExpr = sql<number>`${documentEmbeddings.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`

  const rows = await db
    .select({
      sourceKind: documentEmbeddings.sourceKind,
      documentId: documentEmbeddings.documentId,
      chunkIndex: documentEmbeddings.chunkIndex,
      chunkText: documentEmbeddings.chunkText,
      distance: distanceExpr,
    })
    .from(documentEmbeddings)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(distanceExpr)
    .limit(Math.min(Math.max(topK, 1), 20))

  return rows.map((row) => ({
    sourceKind: row.sourceKind as SourceKind,
    documentId: row.documentId,
    chunkIndex: row.chunkIndex,
    chunkText: row.chunkText,
    score: Number((1 - Number(row.distance)).toFixed(4)),
    citation: `${row.sourceKind}#${row.documentId}-chunk-${row.chunkIndex}`,
  }))
}
