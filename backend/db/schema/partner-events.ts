import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Partner events table schema
 * Événements organisés avec les partenaires
 */
export const partnerEvents = pgTable(
  "partner_events",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    eventName: varchar("event_name", { length: 255 }).notNull(),
    eventType: varchar("event_type", { length: 100 }),
    eventDate: date("event_date").notNull(),
    eventLocation: varchar("event_location", { length: 255 }),
    numParticipants: integer("num_participants"),
    numCapgeminiAttendees: integer("num_capgemini_attendees"),
    numLeadsGenerated: integer("num_leads_generated"),
    numConversions: integer("num_conversions"),
    eventBudget: integer("event_budget"),
    satisfactionScore: integer("satisfaction_score"),
    eventStatus: varchar("event_status", { length: 50 })
      .default("planifie")
      .$type<"planifie" | "en_cours" | "termine" | "annule">(),
    notes: text("notes"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    partnerIdIdx: index("idx_partner_events_partner").on(table.partnerId),
    dateIdx: index("idx_partner_events_date").on(table.eventDate),
  })
)

/**
 * Relations
 */
export const partnerEventsRelations = relations(partnerEvents, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerEvents.partnerId],
    references: [partners.id],
  }),
}))

/**
 * Type definitions
 */
export type PartnerEvent = typeof partnerEvents.$inferSelect
export type NewPartnerEvent = typeof partnerEvents.$inferInsert
