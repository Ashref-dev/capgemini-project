import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  date,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Partner meetings table
 * Réunions entre les employés Capgemini et les partenaires
 */
export const partnerMeetings = pgTable(
  "partner_meetings",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    meetingDate: timestamp("meeting_date", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    employeeName: varchar("employee_name", { length: 200 }).notNull(),
    employeeRole: varchar("employee_role", { length: 100 }),
    employeeId: integer("employee_id"),
    location: varchar("location", { length: 255 }),
    meetingType: varchar("meeting_type", { length: 50 })
      .notNull()
      .$type<"presentiel" | "visioconference" | "telephonique">(),
    agenda: text("agenda"),
    conclusions: text("conclusions"),
    remarks: text("remarks"),
    agreements: text("agreements"),
    sharedDocuments: text("shared_documents"),
    satisfactionScore: integer("satisfaction_score"),
    nextSteps: text("next_steps"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    partnerIdIdx: index("idx_partner_meetings_partner").on(table.partnerId),
    dateIdx: index("idx_partner_meetings_date").on(table.meetingDate),
  })
)

export const partnerMeetingsRelations = relations(partnerMeetings, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerMeetings.partnerId],
    references: [partners.id],
  }),
}))

export type PartnerMeeting = typeof partnerMeetings.$inferSelect
export type NewPartnerMeeting = typeof partnerMeetings.$inferInsert
