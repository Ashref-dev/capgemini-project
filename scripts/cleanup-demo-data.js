const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const envPath = path.join(process.cwd(), ".env");

function loadDotEnv(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function printRows(title, rows) {
  console.log(`\n## ${title}`);
  if (rows.length === 0) {
    console.log("No rows found.");
    return;
  }
  console.table(rows);
}

const candidatePartnerPredicate = `
  id <> 184
  AND (
    name ILIKE 'test%'
    OR lower(name) IN ('test', 'test2', 'test221', 'testcorp sa', 'test partenaire fix')
  )
`;

const duplicateRequestGroupsSql = `
  WITH normalized AS (
    SELECT
      id,
      company_name,
      contact_email,
      created_at,
      lower(trim(company_name)) AS company_key,
      lower(trim(contact_email)) AS email_key
    FROM partnership_requests
  ),
  grouped AS (
    SELECT
      company_key,
      email_key,
      count(*)::int AS duplicate_count,
      min(id)::int AS keep_id,
      array_agg(id ORDER BY id) AS ids,
      min(created_at) AS first_created_at,
      max(created_at) AS last_created_at
    FROM normalized
    GROUP BY company_key, email_key
    HAVING count(*) > 1
  )
  SELECT *
  FROM grouped
  ORDER BY duplicate_count DESC, keep_id
`;

const candidatePartnersSql = `SELECT id, name, categories, email FROM partners WHERE ${candidatePartnerPredicate} ORDER BY id`;

const candidatePartnerChildCountsSql = `
  WITH candidates AS (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
  SELECT p.id, p.name,
    (SELECT count(*)::int FROM projects WHERE partner_id = p.id) AS projects,
    (SELECT count(*)::int FROM partner_events WHERE partner_id = p.id) AS partner_events,
    (SELECT count(*)::int FROM partner_meetings WHERE partner_id = p.id) AS partner_meetings,
    (SELECT count(*)::int FROM partner_contacts WHERE partner_id = p.id) AS partner_contacts,
    (SELECT count(*)::int FROM offers WHERE partner_id = p.id) AS offers,
    (SELECT count(*)::int FROM partnership_requests WHERE created_partner_id = p.id) AS partnership_requests,
    (SELECT count(*)::int FROM technology_partners WHERE partner_id = p.id) AS technology_partners,
    (SELECT count(*)::int FROM university_partners WHERE partner_id = p.id) AS university_partners,
    (SELECT count(*)::int FROM client_partners WHERE partner_id = p.id) AS client_partners,
    (SELECT count(*)::int FROM marketing_partners WHERE partner_id = p.id) AS marketing_partners,
    (SELECT count(*)::int FROM vendor_projects WHERE technology_partner_id = p.id) AS vendor_projects,
    (SELECT count(*)::int FROM partner_documents WHERE partner_id = p.id) AS partner_documents,
    (SELECT count(*)::int FROM document_embeddings de JOIN partner_documents pd ON pd.id = de.document_id WHERE de.source_kind = 'partner_document' AND pd.partner_id = p.id) AS document_embeddings
  FROM partners p JOIN candidates c ON c.id = p.id ORDER BY p.id
`;

const countsSql = `
  SELECT
    (SELECT count(*)::int FROM partners) AS partners_total,
    (SELECT count(*)::int FROM partnership_requests) AS partnership_requests_total,
    (SELECT count(*)::int FROM student_recruitments) AS student_recruitments_total,
    (
      SELECT count(*)::int
      FROM partners
      WHERE ${candidatePartnerPredicate}
    ) AS test_partners_remaining,
    (
      SELECT count(*)::int
      FROM (
        SELECT 1
        FROM partnership_requests
        GROUP BY lower(trim(company_name)), lower(trim(contact_email))
        HAVING count(*) > 1
      ) duplicate_groups
    ) AS duplicate_request_groups
`;

const ramiRecruitmentSql = `
  SELECT id, student_first_name, student_last_name, contract_duration_months, start_date, end_date, recruitment_type, university_partner_id
  FROM student_recruitments
  WHERE lower(coalesce(student_first_name, '')) = 'rami' AND lower(coalesce(student_last_name, '')) = 'cherif'
  ORDER BY id
`;

const projectChildTables = ["project_documents", "project_allocations", "project_tasks", "milestones"];
const directPartnerChildTables = [
  "partner_events",
  "partner_meetings",
  "partner_contacts",
  "offers",
  "partner_kpis",
  "partner_notifications",
  "partner_status_history",
  "partner_documents",
  "technology_partners",
  "university_partners",
  "client_partners",
  "marketing_partners",
];

async function deleteRows(client, label, sql) {
  const result = await client.query(sql);
  const count = result.rowCount ?? 0;
  console.log(`${label}: ${count}`);
  return count;
}

async function collectSnapshot(client, title) {
  const counts = await client.query(countsSql);
  const rami = await client.query(ramiRecruitmentSql);
  printRows(`${title} counts`, counts.rows);
  printRows(`${title} Rami Cherif recruitment`, rami.rows);
  return { counts: counts.rows[0], rami: rami.rows };
}

async function main() {
  loadDotEnv(envPath);
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from .env");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const before = await collectSnapshot(client, "Before cleanup");
    const candidatePartners = await client.query(candidatePartnersSql);
    const childCounts = await client.query(candidatePartnerChildCountsSql);
    const duplicateGroups = await client.query(duplicateRequestGroupsSql);
    const requestsReferencingTestPartners = await client.query(`
      SELECT id, company_name, contact_email, status, created_partner_id, created_at
      FROM partnership_requests
      WHERE created_partner_id IN (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
      ORDER BY created_partner_id, id
    `);

    printRows("Test partner candidates", candidatePartners.rows);
    printRows("FK child counts for test partner candidates", childCounts.rows);
    printRows("Duplicate partnership request groups before delete", duplicateGroups.rows);
    printRows("Partnership requests referencing test partners", requestsReferencingTestPartners.rows);

    console.log("\n## Changes");
    const changed = {};

    changed.duplicateRequests = await deleteRows(client, "Deleted duplicate partnership_requests", `
      WITH duplicate_rows AS (
        SELECT id
        FROM (
          SELECT
            id,
            min(id) OVER (PARTITION BY lower(trim(company_name)), lower(trim(contact_email))) AS keep_id,
            count(*) OVER (PARTITION BY lower(trim(company_name)), lower(trim(contact_email))) AS duplicate_count
          FROM partnership_requests
        ) ranked
        WHERE duplicate_count > 1 AND id <> keep_id
      )
      DELETE FROM partnership_requests pr
      USING duplicate_rows dr
      WHERE pr.id = dr.id
    `);

    changed.testPartnerRequests = await deleteRows(client, "Deleted remaining requests tied to test partners", `
      DELETE FROM partnership_requests
      WHERE created_partner_id IN (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
    `);

    changed.documentEmbeddings = await deleteRows(client, "Deleted document_embeddings for test partner documents", `
      DELETE FROM document_embeddings
      WHERE source_kind = 'partner_document'
        AND document_id IN (
          SELECT id FROM partner_documents WHERE partner_id IN (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
        )
    `);

    for (const table of projectChildTables) {
      changed[table] = await deleteRows(client, `Deleted ${table} for test partner projects`, `
        DELETE FROM ${table}
        WHERE project_id IN (
          SELECT id FROM projects WHERE partner_id IN (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
        )
      `);
    }
    changed.projects = await deleteRows(client, "Deleted projects for test partners", `
      DELETE FROM projects
      WHERE partner_id IN (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
    `);

    changed.studentRecruitments = await deleteRows(client, "Deleted student_recruitments for test university partners", `
      DELETE FROM student_recruitments
      WHERE university_partner_id IN (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
    `);
    changed.vendorProjects = await deleteRows(client, "Deleted vendor_projects for test technology partners", `
      DELETE FROM vendor_projects
      WHERE technology_partner_id IN (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
    `);

    for (const table of directPartnerChildTables) {
      changed[table] = await deleteRows(client, `Deleted ${table}`, `
        DELETE FROM ${table}
        WHERE partner_id IN (SELECT id FROM partners WHERE ${candidatePartnerPredicate})
      `);
    }

    changed.partners = await deleteRows(client, "Deleted test partners", `
      DELETE FROM partners
      WHERE ${candidatePartnerPredicate}
    `);

    changed.testEvents = await deleteRows(client, "Deleted junk test partner_events", `
      DELETE FROM partner_events WHERE event_name ILIKE 'test%'
    `);
    changed.testOffers = await deleteRows(client, "Deleted junk test offers", `
      DELETE FROM offers WHERE title ILIKE 'test%'
    `);
    changed.junkRequests = await deleteRows(client, "Deleted junk-named partnership_requests", `
      DELETE FROM partnership_requests WHERE company_name ILIKE 'test%'
    `);

    const recruitmentFix = await client.query(`
      UPDATE student_recruitments
      SET contract_duration_months = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE lower(coalesce(student_first_name, '')) = 'rami'
        AND lower(coalesce(student_last_name, '')) = 'cherif'
        AND contract_duration_months = 0
      RETURNING id, student_first_name, student_last_name, contract_duration_months, start_date, end_date, recruitment_type
    `);
    changed.ramiRecruitmentFix = recruitmentFix.rowCount ?? 0;
    printRows("Rami Cherif rows fixed", recruitmentFix.rows);

    const after = await collectSnapshot(client, "After cleanup");

    await client.query("COMMIT");

    console.log("\n## Summary");
    console.log(JSON.stringify({ before, after, changed }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
