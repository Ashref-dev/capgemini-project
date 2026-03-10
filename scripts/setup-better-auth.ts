/**
 * Script : crée les tables Better Auth dans la base de données Neon
 * Usage  : bun run scripts/setup-better-auth.ts
 */
import { readFileSync } from "fs";

// Charger .env.local manuellement (bun ne le fait pas pour les scripts isolés)
try {
  const lines = readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false,
});

const sql = `
-- Tables requises par Better Auth v1.4+

CREATE TABLE IF NOT EXISTS "user" (
  "id"             text PRIMARY KEY NOT NULL,
  "name"           text NOT NULL,
  "email"          text NOT NULL UNIQUE,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image"          text,
  "created_at"     timestamp NOT NULL DEFAULT now(),
  "updated_at"     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id"          text PRIMARY KEY NOT NULL,
  "expires_at"  timestamp NOT NULL,
  "token"       text NOT NULL UNIQUE,
  "created_at"  timestamp NOT NULL DEFAULT now(),
  "updated_at"  timestamp NOT NULL DEFAULT now(),
  "ip_address"  text,
  "user_agent"  text,
  "user_id"     text NOT NULL REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "account" (
  "id"                        text PRIMARY KEY NOT NULL,
  "account_id"                text NOT NULL,
  "provider_id"               text NOT NULL,
  "user_id"                   text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "access_token"              text,
  "refresh_token"             text,
  "id_token"                  text,
  "access_token_expires_at"   timestamp,
  "refresh_token_expires_at"  timestamp,
  "scope"                     text,
  "password"                  text,
  "created_at"                timestamp NOT NULL DEFAULT now(),
  "updated_at"                timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id"          text PRIMARY KEY NOT NULL,
  "identifier"  text NOT NULL,
  "value"       text NOT NULL,
  "expires_at"  timestamp NOT NULL,
  "created_at"  timestamp,
  "updated_at"  timestamp
);
`;

async function run() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("✅ Tables Better Auth créées avec succès !");
  } catch (err) {
    console.error("❌ Erreur :", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
