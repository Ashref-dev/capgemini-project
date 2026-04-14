const { Client } = require("pg");

async function createTable() {
  const c = new Client({
    connectionString: "postgresql://postgres:kenza123@localhost:5432/test_partnership_database",
  });
  await c.connect();

  await c.query(`
    CREATE TABLE IF NOT EXISTS partnership_requests (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      legal_name VARCHAR(255),
      contact_first_name VARCHAR(100) NOT NULL,
      contact_last_name VARCHAR(100) NOT NULL,
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(50),
      contact_role VARCHAR(100),
      website VARCHAR(255),
      description TEXT,
      country VARCHAR(100),
      address TEXT,
      num_employees INTEGER,
      annual_revenue VARCHAR(100),
      category VARCHAR(50) NOT NULL,
      partner_subcategory VARCHAR(100),
      partnership_level VARCHAR(50),
      motivations TEXT,
      university_data JSONB,
      technology_data JSONB,
      status VARCHAR(50) DEFAULT 'en_attente',
      is_accepted BOOLEAN,
      reviewed_by INTEGER,
      reviewed_at TIMESTAMPTZ,
      rejection_reason TEXT,
      created_partner_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Table partnership_requests created");

  const cols = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'partnership_requests' ORDER BY ordinal_position"
  );
  console.log("Columns:", cols.rows.map(r => r.column_name).join(", "));

  await c.end();
}

createTable().catch(console.error);
