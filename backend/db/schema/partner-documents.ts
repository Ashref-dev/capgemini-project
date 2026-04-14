import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  bigint,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Partner documents table schema
 * Documents centralisés associés aux partenaires
 */
export const partnerDocuments = pgTable(
  "partner_documents",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    filePath: text("file_path").notNull(),
    description: text("description"),
    uploadedBy: varchar("uploaded_by", { length: 200 }).notNull(),
    uploadedByType: varchar("uploaded_by_type", { length: 20 }).notNull(), // 'employee' | 'partner'
    uploadedById: integer("uploaded_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    partnerIdIdx: index("idx_partner_documents_partner").on(table.partnerId),
    typeIdx: index("idx_partner_documents_type").on(table.fileType),
  })
)

/**
 * Relations
 */
export const partnerDocumentsRelations = relations(partnerDocuments, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerDocuments.partnerId],
    references: [partners.id],
  }),
}))

/**
 * Type definitions
 */
export type PartnerDocument = typeof partnerDocuments.$inferSelect
export type NewPartnerDocument = typeof partnerDocuments.$inferInsert
