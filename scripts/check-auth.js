const { Pool } = require("pg");
const p = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:kenza123@localhost:5432/test_partnership_database"
});

async function main() {
  const res = await p.query(`
    SELECT id, email, first_name, last_name, role, is_active,
      CASE WHEN password_hash IS NOT NULL THEN 'HAS_HASH' ELSE 'NO_HASH' END as hash_status,
      length(password_hash) as hash_len
    FROM capgemini_employees
  `);
  console.table(res.rows);
  await p.end();
}
main().catch(e => { console.error(e); process.exit(1); });
