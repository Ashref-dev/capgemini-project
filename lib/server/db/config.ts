import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"
import { resolvePgSsl } from "./ssl"

/**
 * Create database connection pool
 * Uses DATABASE_URL environment variable
 * Format: postgresql://user:password@localhost:5432/dbname
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  statement_timeout: 20_000,
  ssl: resolvePgSsl(process.env.DATABASE_URL, "DATABASE_SSL"),
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
