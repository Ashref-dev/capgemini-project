import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Partner notifications table
 * Historique des notifications/emails envoyés aux partenaires
 */
export const partnerNotifications = pgTable(
  "partner_notifications",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 })
      .notNull()
      .$type<"email" | "system" | "meeting" | "document" | "status_change" | "general">(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    emailSent: boolean("email_sent").default(false),
    emailSubject: varchar("email_subject", { length: 255 }),
    isRead: boolean("is_read").default(false),
    sentBy: varchar("sent_by", { length: 200 }),
    sentById: integer("sent_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    partnerIdIdx: index("idx_partner_notifications_partner").on(table.partnerId),
    typeIdx: index("idx_partner_notifications_type").on(table.type),
    readIdx: index("idx_partner_notifications_read").on(table.isRead),
  })
)

export const partnerNotificationsRelations = relations(partnerNotifications, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerNotifications.partnerId],
    references: [partners.id],
  }),
}))

export type PartnerNotification = typeof partnerNotifications.$inferSelect
export type NewPartnerNotification = typeof partnerNotifications.$inferInsert
