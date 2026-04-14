const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:kenza123@localhost:5432/test_partnership_database' });

(async () => {
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('=== TABLES ===');
  tables.rows.forEach(r => console.log(r.table_name));

  for (const t of ['partners', 'partner_contacts', 'offers', 'partner_events', 'partner_status_history', 'capgemini_employees']) {
    const cols = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position", [t]);
    console.log('\n=== ' + t.toUpperCase() + ' ===');
    cols.rows.forEach(r => console.log(r.column_name + ' | ' + r.data_type + ' | nullable:' + r.is_nullable + (r.column_default ? ' | default:' + r.column_default : '')));
  }

  console.log('\n=== SAMPLE PARTNERS (3) ===');
  const p = await pool.query('SELECT * FROM partners LIMIT 3');
  p.rows.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n=== SAMPLE CONTACTS (3) ===');
  const c = await pool.query('SELECT * FROM partner_contacts LIMIT 3');
  c.rows.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n=== SAMPLE OFFERS (3) ===');
  const o = await pool.query('SELECT * FROM offers LIMIT 3');
  o.rows.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n=== SAMPLE EVENTS (3) ===');
  const e = await pool.query('SELECT * FROM partner_events LIMIT 3');
  e.rows.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n=== SAMPLE STATUS HISTORY (3) ===');
  const s = await pool.query('SELECT * FROM partner_status_history LIMIT 3');
  s.rows.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n=== COUNTS ===');
  for (const t of ['partners', 'partner_contacts', 'offers', 'partner_events', 'partner_status_history']) {
    const cnt = await pool.query('SELECT count(*) FROM ' + t);
    console.log(t + ': ' + cnt.rows[0].count);
  }

  console.log('\n=== EMPLOYEES ===');
  const emp = await pool.query('SELECT id, first_name, last_name, email, role FROM capgemini_employees ORDER BY id');
  emp.rows.forEach(r => console.log(JSON.stringify(r)));

  pool.end();
})();
