
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database"
});

const tables = [
  { table: "partners", sequence: "partners_id_seq" },
  { table: "partner_contacts", sequence: "partner_contacts_id_seq" },
  { table: "offers", sequence: "offers_id_seq" },
  { table: "partner_events", sequence: "partner_events_id_seq" },
  { table: "partner_status_history", sequence: "partner_status_history_id_seq" },
  { table: "capgemini_employees", sequence: "capgemini_employees_id_seq" },
  { table: "student_recruitments", sequence: "student_recruitments_id_seq" },
  { table: "vendor_projects", sequence: "vendor_projects_id_seq" },
];

async function main() {
  for (const { table, sequence } of tables) {
    try {
      // Get current max id
      const maxRes = await pool.query(`SELECT COALESCE(MAX(id), 0) as max_id FROM ${table}`);
      const maxId = maxRes.rows[0].max_id;
      
      // Get current sequence value
      const seqRes = await pool.query(`SELECT last_value FROM ${sequence}`);
      const seqVal = seqRes.rows[0].last_value;
      
      console.log(`${table}: max_id=${maxId}, sequence=${seqVal}`);
      
      if (seqVal < maxId) {
        const newVal = maxId + 1;
        await pool.query(`SELECT setval('${sequence}', ${newVal})`);
        console.log(`  -> Fixed: sequence reset to ${newVal}`);
      } else {
        console.log(`  -> OK`);
      }
    } catch (e) {
      console.error(`  -> Error for ${table}: ${e.message}`);
    }
  }
  
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
