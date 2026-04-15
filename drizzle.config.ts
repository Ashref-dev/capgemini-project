import type { Config } from "drizzle-kit"
import { readFileSync } from "fs"

// drizzle-kit runs outside Next.js et ne lit pas .env.local automatiquement
for (const envFile of [".env.local", ".env"]) {
  try {
    const lines = readFileSync(envFile, "utf8").split("\n")
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const idx = trimmed.indexOf("=")
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "")
      if (!process.env[key]) process.env[key] = val
    }
  } catch {}
}

export default {
  schema: "./backend/db/schema",
  out: "./backend/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
