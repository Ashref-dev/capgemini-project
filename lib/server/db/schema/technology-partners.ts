import {
  pgTable,
  integer,
  varchar,
  text,
  decimal,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"
import { vendorProjects } from "./vendor-projects"

/**
 * Technology partners table schema
 * Sous-type partenaire : Fournisseur technologique
 * PK = partner_id (relation 1-to-1 avec partners)
 */
export const technologyPartners = pgTable(
  "technology_partners",
  {
    partnerId: integer("partner_id")
      .primaryKey()
      .references(() => partners.id, { onDelete: "cascade" }),
    vendorType: varchar("vendor_type", { length: 100 }),
    technologies: text("technologies").array(),
    certificationsHeld: integer("certifications_held"),
    certificationLevel: varchar("certification_level", { length: 50 }),
    partnershipModel: varchar("partnership_model", { length: 50 }),
    commissionRate: decimal("commission_rate"),
    discountRate: decimal("discount_rate"),
    annualRevenueGenerated: decimal("annual_revenue_generated", { precision: 18, scale: 0 }),
    numProjectsPerYear: integer("num_projects_per_year"),
    numLicensesSold: integer("num_licenses_sold"),
    comarketingBudgetAnnual: integer("comarketing_budget_annual"),
    numEventsOrganized: integer("num_events_organized"),
    hasMasterAgreement: boolean("has_master_agreement").default(false),
    agreementSignedDate: date("agreement_signed_date"),
    agreementRenewalDate: date("agreement_renewal_date"),
    hasDedicatedSupport: boolean("has_dedicated_support").default(false),
    supportSlaHours: integer("support_sla_hours"),
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
export const technologyPartnersRelations = relations(technologyPartners, ({ one, many }) => ({
  partner: one(partners, {
    fields: [technologyPartners.partnerId],
    references: [partners.id],
  }),
  vendorProjects: many(vendorProjects),
}))

/**
 * Type definitions
 */
export type TechnologyPartner = typeof technologyPartners.$inferSelect
export type NewTechnologyPartner = typeof technologyPartners.$inferInsert
