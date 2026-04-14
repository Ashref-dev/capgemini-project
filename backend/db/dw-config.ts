import { Pool } from "pg"

const dwPool = new Pool({
  connectionString: process.env.DW_DATABASE_URL,
  ssl: process.env.NODE_ENV === "production",
})

export { dwPool }
