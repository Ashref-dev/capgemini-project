import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  integer,
  doublePrecision,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Partner events table schema
 * Événements organisés avec les partenaires — correspond exactement à la table partner_events
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
    eventStatus: varchar("event_status", { length: 50 }).default("planifie"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
    eventRevenue: integer("event_revenue"),
    roiEvent: doublePrecision("roi_event"),
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
