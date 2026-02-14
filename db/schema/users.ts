import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

/**
 * Users table schema
 * Stores user account information
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password"),
    name: varchar("name", { length: 255 }).notNull(),
    image: text("image"),
    emailVerified: boolean("email_verified").default(false),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
)

/**
 * Type definitions for Users table
 */
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
