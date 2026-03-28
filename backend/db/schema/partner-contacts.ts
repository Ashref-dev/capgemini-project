import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

/**
 * Partner contacts table schema
 * Contacts des partenaires
 */
export const partnerContacts = pgTable(
  "partner_contacts",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    email: varchar("email", { length: 100 }),
    phone: varchar("phone", { length: 20 }),
    role: varchar("role", { length: 100 }),
    isPrimary: boolean("is_primary").default(false),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    partnerIdIdx: index("idx_partner_contacts_partner").on(table.partnerId),
  })
)

/**
 * Relations
 */
export const partnerContactsRelations = relations(partnerContacts, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerContacts.partnerId],
    references: [partners.id],
  }),
}))

/**
 * Type definitions
 */
export type PartnerContact = typeof partnerContacts.$inferSelect
export type NewPartnerContact = typeof partnerContacts.$inferInsert
