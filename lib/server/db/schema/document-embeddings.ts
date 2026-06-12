import { pgTable, serial, varchar, integer, text, timestamp, vector, index } from "drizzle-orm/pg-core"

export const documentEmbeddings = pgTable("document_embeddings", {
  id: serial("id").primaryKey(),
  sourceKind: varchar("source_kind", { length: 20 }).notNull(),
  documentId: integer("document_id").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  chunkText: text("chunk_text").notNull(),
  embedding: vector("embedding", { dimensions: 2048 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("document_embeddings_source_doc_idx").on(t.sourceKind, t.documentId),
])

export type DocumentEmbedding = typeof documentEmbeddings.$inferSelect
export type NewDocumentEmbedding = typeof documentEmbeddings.$inferInsert
