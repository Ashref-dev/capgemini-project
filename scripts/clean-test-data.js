const { Client } = require("pg");
async function clean() {
  const c = new Client({ connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database" });
  await c.connect();
  const r1 = await c.query("DELETE FROM student_recruitments WHERE id > 150");
  const r2 = await c.query("DELETE FROM vendor_projects WHERE id > 131");
  console.log("Cleaned:", r1.rowCount, "recruitments,", r2.rowCount, "projects");
  await c.end();
}
clean();
