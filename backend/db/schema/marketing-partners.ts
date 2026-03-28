import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Marketing partners table schema
 * Sous-type partenaire : Marketing
 */
export const marketingPartners = pgTable(
  "marketing_partners",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    marketingType: varchar("marketing_type", { length: 100 }),
    leadsGeneratedPerYear: integer("leads_generated_per_year"),
    conversionRate: decimal("conversion_rate"),
    annualMarketingBudget: integer("annual_marketing_budget"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
  },
  (table) => ({
    partnerIdIdx: index("idx_marketing_partners_partner").on(table.partnerId),
  })
)

/**
 * Relations
 */
export const marketingPartnersRelations = relations(marketingPartners, ({ one }) => ({
  partner: one(partners, {
    fields: [marketingPartners.partnerId],
    references: [partners.id],
  }),
}))

/**
 * Type definitions
 */
export type MarketingPartner = typeof marketingPartners.$inferSelect
export type NewMarketingPartner = typeof marketingPartners.$inferInsert
