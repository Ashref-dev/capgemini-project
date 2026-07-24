// scoring-bench.mjs
// Deterministic ground-truth generator + latency microbenchmark for the
// IntelliConnect 5-dimension partner scoring model.
//
// Purpose: (1) produce the exact reference scores used to grade LLMs in the
// report's model comparison, and (2) measure the execution cost of the
// deterministic scoring engine for the complexity study.
//
// Run: bun report-pfe/bench/scoring-bench.mjs

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

console.log("=== GROUND TRUTH (final score + recommendation) ===");
const rows = Object.entries(PARTNERS).map(([name, d]) => {
  const r = finalScore(d);
  return { name, ...r, reco: reco(r.total) };
});
for (const r of rows) console.log(`${r.name.padEnd(12)} budget=${r.budget} sat=${r.satisfaction} act=${r.activity} trk=${r.trackRecord} fit=${r.strategicFit} -> TOTAL=${r.total} (${r.reco})`);

const ranking = [...rows].sort((a, b) => b.total - a.total).map((r) => r.name);
console.log("\n=== RANKING (best -> worst) ===\n" + ranking.join(" > "));

// What-if: NovaTech satisfaction 88 -> 40
const wi = finalScore({ ...PARTNERS.NovaTech, satisfaction: 40 });
console.log(`\n=== WHAT-IF NovaTech sat 88->40 === TOTAL=${wi.total} (${reco(wi.total)})`);

// Latency microbenchmark
const N = 200000;
const sample = PARTNERS.InsightBank;
const t0 = performance.now();
let sink = 0;
for (let i = 0; i < N; i++) sink += finalScore(sample).total;
const t1 = performance.now();
const perCallUs = ((t1 - t0) / N) * 1000;
console.log(`\n=== LATENCY === ${N} scoring calls in ${(t1 - t0).toFixed(1)} ms -> ${perCallUs.toFixed(3)} us/call (sink=${sink.toFixed(0)})`);
