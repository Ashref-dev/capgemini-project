import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  bigint,
  date,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partnerContacts } from "./partner-contacts"
import { offers } from "./offers"
import { partnerEvents } from "./partner-events"
import { partnerKpis } from "./partner-kpis"
import { partnerStatusHistory } from "./partner-status-history"
import { universityPartners } from "./university-partners"
import { technologyPartners } from "./technology-partners"
import { clientPartners } from "./client-partners"
import { marketingPartners } from "./marketing-partners"

/**
 * Partners table schema
 * Table principale des partenaires — correspond exactement à la table partners dans PostgreSQL
 */
export const partners = pgTable(
  "partners",
  {
    id: serial("id").primaryKey(),
    categories: varchar("categories", { length: 50 }),
    name: varchar("name", { length: 200 }).notNull(),
    legalName: varchar("legal_name", { length: 200 }),
    taxId: varchar("tax_id", { length: 50 }),
    website: varchar("website", { length: 200 }),
    email: varchar("email", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),
    logoUrl: text("logo_url"),
    description: text("description"),
    partnerSubcategory: varchar("partner_subcategory", { length: 100 }),
    partnershipLevel: varchar("partnership_level", { length: 50 }),
    partnershipStartDate: date("partnership_start_date"),
    partnershipStatus: varchar("partnership_status", { length: 50 }).default("actif"),
    annualBudgetTnd: bigint("annual_budget_tnd", { mode: "number" }),
    satisfactionScore: integer("satisfaction_score"),
    numEmployees: bigint("num_employees", { mode: "number" }),
    country: varchar("country", { length: 100 }).default("Tunisie"),
    contractEndDate: date("contract_end_date"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
    passwordHash: text("password_hash"),
    lastEventDate: date("last_event_date"),
    annualRevenueGenerated: integer("annual_revenue_generated"),
  },
  (table) => ({
    statusIdx: index("idx_partners_status").on(table.partnershipStatus),
  })
)

/**
 * Relations
 */
export const partnersRelations = relations(partners, ({ many }) => ({
  contacts: many(partnerContacts),
  offers: many(offers),
  events: many(partnerEvents),
  kpis: many(partnerKpis),
  statusHistory: many(partnerStatusHistory),
  universityPartners: many(universityPartners),
  technologyPartners: many(technologyPartners),
  clientPartners: many(clientPartners),
  marketingPartners: many(marketingPartners),
}))

/**
 * Type definitions
 */
export type Partner = typeof partners.$inferSelect
export type NewPartner = typeof partners.$inferInsert
