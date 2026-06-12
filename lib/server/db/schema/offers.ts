import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  decimal,
  date,
  boolean,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { partners } from "./partners"

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"])

/**
 * Offers table schema
 * Offres et promotions — correspond exactement à la table offers dans PostgreSQL
 */
export const offers = pgTable(
  "offers",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    discountType: discountTypeEnum("discount_type").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    termsConditions: text("terms_conditions"),
    isActive: boolean("is_active").default(true),
    usageCount: integer("usage_count").default(0),
    totalValueTnd: decimal("total_value_tnd", { precision: 12, scale: 2 }).default("0"),
    targetAudience: varchar("target_audience", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    partnerIdIdx: index("idx_offers_partner").on(table.partnerId),
    datesIdx: index("idx_offers_dates").on(table.startDate, table.endDate),
  })
)

/**
 * Relations
 */
export const offersRelations = relations(offers, ({ one }) => ({
  partner: one(partners, {
    fields: [offers.partnerId],
    references: [partners.id],
  }),
}))

/**
 * Type definitions
 */
export type Offer = typeof offers.$inferSelect
export type NewOffer = typeof offers.$inferInsert
