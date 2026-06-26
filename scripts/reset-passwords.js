const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

function loadDotEnv() {
  const content = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadDotEnv();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing from .env");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const password = "Capgemini2024!";
  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `UPDATE capgemini_employees SET password_hash = $1 RETURNING id, email, first_name, last_name, role`,
    [hash],
  );

  console.log(`Password reset to "${password}" for ${result.rowCount} employees:`);
  console.table(result.rows);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
