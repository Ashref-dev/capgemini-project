const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database"
});

const partners = [
  { id: 21, name: "BIAT", cat: "customer" },
  { id: 22, name: "Amen Bank", cat: "customer" },
  { id: 6, name: "Pluxee Tunisie", cat: "marketing" },
  { id: 15, name: "Orange Tunisie", cat: "marketing" },
  { id: 16, name: "Microsoft Tunisie", cat: "supplier" },
  { id: 17, name: "Dell Tunisia", cat: "supplier" },
  { id: 1, name: "ESPRIT", cat: "university" },
  { id: 2, name: "INSAT", cat: "university" },
];

async function main() {
  const password = "Partner2024!";
  const hash = await bcrypt.hash(password, 10);
  
  for (const p of partners) {
    await pool.query("UPDATE partners SET password_hash = $1 WHERE id = $2", [hash, p.id]);
    const r = await pool.query("SELECT id, name, email, categories FROM partners WHERE id = $1", [p.id]);
    const row = r.rows[0];
    console.log(`${row.categories} | id=${row.id} | ${row.name} | ${row.email} | Password: ${password}`);
  }
  
  console.log("\nAll 8 partner accounts ready!");
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
