// Test script for Success Stories + Partnership Requests system
// Run with: node scripts/test-partnership-system.js

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

async function loginAdmin() {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "khaled.maatoug@capgemini.com", password: "Capgemini2024!", userType: "employee" }),
  });
  const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const raw = cookies.find(c => c.includes("session_token")) || res.headers.get("set-cookie") || "";
  assert(raw, "No session cookie returned — status: " + res.status);
  return raw.split(";")[0];
}

async function main() {
  console.log("\n🧪 Test: Success Stories + Partnership Requests System\n");

  // =============================================
  // 1. SUCCESS STORIES API
  // =============================================
  console.log("📖 Success Stories API:");

  let stories;
  await test("GET /api/success-stories - public access", async () => {
    const res = await fetch(`${BASE_URL}/api/success-stories`);
    assert(res.ok, `Status ${res.status}`);
    stories = await res.json();
    assert(stories.stats, "Missing stats");
    assert(stories.events !== undefined, "Missing events");
    assert(stories.projects !== undefined, "Missing projects");
  });

  await test("Success stories contain stats fields", async () => {
    assert(stories.stats.totalActivePartners !== undefined, "Missing totalActivePartners");
    assert(stories.stats.totalEvents !== undefined, "Missing totalEvents");
    assert(stories.stats.totalProjects !== undefined, "Missing totalProjects");
    assert(stories.stats.partnerCategories !== undefined, "Missing partnerCategories");
  });

  await test("Events have partner info", async () => {
    if (stories.events.length > 0) {
      const e = stories.events[0];
      assert(e.eventName, "Missing eventName");
      assert(e.partnerName, "Missing partnerName");
      assert(e.partnerCategory, "Missing partnerCategory");
    }
  });

  await test("Projects have partner info", async () => {
    if (stories.projects.length > 0) {
      const p = stories.projects[0];
      assert(p.projectName, "Missing projectName");
      assert(p.partnerName, "Missing partnerName");
    }
  });

  // =============================================
  // 2. PARTNERSHIP REQUEST - SUBMIT
  // =============================================
  console.log("\n📝 Partnership Request Submission:");

  await test("POST /api/partnership-requests - missing fields returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/partnership-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName: "Test" }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test("POST /api/partnership-requests - invalid email returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/partnership-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "Test Corp",
        contactFirstName: "Test",
        contactLastName: "User",
        contactEmail: "not-an-email",
        category: "customer",
      }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test("POST /api/partnership-requests - invalid category returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/partnership-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "Test Corp",
        contactFirstName: "Test",
        contactLastName: "User",
        contactEmail: "test@test.com",
        category: "invalid_category",
      }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  let requestId;
  await test("POST /api/partnership-requests - valid customer request", async () => {
    const res = await fetch(`${BASE_URL}/api/partnership-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "TestCorp SA",
        legalName: "TestCorp Société Anonyme",
        contactFirstName: "Ali",
        contactLastName: "Ben Ahmed",
        contactEmail: "ali@testcorp.tn",
        contactPhone: "+216 71 123 456",
        contactRole: "Directeur Commercial",
        website: "https://testcorp.tn",
        description: "Entreprise de services informatiques",
        country: "Tunisie",
        address: "123 Rue de la Liberté, Tunis",
        numEmployees: 250,
        annualRevenue: "5000000",
        category: "customer",
        partnerSubcategory: "Services IT",
        partnershipLevel: "Gold",
        motivations: "Nous souhaitons collaborer avec Capgemini pour nos projets de transformation digitale.",
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    requestId = data.request.id;
    assert(data.request.status === "en_attente", "Status should be en_attente");
  });

  let uniRequestId;
  await test("POST /api/partnership-requests - valid university request", async () => {
    const res = await fetch(`${BASE_URL}/api/partnership-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "INSAT",
        contactFirstName: "Sana",
        contactLastName: "Mhadhbi",
        contactEmail: "sana@insat.tn",
        category: "university",
        motivations: "Partenariat de stage et formation",
        universityData: {
          institutionType: "ecole_ingenieur",
          numStudents: 3000,
          specialties: ["Informatique", "Génie Logiciel", "IA"],
          numInternsPerYear: 150,
        },
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    uniRequestId = data.request.id;
  });

  let supplierRequestId;
  await test("POST /api/partnership-requests - valid supplier request", async () => {
    const res = await fetch(`${BASE_URL}/api/partnership-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "CloudTech Solutions",
        contactFirstName: "Mohamed",
        contactLastName: "Trabelsi",
        contactEmail: "mohamed@cloudtech.tn",
        category: "supplier",
        motivations: "Co-développement de solutions cloud",
        technologyData: {
          vendorType: "cloud_provider",
          technologies: ["AWS", "Azure", "Kubernetes"],
          certificationsHeld: 12,
          certificationLevel: "gold",
          partnershipModel: "co_development",
        },
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    supplierRequestId = data.request.id;
  });

  // =============================================
  // 3. ADMIN REVIEW API
  // =============================================
  console.log("\n🔐 Admin Review API:");

  await test("GET /api/admin/partnership-requests - unauthorized without auth", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  const adminCookie = await loginAdmin();

  let allRequests;
  await test("GET /api/admin/partnership-requests - list all", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`, {
      headers: { Cookie: adminCookie },
    });
    assert(res.ok, `Status ${res.status}`);
    allRequests = await res.json();
    assert(allRequests.requests.length >= 3, "Should have at least 3 requests");
    assert(allRequests.counts.pending >= 3, "Should have at least 3 pending");
  });

  await test("GET /api/admin/partnership-requests?status=en_attente - filter pending", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests?status=en_attente`, {
      headers: { Cookie: adminCookie },
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.requests.every(r => r.status === "en_attente"), "All should be en_attente");
  });

  await test("PUT /api/admin/partnership-requests - missing requestId returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ action: "accept" }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test("PUT /api/admin/partnership-requests - invalid action returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ requestId: requestId, action: "maybe" }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // Accept the customer request
  await test("PUT accept customer request - creates partner", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ requestId: requestId, action: "accept" }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.partner, "Should return new partner");
    assert(data.partner.name === "TestCorp SA", "Partner name should match");
    assert(data.partner.categories === "customer", "Partner category should match");
    assert(data.request.status === "acceptee", "Status should be acceptee");
    assert(data.request.isAccepted === true, "isAccepted should be true");
    assert(data.request.createdPartnerId, "Should have createdPartnerId");
  });

  // Accept the university request
  await test("PUT accept university request - creates partner + university record", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ requestId: uniRequestId, action: "accept" }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.partner.categories === "university", "Category should be university");
  });

  // Reject the supplier request
  await test("PUT reject supplier request", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        requestId: supplierRequestId,
        action: "reject",
        rejectionReason: "Profil technologique non aligné avec nos besoins actuels",
      }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.request.status === "refusee", "Status should be refusee");
    assert(data.request.isAccepted === false, "isAccepted should be false");
    assert(data.request.rejectionReason, "Should have rejection reason");
  });

  // Try to re-accept an already processed request
  await test("PUT reject already processed request returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ requestId: requestId, action: "accept" }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const data = await res.json();
    assert(data.error.includes("déjà"), "Error should mention already processed");
  });

  // Check counts after processing
  await test("GET counts reflect processed requests", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/partnership-requests`, {
      headers: { Cookie: adminCookie },
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.counts.accepted >= 2, "Should have at least 2 accepted");
    assert(data.counts.rejected >= 1, "Should have at least 1 rejected");
  });

  // =============================================
  // 4. VERIFY CREATED PARTNER
  // =============================================
  console.log("\n👤 Verify Created Partner:");

  await test("Created partner exists in partners list", async () => {
    const res = await fetch(`${BASE_URL}/api/partners`, {
      headers: { Cookie: adminCookie },
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    const partners = data.partners || data;
    const testPartner = partners.find(p => p.name === "TestCorp SA");
    assert(testPartner, "TestCorp SA should exist in partners");
    assert(testPartner.categories === "customer", "Should be customer");
    assert(testPartner.partnershipStatus === "actif", "Should be active");
  });

  // =============================================
  // CLEANUP
  // =============================================
  console.log("\n🧹 Cleanup:");

  // Delete test partnership requests and partners from DB
  await test("Cleanup test data", async () => {
    // We'll leave the data for now since it's a test/dev environment
    console.log("    (Test data left in DB for manual inspection)");
  });

  // =============================================
  // SUMMARY
  // =============================================
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log(`${"=".repeat(50)}\n`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
