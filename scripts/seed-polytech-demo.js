const fs = require("node:fs")
const path = require("node:path")
const { Pool } = require("pg")

const PARTNER_NAME = "Polytechnique Internationale (Polytech Intl)"
const MARKER = "[demo:polytech]"

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName)
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    process.env[match[1]] = value
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing in .env/.env.local")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function fetchEmployee(client) {
  const result = await client.query(
    `select id, first_name, last_name, role from capgemini_employees
     where email in ('khaled.maatoug@capgemini.com','mouna.baccar@capgemini.com')
     order by case when email = 'khaled.maatoug@capgemini.com' then 0 else 1 end limit 1`,
  )
  if (result.rowCount === 0) throw new Error("Demo employee row not found")
  const employee = result.rows[0]
  return { id: employee.id, name: `${employee.first_name} ${employee.last_name}`, role: employee.role }
}

async function resolvePartnerId(client) {
  const existing = await client.query(`select id from partners where name = $1 order by id limit 1`, [PARTNER_NAME])
  if (existing.rowCount > 0) return existing.rows[0].id
  const inserted = await client.query(
    `insert into partners (name, categories, partnership_status, country, description)
     values ($1, 'university', 'actif', 'Tunisie', $2) returning id`,
    [PARTNER_NAME, `${MARKER} Partenaire universitaire Polytech Intl créé pour la démonstration graduation.`],
  )
  return inserted.rows[0].id
}

async function deleteSeededRows(client, partnerId) {
  const documents = await client.query(`select id from partner_documents where partner_id = $1 and description ilike $2`, [partnerId, `%${MARKER}%`])
  if (documents.rowCount > 0) {
    await client.query(`delete from document_embeddings where source_kind = 'partner_document' and document_id = any($1::int[])`, [documents.rows.map((row) => row.id)])
  }
  await client.query(`delete from partner_documents where partner_id = $1 and description ilike $2`, [partnerId, `%${MARKER}%`])
  await client.query(`delete from offers where partner_id = $1 and (description ilike $2 or terms_conditions ilike $2)`, [partnerId, `%${MARKER}%`])
  await client.query(`delete from partner_events where partner_id = $1 and notes ilike $2`, [partnerId, `%${MARKER}%`])
  await client.query(`delete from partner_meetings where partner_id = $1 and (remarks ilike $2 or conclusions ilike $2)`, [partnerId, `%${MARKER}%`])
  await client.query(`delete from partner_kpis where partner_id = $1 and (year, quarter) in ((2025,1),(2025,2),(2025,3),(2025,4))`, [partnerId])
  await client.query(`delete from student_recruitments where university_partner_id = $1 and notes ilike $2`, [partnerId, `%${MARKER}%`])
}

async function upsertPartner(client, partnerId) {
  await client.query(
    `update partners set categories='university', legal_name='École Polytechnique Internationale Privée de Tunis', website='https://pi.tn',
      email='contact@pi.tn', phone='+216 71 941 541', address='Tunis, Tunisie', partner_subcategory='École d’ingénieurs privée EUR-ACE',
      partnership_level='platinum', partnership_start_date='2021-09-15', partnership_status='actif', annual_budget_tnd=175000,
      satisfaction_score=88, num_employees=120, country='Tunisie', contract_end_date='2027-09-30', last_event_date='2026-03-18',
      annual_revenue_generated=150000, description=$2, updated_at=current_timestamp where id=$1`,
    [partnerId, `${MARKER} Polytech Intl est l’École Polytechnique Internationale Privée de Tunis, fondée en 2013 au sein d’ISAT et dirigée par Dr Imène Kacem. Le partenariat Capgemini cible les cursus EUR-ACE/DNI IRM, mécatronique et génie industriel, la licence GLSI orientée IA, le Master Data Science et l’option Big Data & IA pour renforcer le vivier stages PFE, alternance et CDI jeunes diplômés.`],
  )
  await client.query(
    `insert into university_partners (partner_id, institution_type, num_students, specialties, num_interns_per_year, num_apprentices_per_year,
      num_hires_per_year, conversion_rate_to_cdi, average_hire_duration_months, annual_sponsorship_budget, budget_breakdown,
      num_events_per_year, last_event_date, has_framework_agreement, agreement_signed_date, notes, updated_at)
     values ($1,'École d’ingénieurs privée',1800,$2,90,35,22,40,12,120000,$3::jsonb,8,'2026-03-18',true,'2025-02-12',$4,current_timestamp)
     on conflict (partner_id) do update set institution_type=excluded.institution_type, num_students=excluded.num_students, specialties=excluded.specialties,
      num_interns_per_year=excluded.num_interns_per_year, num_apprentices_per_year=excluded.num_apprentices_per_year, num_hires_per_year=excluded.num_hires_per_year,
      conversion_rate_to_cdi=excluded.conversion_rate_to_cdi, average_hire_duration_months=excluded.average_hire_duration_months,
      annual_sponsorship_budget=excluded.annual_sponsorship_budget, budget_breakdown=excluded.budget_breakdown, num_events_per_year=excluded.num_events_per_year,
      last_event_date=excluded.last_event_date, has_framework_agreement=true, agreement_signed_date=excluded.agreement_signed_date, notes=excluded.notes, updated_at=current_timestamp`,
    [partnerId, ["IRM Big Data & IA", "Big Data & Business Intelligence", "IT Finance", "Systèmes embarqués et mobiles", "Systèmes d'information et logiciel", "Génie Industriel", "Mécatronique", "Architecture DNA", "Licence GLSI orientée IA", "Master Data Science", "Master 5G & Secure Computing", "Master Ingénierie du logiciel"], JSON.stringify({ stagesPfe: 46000, alternance: 30000, evenements: 26000, bourses: 18000 }), `${MARKER} EUR-ACE depuis septembre 2018 via CTI, renouvelé en 2022 et valable 2027-2028 pour IRM, mécatronique et génie industriel; DNI autorisé; partenariat AEC Québec/UQAC pour GLSI.`],
  )
}

async function insertEvents(client, partnerId) {
  const rows = [
    ["Summer Camp 2025 — ateliers IA appliquée", "formation", "2025-07-18", "Campus Polytech Intl, Tunis", 140, 8, 24, 6, 16000, 90, "termine", 28000, 75],
    ["Spring School 2025 — data, cloud et employabilité", "formation", "2025-04-12", "Tunis", 115, 7, 18, 5, 13000, 88, "termine", 24000, 84.62],
    ["Formation SAP S/4HANA & Certification Internationale", "formation", "2025-05-24", "Polytech Intl", 72, 5, 12, 3, 11000, 86, "termine", 19000, 72.73],
    ["Formation Courte Développement Mobile Flutter", "atelier", "2025-10-09", "Laboratoire GLSI", 64, 4, 10, 3, 8500, 87, "termine", 16000, 88.24],
    ["Conférence-Débat Auto-Entrepreneuriat", "conference", "2025-11-20", "Amphithéâtre Polytech Intl", 180, 6, 20, 4, 9000, 89, "termine", 21000, 133.33],
    ["Forum Recrutement Capgemini × Polytech Intl 2025", "forum", "2025-12-04", "Campus Polytech Intl, Tunis", 260, 14, 46, 11, 22000, 93, "termine", 42000, 90.91],
    ["AI Hackathon Capgemini 2026", "hackathon", "2026-03-18", "Capgemini Tunis & Polytech Intl", 96, 12, 28, 8, 24500, 92, "termine", 39000, 59.18],
  ]
  for (const row of rows) await client.query(
    `insert into partner_events (partner_id,event_name,event_type,event_date,event_location,num_participants,num_capgemini_attendees,num_leads_generated,num_conversions,event_budget,satisfaction_score,event_status,event_revenue,roi_event,notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [partnerId, ...row, `${MARKER} Événement Polytech Intl basé sur le calendrier 2025-2026 et orienté pipeline IA/data Capgemini Tunisie.`],
  )
}

async function insertMeetings(client, partnerId, employee) {
  const rows = [
    ["Revue accord-cadre académique Capgemini × Polytech Intl", "2025-02-12", 90, "presentiel", 91],
    ["Planification recrutement PFE IA/Data 2025", "2025-03-18", 75, "visioconference", 89],
    ["Alignement curriculum IA — GLSI, BD-IA et Master Data Science", "2025-06-10", 80, "presentiel", 92],
    ["Comité de pilotage alternance Data Engineering", "2025-09-16", 70, "telephonique", 86],
    ["Bilan forum recrutement et conversions CDI", "2025-12-18", 85, "presentiel", 93],
  ]
  for (const row of rows) await client.query(
    `insert into partner_meetings (partner_id,title,meeting_date,duration_minutes,employee_name,employee_role,employee_id,location,meeting_type,agenda,conclusions,remarks,agreements,shared_documents,satisfaction_score,next_steps)
     values ($1,$2,$3::date + time '10:00',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [partnerId, row[0], row[1], row[2], employee.name, employee.role || "Responsable partenariats", employee.id, row[3] === "presentiel" ? "Tunis" : "Microsoft Teams", row[3], "Suivi de l’accord-cadre, besoins PFE, alternance, CDI jeunes diplômés et contenus IA/data.", `${MARKER} Décisions : prioriser les profils IRM BD-IA, GLSI IA, Data Science, mécatronique logicielle et génie industriel data-driven.`, `${MARKER} Relation excellente avec Polytech Intl; forte réactivité académique et adéquation avec les besoins Capgemini Tunisie.`, "Calendrier PFE validé, comité trimestriel, intervention Capgemini dans les modules employabilité et IA responsable.", "Accord-cadre, convention stages, planning forum, cartographie compétences.", row[4], "Partager les offres PFE et confirmer les jurys techniques Capgemini."],
  )
}

async function insertKpis(client, partnerId) {
  const rows = [[2025, 1, 38, 2, 31000, 7, 3, 1, 24.0, 52000, 88.0], [2025, 2, 46, 4, 47000, 18, 8, 3, 29.0, 88000, 88.7], [2025, 3, 54, 5, 62000, 32, 16, 6, 33.0, 124000, 89.2], [2025, 4, 60, 7, 79000, 45, 25, 8, 35.0, 150000, 90.0]]
  for (const row of rows) await client.query(
    `insert into partner_kpis (partner_id,year,quarter,total_interactions,total_events,total_budget_spent,total_interns,total_apprentices,total_hires,conversion_rate,total_revenue_generated,avg_satisfaction_score,calculated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,current_timestamp)`, [partnerId, ...row])
}

async function insertRecruitments(client, partnerId) {
  const rows = [
    ["Yasmine","Trabelsi","stage",6,"2023-02-06","2023-07-31","ingénieur","IRM BD-IA",["Python","ML","SQL"],"Assistant scoring partenaires","Capgemini AI","Mouna Baccar",4,90,false,null,null],
    ["Ahmed","Mansouri","stage",6,"2023-02-13","2023-08-15","ingénieur","Génie Industriel",["Power BI","Process Mining","SQL"],"Optimisation reporting delivery","Data & Insights","Khaled Maatoug",4,86,false,null,null],
    ["Sarra","Khemiri","alternance",12,"2023-09-04","2024-08-30","master","Data Science",["Python","MLOps","Airflow"],"Pipeline prévision charge projet","Data Engineering","Mouna Baccar",5,92,false,null,null],
    ["Omar","Ben Salah","alternance",12,"2023-10-02","2024-09-30","ingénieur","Mécatronique",["C++","IoT","Python"],"Monitoring edge industriel","Cloud & IoT","Khaled Maatoug",4,84,false,null,null],
    ["Nour","Mejri","stage",6,"2024-02-05","2024-07-31","licence","GLSI orientée IA",["React","Node.js","NLP"],"Portail chatbot RH","Capgemini AI","Mouna Baccar",5,91,false,null,null],
    ["Malek","Gharbi","stage",6,"2024-02-12","2024-08-15","ingénieur","Systèmes d'information et logiciel",["Java","Spring","PostgreSQL"],"Modernisation API partenaires","Software Engineering","Khaled Maatoug",4,87,false,null,null],
    ["Ines","Bouzid","cdi_jeune_diplome",0,"2024-09-02",null,"master","5G & Secure Computing",["Cybersecurity","5G","Linux"],"Sécurité cloud telco","Cloud Security","Mouna Baccar",4,90,true,"2024-09-02","3300-4100 TND"],
    ["Mehdi","Jlassi","stage",6,"2024-02-19","2024-08-16","ingénieur","IT Finance",["Java","Kafka","Finance"],"Automatisation rapprochement bancaire","Financial Services","Khaled Maatoug",4,85,false,null,null],
    ["Rania","Haddad","alternance",12,"2024-09-09","2025-08-29","ingénieur","Big Data & Business Intelligence",["Spark","dbt","Power BI"],"Lakehouse RH","Data Engineering","Mouna Baccar",5,93,true,"2025-09-15","3400-4200 TND"],
    ["Karim","Ayari","stage",6,"2025-02-03","2025-07-31","ingénieur","Systèmes embarqués et mobiles",["Flutter","Kotlin","APIs"],"Application mobile terrain","Digital Factory","Khaled Maatoug",4,82,false,null,null],
    ["Lina","Saidi","stage",6,"2025-02-10","2025-08-08","master","Ingénierie du logiciel",["TypeScript","Testing","CI/CD"],"Qualité portail partenaires","Software Engineering","Mouna Baccar",4,88,false,null,null],
    ["Taha","Zouari","alternance",12,"2025-09-01","2026-08-31","master","Data Science",["Python","GenAI","RAG"],"Assistant RAG documentaire","Capgemini AI","Khaled Maatoug",5,95,true,"2026-09-14","3600-4500 TND"],
    ["Aya","Ferchichi","stage",6,"2025-02-17","2025-08-15","ingénieur","IRM BD-IA",["Python","Computer Vision","MLflow"],"Contrôle qualité visuel IA","Capgemini AI","Mouna Baccar",5,94,true,"2025-10-01","3500-4300 TND"],
    ["Sami","Chaabane","stage",6,"2025-03-03","2025-08-29","ingénieur","Génie Industriel",["Lean","Python","Analytics"],"Tableaux efficacité opérationnelle","Operations Analytics","Khaled Maatoug",4,86,false,null,null],
    ["Eya","Karray","alternance",12,"2025-09-08","2026-08-28","licence","GLSI orientée IA",["React","Python","Prompt Engineering"],"Expérience utilisateur agent IA","Digital Factory","Mouna Baccar",5,91,false,null,null],
    ["Fares","Mrad","stage",6,"2026-02-02","2026-07-31","ingénieur","Mécatronique",["ROS","Python","IoT"],"Démonstrateur jumeau numérique","Industry X","Khaled Maatoug",4,86,false,null,null],
    ["Meriem","Kooli","stage",6,"2026-02-09","2026-08-07","master","Data Science",["NLP","RAG","Vector DB"],"Recherche sémantique contrats","Capgemini AI","Mouna Baccar",5,95,true,"2026-09-01","3700-4600 TND"],
    ["Walid","Bennour","alternance",12,"2026-01-12","2026-12-31","ingénieur","Big Data & Business Intelligence",["Spark","Azure","SQL"],"Industrialisation data quality","Data Engineering","Khaled Maatoug",4,89,true,"2026-06-15","3400-4300 TND"],
    ["Salma","Rekik","stage",6,"2026-02-16","2026-08-14","ingénieur","IT Finance",["Java","Risk","SQL"],"Moteur règles conformité","Financial Services","Mouna Baccar",4,87,true,"2026-06-17","3300-4100 TND"],
    ["Islem","Guesmi","cdi_jeune_diplome",0,"2026-03-02",null,"ingénieur","Systèmes d'information et logiciel",["TypeScript","Cloud","DevOps"],"Plateforme intégration partenaires","Software Engineering","Khaled Maatoug",4,90,true,"2026-03-02","3500-4400 TND"],
  ]
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    await client.query(
      `insert into student_recruitments (university_partner_id,student_first_name,student_last_name,student_email,student_phone,recruitment_type,contract_duration_months,start_date,end_date,degree_level,specialization,skills,assigned_project,assigned_team,manager_name,manager_email,performance_score,satisfaction_score,converted_to_cdi,cdi_start_date,cdi_salary_range,notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'talent@capgemini.com',$16,$17,$18,$19,$20,$21)`,
      [partnerId, row[0], row[1], `${row[0].toLowerCase()}.${row[1].toLowerCase()}@polytech-intl.tn`, `+216 5${String(1000000 + index).padStart(7, "0")}`, ...row.slice(2), `${MARKER} Recrutement Polytech Intl aligné avec le vivier IA/data, PFE, alternance et CDI jeunes diplômés Capgemini Tunisie.`],
    )
  }
}

async function insertOffers(client, partnerId) {
  const rows = [["Programme de stages PFE IA Capgemini × Polytech Intl", "fixed", "2025-01-15", "2026-12-31", 14, 68000, "Étudiants IRM BD-IA, GLSI IA et Master Data Science"], ["Parcours alternance Data Engineering", "percentage", "2025-09-01", "2027-08-31", 8, 52000, "Alternants data, BI, cloud et logiciel"]]
  for (const row of rows) await client.query(
    `insert into offers (partner_id,title,description,discount_type,start_date,end_date,terms_conditions,is_active,usage_count,total_value_tnd,target_audience)
     values ($1,$2,$3,$4,$5,$6,$7,true,$8,$9,$10)`,
    [partnerId, row[0], `${MARKER} Offre académique Polytech Intl pour sécuriser un flux qualifié de stages, alternance et recrutements IA/data.`, row[1], row[2], row[3], `${MARKER} Conditions : sélection conjointe Capgemini/Polytech Intl, calendrier PFE publié, suivi mensuel et priorité aux cursus accrédités EUR-ACE/DNI.`, row[4], row[5], row[6]],
  )
}

const ragDocuments = [
  { fileName: "polytech-accord-cadre-2025.md", originalName: "Accord-cadre partenariat académique Capgemini × Polytech Intl 2025.md", text: `${MARKER}\n# Accord-cadre de partenariat académique Capgemini × Polytech Intl — 2025\n\nL’accord-cadre signé le 12 février 2025 associe Capgemini Tunisie et l’École Polytechnique Internationale Privée de Tunis, dite Polytech Intl, école privée tunisienne fondée en 2013 au sein du groupe ISAT et dirigée par Dr Imène Kacem. L’établissement est autorisé à délivrer le Diplôme National d’Ingénieur et dispose du label européen EUR-ACE via la CTI depuis septembre 2018, renouvelé en 2022 et valable jusqu’à 2027-2028 pour IRM, Mécatronique et Génie Industriel.\n\nLe partenariat cible les besoins Capgemini en intelligence artificielle, data engineering, logiciel, cloud, 5G sécurisé et systèmes embarqués. Les viviers prioritaires Polytech Intl sont la licence Informatique GLSI fortement orientée IA, le Master Data Science, le Master 5G & Secure Computing, le Master Ingénierie du logiciel et le cycle ingénieur IRM avec options Big Data & IA, Big Data & Business Intelligence, IT Finance, systèmes embarqués et mobiles, systèmes d’information et logiciel.\n\nLes engagements Polytech Intl 2025-2026 prévoient des interventions métiers Capgemini, des jurys PFE, un forum recrutement annuel, un AI Hackathon Capgemini 2026 et des indicateurs trimestriels de satisfaction, conversion CDI et adéquation des compétences.` },
  { fileName: "polytech-convention-stages-alternance-2025.md", originalName: "Convention stages PFE et alternance Polytech Intl - Capgemini 2025.md", text: `${MARKER}\n# Convention de stages PFE et alternance — Polytech Intl / Capgemini Tunisie\n\nLa convention 2025 organise l’accueil des étudiants Polytech Intl en stages PFE, alternance et projets tutorés chez Capgemini Tunisie. Elle s’appuie sur la croissance de l’école, passée de 60 étudiants ingénieurs en 2014/2015 à 428 en 2021/2022, et sur un effectif total plausible d’environ 1 800 étudiants au milieu des années 2020. Les parcours concernés couvrent IRM Big Data & IA, GLSI orientée Intelligence Artificielle, Data Science, Génie Industriel, Mécatronique, IT Finance et ingénierie logicielle.\n\nCapgemini propose des sujets PFE en RAG documentaire, MLOps, data quality, cloud sécurisé, automatisation bancaire, applications Flutter et analytics industriels. Polytech Intl assure la présélection académique, le suivi pédagogique, la disponibilité des encadrants et la coordination avec les partenaires académiques, notamment l’AEC Québec/UQAC pour les étudiants GLSI.\n\nLes objectifs 2025-2026 sont de 90 stagiaires par an, 35 alternants, un taux de conversion CDI voisin de 40 % et des revues mensuelles avec les managers Capgemini pour sécuriser la qualité d’intégration.` },
  { fileName: "polytech-recrutement-jeunes-diplomes-2026.md", originalName: "Programme recrutement jeunes diplômés Polytech Intl 2026.md", text: `${MARKER}\n# Programme de recrutement jeunes diplômés Polytech Intl — Promotion 2026\n\nLe programme Capgemini de recrutement jeunes diplômés Polytech Intl 2026 cible les profils IA, data engineering, logiciel, cloud, cybersécurité 5G, mécatronique logicielle et génie industriel digitalisé. Il complète les événements réels 2025 de l’école, notamment Summer Camp 2025, Spring School 2025, Formation SAP S/4HANA & Certification Internationale, Formation Courte Développement Mobile Flutter et Conférence-Débat Auto-Entrepreneuriat.\n\nPolytech Intl apporte un réseau d’entreprises déjà actif avec Orange Tunisie, Tunisair, Microsoft, Amen Bank, Coficab, SOFRECOM, GOMYCODE, Caterpillar, ENNAKL, Delphi-Packard et des partenaires académiques comme UQAC, Université de Liège et ESIEE Amiens. Capgemini positionne le Forum Recrutement Capgemini × Polytech Intl 2025 et l’AI Hackathon Capgemini 2026 comme points de qualification des candidats Polytech Intl.\n\nLe dispositif Polytech Intl prévoit entretiens techniques, challenge IA, coaching CV, simulations client et propositions CDI jeunes diplômés pour les meilleurs stagiaires et alternants. Les indicateurs suivis sont le délai moyen de recrutement, la performance projet, la satisfaction manager, la conversion CDI et la rétention à douze mois.` },
]

async function insertRagDocuments(client, partnerId, employee) {
  const ids = []
  for (const document of ragDocuments) {
    const result = await client.query(
      `insert into partner_documents (partner_id,file_name,original_name,file_type,file_size,file_path,description,uploaded_by,uploaded_by_type,uploaded_by_id)
       values ($1,$2,$3,'text/markdown',$4,$5,$6,$7,'employee',$8) returning id`,
      [partnerId, document.fileName, document.originalName, Buffer.byteLength(document.text, "utf8"), `/demo/polytech/${document.fileName}`, `${MARKER} ${document.originalName} — document Polytech Intl indexé pour citations RAG.`, employee.name, employee.id],
    )
    ids.push({ id: result.rows[0].id, fileName: document.fileName, text: document.text })
  }
  return ids
}

async function seedRelationalData() {
  const client = await pool.connect()
  try {
    await client.query("begin")
    const employee = await fetchEmployee(client)
    const partnerId = await resolvePartnerId(client)
    await deleteSeededRows(client, partnerId)
    await upsertPartner(client, partnerId)
    if (process.env.POLYTECH_DEMO_RAG_ONLY !== "1") {
      await insertEvents(client, partnerId); await insertMeetings(client, partnerId, employee); await insertKpis(client, partnerId); await insertRecruitments(client, partnerId); await insertOffers(client, partnerId)
    }
    const documents = await insertRagDocuments(client, partnerId, employee)
    await client.query("commit")
    return { partnerId, documents }
  } catch (error) { await client.query("rollback"); throw error } finally { client.release() }
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

async function collectCounts(client, partnerId) {
  const result = await client.query(
    `with seeded_documents as (select id from partner_documents where partner_id=$1 and description ilike $2)
     select (select count(*)::int from partner_events where partner_id=$1 and notes ilike $2) as partner_events,
       (select count(*)::int from partner_meetings where partner_id=$1 and (remarks ilike $2 or conclusions ilike $2)) as partner_meetings,
       (select count(*)::int from partner_kpis where partner_id=$1 and (year, quarter) in ((2025,1),(2025,2),(2025,3),(2025,4))) as partner_kpis,
       (select count(*)::int from student_recruitments where university_partner_id=$1 and notes ilike $2) as student_recruitments,
       (select count(*)::int from student_recruitments where university_partner_id=$1 and notes ilike $2 and converted_to_cdi=true) as cdi_conversions,
       (select count(*)::int from offers where partner_id=$1 and (description ilike $2 or terms_conditions ilike $2)) as offers,
       (select count(*)::int from seeded_documents) as partner_documents,
       (select count(*)::int from document_embeddings where source_kind='partner_document' and document_id in (select id from seeded_documents)) as document_embeddings,
       (select count(*)::int from document_embeddings de join partner_documents pd on pd.id=de.document_id where pd.partner_id=$1 and de.source_kind='partner_document') as total_partner_document_embeddings`,
    [partnerId, `%${MARKER}%`],
  )
  return result.rows[0]
}

async function main() {
  const { partnerId, documents } = await seedRelationalData()
  const ingestion = await ingestRagDocuments(documents)
  const client = await pool.connect()
  try {
    const counts = await collectCounts(client, partnerId)
    console.log(JSON.stringify({ partnerId, partnerName: PARTNER_NAME, marker: MARKER, counts, ingestion }, null, 2))
  } finally { client.release(); await pool.end() }
}

main().catch(async (error) => { console.error(error); await pool.end().catch(() => {}); process.exit(1) })
