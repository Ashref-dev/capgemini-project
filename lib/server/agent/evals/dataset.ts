export type EvalCase = {
  id: string
  input: { question: string }
  expected: {
    contains?: string[]
    tools?: string[]
    citation?: boolean
  }
}

export const EVAL_DATASET: EvalCase[] = [
  {
    id: "scoring-1",
    input: {
      question: "Score partner BIAT and tell me if we should renew.",
    },
    expected: {
      tools: ["scorePartner"],
      contains: ["score"],
    },
  },
  {
    id: "churn-1",
    input: {
      question: "Compute churn risk for partner id 1 and list the top reasons.",
    },
    expected: {
      tools: ["predictChurn"],
      contains: ["churn", "risk"],
    },
  },
  {
    id: "recommend-1",
    input: {
      question: "Recommend 3 partners for a cloud migration project.",
    },
    expected: {
      tools: ["recommendPartners"],
    },
  },
  {
    id: "report-1",
    input: {
      question: "Generate a partner overview report.",
    },
    expected: {
      tools: ["generateReport"],
    },
  },
  {
    id: "rag-1",
    input: {
      question: "What are the partnership terms with our supplier? Quote from documents.",
    },
    expected: {
      tools: ["searchDocuments"],
      citation: true,
    },
  },
  {
    id: "project-health-1",
    input: {
      question: "Analyze the health of project 1 and tell me if it's at risk.",
    },
    expected: {
      tools: ["analyzeProjectHealth"],
      contains: ["health", "score"],
    },
  },
  {
    id: "at-risk-1",
    input: {
      question: "Which projects are currently at risk? Show me the top ones.",
    },
    expected: {
      tools: ["identifyAtRiskProjects"],
    },
  },
  {
    id: "forecast-1",
    input: {
      question: "Forecast the end date of project 1 based on milestone slippage.",
    },
    expected: {
      tools: ["forecastProjectDelay"],
      contains: ["end date", "predict"],
    },
  },
  {
    id: "staffing-1",
    input: {
      question: "Recommend the best Capgemini employees to staff project 1.",
    },
    expected: {
      tools: ["recommendStaffing"],
    },
  },
  {
    id: "critical-path-1",
    input: {
      question: "Show me the critical path of milestones for project 1.",
    },
    expected: {
      tools: ["findCriticalPath"],
      contains: ["milestone", "critical"],
    },
  },
]
