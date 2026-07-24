// model-benchmark.mjs
//
// Real, reproducible benchmark used for the report's "best-performing AI
// model for our agentic use case" comparison (Chapter 7). This does NOT
// compare a language model against the deterministic scoring engine - that
// comparison is meaningless (the engine is deterministic by construction,
// so it always "wins" at arithmetic). Instead this tests the task the agent
// actually performs in production: turning an already-computed score
// breakdown into correct, grounded business language (explanation,
// comparison, risk flagging, executive summary, and what-if reasoning).
//
// Requires OPENROUTER_KEY in the environment. Each run costs real money
// (roughly $0.35-0.40 USD for the full 99-call suite at 2026 OpenRouter
// pricing for the three models below). Results are NOT auto-graded with
// perfect reliability - regex/keyword grading was tried and produced false
// negatives (e.g. correct French answers, "reviewed" vs "review" word
// boundaries). The report's numbers come from a manual read of every
// response against the ground truth printed here, not from the automated
// grader alone. Treat the automated grader as a first-pass filter only.
//
// Run: OPENROUTER_KEY=... bun report-pfe/bench/model-benchmark.mjs

const WEIGHTS = { budget: 0.2, satisfaction: 0.25, activity: 0.2, trackRecord: 0.2, strategicFit: 0.15 };
const clamp = (n) => Math.min(100, Math.max(0, n));

function budgetScore(annualBudgetTnd) { return clamp((annualBudgetTnd / 200000) * 100); }
function activityScore({ events, meetings, activeOffers, interactions }) {
  return clamp(events * 8 + meetings * 5 + activeOffers * 3 + interactions);
}
function trackRecordScore({ vendorProjects, cdiConversions, conversionRate, revenueTnd }) {
  return clamp(vendorProjects * 10 + cdiConversions * 8 + conversionRate * 0.6 + revenueTnd / 50000);
}
function finalScore(d) {
  const b = budgetScore(d.annualBudgetTnd);
  const a = activityScore(d.activity);
  const t = trackRecordScore(d.track);
  const s = clamp(d.satisfaction);
  const f = clamp(d.strategicFit);
  const total = b * WEIGHTS.budget + s * WEIGHTS.satisfaction + a * WEIGHTS.activity + t * WEIGHTS.trackRecord + f * WEIGHTS.strategicFit;
  return { budget: b, satisfaction: s, activity: a, trackRecord: t, strategicFit: f, total: Math.round(total * 100) / 100 };
}
function reco(total) { return total >= 75 ? "APPROUVER" : total >= 50 ? "A_REVOIR" : "REJETER"; }

const PARTNERS = {
  NovaTech:    { annualBudgetTnd: 300000, satisfaction: 88, activity: { events: 6, meetings: 4, activeOffers: 3, interactions: 20 }, track: { vendorProjects: 4, cdiConversions: 3, conversionRate: 60, revenueTnd: 400000 }, strategicFit: 90 },
  EduLink:     { annualBudgetTnd: 120000, satisfaction: 74, activity: { events: 2, meetings: 3, activeOffers: 1, interactions: 10 }, track: { vendorProjects: 1, cdiConversions: 8, conversionRate: 45, revenueTnd: 90000 }, strategicFit: 65 },
  MarketPro:   { annualBudgetTnd: 80000,  satisfaction: 58, activity: { events: 1, meetings: 1, activeOffers: 0, interactions: 5 },  track: { vendorProjects: 0, cdiConversions: 0, conversionRate: 20, revenueTnd: 30000 }, strategicFit: 25 },
  DataForge:   { annualBudgetTnd: 250000, satisfaction: 69, activity: { events: 3, meetings: 2, activeOffers: 2, interactions: 12 }, track: { vendorProjects: 2, cdiConversions: 1, conversionRate: 50, revenueTnd: 150000 }, strategicFit: 55 },
  InsightBank: { annualBudgetTnd: 200000, satisfaction: 82, activity: { events: 4, meetings: 5, activeOffers: 2, interactions: 18 }, track: { vendorProjects: 3, cdiConversions: 2, conversionRate: 55, revenueTnd: 220000 }, strategicFit: 55 },
};

const breakdowns = {};
for (const [name, d] of Object.entries(PARTNERS)) breakdowns[name] = { ...finalScore(d), reco: reco(finalScore(d).total) };

function weightedContribs(s) {
  return { budget: s.budget * WEIGHTS.budget, satisfaction: s.satisfaction * WEIGHTS.satisfaction, activity: s.activity * WEIGHTS.activity, trackRecord: s.trackRecord * WEIGHTS.trackRecord, strategicFit: s.strategicFit * WEIGHTS.strategicFit };
}
function strongestDriver(s) { return Object.entries(weightedContribs(s)).sort((a, b) => b[1] - a[1])[0][0]; }
function weakestDriver(s) { return Object.entries(weightedContribs(s)).sort((a, b) => a[1] - b[1])[0][0]; }

function fmt(name) {
  const s = breakdowns[name];
  return `Partner: ${name}\nSub-scores (0-100): budget=${s.budget}, satisfaction=${s.satisfaction}, activity=${s.activity}, trackRecord=${s.trackRecord}, strategicFit=${s.strategicFit}\nWeights: budget 20%, satisfaction 25%, activity 20%, trackRecord 20%, strategicFit 15%\nTotal score: ${s.total}/100\nRecommendation: ${s.reco}`;
}

const explainCases = Object.keys(PARTNERS).map((name) => ({ id: `explain-${name}`, type: "explain", expected: strongestDriver(breakdowns[name]),
  prompt: `You are a partnership analyst assistant for a B2B partnership platform. Given the following partner scoring breakdown (already computed by a deterministic scoring engine), write a short executive explanation (3-4 sentences) of why this partner received this score, in business language for a partnership manager. Explicitly name which single dimension contributed the most to the result.\n\n${fmt(name)}` }));

const weakestCases = Object.keys(PARTNERS).map((name) => ({ id: `weakest-${name}`, type: "weakest", expected: weakestDriver(breakdowns[name]),
  prompt: `You are a partnership analyst assistant. Given this partner's scoring breakdown (already computed by a deterministic scoring engine), identify which single dimension contributed LEAST to the total score, and suggest one concrete relationship-management action to improve it.\n\n${fmt(name)}` }));

const riskCases = Object.keys(PARTNERS).map((name) => ({ id: `risk-${name}`, type: "risk", expected: breakdowns[name].reco !== "APPROUVER" ? "YES" : "NO",
  prompt: `You are a partnership analyst assistant. Given this partner's scoring breakdown, would you flag this partner as a renewal/churn risk for next quarter? Answer YES or NO as the first word, then justify in 1-2 sentences.\n\n${fmt(name)}` }));

const onelinerCases = Object.keys(PARTNERS).map((name) => ({ id: `oneliner-${name}`, type: "oneliner", expected: breakdowns[name].reco,
  prompt: `You are a partnership analyst assistant. Given this partner's scoring breakdown, write ONE short sentence (executive dashboard headline style) summarizing the partner's status. It must clearly convey whether the partner should be approved, reviewed, or rejected for continued partnership.\n\n${fmt(name)}` }));

const comparePairs = [["NovaTech","EduLink"], ["EduLink","MarketPro"], ["MarketPro","DataForge"], ["DataForge","InsightBank"], ["InsightBank","NovaTech"], ["NovaTech","MarketPro"], ["EduLink","DataForge"], ["EduLink","InsightBank"]];
const compareCases = comparePairs.map(([a, b]) => ({ id: `compare-${a}-vs-${b}`, type: "compare", expected: breakdowns[a].total >= breakdowns[b].total ? a : b,
  prompt: `You are a partnership analyst assistant. Given the scoring breakdowns of two partners (already computed by a deterministic scoring engine), state which partner Capgemini should prioritize for renewal, and justify briefly.\n\n${fmt(a)}\n\n${fmt(b)}` }));

const DROP = 30;
const whatifCases = Object.keys(PARTNERS).map((name) => {
  const d = PARTNERS[name];
  const newSat = Math.max(0, d.satisfaction - DROP);
  const before = breakdowns[name];
  const after = finalScore({ ...d, satisfaction: newSat });
  const afterReco = reco(after.total);
  return { id: `whatif-${name}`, type: "whatif", expected: { tierChanges: afterReco !== before.reco, newTier: afterReco },
    prompt: `You are a partnership analyst assistant. Current breakdown:\n\n${fmt(name)}\n\nTier thresholds used by the scoring engine: APPROUVER if total >= 75, A_REVOIR if 50 <= total < 75, REJETER if total < 50.\n\nHypothetical: if this partner's satisfaction sub-score dropped from ${before.satisfaction} to ${newSat} (all else unchanged), explain directionally what happens to the total score and state whether the recommendation tier would change, and to which tier.` };
});

const ALL_CASES = [...explainCases, ...weakestCases, ...riskCases, ...onelinerCases, ...compareCases, ...whatifCases];

const MODELS = [
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "openai/gpt-5.5", label: "GPT-5.5" },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5" },
];

async function callModel(modelId, prompt) {
  const t0 = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: modelId, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 400 }),
  });
  const elapsed = Date.now() - t0;
  if (!res.ok) return { error: `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`, elapsed };
  const data = await res.json();
  return { content: data?.choices?.[0]?.message?.content ?? "", elapsed, cost: data?.usage?.cost ?? 0 };
}

if (!process.env.OPENROUTER_KEY) {
  console.error("OPENROUTER_KEY not set. Export it before running this script.");
  process.exit(1);
}

console.log(`Running ${ALL_CASES.length} test cases x ${MODELS.length} models = ${ALL_CASES.length * MODELS.length} real API calls...\n`);
let totalCost = 0;
for (const c of ALL_CASES) {
  console.log(`--- ${c.id} (${c.type}) --- expected: ${JSON.stringify(c.expected)}`);
  for (const m of MODELS) {
    const r = await callModel(m.id, c.prompt);
    totalCost += r.cost || 0;
    if (r.error) { console.log(`  [${m.label}] ERROR: ${r.error}`); continue; }
    console.log(`  [${m.label}] (${r.elapsed}ms, $${(r.cost || 0).toFixed(4)}): ${r.content.slice(0, 200).replace(/\n/g, " ")}...`);
  }
}
console.log(`\nTotal real cost this run: $${totalCost.toFixed(4)}`);
console.log("Grade each response by hand against the printed `expected` ground truth - see Chapter 7 of the report for the manually-verified reference results.");
