const BASE = "http://localhost:3000";

async function test() {
  // Login as ESPRIT
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "partenariats@esprit.tn", password: "Partner2024!", userType: "partner" }),
  });
  const cookies = loginRes.headers.getSetCookie?.() || [];
  const token = cookies.find(c => c.startsWith("session_token=")).split(";")[0];
  console.log("Token:", token.substring(0, 30) + "...");

  // POST recruitment
  const res = await fetch(`${BASE}/api/partner/recruitments`, {
    method: "POST",
    headers: {
      Cookie: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      studentFirstName: "Ahmed",
      studentLastName: "Ben Salah",
      studentEmail: "ahmed.bs@esprit.tn",
      recruitmentType: "stage",
      startDate: "2025-09-01",
    }),
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 500));
}

test().catch(console.error);
