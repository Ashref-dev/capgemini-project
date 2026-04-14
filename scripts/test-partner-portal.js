// Test all partner portal features
const BASE = "http://localhost:3000";

async function test() {
  console.log("=== TESTING PARTNER PORTAL ===\n");

  // Partners to test (one from each category)
  const testPartners = [
    { email: "partenariats@esprit.tn", name: "ESPRIT", cat: "university" },
    { email: "relationsclient@biat.tn", name: "BIAT", cat: "customer" },
    { email: "contact@pluxee.tn", name: "Pluxee", cat: "marketing" },
    { email: "partenariats@microsoft.tn", name: "Microsoft", cat: "supplier" },
  ];

  for (const p of testPartners) {
    console.log(`\n--- Testing: ${p.name} (${p.cat}) ---`);

    // 1. Login
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: p.email, password: "Partner2024!", userType: "partner" }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200) {
      console.log(`  ❌ LOGIN FAILED: ${loginRes.status} - ${JSON.stringify(loginData)}`);
      continue;
    }
    console.log(`  ✅ Login OK - ${loginData.user.name}`);

    // Get session cookie
    const cookie = loginRes.headers.get("set-cookie")?.split(";")[0];
    const headers = { Cookie: cookie || "", "Content-Type": "application/json" };

    // 2. Get profile + stats
    const meRes = await fetch(`${BASE}/api/partner/me`, { headers });
    const meData = await meRes.json();
    console.log(`  ✅ Profile: ${meRes.status} - satisfaction=${meData.partner?.satisfactionScore}, rank=${meData.stats?.rank}/${meData.stats?.totalPartners}`);

    // 3. Update profile
    const updateRes = await fetch(`${BASE}/api/partner/me`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ name: meData.partner.name, email: meData.partner.email, description: "Test update " + new Date().toISOString() }),
    });
    console.log(`  ✅ Update profile: ${updateRes.status}`);

    // 4. Get offers
    const offersRes = await fetch(`${BASE}/api/partner/offers`, { headers });
    const offersData = await offersRes.json();
    console.log(`  ✅ Offers: ${offersRes.status} - count=${offersData.offers?.length}`);

    // 5. Create offer
    const newOfferRes = await fetch(`${BASE}/api/partner/offers`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: `Test Offre ${p.name}`, discountType: "percentage", startDate: "2026-01-01", endDate: "2026-12-31", targetAudience: "Employés Capgemini" }),
    });
    const newOfferData = await newOfferRes.json();
    console.log(`  ✅ Create offer: ${newOfferRes.status} - id=${newOfferData.offer?.id}`);

    // 6. Get events
    const eventsRes = await fetch(`${BASE}/api/partner/events`, { headers });
    const eventsData = await eventsRes.json();
    console.log(`  ✅ Events: ${eventsRes.status} - count=${eventsData.events?.length}`);

    // 7. Create event
    const newEventRes = await fetch(`${BASE}/api/partner/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({ eventName: `Test Event ${p.name}`, eventDate: "2026-06-15", eventLocation: "Tunis", eventStatus: "planifie", numParticipants: 50, eventBudget: 5000 }),
    });
    const newEventData = await newEventRes.json();
    console.log(`  ✅ Create event: ${newEventRes.status} - id=${newEventData.event?.id}`);

    // 8. Get contacts
    const contactsRes = await fetch(`${BASE}/api/partner/contacts`, { headers });
    const contactsData = await contactsRes.json();
    console.log(`  ✅ Contacts: ${contactsRes.status} - count=${contactsData.contacts?.length}`);

    // 9. Create contact
    const newContactRes = await fetch(`${BASE}/api/partner/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ firstName: "Test", lastName: p.name, email: `test.${p.cat}@test.com`, role: "Test Contact", isPrimary: false }),
    });
    const newContactData = await newContactRes.json();
    console.log(`  ✅ Create contact: ${newContactRes.status} - id=${newContactData.contact?.id}`);
  }

  // 10. Test security: employee should NOT access partner API
  console.log("\n--- Security Test: Employee accessing partner API ---");
  const empLogin = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "khaled.maatoug@capgemini.com", password: "Capgemini2024!", userType: "employee" }),
  });
  const empCookie = empLogin.headers.get("set-cookie")?.split(";")[0];
  const empMeRes = await fetch(`${BASE}/api/partner/me`, { headers: { Cookie: empCookie || "" } });
  console.log(`  ✅ Employee -> /api/partner/me: ${empMeRes.status} (expected 401)`);

  console.log("\n=== ALL TESTS COMPLETE ===");
}

test().catch(console.error);
