/**
 * Typed Methodology Registry for IntelliConnect AI Agent.
 *
 * Defines 9 analytical methodologies. Each methodology carries trigger
 * keywords, UI chip labels, a rationale, and step-by-step instructions
 * that are injected into the system prompt when matched.
 */

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export type Methodology = {
  /** kebab-case unique id */
  id: string
  /** Human-readable name, used as a chip label */
  name: string
  /** Case-insensitive whole-word matches in user message */
  triggerKeywords: string[]
  /** 1–3 short labels shown in MethodologyHeader UI */
  chips: string[]
  /** 1–2 sentences: when/why this methodology applies */
  rationale: string
  /** 3–6 sentences: what the agent should do step-by-step */
  instructions: string
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const METHODOLOGIES: Methodology[] = [
  // 1 ─ Margin Waterfall
  {
    id: "margin-waterfall",
    name: "Margin Waterfall",
    triggerKeywords: [
      "margin",
      "marge",
      "marges",
      "profitability",
      "profitabilité",
      "ebitda",
      "operating margin",
    ],
    chips: ["Margin Waterfall", "P&L Decomposition"],
    rationale:
      "Decompose total margin from revenue down through COGS, opex, and overhead to identify which step erodes value most.",
    instructions:
      "Pull revenue and itemised cost data for every relevant segment using getPartnerDetails and queryAnalytics, then compute gross margin (revenue minus COGS), operating margin (gross margin minus opex), and net margin (operating margin minus overhead and taxes) for each segment. " +
      "Express each level as both an absolute amount in TND and a percentage of revenue so that the waterfall steps are immediately comparable. " +
      "Identify the single largest negative delta between adjacent levels — this is the primary value-erosion point — and compare it to the category benchmark obtained via getCategoryBenchmarks. " +
      "Cite the specific KPIs, partner IDs, and ISO date ranges that underpin each figure, and flag any data gaps as 'insufficient evidence' rather than estimating. " +
      "Close with a targeted recommendation for the lowest-margin segment, quantifying the potential margin improvement if the delta were brought to benchmark level.",
  },

  // 2 ─ Best-in-Class + Root Cause
  {
    id: "best-in-class-root-cause",
    name: "Best-in-Class + Root Cause",
    triggerKeywords: [
      "best practice",
      "root cause",
      "why is",
      "why are",
      "why does",
      "cause racine",
      "meilleure pratique",
    ],
    chips: ["Best-in-Class Benchmark", "Root Cause"],
    rationale:
      "Compare the entity against the top performer in its category, then trace deviations back to underlying drivers.",
    instructions:
      "Identify the top-quartile performer in the same partner category and size band by calling getCategoryBenchmarks and ranking all peers on the primary KPI under discussion. " +
      "List every material gap between the entity and the top performer, expressing each gap as an absolute value and as a percentage deviation so the magnitude is unambiguous. " +
      "Propose two to three plausible root causes for the largest gap, citing specific data points from partner_kpis or partner_status_history as evidence for each hypothesis. " +
      "Prioritise the root causes by the product of estimated impact (revenue or cost effect in TND) and addressability (1 = structural barrier, 5 = immediately actionable), then surface the highest-priority cause first. " +
      "Recommend one concrete corrective action tied to the highest-priority root cause, including an owner role, a target KPI, and a realistic timeline.",
  },

  // 3 ─ COGS Comparison
  {
    id: "cogs-comparison",
    name: "COGS Comparison",
    triggerKeywords: [
      "cogs",
      "cost of goods",
      "coût des marchandises",
      "unit cost",
      "supplier cost",
      "vendor cost",
    ],
    chips: ["COGS Analysis"],
    rationale:
      "Compare per-unit costs across suppliers/vendors to surface negotiation opportunities.",
    instructions:
      "Retrieve cost-of-goods data for every relevant vendor or supplier partner using getPartnerDetails and queryAnalytics, focusing on invoice totals, contracted unit prices, and volume commitments over the selected date range. " +
      "Normalise all figures to a consistent per-unit basis (e.g., per licence seat, per kilogram, per service hour) so that cross-vendor comparison is valid; document the normalisation formula used. " +
      "Rank vendors from lowest to highest normalised unit cost and compute the spread between the cheapest and most expensive supplier as both an absolute TND amount and a percentage. " +
      "Calculate the potential annual savings achievable if the entire volume were sourced at the lowest current unit cost, quantifying the opportunity in TND and as a share of total COGS. " +
      "Recommend whether to consolidate volume with the lowest-cost supplier, renegotiate with the highest-cost supplier, or run a competitive tender, citing any quality or delivery risk that might offset the cost advantage.",
  },

  // 4 ─ Revenue Decomposition
  {
    id: "revenue-decomposition",
    name: "Revenue Decomposition",
    triggerKeywords: [
      "revenue",
      "chiffre d'affaires",
      "ca",
      "sales",
      "revenu",
      "decomposition",
      "decompose",
    ],
    chips: ["Revenue Decomposition", "Volume × Price × Mix"],
    rationale:
      "Break revenue into volume, price, and mix components to isolate growth drivers.",
    instructions:
      "Pull the revenue time series for the specified scope (partner, category, or portfolio) from queryAnalytics, ensuring you cover at least two comparable periods so that year-over-year or quarter-over-quarter delta can be computed. " +
      "Decompose the total revenue change into three independent components: volume effect (change in units or transactions multiplied by prior-period average price), price effect (change in average price multiplied by current-period volume), and mix effect (shift in revenue share between higher- and lower-margin product or partner types). " +
      "Identify which of the three components is the primary driver of the change, citing the numerical contribution of each in TND and as a percentage of total delta. " +
      "Surface any anomalies — such as a segment where volume grew but revenue fell due to price erosion, or a mix shift that masks underlying volume weakness — and flag them explicitly. " +
      "Recommend the single most impactful lever to pull (e.g., pricing discipline, volume incentive, mix optimisation toward higher-margin segments) and quantify the expected revenue benefit under a realistic scenario.",
  },

  // 5 ─ Peer Benchmark
  {
    id: "peer-benchmark",
    name: "Peer Benchmark",
    triggerKeywords: [
      "peer",
      "benchmark",
      "compare",
      "comparison",
      "comparable",
      "comparaison",
      "vs",
      "versus",
    ],
    chips: ["Peer Benchmark"],
    rationale:
      "Rank the entity against a defined peer set on key KPIs to surface relative position.",
    instructions:
      "Define the peer set as all partners sharing the same category and size band (e.g., large university, mid-market customer) using queryPartners with the appropriate filters, and document the peer set composition so the benchmark is reproducible. " +
      "Pull the key KPIs for every peer — including revenue contribution, activity score, satisfaction index, and any category-specific metrics — from partner_kpis and queryAnalytics for the same reference period. " +
      "Compute percentile ranks or z-scores for each KPI so that relative standing is expressed on a common scale; present results in a ranked table via createTable. " +
      "Highlight the top three KPIs where the entity outperforms its peers and the bottom three KPIs where it underperforms, quantifying each gap in absolute terms and as a percentile rank. " +
      "Recommend two to three focus areas where closing the gap to the median peer would deliver the greatest incremental value, prioritising by the combination of gap size and KPI strategic weight.",
  },

  // 6 ─ Activity-Decay Churn
  {
    id: "activity-decay-churn",
    name: "Activity-Decay Churn",
    triggerKeywords: [
      "churn",
      "attrition",
      "at risk",
      "at-risk",
      "leaving",
      "inactive",
      "dormant",
      "perdre",
      "perdu",
    ],
    chips: ["Activity-Decay Churn", "Risk Scoring"],
    rationale:
      "Score churn risk by combining recency of activity, declining engagement KPIs, and unresolved blockers.",
    instructions:
      "Pull the full activity timeline for the partner using getPartnerDetails, capturing the timestamps of meetings, events, document uploads, KPI updates, and status transitions over the past 180 days. " +
      "Weight recent activity more heavily than older activity by applying a recency decay: last 30 days contributes 50 % of the raw activity score, the 31–90-day window contributes 30 %, and the 91–180-day window contributes the remaining 20 %. " +
      "Combine the recency-weighted activity score with KPI trend signals (directional delta of the three most important KPIs over the period) and a penalty for each unresolved negative status_history entry (e.g., suspended, at_risk, churned transitions). " +
      "Compute a composite churn-risk score from 0 (no risk) to 100 (imminent churn), classify it into Red (≥ 70), Yellow (40–69), or Green (< 40) bands, and surface the two to three factors that contributed most to the score. " +
      "Recommend a targeted retention play proportional to the risk band: for Red, propose an immediate executive escalation with a concrete offer or concession; for Yellow, suggest a scheduled check-in and one proactive incentive; for Green, recommend routine monitoring cadence.",
  },

  // 7 ─ Strategic-Fit Scoring
  {
    id: "strategic-fit-scoring",
    name: "Strategic-Fit Scoring",
    triggerKeywords: [
      "strategic fit",
      "strategic",
      "fit score",
      "alignment",
      "should we partner",
      "should we work with",
      "renew",
      "renewal",
    ],
    chips: ["Strategic-Fit Scoring"],
    rationale:
      "Score strategic alignment via weighted criteria: market fit, capability gap closed, revenue potential, brand reputation, execution risk.",
    instructions:
      "Enumerate the five strategic-fit criteria and their weights: market fit (25 %), capability gap closed (25 %), revenue potential (20 %), brand/reputation alignment (20 %), and execution risk — scored inversely so lower risk yields a higher score — (10 %), confirming the weights sum to 100 %. " +
      "Score each criterion from 0 to 10 using cited evidence from getPartnerDetails, partner_kpis, and any available vendor_projects or student_recruitments data; do not assign a score without a supporting data point. " +
      "Compute the weighted total score (sum of criterion score × weight / 10, yielding a 0–100 result) and classify the outcome: 75–100 = Strong Fit (go), 50–74 = Medium Fit (conditional go with mitigation), 0–49 = Weak Fit (no-go or renegotiate). " +
      "Present the scoring breakdown in a table via createTable showing criterion, raw score, weight, and weighted contribution so the decision is fully auditable. " +
      "End with an explicit go/no-go/conditional recommendation, listing one to two specific conditions or risk mitigations that must be addressed before signing or renewing.",
  },

  // 8 ─ Vendor Performance Index
  {
    id: "vendor-performance-index",
    name: "Vendor Performance Index",
    triggerKeywords: [
      "vendor",
      "supplier",
      "fournisseur",
      "performance",
      "sla",
      "delivery",
      "quality",
    ],
    chips: ["Vendor Performance Index"],
    rationale:
      "Composite index combining on-time delivery, quality defect rate, cost competitiveness, and incident response time.",
    instructions:
      "Pull vendor KPIs from getPartnerDetails and partner_kpis for the selected date range, specifically extracting on-time delivery rate (%), quality defect rate (%), unit cost relative to category median (%), and mean incident response time (hours). " +
      "Normalise each raw KPI to a 0–100 sub-score: delivery rate maps linearly (100 % on-time = 100, 0 % = 0); defect rate inverts (0 % defects = 100, 10 %+ = 0, linear interpolation); cost competitiveness inverts the percentage premium over the cheapest peer (at-median = 50, cheapest = 100, 20 %+ above median = 0); incident response inverts response hours (≤ 4 h = 100, ≥ 48 h = 0, log scale). " +
      "Compute the Vendor Performance Index as a weighted composite: 40 % delivery + 30 % quality + 20 % cost + 10 % incident response, producing a final score from 0 to 100. " +
      "Rank all vendors by VPI score, present the table via createTable, and classify each as Preferred (VPI ≥ 75), Acceptable (50–74), or At-Risk (< 50). " +
      "For each At-Risk vendor, recommend a specific remediation action (e.g., issue a formal performance notice, cap volume until SLA is met, initiate dual-sourcing) and identify a replacement candidate from the Preferred tier if available.",
  },

  // 9 ─ Recruitment Funnel
  {
    id: "recruitment-funnel",
    name: "Recruitment Funnel",
    triggerKeywords: [
      "recruitment",
      "recrutement",
      "hire",
      "hiring",
      "candidate",
      "candidat",
      "applicant",
      "intern",
      "internship",
      "stage",
    ],
    chips: ["Recruitment Funnel"],
    rationale:
      "Track conversion rates between funnel stages (applied → screened → interviewed → offered → accepted) to find the leaky step.",
    instructions:
      "Pull student_recruitments data for each university partner using queryAnalytics (recruitment_conversion query) and getPartnerDetails, capturing counts at each funnel stage: Applied, Screened, Interviewed, Offered, and Accepted for the target academic year or date range. " +
      "Compute stage-to-stage conversion rates as (count at stage N+1) / (count at stage N) × 100, and compute the end-to-end funnel yield (Accepted / Applied × 100) for each university partner. " +
      "Identify the single lowest-conversion step across the aggregate funnel — this is the primary leakage point — and flag any partner where a specific stage conversion is more than 15 percentage points below the portfolio average. " +
      "Compare the funnel metrics across all university partners side by side in a table via createTable, sorted by end-to-end yield descending, so that high- and low-performing partners are immediately visible. " +
      "Recommend a targeted intervention at the lowest-conversion stage (e.g., faster screening SLA to reduce dropout, structured interview training to improve offer-acceptance rate, dedicated employer-brand event to boost application volume) and estimate the incremental hires achievable if the conversion rate at that stage reaches the top-quartile benchmark.",
  },
]

// ---------------------------------------------------------------------------
// selectMethodologies
// ---------------------------------------------------------------------------

/**
 * Scan user message for trigger keywords and return all matching methodologies.
 * Match is case-insensitive whole-word (word boundary) regex.
 */
export function selectMethodologies(userMessage: string): Methodology[] {
  if (!userMessage || typeof userMessage !== "string") return []
  const normalized = userMessage.toLowerCase()
  const matched: Methodology[] = []

  for (const m of METHODOLOGIES) {
    for (const kw of m.triggerKeywords) {
      // Word boundary regex; supports multi-word keywords by escaping spaces
      // and using \b at start/end of phrase.
      const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`\\b${escaped}\\b`, "i")
      if (regex.test(normalized)) {
        matched.push(m)
        break
      }
    }
  }

  return matched
}

// ---------------------------------------------------------------------------
// buildMethodologyPrompt
// ---------------------------------------------------------------------------

/**
 * Build the system prompt addendum to inject when methodologies match.
 * Returns "" when matched.length === 0.
 */
export function buildMethodologyPrompt(matched: Methodology[]): string {
  if (matched.length === 0) return ""

  const blocks = matched
    .map(
      (m) =>
        `### ${m.name}
${m.instructions}`
    )
    .join("\n\n")

  const allChips = matched.flatMap((m) => m.chips)

  return `

## Auto-loaded Analytical Methodologies

The user's question matches the following analytical patterns. Apply them rigorously:

${blocks}

After your analysis, call \`declareMethodology\` with:
- methodologies: ${JSON.stringify(allChips)}
- rationale: a 1-2 sentence explanation of why these patterns apply
- assumptions: any assumptions you're making
`
}
