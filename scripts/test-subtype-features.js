/**
 * Test script for university & supplier specific features
 * Tests: recruitment API, project API, profile subtype data, stats
 */

const BASE = "http://localhost:3000"

// Test partners:
// ESPRIT (university, id=1): partenariats@esprit.tn
// Microsoft (supplier, id=16): partenariats@microsoft.tn

async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, userType: "partner" }),
  })
  const cookies = res.headers.getSetCookie?.() || []
  const sessionCookie = cookies.find(c => c.startsWith("session_token="))
  if (!sessionCookie) {
    const data = await res.json()
    throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`)
  }
  const token = sessionCookie.split(";")[0]
  return token
}

async function api(method, path, token, body = null) {
  const opts = {
    method,
    headers: {
      Cookie: token,
      "Content-Type": "application/json",
    },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()
  return { status: res.status, data }
}

let passed = 0
let failed = 0

function assert(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${name}`)
    passed++
  } else {
    console.log(`  ❌ ${name} ${detail}`)
    failed++
  }
}

async function main() {
  console.log("🔐 Logging in as ESPRIT (university)...")
  const espritToken = await login("partenariats@esprit.tn", "Partner2024!")
  console.log("  ✅ ESPRIT logged in\n")

  console.log("🔐 Logging in as Microsoft (supplier)...")
  const msToken = await login("partenariats@microsoft.tn", "Partner2024!")
  console.log("  ✅ Microsoft logged in\n")

  // Also login as employee to verify security
  const empRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "khaled.maatoug@capgemini.com", password: "Capgemini2024!", userType: "employee" }),
  })
  const empCookies = empRes.headers.getSetCookie?.() || []
  const empToken = empCookies.find(c => c.startsWith("session_token="))?.split(";")[0]

  // ============================================================
  console.log("=== UNIVERSITY PARTNER: ESPRIT ===\n")

  // 1. GET /api/partner/me — should include subtypeData
  console.log("📋 Test: GET /api/partner/me (university subtype data)")
  const meRes = await api("GET", "/api/partner/me", espritToken)
  assert("Profile returned", meRes.status === 200)
  assert("Partner data exists", !!meRes.data.partner)
  assert("Category is university", meRes.data.partner.categories === "university")
  assert("subtypeData exists", meRes.data.subtypeData !== null && meRes.data.subtypeData !== undefined)
  if (meRes.data.subtypeData) {
    assert("subtypeData has partnerId", meRes.data.subtypeData.partnerId !== undefined)
  }

  // 2. GET /api/partner/recruitments — list recruitments
  console.log("\n📋 Test: GET /api/partner/recruitments")
  const recListRes = await api("GET", "/api/partner/recruitments", espritToken)
  assert("Recruitments endpoint returns 200", recListRes.status === 200)
  assert("Has recruitments array", Array.isArray(recListRes.data.recruitments))
  assert("Has stats object", !!recListRes.data.stats)
  assert("Has globalStats object", !!recListRes.data.globalStats)
  assert("Stats has total", typeof recListRes.data.stats?.total === "number")
  assert("Stats has conversionRate", typeof recListRes.data.stats?.conversionRate === "number")
  const initialRecruitmentCount = recListRes.data.recruitments.length
  console.log(`  ℹ️  Current recruitments: ${initialRecruitmentCount}`)

  // 3. POST /api/partner/recruitments — create a recruitment
  console.log("\n📋 Test: POST /api/partner/recruitments")
  const newRecRes = await api("POST", "/api/partner/recruitments", espritToken, {
    studentFirstName: "Ahmed",
    studentLastName: "Ben Salah",
    studentEmail: "ahmed.bensalah@esprit.tn",
    studentPhone: "+216 55 123 456",
    recruitmentType: "stage",
    contractDurationMonths: 6,
    startDate: "2025-09-01",
    endDate: "2026-02-28",
    degreeLevel: "Bac+5",
    specialization: "Génie Logiciel",
    skills: ["Java", "Spring Boot", "React"],
    assignedProject: "Digital Banking Platform",
    assignedTeam: "Digital Engineering",
    managerName: "Khaled Maatoug",
    managerEmail: "khaled.maatoug@capgemini.com",
    performanceScore: 4,
    satisfactionScore: 90,
    notes: "Excellent stagiaire, potentiel CDI",
  })
  if (newRecRes.status !== 201) console.log("  DEBUG recruitment POST:", JSON.stringify(newRecRes))
  assert("Recruitment created (201)", newRecRes.status === 201)
  assert("Recruitment has id", !!newRecRes.data.recruitment?.id)
  assert("Student name correct", newRecRes.data.recruitment?.studentFirstName === "Ahmed")
  assert("Skills saved as array", Array.isArray(newRecRes.data.recruitment?.skills))

  // 4. POST validation — missing required field
  console.log("\n📋 Test: POST /api/partner/recruitments (missing startDate)")
  const badRecRes = await api("POST", "/api/partner/recruitments", espritToken, {
    studentFirstName: "Test",
  })
  assert("Missing startDate returns 400", badRecRes.status === 400)

  // 5. Verify new recruitment shows in list
  console.log("\n📋 Test: GET /api/partner/recruitments (after create)")
  const recListRes2 = await api("GET", "/api/partner/recruitments", espritToken)
  assert("List count increased", recListRes2.data.recruitments.length > initialRecruitmentCount)

  // 6. Update university profile data
  console.log("\n📋 Test: PUT /api/partner/me (university-specific data)")
  const updateUniRes = await api("PUT", "/api/partner/me", espritToken, {
    name: meRes.data.partner.name,
    universityData: {
      institutionType: "École d'ingénieur",
      numStudents: 12000,
      specialties: ["Informatique", "Télécommunications", "Génie Civil"],
      numInternsPerYear: 150,
      numApprenticesPerYear: 30,
      numHiresPerYear: 45,
      annualSponsorshipBudget: 50000,
      notes: "Partenariat stratégique prioritaire",
    },
  })
  assert("University profile update returns 200", updateUniRes.status === 200)
  assert("subtypeData returned after update", !!updateUniRes.data.subtypeData)

  // 7. Verify updated data in GET
  console.log("\n📋 Test: GET /api/partner/me (verify university update)")
  const meRes2 = await api("GET", "/api/partner/me", espritToken)
  if (meRes2.data.subtypeData) {
    assert("institutionType updated", meRes2.data.subtypeData.institutionType === "École d'ingénieur")
    assert("numStudents updated", meRes2.data.subtypeData.numStudents === 12000)
  }

  // ============================================================
  console.log("\n\n=== SUPPLIER PARTNER: MICROSOFT ===\n")

  // 8. GET /api/partner/me — should include technology subtypeData
  console.log("📋 Test: GET /api/partner/me (supplier subtype data)")
  const msMeRes = await api("GET", "/api/partner/me", msToken)
  assert("Profile returned", msMeRes.status === 200)
  assert("Category is supplier", msMeRes.data.partner.categories === "supplier")
  assert("subtypeData exists", msMeRes.data.subtypeData !== null && msMeRes.data.subtypeData !== undefined)

  // 9. GET /api/partner/projects — list projects
  console.log("\n📋 Test: GET /api/partner/projects")
  const projListRes = await api("GET", "/api/partner/projects", msToken)
  assert("Projects endpoint returns 200", projListRes.status === 200)
  assert("Has projects array", Array.isArray(projListRes.data.projects))
  assert("Has stats object", !!projListRes.data.stats)
  assert("Has globalStats object", !!projListRes.data.globalStats)
  assert("Stats has total", typeof projListRes.data.stats?.total === "number")
  assert("Stats has onTimeRate", typeof projListRes.data.stats?.onTimeRate === "number")
  const initialProjectCount = projListRes.data.projects.length
  console.log(`  ℹ️  Current projects: ${initialProjectCount}`)

  // 10. POST /api/partner/projects — create a project
  console.log("\n📋 Test: POST /api/partner/projects")
  const newProjRes = await api("POST", "/api/partner/projects", msToken, {
    projectName: "Azure Cloud Migration - BIAT",
    projectDescription: "Migration complète de l'infrastructure on-premise vers Azure",
    clientName: "BIAT",
    projectType: "Migration Cloud",
    technologiesUsed: ["Azure", "Terraform", "Docker", "Kubernetes"],
    startDate: "2025-06-01",
    endDate: "2026-03-31",
    durationMonths: 10,
    projectValue: 500000,
    licenseCost: 120000,
    servicesCost: 380000,
    commissionEarned: 45000,
    deliveryStatus: "a_temps",
    clientSatisfactionScore: 92,
    numConsultantsCapgemini: 8,
    numConsultantsVendor: 3,
    projectStatus: "en_cours",
    isReferenceProject: true,
    notes: "Projet stratégique pour le marché bancaire tunisien",
  })
  assert("Project created (201)", newProjRes.status === 201)
  assert("Project has id", !!newProjRes.data.project?.id)
  assert("Project name correct", newProjRes.data.project?.projectName === "Azure Cloud Migration - BIAT")
  assert("Technologies saved as array", Array.isArray(newProjRes.data.project?.technologiesUsed))

  // 11. POST validation — missing required fields
  console.log("\n📋 Test: POST /api/partner/projects (missing fields)")
  const badProjRes = await api("POST", "/api/partner/projects", msToken, {
    projectDescription: "Only description",
  })
  assert("Missing fields returns 400", badProjRes.status === 400)

  // 12. Verify new project shows in list
  console.log("\n📋 Test: GET /api/partner/projects (after create)")
  const projListRes2 = await api("GET", "/api/partner/projects", msToken)
  assert("List count increased", projListRes2.data.projects.length > initialProjectCount)

  // 13. Update supplier/technology profile data
  console.log("\n📋 Test: PUT /api/partner/me (technology-specific data)")
  const updateTechRes = await api("PUT", "/api/partner/me", msToken, {
    name: msMeRes.data.partner.name,
    technologyData: {
      vendorType: "Cloud & Enterprise Software",
      technologies: ["Azure", "Microsoft 365", "Dynamics 365", "Power Platform"],
      certificationsHeld: 15,
      certificationLevel: "Gold",
      partnershipModel: "Strategic Alliance",
      commissionRate: "12.5",
      discountRate: "25",
      numProjectsPerYear: 8,
      numLicensesSold: 1200,
      comarketingBudgetAnnual: 100000,
      hasMasterAgreement: true,
      hasDedicatedSupport: true,
      supportSlaHours: 4,
      notes: "Partenaire stratégique global",
    },
  })
  assert("Technology profile update returns 200", updateTechRes.status === 200)
  assert("subtypeData returned after update", !!updateTechRes.data.subtypeData)

  // 14. Verify updated data in GET
  console.log("\n📋 Test: GET /api/partner/me (verify technology update)")
  const msMeRes2 = await api("GET", "/api/partner/me", msToken)
  if (msMeRes2.data.subtypeData) {
    assert("vendorType updated", msMeRes2.data.subtypeData.vendorType === "Cloud & Enterprise Software")
    assert("certificationLevel updated", msMeRes2.data.subtypeData.certificationLevel === "Gold")
  }

  // ============================================================
  console.log("\n\n=== SECURITY TESTS ===\n")

  // 15. University partner cannot access projects API
  console.log("📋 Test: University partner blocked from projects API")
  const crossRes1 = await api("GET", "/api/partner/projects", espritToken)
  assert("University blocked from projects (403)", crossRes1.status === 403)

  // 16. Supplier partner cannot access recruitments API
  console.log("\n📋 Test: Supplier partner blocked from recruitments API")
  const crossRes2 = await api("GET", "/api/partner/recruitments", msToken)
  assert("Supplier blocked from recruitments (403)", crossRes2.status === 403)

  // 17. Employee cannot access recruitments API
  if (empToken) {
    console.log("\n📋 Test: Employee blocked from partner APIs")
    const empRes1 = await api("GET", "/api/partner/recruitments", empToken)
    assert("Employee blocked from recruitments (401)", empRes1.status === 401)
    const empRes2 = await api("GET", "/api/partner/projects", empToken)
    assert("Employee blocked from projects (401)", empRes2.status === 401)
  }

  // ============================================================
  console.log("\n\n=== RESULTS ===")
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Total: ${passed + failed}`)

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Test script error:", err)
  process.exit(1)
})
