import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  index,
  integer,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Partner status history table schema
 * Historique des changements de statut
 */
export const partnerStatusHistory = pgTable(
  "partner_status_history",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    oldStatus: varchar("old_status", { length: 50 }),
    newStatus: varchar("new_status", { length: 50 }).notNull(),
    changeReason: text("change_reason"),
    changedBy: varchar("changed_by", { length: 100 }),
    changedAt: timestamp("changed_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    partnerIdIdx: index("idx_partner_status_history_partner").on(table.partnerId),
    dateIdx: index("idx_partner_status_history_date").on(table.changedAt),
  })
)

/**
 * Relations
 */
export const partnerStatusHistoryRelations = relations(partnerStatusHistory, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerStatusHistory.partnerId],
    references: [partners.id],
  }),
}))

/**
 * Type definitions
 */
export type PartnerStatusHistory = typeof partnerStatusHistory.$inferSelect
export type NewPartnerStatusHistory = typeof partnerStatusHistory.$inferInsert
