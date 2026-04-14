const { Client } = require("pg");

async function migrate() {
  const client = new Client({
    connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database",
  });
  await client.connect();

  const queries = [
    // === university_partners: add missing columns ===
    `ALTER TABLE university_partners ADD COLUMN IF NOT EXISTS institution_type VARCHAR(100)`,
    `ALTER TABLE university_partners ADD COLUMN IF NOT EXISTS annual_sponsorship_budget INTEGER`,
    `ALTER TABLE university_partners ADD COLUMN IF NOT EXISTS budget_breakdown JSONB`,
    `ALTER TABLE university_partners ADD COLUMN IF NOT EXISTS num_events_per_year INTEGER`,
    `ALTER TABLE university_partners ADD COLUMN IF NOT EXISTS last_event_date DATE`,
    `ALTER TABLE university_partners ADD COLUMN IF NOT EXISTS has_framework_agreement BOOLEAN DEFAULT false`,
    `ALTER TABLE university_partners ADD COLUMN IF NOT EXISTS agreement_signed_date DATE`,
    `ALTER TABLE university_partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,

    // === technology_partners: add missing columns ===
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS vendor_type VARCHAR(100)`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS annual_revenue_generated DECIMAL(18,0)`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS num_projects_per_year INTEGER`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS num_licenses_sold INTEGER`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS comarketing_budget_annual INTEGER`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS num_events_organized INTEGER`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS has_master_agreement BOOLEAN DEFAULT false`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS agreement_signed_date DATE`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS agreement_renewal_date DATE`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS has_dedicated_support BOOLEAN DEFAULT false`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS support_sla_hours INTEGER`,
    `ALTER TABLE technology_partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,

    // === student_recruitments: rename salary_range -> cdi_salary_range, add created_at ===
    `ALTER TABLE student_recruitments RENAME COLUMN salary_range TO cdi_salary_range`,
    `ALTER TABLE student_recruitments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,

    // === vendor_projects: add missing columns ===
    `ALTER TABLE vendor_projects ADD COLUMN IF NOT EXISTS project_status VARCHAR(50) DEFAULT 'en_cours'`,
    `ALTER TABLE vendor_projects ADD COLUMN IF NOT EXISTS is_reference_project BOOLEAN DEFAULT false`,
    `ALTER TABLE vendor_projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,
  ];

  for (const q of queries) {
    try {
      await client.query(q);
      console.log("OK:", q.substring(0, 80));
    } catch (err) {
      // Ignore "column already exists" for RENAME
      if (err.code === "42701" || err.message.includes("already exists")) {
        console.log("SKIP (already done):", q.substring(0, 80));
      } else {
        console.error("FAIL:", q.substring(0, 80), "->", err.message);
      }
    }
  }

  // Verify
  for (const table of ["university_partners", "technology_partners", "student_recruitments", "vendor_projects"]) {
    const res = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [table]
    );
    console.log(`\n${table}: ${res.rows.map(r => r.column_name).join(", ")}`);
  }

  await client.end();
  console.log("\nMigration done!");
}

migrate().catch(console.error);
