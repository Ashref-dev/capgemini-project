const { Client } = require("pg");
async function check() {
  const c = new Client({ connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database" });
  await c.connect();
  const r = await c.query("SELECT id, name, email, password_hash FROM partners WHERE id=1");
  console.log(r.rows[0]);
  await c.end();
}
check();
