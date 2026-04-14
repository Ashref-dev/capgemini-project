const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:kenza123@localhost:5432/test_partnership_database' });

async function main() {
  const tables = ['university_partners', 'technology_partners', 'student_recruitments', 'vendor_projects'];
  
  for (const table of tables) {
    const res = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [table]
    );
    console.log(`${table}: ${res.rows.length > 0 ? res.rows.map(r => r.column_name).join(', ') : 'TABLE DOES NOT EXIST'}`);
  }

  // Check if there are any records
  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT count(*) as count FROM ${table}`);
      console.log(`  -> ${table} has ${res.rows[0].count} rows`);
    } catch (e) {
      console.log(`  -> ${table}: ${e.message}`);
    }
  }

  await pool.end();
}
main().catch(console.error);
