import { tool } from "ai"
import { z } from "zod"

import {
  buildChurnRiskReport,
  buildEventImpactReport,
  buildPartnerOverviewReport,
  buildRecruitmentPerformanceReport,
  buildRevenueAnalysisReport,
  buildUniversityPartnershipsReport,
} from "../reports/builders"
import { getErrorMessage } from "../utils"

export const generateReport = tool({
  description:
    "Generate a detailed markdown report on a topic. Topics: partner-overview, university-partnerships, revenue-analysis, churn-risk, recruitment-performance, event-impact. The report includes title, executive summary, data tables, insights, and recommendations.",
  inputSchema: z.object({
    topic: z.enum([
      "partner-overview",
      "university-partnerships",
      "revenue-analysis",
      "churn-risk",
      "recruitment-performance",
      "event-impact",
    ]),
    title: z.string().optional(),
  }),
  execute: async ({ topic, title }) => {
    try {
      switch (topic) {
        case "partner-overview":
          return await buildPartnerOverviewReport(title)
        case "university-partnerships":
          return await buildUniversityPartnershipsReport(title)
        case "revenue-analysis":
          return await buildRevenueAnalysisReport(title)
        case "churn-risk":
          return await buildChurnRiskReport(title)
        case "recruitment-performance":
          return await buildRecruitmentPerformanceReport(title)
        case "event-impact":
          return await buildEventImpactReport(title)
      }
    } catch (error) {
      return { error: `Failed to generate report: ${getErrorMessage(error)}` }
    }
  },
})
