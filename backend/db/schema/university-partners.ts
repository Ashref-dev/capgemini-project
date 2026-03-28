import {
  pgTable,
  integer,
  varchar,
  text,
  decimal,
  boolean,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"
import { studentRecruitments } from "./student-recruitments"

/**
 * University partners table schema
 * Sous-type partenaire : Université / École
 * PK = partner_id (relation 1-to-1 avec partners)
 */
export const universityPartners = pgTable(
  "university_partners",
  {
    partnerId: integer("partner_id")
      .primaryKey()
      .references(() => partners.id, { onDelete: "cascade" }),
    institutionType: varchar("institution_type", { length: 100 }),
    numStudents: integer("num_students"),
    specialties: text("specialties").array(),
    numInternsPerYear: integer("num_interns_per_year"),
    numApprenticesPerYear: integer("num_apprentices_per_year"),
    numHiresPerYear: integer("num_hires_per_year"),
    conversionRateToCdi: decimal("conversion_rate_to_cdi"),
    averageHireDurationMonths: integer("average_hire_duration_months"),
    annualSponsorshipBudget: integer("annual_sponsorship_budget"),
    budgetBreakdown: jsonb("budget_breakdown"),
    numEventsPerYear: integer("num_events_per_year"),
    lastEventDate: date("last_event_date"),
    hasFrameworkAgreement: boolean("has_framework_agreement").default(false),
    agreementSignedDate: date("agreement_signed_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
  }
)

/**
 * Relations
 */
export const universityPartnersRelations = relations(universityPartners, ({ one, many }) => ({
  partner: one(partners, {
    fields: [universityPartners.partnerId],
    references: [partners.id],
  }),
  studentRecruitments: many(studentRecruitments),
}))

/**
 * Type definitions
 */
export type UniversityPartner = typeof universityPartners.$inferSelect
export type NewUniversityPartner = typeof universityPartners.$inferInsert
