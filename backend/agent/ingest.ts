import { and, eq } from "drizzle-orm"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { db } from "@/backend/db/config"
import { documentEmbeddings } from "@/backend/db/schema"
import { embedTexts } from "./embeddings"

export type SourceKind = "partner_document" | "project_document"

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1200,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", " ", ""],
})

/**
 * Ingest a document into the embeddings store.
 * Idempotent: existing chunks for (sourceKind, documentId) are deleted before insert.
 */
export async function ingestDocument(
  sourceKind: SourceKind,
  documentId: number,
  text: string,
): Promise<{ chunksInserted: number }> {
  if (!text || text.trim().length === 0) {
    return { chunksInserted: 0 }
  }

  await db
    .delete(documentEmbeddings)
    .where(
      and(
        eq(documentEmbeddings.sourceKind, sourceKind),
        eq(documentEmbeddings.documentId, documentId),
      ),
    )

  const chunks = await splitter.splitText(text)
  if (chunks.length === 0) return { chunksInserted: 0 }

  const embeddings = await embedTexts(chunks)
  if (embeddings.length !== chunks.length) {
    throw new Error(
      `ingestDocument: embedding count mismatch (${embeddings.length} vs ${chunks.length} chunks)`,
    )
  }

  const rows = chunks.map((chunkText, chunkIndex) => ({
    sourceKind,
    documentId,
    chunkIndex,
    chunkText,
    embedding: embeddings[chunkIndex]!,
  }))

  await db.insert(documentEmbeddings).values(rows)

  return { chunksInserted: rows.length }
}
