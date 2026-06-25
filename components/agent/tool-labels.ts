/**
 * Human-friendly French labels for the agent's internal tool names.
 *
 * The agent surface must never expose raw camelCase tool identifiers to users.
 * Known tools map to a curated French label; unknown tools fall back to a
 * prettified version of their name (camelCase -> spaced, capitalized) so the
 * UI degrades gracefully instead of leaking internal identifiers.
 */
const TOOL_LABELS: Readonly<Record<string, string>> = {
  // Meta / planning
  declareMethodology: "Méthodologie",
  createPlan: "Plan d'analyse",
  askClarification: "Demande de précision",
  // Partner intelligence
  queryPartners: "Recherche de partenaires",
  queryAnalytics: "Analyse des données",
  getPartnerDetails: "Détails du partenaire",
  scorePartner: "Scoring du partenaire",
  predictChurn: "Analyse du risque de churn",
  recommendPartners: "Recommandation de partenaires",
  // Portfolio
  summarizePartnerPortfolio: "Synthèse du portefeuille",
  getPartnerActivityTimeline: "Chronologie d'activité",
  getCategoryBenchmarks: "Comparatif par catégorie",
  // Projects
  analyzeProjectHealth: "Santé des projets",
  identifyAtRiskProjects: "Projets à risque",
  forecastProjectDelay: "Prévision des retards",
  recommendStaffing: "Recommandation de staffing",
  findCriticalPath: "Chemin critique",
  crossEntityAnalysis: "Analyse transversale",
  searchDocuments: "Recherche documentaire",
  // Visual / output
  generateReport: "Génération du rapport",
  createBarChart: "Graphique en barres",
  createLineChart: "Graphique en courbes",
  createPieChart: "Graphique en camembert",
  createTable: "Tableau",
  // Code execution aliases
  executeCode: "Exécution du code",
  runCode: "Exécution du code",
  createCodeResult: "Exécution du code",
}

/**
 * Turn an unknown camelCase / snake_case tool name into a readable, capitalized
 * label, e.g. `summarizePartnerPortfolio` -> `Summarize partner portfolio`.
 */
function prettifyToolName(toolName: string): string {
  const spaced = toolName
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

  if (spaced.length === 0) {
    return "Outil"
  }

  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Resolve a friendly French label for a raw tool identifier. */
export function getToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? prettifyToolName(toolName)
}
