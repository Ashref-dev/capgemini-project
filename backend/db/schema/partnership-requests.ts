import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

/**
 * Partnership requests table schema
 * Demandes de partenariat soumises via le formulaire public
 */
export const partnershipRequests = pgTable("partnership_requests", {
  id: serial("id").primaryKey(),

  // Informations de base du demandeur
  companyName: varchar("company_name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }),
  contactFirstName: varchar("contact_first_name", { length: 100 }).notNull(),
  contactLastName: varchar("contact_last_name", { length: 100 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactRole: varchar("contact_role", { length: 100 }),

  // Informations entreprise
  website: varchar("website", { length: 255 }),
  description: text("description"),
  country: varchar("country", { length: 100 }),
  address: text("address"),
  numEmployees: integer("num_employees"),
  annualRevenue: varchar("annual_revenue", { length: 100 }),

  // Type de partenariat souhaité
  category: varchar("category", { length: 50 }).notNull()
    .$type<"customer" | "marketing" | "supplier" | "university">(),
  partnerSubcategory: varchar("partner_subcategory", { length: 100 }),
  partnershipLevel: varchar("partnership_level", { length: 50 }),
  motivations: text("motivations"),

  // Données spécifiques université
  universityData: jsonb("university_data"),
  // Données spécifiques fournisseur technologique
  technologyData: jsonb("technology_data"),

  // Statut de la demande
  status: varchar("status", { length: 50 }).default("en_attente")
    .$type<"en_attente" | "acceptee" | "refusee">(),
  isAccepted: boolean("is_accepted"),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),

  // Partenaire créé après acceptation
  createdPartnerId: integer("created_partner_id"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`),
})

export type PartnershipRequest = typeof partnershipRequests.$inferSelect
export type NewPartnershipRequest = typeof partnershipRequests.$inferInsert
