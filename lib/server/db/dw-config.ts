import { Pool } from "pg"
import { resolvePgSsl } from "./ssl"

const dwPool = new Pool({
  connectionString: process.env.DW_DATABASE_URL,
  statement_timeout: 20_000,
  ssl: resolvePgSsl(process.env.DW_DATABASE_URL, "DW_DATABASE_SSL"),
})

export { dwPool }
