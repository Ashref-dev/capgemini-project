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

import { projects } from "./projects"

/**
 * Project documents table schema
 * Documents centralisés associés aux projets
 */
export const projectDocuments = pgTable(
  "project_documents",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    filePath: text("file_path").notNull(),
    description: text("description"),
    uploadedBy: varchar("uploaded_by", { length: 200 }).notNull(),
    uploadedByType: varchar("uploaded_by_type", { length: 20 }).notNull(),
    uploadedById: integer("uploaded_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    projectIdIdx: index("idx_project_documents_project").on(table.projectId),
    typeIdx: index("idx_project_documents_type").on(table.fileType),
  })
)

/**
 * Relations
 */
export const projectDocumentsRelations = relations(projectDocuments, ({ one }) => ({
  project: one(projects, {
    fields: [projectDocuments.projectId],
    references: [projects.id],
  }),
}))

/**
 * Type definitions
 */
export type ProjectDocument = typeof projectDocuments.$inferSelect
export type NewProjectDocument = typeof projectDocuments.$inferInsert
