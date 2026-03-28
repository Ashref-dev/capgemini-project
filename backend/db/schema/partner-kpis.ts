import {
  pgTable,
  serial,
  integer,
  decimal,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Partner KPIs table schema
 * KPIs pré-calculés par partenaire
 */
export const partnerKpis = pgTable(
  "partner_kpis",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    quarter: integer("quarter"),
    month: integer("month"),
    
    // KPIs généraux
    totalInteractions: integer("total_interactions").default(0),
    totalEvents: integer("total_events").default(0),
    totalBudgetSpent: integer("total_budget_spent").default(0),
    
    // KPIs universitaires
    totalInterns: integer("total_interns").default(0),
    totalApprentices: integer("total_apprentices").default(0),
    totalHires: integer("total_hires").default(0),
    conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),
    
    // KPIs fournisseurs
    totalRevenueGenerated: decimal("total_revenue_generated", { precision: 18, scale: 2 }).default("0"),
    totalProjects: integer("total_projects").default(0),
    totalLicensesSold: integer("total_licenses_sold").default(0),
    
    // Satisfaction
    avgSatisfactionScore: decimal("avg_satisfaction_score", { precision: 5, scale: 2 }),
    
    calculatedAt: timestamp("calculated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    partnerIdIdx: index("idx_partner_kpis_partner").on(table.partnerId),
    periodIdx: index("idx_partner_kpis_period").on(table.year, table.quarter, table.month),
  })
)

/**
 * Relations
 */
export const partnerKpisRelations = relations(partnerKpis, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerKpis.partnerId],
    references: [partners.id],
  }),
}))

/**
 * Type definitions
 */
export type PartnerKPI = typeof partnerKpis.$inferSelect
export type NewPartnerKPI = typeof partnerKpis.$inferInsert
