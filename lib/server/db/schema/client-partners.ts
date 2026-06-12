import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Client partners table schema
 * Sous-type partenaire : Client
 */
export const clientPartners = pgTable(
  "client_partners",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    clientType: varchar("client_type", { length: 50 }),
    industry: varchar("industry", { length: 100 }),
    annualRevenue: bigint("annual_revenue", { mode: "number" }),
    numActiveProjects: integer("num_active_projects"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
  },
  (table) => ({
    partnerIdIdx: index("idx_client_partners_partner").on(table.partnerId),
  })
)

/**
 * Relations
 */
export const clientPartnersRelations = relations(clientPartners, ({ one }) => ({
  partner: one(partners, {
    fields: [clientPartners.partnerId],
    references: [partners.id],
  }),
}))

/**
 * Type definitions
 */
export type ClientPartner = typeof clientPartners.$inferSelect
export type NewClientPartner = typeof clientPartners.$inferInsert
