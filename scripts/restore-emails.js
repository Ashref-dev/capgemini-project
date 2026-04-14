const { Client } = require("pg");
async function fix() {
  const c = new Client({ connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database" });
  await c.connect();

  // Check which partners have null emails
  const nullEmails = await c.query("SELECT id, name FROM partners WHERE email IS NULL");
  console.log("Partners with null email:", nullEmails.rows.length);
  for (const p of nullEmails.rows) {
    console.log(`  - ${p.id}: ${p.name}`);
  }

  // Restore ESPRIT email
  await c.query("UPDATE partners SET email = 'partenariats@esprit.tn' WHERE id = 1");
  console.log("\nRestored ESPRIT email");

  // Restore Microsoft email
  await c.query("UPDATE partners SET email = 'partenariats@microsoft.tn' WHERE id = 16");
  console.log("Restored Microsoft email");

  // Verify
  const check = await c.query("SELECT id, name, email FROM partners WHERE id IN (1, 16)");
  for (const p of check.rows) {
    console.log(`  ${p.id} ${p.name}: ${p.email}`);
  }

  await c.end();
}
fix();
