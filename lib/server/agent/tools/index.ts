import { createBarChart, createLineChart, createPieChart, createTable } from "./chart-tools"
import { askClarification, createPlan, declareMethodology } from "./meta-tools"
import { getCategoryBenchmarks, getPartnerActivityTimeline, summarizePartnerPortfolio } from "./portfolio-tools"
import {
  analyzeProjectHealthTool,
  crossEntityAnalysisTool,
  findCriticalPathTool,
  forecastProjectDelayTool,
  identifyAtRiskProjectsTool,
  recommendStaffingTool,
  searchDocumentsTool,
} from "./project-tools"
import { getPartnerDetails, predictChurn, queryAnalytics, queryPartners, recommendPartners, scorePartner } from "./partner-tools"
import { generateReport } from "./report-tools"
import { DEFAULT_TOOL_TIMEOUT_MS, HEAVY_TOOL_TIMEOUT_MS, withToolTimeout } from "./tool-timeout"

export { DEFAULT_TOOL_TIMEOUT_MS, HEAVY_TOOL_TIMEOUT_MS, withToolTimeout } from "./tool-timeout"

export const tools = {
  declareMethodology: withToolTimeout("declareMethodology", declareMethodology, DEFAULT_TOOL_TIMEOUT_MS),
  createPlan: withToolTimeout("createPlan", createPlan, DEFAULT_TOOL_TIMEOUT_MS),
  askClarification: withToolTimeout("askClarification", askClarification, DEFAULT_TOOL_TIMEOUT_MS),
  queryPartners: withToolTimeout("queryPartners", queryPartners, DEFAULT_TOOL_TIMEOUT_MS),
  queryAnalytics: withToolTimeout("queryAnalytics", queryAnalytics, DEFAULT_TOOL_TIMEOUT_MS),
  getPartnerDetails: withToolTimeout("getPartnerDetails", getPartnerDetails, DEFAULT_TOOL_TIMEOUT_MS),
  scorePartner: withToolTimeout("scorePartner", scorePartner, DEFAULT_TOOL_TIMEOUT_MS),
  predictChurn: withToolTimeout("predictChurn", predictChurn, HEAVY_TOOL_TIMEOUT_MS),
  recommendPartners: withToolTimeout("recommendPartners", recommendPartners, HEAVY_TOOL_TIMEOUT_MS),
  generateReport: withToolTimeout("generateReport", generateReport, DEFAULT_TOOL_TIMEOUT_MS),
  createBarChart: withToolTimeout("createBarChart", createBarChart, DEFAULT_TOOL_TIMEOUT_MS),
  createLineChart: withToolTimeout("createLineChart", createLineChart, DEFAULT_TOOL_TIMEOUT_MS),
  createPieChart: withToolTimeout("createPieChart", createPieChart, DEFAULT_TOOL_TIMEOUT_MS),
  createTable: withToolTimeout("createTable", createTable, DEFAULT_TOOL_TIMEOUT_MS),
  summarizePartnerPortfolio: withToolTimeout("summarizePartnerPortfolio", summarizePartnerPortfolio, DEFAULT_TOOL_TIMEOUT_MS),
  getPartnerActivityTimeline: withToolTimeout("getPartnerActivityTimeline", getPartnerActivityTimeline, DEFAULT_TOOL_TIMEOUT_MS),
  getCategoryBenchmarks: withToolTimeout("getCategoryBenchmarks", getCategoryBenchmarks, DEFAULT_TOOL_TIMEOUT_MS),
  analyzeProjectHealth: withToolTimeout("analyzeProjectHealth", analyzeProjectHealthTool, DEFAULT_TOOL_TIMEOUT_MS),
  identifyAtRiskProjects: withToolTimeout("identifyAtRiskProjects", identifyAtRiskProjectsTool, HEAVY_TOOL_TIMEOUT_MS),
  forecastProjectDelay: withToolTimeout("forecastProjectDelay", forecastProjectDelayTool, DEFAULT_TOOL_TIMEOUT_MS),
  recommendStaffing: withToolTimeout("recommendStaffing", recommendStaffingTool, DEFAULT_TOOL_TIMEOUT_MS),
  findCriticalPath: withToolTimeout("findCriticalPath", findCriticalPathTool, DEFAULT_TOOL_TIMEOUT_MS),
  crossEntityAnalysis: withToolTimeout("crossEntityAnalysis", crossEntityAnalysisTool, DEFAULT_TOOL_TIMEOUT_MS),
  searchDocuments: withToolTimeout("searchDocuments", searchDocumentsTool, DEFAULT_TOOL_TIMEOUT_MS),
}
