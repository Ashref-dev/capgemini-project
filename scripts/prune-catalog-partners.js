const fs = require("fs")
const path = require("path")
const { Pool } = require("pg")

const envPath = path.join(process.cwd(), ".env")

function loadDotEnv(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const separatorIndex = line.indexOf("=")
    if (separatorIndex === -1) continue
    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

const FLAGSHIP_IDS = [184, 187]

// A partner is "real" (kept) when it has genuine engagement: events, meetings,
// KPIs, contacts, offers, student recruitments, projects, or documents. The
// global vendor catalog rows carry only a single synthetic vendor_project (or
// nothing) and are pruned as noise. Flagships are always kept.
const deleteCandidatesSql = `
  WITH engagement AS (
    SELECT pa.id,
      (SELECT count(*) FROM partner_events WHERE partner_id = pa.id)
      + (SELECT count(*) FROM partner_meetings WHERE partner_id = pa.id)
      + (SELECT count(*) FROM partner_kpis WHERE partner_id = pa.id)
      + (SELECT count(*) FROM partner_contacts WHERE partner_id = pa.id)
      + (SELECT count(*) FROM offers WHERE partner_id = pa.id)
      + (SELECT count(*) FROM student_recruitments WHERE university_partner_id = pa.id)
      + (SELECT count(*) FROM projects WHERE partner_id = pa.id)
      + (SELECT count(*) FROM partner_documents WHERE partner_id = pa.id) AS signals
    FROM partners pa
  )
  SELECT id FROM engagement
  WHERE signals = 0 AND id <> ALL($1::int[])
`

const projectChildTables = ["project_documents", "project_allocations", "project_tasks", "milestones"]
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
]

async function deleteRows(client, label, sql, params) {
  const result = await client.query(sql, params)
  const count = result.rowCount ?? 0
  console.log(`${label}: ${count}`)
  return count
}

async function counts(client) {
  const res = await client.query(`
    SELECT
      (SELECT count(*)::int FROM partners) AS partners,
      (SELECT count(*)::int FROM vendor_projects) AS vendor_projects,
      (SELECT count(*)::int FROM technology_partners) AS technology_partners
  `)
  return res.rows[0]
}

async function main() {
  loadDotEnv(envPath)
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing from .env")

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const before = await counts(client)
    const candidatesRes = await client.query(deleteCandidatesSql, [FLAGSHIP_IDS])
    const ids = candidatesRes.rows.map((row) => row.id)
    console.log(`\n## Prune plan`)
    console.log(`Noise partners to delete: ${ids.length}`)

    if (ids.length === 0) {
      console.log("Nothing to prune. Already clean.")
      await client.query("COMMIT")
      console.log("\n## Counts", JSON.stringify(before))
      return
    }

    const sample = await client.query(
      `SELECT id, name, categories FROM partners WHERE id = ANY($1::int[]) ORDER BY id LIMIT 12`,
      [ids],
    )
    console.log("Sample:", sample.rows.map((r) => `${r.id}:${r.name}`).join(", "), "…")

    console.log("\n## Deletions")
    await deleteRows(
      client,
      "partnership_requests (created_partner_id)",
      `DELETE FROM partnership_requests WHERE created_partner_id = ANY($1::int[])`,
      [ids],
    )
    await deleteRows(
      client,
      "document_embeddings (partner_document)",
      `DELETE FROM document_embeddings WHERE source_kind = 'partner_document'
         AND document_id IN (SELECT id FROM partner_documents WHERE partner_id = ANY($1::int[]))`,
      [ids],
    )
    for (const table of projectChildTables) {
      await deleteRows(
        client,
        table,
        `DELETE FROM ${table} WHERE project_id IN (SELECT id FROM projects WHERE partner_id = ANY($1::int[]))`,
        [ids],
      )
    }
    await deleteRows(client, "projects", `DELETE FROM projects WHERE partner_id = ANY($1::int[])`, [ids])
    await deleteRows(
      client,
      "student_recruitments",
      `DELETE FROM student_recruitments WHERE university_partner_id = ANY($1::int[])`,
      [ids],
    )
    await deleteRows(
      client,
      "vendor_projects",
      `DELETE FROM vendor_projects WHERE technology_partner_id = ANY($1::int[])`,
      [ids],
    )
    for (const table of directPartnerChildTables) {
      await deleteRows(client, table, `DELETE FROM ${table} WHERE partner_id = ANY($1::int[])`, [ids])
    }
    await deleteRows(client, "partners", `DELETE FROM partners WHERE id = ANY($1::int[])`, [ids])

    const after = await counts(client)
    await client.query("COMMIT")

    console.log("\n## Summary")
    console.log(JSON.stringify({ before, after, deletedPartners: ids.length }, null, 2))
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
