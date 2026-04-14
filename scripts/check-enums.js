const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres:kenza123@localhost:5432/test_partnership_database' });
(async () => {
  const r = await p.query("SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid ORDER BY t.typname, e.enumsortorder");
  r.rows.forEach(x => console.log(x.typname, x.enumlabel));
  p.end();
})();
