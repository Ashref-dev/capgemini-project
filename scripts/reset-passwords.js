const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database"
});

async function main() {
  const password = "Capgemini2024!";
  const hash = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    `UPDATE capgemini_employees SET password_hash = $1 RETURNING id, email, first_name, last_name, role`,
    [hash]
  );
  
  console.log(`Password reset to "${password}" for ${result.rowCount} employees:`);
  console.table(result.rows);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
