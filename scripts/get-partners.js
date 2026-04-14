const { Pool } = require("pg");
const p = new Pool({ connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database" });

(async () => {
  const r = await p.query(`
    SELECT id, name, email, categories 
    FROM partners 
    WHERE email IS NOT NULL 
      AND categories IN ('customer','marketing','supplier','university')
    ORDER BY categories, id
  `);
  console.log("PARTNERS WITH EMAIL:");
  r.rows.forEach(x => console.log(`${x.categories} | id=${x.id} | ${x.name} | ${x.email}`));
  await p.end();
})();
