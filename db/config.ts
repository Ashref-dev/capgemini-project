import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

/**
 * Create database connection pool
 * Uses DATABASE_URL environment variable
 * Format: postgresql://user:password@localhost:5432/dbname
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production",
})

/**
 * Drizzle instance with schema
 * Provides type-safe database operations
 */
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
})

/**
 * Export pool for direct access if needed
 */
export { pool }
