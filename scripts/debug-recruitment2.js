const BASE = "http://localhost:3000";

async function test() {
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "partenariats@esprit.tn", password: "Partner2024!", userType: "partner" }),
  });
  const cookies = loginRes.headers.getSetCookie?.() || [];
  const token = cookies.find(c => c.startsWith("session_token=")).split(";")[0];

  // Exact same payload as test script
  const res = await fetch(`${BASE}/api/partner/recruitments`, {
    method: "POST",
    headers: { Cookie: token, "Content-Type": "application/json" },
    body: JSON.stringify({
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
      performanceScore: 85,
      satisfactionScore: 90,
      notes: "Excellent stagiaire, potentiel CDI",
    }),
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Data:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
