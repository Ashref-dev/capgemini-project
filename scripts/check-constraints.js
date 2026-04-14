const { Client } = require("pg");
async function check() {
  const c = new Client({ connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database" });
  await c.connect();
  const r = await c.query(`
    SELECT conname, pg_get_constraintdef(oid) as definition
    FROM pg_constraint
    WHERE conrelid = 'student_recruitments'::regclass
    AND contype = 'c'
  `);
  for (const row of r.rows) {
    console.log(row.conname, ":", row.definition);
  }
  await c.end();
}
check();
