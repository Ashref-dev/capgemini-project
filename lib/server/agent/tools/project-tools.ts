import { tool } from "ai"
import { z } from "zod"

import { searchDocuments } from "@/lib/server/agent/rag"
import {
  analyzeProjectHealth,
  crossEntityAnalysis,
  findCriticalPath,
  forecastProjectDelay,
  identifyAtRiskProjects,
  recommendStaffing,
} from "@/lib/server/services/project-analytics"

export const analyzeProjectHealthTool = tool({
  description:
    "Analyze the health of a single project. Returns a 0-100 score, R/Y/G band, and human-readable reasons. Use when the user asks about a specific project's status, risk, or health.",
  inputSchema: z.object({
    projectId: z.number().int().positive().describe("Project ID to analyze"),
  }),
  execute: async ({ projectId }) => {
    try {
      return await analyzeProjectHealth(projectId)
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})

export const identifyAtRiskProjectsTool = tool({
  description:
    "Identify projects currently at risk (Red or low-Yellow health). Returns top 20 worst-first. Use when the user asks 'which projects are in trouble', 'show me at-risk projects', etc.",
  inputSchema: z.object({
    partnerId: z.number().int().positive().optional().describe("Optional: filter to projects of a specific partner"),
    minRiskScore: z
      .number()
      .int()
      .min(0)
      .max(100)
      .optional()
      .describe("Optional: include yellow projects below this score (default 60)"),
  }),
  execute: async (input) => {
    try {
      return { projects: await identifyAtRiskProjects(input) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})

export const forecastProjectDelayTool = tool({
  description:
    "Forecast a project's likely end date based on past milestone slippage. Returns predicted end date and confidence level. Use when asked to predict delays or project completion.",
  inputSchema: z.object({
    projectId: z.number().int().positive(),
  }),
  execute: async ({ projectId }) => {
    try {
      return await forecastProjectDelay(projectId)
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})

export const recommendStaffingTool = tool({
  description:
    "Recommend Capgemini employees who would fit well on a project, based on tag/skill match, current availability, and workload. Returns top 8.",
  inputSchema: z.object({
    projectId: z.number().int().positive(),
  }),
  execute: async ({ projectId }) => {
    try {
      return { recommendations: await recommendStaffing(projectId) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})

export const findCriticalPathTool = tool({
  description:
    "Identify the critical chain of open milestones for a project, ordered chronologically. Returns the path + total span in days.",
  inputSchema: z.object({
    projectId: z.number().int().positive(),
  }),
  execute: async ({ projectId }) => {
    try {
      return await findCriticalPath(projectId)
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})

export const crossEntityAnalysisTool = tool({
  description: "Cross-entity analysis combining a partner and/or a project. Returns joint insights. Provide at least one of partnerId or projectId.",
  inputSchema: z.object({
    partnerId: z.number().int().positive().optional(),
    projectId: z.number().int().positive().optional(),
  }),
  execute: async (input) => {
    try {
      return await crossEntityAnalysis(input)
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})

export const searchDocumentsTool = tool({
  description:
    "Vector search over partner + project documents. Returns top-K most similar chunks with citations like 'partner_document#42-chunk-3'. Use when the user asks about document content, contract terms, or anything that might be in a stored document. After using this tool, ALWAYS cite chunks in your answer using the citation format [docKind#docId-chunk-N].",
  inputSchema: z.object({
    query: z.string().min(3).describe("The user's question or search query"),
    topK: z.number().int().min(1).max(10).optional().default(5),
    sourceKind: z.enum(["partner_document", "project_document"]).optional(),
    documentId: z.number().int().positive().optional().describe("Optional: restrict to a specific document"),
  }),
  execute: async (input) => {
    try {
      const matches = await searchDocuments({
        query: input.query,
        topK: input.topK ?? 5,
        sourceKind: input.sourceKind,
        documentId: input.documentId,
      })
      return { matches }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})
