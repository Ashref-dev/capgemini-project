import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  date,
  index,
  unique,
  check,
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
 * Table principale des partenaires
 */
export const partners = pgTable(
  "partners",
  {
    id: serial("id").primaryKey(),
    category: varchar("category", { length: 50 }).notNull(),
    categories: text("categories").array().default(sql`'{}'::text[]`),
    name: varchar("name", { length: 200 }).notNull(),
    legalName: varchar("legal_name", { length: 200 }),
    taxId: varchar("tax_id", { length: 50 }),
    website: varchar("website", { length: 200 }),
    email: varchar("email", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),
    logoUrl: text("logo_url"),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    
    // Champs BI/Analytics
    partnerSubcategory: varchar("partner_subcategory", { length: 100 }),
    partnershipLevel: varchar("partnership_level", { length: 50 })
      .$type<"basique" | "actif" | "stratégique" | "exclusif">(),
    partnershipStartDate: date("partnership_start_date"),
    partnershipStatus: varchar("partnership_status", { length: 50 })
      .default("actif")
      .$type<"prospect" | "en_negociation" | "actif" | "inactif" | "termine">(),
    annualBudgetTnd: integer("annual_budget_tnd"),
    satisfactionScore: integer("satisfaction_score"),
    numEmployees: integer("num_employees"),
    country: varchar("country", { length: 100 }).default("Tunisie"),
    location: varchar("location", { length: 255 }),
    contractEndDate: date("contract_end_date"),
    passwordHash: text("password_hash"),
    
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    categoryIdx: index("idx_partners_category").on(table.category),
    statusIdx: index("idx_partners_status").on(table.partnershipStatus),
    locationIdx: index("idx_partners_location").on(table.location),
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
