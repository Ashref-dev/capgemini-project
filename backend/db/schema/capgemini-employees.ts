import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  check,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

/**
 * Capgemini employees table schema
 * Employés Capgemini référents
 */
export const capgeminiEmployees = pgTable(
  "capgemini_employees",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    role: varchar("role", { length: 50 })
      .notNull()
      .$type<"admin" | "manager" | "commercial" | "analyst" | "rh">(),
    isActive: boolean("is_active").default(true),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
  }
)

/**
 * Type definitions
 */
export type CapgeminiEmployee = typeof capgeminiEmployees.$inferSelect
export type NewCapgeminiEmployee = typeof capgeminiEmployees.$inferInsert
