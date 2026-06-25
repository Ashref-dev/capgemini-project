const fs = require("node:fs")
const path = require("node:path")
const { Pool } = require("pg")

const PARTNER_ID = 184
const MARKER = "[demo:langsmith]"
const seededContactEmails = [
  "marie.dubois@langsmith.dev",
  "thomas.nguyen@langchain.dev",
  "sarah.benali@langsmith.dev",
]
const seededKpis = [
  { year: 2025, quarter: 3 },
  { year: 2025, quarter: 4 },
  { year: 2026, quarter: 1 },
  { year: 2026, quarter: 2 },
]

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName)
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[match[1]] = value
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing in .env/.env.local")
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function monthsAgo(months) {
  const date = new Date()
  date.setUTCMonth(date.getUTCMonth() - months)
  return isoDate(date)
}

function monthsFromNow(months) {
  const date = new Date()
  date.setUTCMonth(date.getUTCMonth() + months)
  return isoDate(date)
}

function jsonTags(tags) {
  return JSON.stringify(tags)
}

async function fetchEmployee(client) {
  const result = await client.query(
    `select id, first_name, last_name, role, email
     from capgemini_employees
     where email = 'khaled.maatoug@capgemini.com'
     limit 1`,
  )
  if (result.rowCount === 0) throw new Error("Khaled Maatoug employee row not found")
  const employee = result.rows[0]
  return {
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    role: employee.role,
  }
}

async function deleteSeededRows(client) {
  const documentIds = await client.query(
    `select id from partner_documents where partner_id = $1 and description ilike $2`,
    [PARTNER_ID, `%${MARKER}%`],
  )
  if (documentIds.rowCount > 0) {
    await client.query(
      `delete from document_embeddings
       where source_kind = 'partner_document' and document_id = any($1::int[])`,
      [documentIds.rows.map((row) => row.id)],
    )
  }
  await client.query(`delete from partner_documents where partner_id = $1 and description ilike $2`, [PARTNER_ID, `%${MARKER}%`])

  const projectIds = await client.query(
    `select id from projects where partner_id = $1 and description ilike $2`,
    [PARTNER_ID, `%${MARKER}%`],
  )
  if (projectIds.rowCount > 0) {
    const ids = projectIds.rows.map((row) => row.id)
    await client.query(`delete from project_tasks where project_id = any($1::int[])`, [ids])
    await client.query(`delete from milestones where project_id = any($1::int[])`, [ids])
    await client.query(`delete from projects where id = any($1::int[])`, [ids])
  }

  await client.query(`delete from vendor_projects where technology_partner_id = $1 and notes ilike $2`, [PARTNER_ID, `%${MARKER}%`])
  await client.query(`delete from partner_events where partner_id = $1 and notes ilike $2`, [PARTNER_ID, `%${MARKER}%`])
  await client.query(
    `delete from partner_meetings where partner_id = $1 and (remarks ilike $2 or conclusions ilike $2)`,
    [PARTNER_ID, `%${MARKER}%`],
  )
  await client.query(
    `delete from partner_kpis where partner_id = $1 and (year, quarter) in (${seededKpis.map((_, index) => `($${index * 2 + 2}, $${index * 2 + 3})`).join(", ")})`,
    [PARTNER_ID, ...seededKpis.flatMap((kpi) => [kpi.year, kpi.quarter])],
  )
  await client.query(`delete from offers where partner_id = $1 and (description ilike $2 or terms_conditions ilike $2)`, [PARTNER_ID, `%${MARKER}%`])
  await client.query(`delete from partner_contacts where partner_id = $1 and email = any($2::text[])`, [PARTNER_ID, seededContactEmails])
}

async function updatePartner(client) {
  const result = await client.query(
    `update partners
     set categories = 'supplier',
         legal_name = 'LangSmith Inc.',
         website = 'https://www.langchain.com/langsmith',
         email = 'partenariats@langsmith.dev',
         phone = '+1 415 555 0184',
         address = '548 Market Street, San Francisco, CA, États-Unis',
         description = $2,
         partner_subcategory = 'Observabilité et évaluation LLMOps',
         partnership_level = 'platinum',
         partnership_start_date = $3,
         partnership_status = 'actif',
         annual_budget_tnd = 175000,
         satisfaction_score = 88,
         num_employees = 160,
         country = 'États-Unis',
         contract_end_date = $4,
         last_event_date = $5,
         annual_revenue_generated = 350000,
         updated_at = current_timestamp
     where id = $1
     returning id`,
    [
      PARTNER_ID,
      `${MARKER} Partenaire stratégique LangSmith pour l'observabilité, l'évaluation et la supervision des applications GenAI de Capgemini Tunisie. Le partenariat couvre la formation LLMOps, les revues qualité de prompts, les tableaux de bord d'expérimentation et le support dédié pour les comptes grands clients.`,
      monthsAgo(27),
      monthsFromNow(13),
      monthsAgo(1),
    ],
  )
  if (result.rowCount !== 1) throw new Error(`Partner ${PARTNER_ID} not found`)

  await client.query(
    `insert into technology_partners (
       partner_id, vendor_type, technologies, certifications_held, certification_level, partnership_model,
       commission_rate, discount_rate, annual_revenue_generated, num_projects_per_year, num_licenses_sold,
       comarketing_budget_annual, num_events_organized, has_master_agreement, agreement_signed_date,
       agreement_renewal_date, has_dedicated_support, support_sla_hours, notes, updated_at
     ) values ($1, 'Editeur SaaS LLMOps', $2, 18, 'Platinum', 'Co-sell et intégration conseil',
       12.5, 18.0, 350000, 9, 420, 65000, 6, true, $3, $4, true, 4, $5, current_timestamp)
     on conflict (partner_id) do update set
       vendor_type = excluded.vendor_type,
       technologies = excluded.technologies,
       certifications_held = excluded.certifications_held,
       certification_level = excluded.certification_level,
       partnership_model = excluded.partnership_model,
       commission_rate = excluded.commission_rate,
       discount_rate = excluded.discount_rate,
       annual_revenue_generated = excluded.annual_revenue_generated,
       num_projects_per_year = excluded.num_projects_per_year,
       num_licenses_sold = excluded.num_licenses_sold,
       comarketing_budget_annual = excluded.comarketing_budget_annual,
       num_events_organized = excluded.num_events_organized,
       has_master_agreement = true,
       agreement_signed_date = excluded.agreement_signed_date,
       agreement_renewal_date = excluded.agreement_renewal_date,
       has_dedicated_support = true,
       support_sla_hours = excluded.support_sla_hours,
       notes = excluded.notes,
       updated_at = current_timestamp`,
    [
      PARTNER_ID,
      ["LangSmith", "LangGraph", "OpenTelemetry", "LLMOps", "RAG evaluation"],
      monthsAgo(27),
      monthsFromNow(13),
      `${MARKER} Accord cadre actif avec support dédié 4h ouvrées, accès bêta aux fonctionnalités d'évaluation et revues trimestrielles de roadmap.`,
    ],
  )
}

async function insertEvents(client) {
  const events = [
    ["Webinaire exécutif : gouvernance LLMOps avec LangSmith", "webinaire", monthsAgo(11), "Visioconférence", 94, 14, 18, 5, 7800, 88, "termine", 42000, 438.46],
    ["Atelier pratique RAG sécurisé pour les équipes banque", "atelier", monthsAgo(9), "Capgemini Tunis", 42, 11, 9, 3, 6200, 91, "termine", 39000, 529.03],
    ["Journée technique observabilité GenAI", "journee_technique", monthsAgo(7), "The Dot, Tunis", 68, 16, 12, 4, 9100, 90, "termine", 56000, 515.38],
    ["Session de certification LangSmith pour architectes", "formation", monthsAgo(5), "Capgemini Learning Lab", 26, 8, 5, 2, 5400, 93, "termine", 28000, 418.52],
    ["Table ronde qualité des agents IA en production", "conference", monthsAgo(3), "Lac 2, Tunis", 57, 12, 11, 3, 8300, 87, "termine", 47000, 466.27],
    ["Bootcamp évaluation automatique des prompts", "atelier", monthsAgo(1), "Hybride", 36, 10, 8, 2, 5900, 86, "termine", 33000, 459.32],
  ]
  for (const event of events) {
    await client.query(
      `insert into partner_events (
        partner_id, event_name, event_type, event_date, event_location, num_participants,
        num_capgemini_attendees, num_leads_generated, num_conversions, event_budget,
        satisfaction_score, event_status, event_revenue, roi_event, notes
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [PARTNER_ID, ...event, `${MARKER} Événement LangSmith qualifié pour le demo graduation : contenu en français, leads suivis dans le pipeline GenAI.`],
    )
  }
}

async function insertMeetings(client, employee) {
  const meetings = [
    ["Revue trimestrielle LangSmith Q3 — adoption et valeur", monthsAgo(8), 75, "visioconference", 88],
    ["Comité de pilotage renouvellement et SLA", monthsAgo(6), 90, "presentiel", 91],
    ["Point architecture : traçabilité LangGraph et sécurité", monthsAgo(4), 60, "visioconference", 89],
    ["Revue commerciale comptes BIAT et Orange Tunisie", monthsAgo(2), 70, "telephonique", 86],
    ["Comité exécutif : plan d'expansion 2026", monthsAgo(1), 95, "presentiel", 93],
  ]
  for (const meeting of meetings) {
    await client.query(
      `insert into partner_meetings (
        partner_id, title, meeting_date, duration_minutes, employee_name, employee_role,
        employee_id, location, meeting_type, agenda, conclusions, remarks, agreements,
        shared_documents, satisfaction_score, next_steps
      ) values ($1,$2,$3::date + time '10:00',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        PARTNER_ID,
        meeting[0],
        meeting[1],
        meeting[2],
        employee.name,
        "Admin partenariat",
        employee.id,
        meeting[3] === "presentiel" ? "Capgemini Tunis" : "Microsoft Teams",
        meeting[3],
        "Suivi des engagements, analyse des indicateurs d'usage, priorisation des comptes et arbitrage support.",
        `${MARKER} Décisions validées : maintien du niveau platinum, amélioration continue des guides RAG et support prioritaire sur les incidents critiques.`,
        `${MARKER} Relation très saine : interlocuteurs réactifs, documentation complète et forte valeur perçue par les équipes delivery.`,
        "Accord sur le calendrier de formation, les revues mensuelles des incidents et la préparation du renouvellement.",
        "Compte rendu, tableau KPI, backlog support, matrice SLA.",
        meeting[4],
        "Finaliser les playbooks d'escalade et partager les métriques d'adoption avant la prochaine revue.",
      ],
    )
  }
}

async function insertKpis(client) {
  const rows = [
    [2025, 3, 42, 4, 54000, 215000, 24.5, 4, 260, 87.5],
    [2025, 4, 49, 5, 68000, 265000, 27.0, 5, 310, 88.8],
    [2026, 1, 55, 5, 73000, 305000, 28.5, 5, 365, 89.4],
    [2026, 2, 60, 6, 79000, 350000, 30.0, 6, 420, 90.0],
  ]
  for (const row of rows) {
    await client.query(
      `insert into partner_kpis (
        partner_id, year, quarter, total_interactions, total_events, total_budget_spent,
        total_revenue_generated, conversion_rate, total_projects, total_licenses_sold,
        avg_satisfaction_score, calculated_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,current_timestamp)`,
      [PARTNER_ID, ...row],
    )
  }
}

async function insertProjects(client, employee) {
  const projects = [
    ["Plateforme d'observabilité LLM LangSmith", "active", "G", "high", monthsAgo(10), monthsFromNow(2), 98000, 82, ["LLMOps", "observabilité", "GenAI"]],
    ["Intégration LangSmith × Capgemini AI Factory", "active", "G", "high", monthsAgo(8), monthsFromNow(4), 125000, 74, ["AI Factory", "RAG", "évaluation"]],
    ["Centre d'excellence prompts et datasets", "active", "Y", "medium", monthsAgo(6), monthsFromNow(5), 76000, 61, ["prompt engineering", "qualité", "formation"]],
    ["Accélérateur conformité agents IA", "planning", "G", "medium", monthsAgo(2), monthsFromNow(8), 68000, 28, ["conformité", "audit", "agents IA"]],
  ]
  for (const project of projects) {
    const inserted = await client.query(
      `insert into projects (
        name, partner_id, owner_employee_id, status, health, priority, start_date, end_date,
        budget, currency, percent_complete, tags, description
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'TND',$10,$11::jsonb,$12) returning id`,
      [project[0], PARTNER_ID, employee.id, project[1], project[2], project[3], project[4], project[5], project[6], project[7], jsonTags(project[8]), `${MARKER} ${project[0]} : initiative Capgemini-LangSmith avec objectifs mesurables, gouvernance projet et livrables en français pour le demo graduation.`],
    )
    const projectId = inserted.rows[0].id
    const milestones = ["Cadrage validé", "Pilote métier", "Industrialisation"]
    for (let index = 0; index < milestones.length; index += 1) {
      const milestone = await client.query(
        `insert into milestones (project_id, name, due_date, status, "order", description)
         values ($1,$2,$3,$4,$5,$6) returning id`,
        [projectId, milestones[index], monthsFromNow(index + 1), index === 0 ? "done" : index === 1 ? "in_progress" : "pending", index + 1, `${MARKER} Jalon ${milestones[index].toLowerCase()} pour ${project[0]}.`],
      )
      for (let task = 1; task <= (index === 1 ? 2 : 1); task += 1) {
        await client.query(
          `insert into project_tasks (project_id, milestone_id, name, assignee_employee_id, due_date, status, blocker_text)
           values ($1,$2,$3,$4,$5,$6,$7)`,
          [projectId, milestone.rows[0].id, `${milestones[index]} — tâche ${task}`, employee.id, monthsFromNow(index + task), index === 0 ? "done" : task === 1 ? "in_progress" : "todo", `${MARKER} Aucun blocage actif ; tâche suivie pour le scénario de démonstration LangSmith.`],
        )
      }
    }
  }
}

async function insertVendorProjects(client) {
  const rows = [
    ["Observabilité GenAI BIAT", "BIAT", "LLMOps bancaire", monthsAgo(22), monthsAgo(16), 7, 96000, 26000, 70000, 11500, "a_temps", 0, 2.5, 92, 7, 3, "termine", true],
    ["Évaluation RAG Amen Bank", "Amen Bank", "Qualité documentaire", monthsAgo(19), monthsAgo(13), 6, 88000, 24000, 64000, 10400, "en_avance", -8, -1.5, 90, 6, 2, "termine", true],
    ["Agent support Orange Tunisie", "Orange Tunisie", "Agent IA client", monthsAgo(15), monthsAgo(9), 6, 112000, 32000, 80000, 13200, "a_temps", 0, 1.0, 89, 8, 4, "termine", true],
    ["Copilote conformité Poulina Group", "Poulina Group Holding", "Audit GenAI", monthsAgo(12), monthsAgo(5), 7, 74000, 18000, 56000, 8500, "a_temps", 0, 3.2, 87, 5, 2, "termine", false],
    ["Tableaux de bord prompts Tunisie Telecom", "Tunisie Telecom", "Monitoring prompts", monthsAgo(9), monthsAgo(2), 7, 69000, 17000, 52000, 7900, "en_retard", 9, 5.6, 85, 5, 2, "termine", false],
    ["Fabrique d'évaluation LLM STB", "STB Bank", "Évaluation LLM", monthsAgo(5), null, 10, 124000, 36000, 88000, 14600, "a_temps", 0, 1.8, 91, 8, 3, "en_cours", true],
  ]
  for (const row of rows) {
    await client.query(
      `insert into vendor_projects (
        technology_partner_id, project_name, project_description, client_name, project_type,
        technologies_used, start_date, end_date, duration_months, project_value, license_cost,
        services_cost, commission_earned, delivery_status, delay_days, budget_variance_percentage,
        client_satisfaction_score, num_consultants_capgemini, num_consultants_vendor,
        project_status, is_reference_project, notes
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
      [PARTNER_ID, row[0], `${MARKER} Projet livré avec LangSmith : traçabilité des exécutions, datasets d'évaluation et rapports de qualité pour ${row[1]}.`, row[1], row[2], ["LangSmith", "LangGraph", "RAG", "OpenTelemetry"], ...row.slice(3), `${MARKER} Référence réaliste pour démontrer le track record fournisseur LangSmith.`],
    )
  }
}

async function insertContactsAndOffers(client) {
  const contacts = [
    ["Marie", "Dubois", seededContactEmails[0], "+1 415 555 0110", "Directrice partenariats EMEA", true],
    ["Thomas", "Nguyen", seededContactEmails[1], "+1 415 555 0128", "Architecte solutions LangSmith", false],
    ["Sarah", "Ben Ali", seededContactEmails[2], "+33 1 84 88 55 41", "Responsable succès client francophone", false],
  ]
  for (const contact of contacts) {
    await client.query(
      `insert into partner_contacts (partner_id, first_name, last_name, email, phone, role, is_primary)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [PARTNER_ID, ...contact],
    )
  }

  const offers = [
    ["Crédit pilote LangSmith pour comptes GenAI", "percentage", monthsAgo(2), monthsFromNow(10), 14, 64000, "Comptes stratégiques Capgemini"],
    ["Pack formation LLMOps francophone", "fixed", monthsAgo(1), monthsFromNow(8), 9, 28000, "Architectes et équipes delivery"],
    ["Remise renouvellement platinum 2026", "percentage", monthsAgo(0), monthsFromNow(13), 5, 83000, "Renouvellements annuels"],
  ]
  for (const offer of offers) {
    await client.query(
      `insert into offers (
        partner_id, title, description, discount_type, start_date, end_date,
        terms_conditions, is_active, usage_count, total_value_tnd, target_audience
      ) values ($1,$2,$3,$4,$5,$6,$7,true,$8,$9,$10)`,
      [PARTNER_ID, offer[0], `${MARKER} Offre LangSmith activée pour accélérer les démonstrateurs clients et sécuriser les renouvellements GenAI.`, offer[1], offer[2], offer[3], `${MARKER} Conditions : activation sur opportunités validées par Capgemini, revue mensuelle des consommations et conformité aux politiques sécurité client.`, offer[4], offer[5], offer[6]],
    )
  }
}

const ragDocuments = [
  {
    fileName: "langsmith-contrat-partenariat-demo.md",
    originalName: "Contrat de partenariat LangSmith - Capgemini Tunisie.md",
    text: `${MARKER}\n# Contrat de partenariat LangSmith — Capgemini Tunisie\n\nLe partenariat platinum entre Capgemini Tunisie et LangSmith couvre l'observabilité des applications GenAI, l'évaluation automatisée des prompts, la constitution de jeux de données de référence et la supervision des agents LangGraph en production. LangSmith s'engage à fournir un accès SaaS sécurisé, une documentation technique à jour en français ou en anglais, un support expert pour les équipes Capgemini et une revue trimestrielle de la roadmap.\n\nLes obligations contractuelles incluent la protection des données de traces, la restriction des accès aux espaces clients, la conservation contrôlée des journaux d'exécution, la notification des incidents de sécurité et la disponibilité d'un interlocuteur technique dédié. Capgemini s'engage à qualifier les cas d'usage, former les équipes delivery, respecter les politiques de confidentialité client et communiquer les prévisions de consommation au moins trente jours avant les pics prévus.\n\nLa durée initiale du contrat est de vingt-quatre mois avec prise d'effet au 1er mars 2024. Le budget annuel de référence est fixé à 175 000 TND, incluant licences, accompagnement technique, ateliers et crédits d'expérimentation. Toute extension à un nouveau client bancaire ou télécom fait l'objet d'un bon de commande rattaché au présent contrat.`,
  },
  {
    fileName: "langsmith-avenant-renouvellement-demo.md",
    originalName: "Avenant de renouvellement LangSmith 2026.md",
    text: `${MARKER}\n# Avenant de renouvellement LangSmith 2026\n\nLe renouvellement du partenariat LangSmith est prévu pour treize mois supplémentaires à compter de la date d'échéance contractuelle. Les conditions de renouvellement sont déclenchées si le score de satisfaction moyen reste supérieur à 85/100, si au moins quatre projets de référence sont documentés et si les engagements SLA critiques ont été respectés sur les deux derniers trimestres.\n\nL'avenant maintient le niveau platinum et prévoit une remise de renouvellement de 18 % sur les licences LangSmith utilisées par les équipes Capgemini Tunisie. Les tarifs sont indexés sur le volume de traces, le nombre d'environnements projet et les modules d'évaluation activés. Les prestations d'architecture, de formation LLMOps et de revue de prompts sont facturées séparément lorsque le périmètre dépasse les enveloppes incluses.\n\nEn cas de non-renouvellement, les espaces de travail restent accessibles en lecture pendant quatre-vingt-dix jours pour permettre l'export des datasets, évaluations et rapports d'observabilité. Les parties conviennent de préparer la décision de renouvellement au moins soixante jours avant l'échéance afin de garantir la continuité des démonstrateurs GenAI.`,
  },
  {
    fileName: "langsmith-sla-support-demo.md",
    originalName: "SLA support dédié LangSmith - Production GenAI.md",
    text: `${MARKER}\n# Accord de niveau de service LangSmith\n\nLangSmith fournit un support dédié aux équipes Capgemini avec un délai de première réponse de quatre heures ouvrées pour les incidents critiques de production. Les incidents critiques concernent l'indisponibilité de l'interface d'observabilité, l'impossibilité d'ingérer des traces, la corruption d'un dataset d'évaluation ou l'échec bloquant d'un tableau de bord utilisé par un client.\n\nLa disponibilité cible du service est de 99,5 % par mois calendaire, hors fenêtres de maintenance annoncées au moins cinq jours ouvrés à l'avance. Pour les incidents majeurs, LangSmith communique un point d'avancement toutes les deux heures ouvrées jusqu'à contournement ou résolution. Les demandes standard de configuration, d'accès ou de conseil sont traitées sous deux jours ouvrés.\n\nLe SLA inclut une revue mensuelle des tickets, un rapport de tendances sur les erreurs d'exécution LLM, des recommandations d'optimisation des datasets et un plan d'amélioration continue. Les pénalités éventuelles prennent la forme de crédits de service lorsque la disponibilité mensuelle descend sous le seuil contractuel sans cause imputable à Capgemini ou à un client final.`,
  },
]

async function insertRagDocuments(client, employee) {
  const ids = []
  for (const document of ragDocuments) {
    const result = await client.query(
      `insert into partner_documents (
        partner_id, file_name, original_name, file_type, file_size, file_path,
        description, uploaded_by, uploaded_by_type, uploaded_by_id
      ) values ($1,$2,$3,'text/markdown',$4,$5,$6,$7,'employee',$8) returning id`,
      [
        PARTNER_ID,
        document.fileName,
        document.originalName,
        Buffer.byteLength(document.text, "utf8"),
        `/demo/langsmith/${document.fileName}`,
        `${MARKER} ${document.originalName} — document de démonstration indexé pour citations RAG.`,
        employee.name,
        employee.id,
      ],
    )
    ids.push({ id: result.rows[0].id, text: document.text, fileName: document.fileName })
  }
  return ids
}

async function collectCounts(client) {
  const result = await client.query(
    `with seeded_projects as (select id from projects where partner_id = $1 and description ilike $2),
          seeded_documents as (select id from partner_documents where partner_id = $1 and description ilike $2)
     select
       (select count(*)::int from partner_events where partner_id = $1 and notes ilike $2) as partner_events,
       (select count(*)::int from partner_meetings where partner_id = $1 and (remarks ilike $2 or conclusions ilike $2)) as partner_meetings,
       (select count(*)::int from partner_kpis where partner_id = $1 and (year, quarter) in ((2025,3),(2025,4),(2026,1),(2026,2))) as partner_kpis,
       (select count(*)::int from seeded_projects) as projects,
       (select count(*)::int from milestones where project_id in (select id from seeded_projects)) as milestones,
       (select count(*)::int from project_tasks where project_id in (select id from seeded_projects)) as project_tasks,
       (select count(*)::int from vendor_projects where technology_partner_id = $1 and notes ilike $2) as vendor_projects,
       (select count(*)::int from partner_contacts where partner_id = $1 and email = any($3::text[])) as seeded_partner_contacts,
       (select count(*)::int from partner_contacts where partner_id = $1) as total_partner_contacts,
       (select count(*)::int from offers where partner_id = $1 and (description ilike $2 or terms_conditions ilike $2)) as offers,
       (select count(*)::int from seeded_documents) as partner_documents,
       (select count(*)::int from document_embeddings where source_kind = 'partner_document' and document_id in (select id from seeded_documents)) as document_embeddings,
       (select count(*)::int from document_embeddings de join partner_documents pd on pd.id = de.document_id where pd.partner_id = $1 and de.source_kind = 'partner_document') as total_partner_document_embeddings`,
    [PARTNER_ID, `%${MARKER}%`, seededContactEmails],
  )
  return result.rows[0]
}

async function seedRelationalData() {
  const client = await pool.connect()
  try {
    await client.query("begin")
    const employee = await fetchEmployee(client)
    await deleteSeededRows(client)
    await updatePartner(client)
    await insertEvents(client)
    await insertMeetings(client, employee)
    await insertKpis(client)
    await insertProjects(client, employee)
    await insertVendorProjects(client)
    await insertContactsAndOffers(client)
    const documents = await insertRagDocuments(client, employee)
    await client.query("commit")
    return documents
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

async function ingestRagDocuments(documents) {
  const { ingestDocument } = await import("../lib/server/agent/ingest.ts")
  const results = []
  for (const document of documents) {
    const result = await ingestDocument("partner_document", document.id, document.text)
    results.push({ id: document.id, fileName: document.fileName, chunksInserted: result.chunksInserted })
  }
  return results
}

async function main() {
  const documents = await seedRelationalData()
  const ingestion = await ingestRagDocuments(documents)
  const client = await pool.connect()
  try {
    const counts = await collectCounts(client)
    console.log(JSON.stringify({ partnerId: PARTNER_ID, marker: MARKER, counts, ingestion }, null, 2))
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(async (error) => {
  console.error(error)
  await pool.end().catch(() => {})
  process.exit(1)
})
