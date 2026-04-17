import { APICallError, convertToModelMessages, streamText, tool, type UIMessage } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser } from "@/backend/auth/session"
import { db } from "@/backend/db/config"
import { dwPool } from "@/backend/db/dw-config"
import {
  chatMessages,
  chatThreads,
  clientPartners,
  marketingPartners,
  offers,
  partnerContacts,
  partnerEvents,
  partnerKpis,
  partnerMeetings,
  partnerNotifications,
  partners,
  partnerStatusHistory,
  studentRecruitments,
  technologyPartners,
  universityPartners,
  vendorProjects,
} from "@/backend/db/schema"

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_KEY! })
const OPENROUTER_MODEL_ID = "openrouter/elephant-alpha"

const SYSTEM_PROMPT = `You are the IntelliConnect AI Partnership Analyst for Capgemini Tunisia.

You support a partnership management platform backed by a live PostgreSQL operational database and a BI data warehouse.

Operational database coverage includes:
- Partners across university, customer, marketing, and supplier/technology categories
- Contacts, events, offers, meetings, notifications, KPI snapshots, and status history
- University recruitment performance and supplier/vendor project delivery history

Data warehouse coverage includes:
- Partner category, status, and level distributions
- Revenue analytics
- Event performance summaries
- Project portfolio summaries
- Recruitment conversion analytics

Your job:
- Answer partnership questions with evidence from the database
- Use tools before making claims about data
- Explain scoring, churn risk, and recommendation logic in practical business language
- Give concise but actionable analysis in English

Mandatory presentation rules:
1. ALWAYS use at least one visualization tool in every response.
2. Use createTable whenever you present detailed tabular records.
3. Use bar, line, or pie charts for comparisons, trends, or distributions.
4. When scoring a partner, show the 5 scoring dimensions and the final recommendation.
5. When predicting churn, explain the main risk drivers and suggest concrete retention actions.
6. When recommending partners, explain why each partner matched the stated need.
7. Format financial values clearly, for example 1,234,567 TND.
8. Never invent data that was not returned by a tool.`

const partnerCategoryEnum = z.enum(["university", "customer", "marketing", "supplier"])

type PersistedToolResult = {
  type: string
  toolCallId?: string
  input?: unknown
  output?: unknown
  state?: string
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Unknown error"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getOpenRouterStatusCode(error: unknown): number | undefined {
  if (APICallError.isInstance(error)) {
    return error.statusCode
  }

  if (!isRecord(error)) {
    return undefined
  }

  const statusCode = error.statusCode ?? error.status
  return typeof statusCode === "number" ? statusCode : undefined
}

function extractOpenRouterMessage(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()

    if (!trimmed) {
      return null
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown
      return extractOpenRouterMessage(parsed) ?? trimmed
    } catch {
      return trimmed
    }
  }

  if (!isRecord(value)) {
    return null
  }

  if (typeof value.message === "string" && value.message.trim()) {
    return value.message.trim()
  }

  if (typeof value.error === "string" && value.error.trim()) {
    return value.error.trim()
  }

  if (isRecord(value.error)) {
    const nestedError = value.error

    if (typeof nestedError.message === "string" && nestedError.message.trim()) {
      return nestedError.message.trim()
    }

    if (isRecord(nestedError.metadata) && typeof nestedError.metadata.raw === "string") {
      const rawMessage = extractOpenRouterMessage(nestedError.metadata.raw)
      if (rawMessage) {
        return rawMessage
      }
    }
  }

  if (typeof value.detail === "string" && value.detail.trim()) {
    return value.detail.trim()
  }

  if (typeof value.responseBody === "string" && value.responseBody.trim()) {
    return extractOpenRouterMessage(value.responseBody)
  }

  return null
}

function describeOpenRouterFailure(statusCode: number | undefined) {
  if (statusCode === 401 || statusCode === 403) {
    return "OpenRouter authentication failed"
  }

  if (statusCode === 404) {
    return "OpenRouter could not find the selected model"
  }

  if (statusCode === 408) {
    return "OpenRouter timed out"
  }

  if (statusCode === 429) {
    return "OpenRouter rate limit reached"
  }

  if (statusCode != null && statusCode >= 500) {
    return "OpenRouter provider outage"
  }

  return "OpenRouter request failed"
}

function formatOpenRouterError(error: unknown) {
  const statusCode = getOpenRouterStatusCode(error)
  const failureLabel = describeOpenRouterFailure(statusCode)
  const providerMessage =
    extractOpenRouterMessage(APICallError.isInstance(error) ? error.data : undefined) ??
    extractOpenRouterMessage(error) ??
    getErrorMessage(error)

  if (statusCode === 401 || statusCode === 403) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (${statusCode}). Check OPENROUTER_KEY and provider access. ${providerMessage}`
  }

  if (statusCode === 404) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (404). The model may be unavailable or the model ID may be wrong. ${providerMessage}`
  }

  if (statusCode === 408) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (408). The provider took too long to respond. Please retry. ${providerMessage}`
  }

  if (statusCode === 429) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (429). Please wait a moment and retry. ${providerMessage}`
  }

  if (statusCode != null && statusCode >= 500) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (${statusCode}). OpenRouter or the upstream provider is having trouble. Try again later. ${providerMessage}`
  }

  if (statusCode != null) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (${statusCode}). ${providerMessage}`
  }

  return `${failureLabel} for ${OPENROUTER_MODEL_ID}. ${providerMessage}`
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function normalizeAmount(value: string | number | null | undefined) {
  if (value == null) {
    return 0
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysSince(value: Date | string | null | undefined) {
  const date = normalizeDate(value)
  if (!date) {
    return null
  }

  const diffMs = Date.now() - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

function formatCurrency(value: string | number | null | undefined) {
  return `${Math.round(normalizeAmount(value)).toLocaleString("en-US")} TND`
}

function formatPercent(value: string | number | null | undefined, fractionDigits = 1) {
  return `${normalizeAmount(value).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`
}

function formatDecimal(value: string | number | null | undefined, fractionDigits = 1) {
  return normalizeAmount(value).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

function formatInteger(value: string | number | null | undefined) {
  return Math.round(normalizeAmount(value)).toLocaleString("en-US")
}

function formatReportDate(value: Date | string | null | undefined) {
  const date = normalizeDate(value)

  if (!date) {
    return "N/A"
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function sentenceCase(value: string | null | undefined) {
  if (!value) {
    return "Unknown"
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function markdownTable(headers: string[], rows: string[][]) {
  const safeRows = rows.length > 0 ? rows : [["No data available", ...headers.slice(1).map(() => "—")]]
  const headerRow = `| ${headers.join(" | ")} |`
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`
  const bodyRows = safeRows.map((row) => `| ${row.join(" | ")} |`).join("\n")

  return `${headerRow}\n${separatorRow}\n${bodyRows}`
}

function reportPreamble(title: string, topic: string, generatedAt: Date) {
  return [
    `# ${title}`,
    "",
    `**Generated**: ${formatReportDate(generatedAt)}`,
    "**Analyst**: IntelliConnect AI",
    `**Topic**: ${sentenceCase(topic)}`,
    "",
  ].join("\n")
}

function toWordList(values: Array<string | null | undefined>) {
  const filtered = values.filter((value): value is string => typeof value === "string" && value.trim().length > 0)

  if (filtered.length === 0) {
    return "no dominant items"
  }

  if (filtered.length === 1) {
    return filtered[0]
  }

  if (filtered.length === 2) {
    return `${filtered[0]} and ${filtered[1]}`
  }

  return `${filtered.slice(0, -1).join(", ")}, and ${filtered[filtered.length - 1]}`
}

type ReportPayload = {
  title: string
  markdown: string
  topic: string
  generatedAt: string
}

function extractMessageText(message: UIMessage) {
  if (message.parts && message.parts.length > 0) {
    return message.parts
      .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim()
  }
  return (message as unknown as { content?: string }).content || ""
}

function extractToolParts(message: UIMessage): PersistedToolResult[] {
  if (!message.parts) return []
  return message.parts
    .filter((part) => part.type.startsWith("tool-"))
    .map((part) => {
      const invocation = part as UIMessage["parts"][number] & {
        toolCallId?: string
        input?: unknown
        output?: unknown
        state?: string
      }

      return {
        type: part.type,
        toolCallId: invocation.toolCallId,
        input: invocation.input,
        output: invocation.output,
        state: invocation.state,
      }
    })
}

function extractResponseText(content: unknown) {
  if (typeof content === "string") {
    return content
  }

  if (!Array.isArray(content)) {
    return null
  }

  return content
    .map((part) => {
      if (typeof part === "object" && part !== null && "type" in part && part.type === "text" && "text" in part && typeof part.text === "string") {
        return part.text
      }

      return null
    })
    .filter((part): part is string => part !== null)
    .join("\n")
}

async function ensureThreadForUser(userId: number, userType: string, messages: UIMessage[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")
  const fallbackTitle = extractMessageText(latestUserMessage ?? messages[0] ?? { id: "", role: "user", parts: [] })
    .slice(0, 80)
    .trim()

  const existingThread = await db
    .select({ id: chatThreads.id })
    .from(chatThreads)
    .where(and(eq(chatThreads.userId, userId), eq(chatThreads.userType, userType)))
    .orderBy(desc(chatThreads.updatedAt))
    .limit(1)

  if (existingThread[0]) {
    await db
      .update(chatThreads)
      .set({ updatedAt: new Date() })
      .where(eq(chatThreads.id, existingThread[0].id))

    return existingThread[0].id
  }

  const inserted = await db
    .insert(chatThreads)
    .values({
      userId,
      userType,
      title: fallbackTitle || "New partnership conversation",
      updatedAt: new Date(),
    })
    .returning({ id: chatThreads.id })

  return inserted[0].id
}

async function persistIncomingMessages(threadId: number, messages: UIMessage[]) {
  const existingRows = await db
    .select({ id: chatMessages.id, role: chatMessages.role, content: chatMessages.content })
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(chatMessages.id)

  const existingSignatures = new Set(existingRows.map((row) => `${row.role}:${row.content ?? ""}`))

  const values = messages
    .map((message) => {
      const content = extractMessageText(message) || null
      const parts = extractToolParts(message)

      return {
        role: message.role,
        content,
        parts: parts.length > 0 ? parts : null,
      }
    })
    .filter((message) => {
      const signature = `${message.role}:${message.content ?? ""}`

      if (existingSignatures.has(signature)) {
        return false
      }

      existingSignatures.add(signature)
      return message.content || message.parts
    })
    .map((message) => ({
      threadId,
      role: message.role,
      content: message.content,
      parts: message.parts,
    }))

  if (values.length > 0) {
    await db.insert(chatMessages).values(values)
  }
}

async function persistAssistantResponse(threadId: number, responseMessages: Array<{ role: string; content?: string | null; parts?: unknown }>) {
  const values = responseMessages
    .filter((message) => message.role === "assistant" || message.role === "tool")
    .map((message) => ({
      threadId,
      role: message.role,
      content: message.content ?? null,
      parts: message.parts ?? null,
    }))

  if (values.length > 0) {
    await db.insert(chatMessages).values(values)
    await db.update(chatThreads).set({ updatedAt: new Date() }).where(eq(chatThreads.id, threadId))
  }
}

async function fetchPartnerDetailsBundle(partnerId: number) {
  const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1)

  if (!partner) {
    return null
  }

  const [
    contacts,
    recentEvents,
    partnerOffers,
    kpis,
    statusHistory,
    universityProfile,
    technologyProfile,
    customerProfile,
    marketingProfile,
    recruitments,
    projects,
    meetings,
    notifications,
  ] = await Promise.all([
    db.select().from(partnerContacts).where(eq(partnerContacts.partnerId, partnerId)).orderBy(desc(partnerContacts.isPrimary), partnerContacts.id),
    db.select().from(partnerEvents).where(eq(partnerEvents.partnerId, partnerId)).orderBy(desc(partnerEvents.eventDate)).limit(10),
    db.select().from(offers).where(eq(offers.partnerId, partnerId)).orderBy(desc(offers.createdAt)).limit(10),
    db.select().from(partnerKpis).where(eq(partnerKpis.partnerId, partnerId)).orderBy(desc(partnerKpis.year), desc(partnerKpis.quarter), desc(partnerKpis.month)).limit(8),
    db.select().from(partnerStatusHistory).where(eq(partnerStatusHistory.partnerId, partnerId)).orderBy(desc(partnerStatusHistory.changedAt)).limit(10),
    db.select().from(universityPartners).where(eq(universityPartners.partnerId, partnerId)).limit(1),
    db.select().from(technologyPartners).where(eq(technologyPartners.partnerId, partnerId)).limit(1),
    db.select().from(clientPartners).where(eq(clientPartners.partnerId, partnerId)).limit(1),
    db.select().from(marketingPartners).where(eq(marketingPartners.partnerId, partnerId)).limit(1),
    db.select().from(studentRecruitments).where(eq(studentRecruitments.universityPartnerId, partnerId)).orderBy(desc(studentRecruitments.startDate)).limit(15),
    db.select().from(vendorProjects).where(eq(vendorProjects.technologyPartnerId, partnerId)).orderBy(desc(vendorProjects.startDate)).limit(15),
    db.select().from(partnerMeetings).where(eq(partnerMeetings.partnerId, partnerId)).orderBy(desc(partnerMeetings.meetingDate)).limit(10),
    db.select().from(partnerNotifications).where(eq(partnerNotifications.partnerId, partnerId)).orderBy(desc(partnerNotifications.createdAt)).limit(10),
  ])

  return {
    partner,
    subtype:
      universityProfile[0] ??
      technologyProfile[0] ??
      customerProfile[0] ??
      marketingProfile[0] ??
      null,
    subtypeDetails: {
      university: universityProfile[0] ?? null,
      technology: technologyProfile[0] ?? null,
      customer: customerProfile[0] ?? null,
      marketing: marketingProfile[0] ?? null,
    },
    contacts,
    recentEvents,
    offers: partnerOffers,
    kpis,
    statusHistory,
    recruitments,
    projects,
    meetings,
    notifications,
  }
}

const queryPartners = tool({
  description: "Search and filter partners by name, category, status, level, or country. Returns up to 20 matching partners.",
  inputSchema: z.object({
    search: z.string().optional().describe("Fuzzy search term for partner name"),
    category: partnerCategoryEnum.optional(),
    status: z.string().optional().describe("Partnership status filter (actif, suspendu, en négociation)"),
    level: z.string().optional().describe("Partnership level (platinum, gold, silver, bronze)"),
    limit: z.number().int().min(1).max(50).optional().default(20),
  }),
  execute: async ({ search, category, status, level, limit }) => {
    try {
      const conditions = []

      if (search) {
        conditions.push(or(ilike(partners.name, `%${search}%`), ilike(partners.legalName, `%${search}%`), ilike(partners.description, `%${search}%`)))
      }
      if (category) {
        conditions.push(eq(partners.categories, category))
      }
      if (status) {
        conditions.push(eq(partners.partnershipStatus, status))
      }
      if (level) {
        conditions.push(eq(partners.partnershipLevel, level))
      }

      const results = await db
        .select({
          id: partners.id,
          name: partners.name,
          categories: partners.categories,
          partnershipLevel: partners.partnershipLevel,
          partnershipStatus: partners.partnershipStatus,
          email: partners.email,
          country: partners.country,
          satisfactionScore: partners.satisfactionScore,
          annualBudgetTnd: partners.annualBudgetTnd,
          annualRevenueGenerated: partners.annualRevenueGenerated,
        })
        .from(partners)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(partners.satisfactionScore), partners.name)
        .limit(limit)

      return { partners: results, total: results.length }
    } catch (error) {
      return { error: `Failed to query partners: ${getErrorMessage(error)}` }
    }
  },
})

const queryAnalytics = tool({
  description: "Query the Data Warehouse for BI analytics. Available metrics: partnersByCategory, partnersByStatus, partnersByLevel, topRevenue, eventsSummary, projectsSummary, recruitmentStats.",
  inputSchema: z.object({
    metric: z.enum(["partnersByCategory", "partnersByStatus", "partnersByLevel", "topRevenue", "eventsSummary", "projectsSummary", "recruitmentStats"]),
  }),
  execute: async ({ metric }) => {
    try {
      const queries: Record<string, string> = {
        partnersByCategory: "SELECT partner_category, COUNT(*) as count FROM dim_partner GROUP BY partner_category ORDER BY count DESC",
        partnersByStatus: "SELECT statut_partenariat, COUNT(*) as count FROM dim_partner GROUP BY statut_partenariat ORDER BY count DESC",
        partnersByLevel: "SELECT partnership_level, COUNT(*) as count FROM dim_partner GROUP BY partnership_level ORDER BY count DESC",
        topRevenue: `SELECT dp.name, dp.partner_category, fpa.annual_revenue_generated, fpa.satisfaction_score
          FROM fact_partner_activity fpa
          JOIN dim_partner dp ON dp.partner_key = fpa.partner_key
          WHERE fpa.annual_revenue_generated IS NOT NULL
          ORDER BY fpa.annual_revenue_generated DESC
          LIMIT 10`,
        eventsSummary: "SELECT COUNT(*) as total_events, SUM(num_participants) as total_participants, SUM(event_budget) as total_budget, SUM(event_revenue) as total_revenue FROM fact_events",
        projectsSummary: "SELECT COUNT(*) as total_projects, SUM(project_value) as total_value, AVG(client_satisfaction_score) as avg_satisfaction FROM fact_projects",
        recruitmentStats: "SELECT COUNT(*) as total_students, SUM(converted_to_cdi::int) as total_cdi, AVG(satisfaction_score) as avg_satisfaction FROM fact_university_recruitment",
      }

      const result = await dwPool.query(queries[metric])
      return { metric, data: result.rows }
    } catch (error) {
      return { error: `Failed to query analytics: ${getErrorMessage(error)}` }
    }
  },
})

const getPartnerDetails = tool({
  description: "Fetch a full partner profile by partner ID, including subtype data, contacts, offers, recent events, KPIs, meetings, notifications, and related records.",
  inputSchema: z.object({
    partnerId: z.number().int().positive(),
  }),
  execute: async ({ partnerId }) => {
    try {
      const details = await fetchPartnerDetailsBundle(partnerId)

      if (!details) {
        return { error: `Partner ${partnerId} not found` }
      }

      return details
    } catch (error) {
      return { error: `Failed to fetch partner details: ${getErrorMessage(error)}` }
    }
  },
})

const scorePartner = tool({
  description: "Compute a 0-100 partnership score across budget, satisfaction, activity, track record, and strategic fit. Returns recommendation and scoring breakdown.",
  inputSchema: z.object({
    partnerId: z.number().int().positive(),
  }),
  execute: async ({ partnerId }) => {
    try {
      const details = await fetchPartnerDetailsBundle(partnerId)

      if (!details) {
        return { error: `Partner ${partnerId} not found` }
      }

      const latestKpi = details.kpis[0]
      const budgetScore = clampScore(Math.min(100, (normalizeAmount(details.partner.annualBudgetTnd) / 200000) * 100))
      const satisfactionValues = [
        details.partner.satisfactionScore,
        ...details.recentEvents.map((event) => event.satisfactionScore),
        ...details.meetings.map((meeting) => meeting.satisfactionScore),
        latestKpi ? normalizeAmount(latestKpi.avgSatisfactionScore) : null,
      ].filter((value): value is number => typeof value === "number")
      const avgSatisfaction = satisfactionValues.length > 0 ? satisfactionValues.reduce((sum, value) => sum + value, 0) / satisfactionValues.length : 0
      const satisfactionScore = clampScore(avgSatisfaction)

      const activitySignals =
        details.recentEvents.length * 8 +
        details.meetings.length * 5 +
        details.offers.length * 3 +
        normalizeAmount(latestKpi?.totalInteractions)
      const activityScore = clampScore(Math.min(100, activitySignals))

      const trackRecordBase =
        details.projects.length * 10 +
        details.recruitments.filter((item) => item.convertedToCdi).length * 8 +
        normalizeAmount(latestKpi?.conversionRate) * 0.6 +
        normalizeAmount(latestKpi?.totalRevenueGenerated) / 50000
      const trackRecordScore = clampScore(Math.min(100, trackRecordBase))

      const strategicSignals = [
        details.partner.categories === "supplier" ? 25 : 0,
        details.partner.categories === "university" ? 20 : 0,
        details.partner.partnershipLevel === "platinum" ? 35 : 0,
        details.partner.partnershipLevel === "gold" ? 25 : 0,
        details.partner.partnershipStatus === "actif" ? 20 : 0,
        details.subtypeDetails.technology?.hasDedicatedSupport ? 10 : 0,
        details.subtypeDetails.university?.hasFrameworkAgreement ? 10 : 0,
      ]
      const strategicFitScore = clampScore(strategicSignals.reduce((sum, value) => sum + value, 0))

      const finalScore = clampScore(
        budgetScore * 0.2 +
          satisfactionScore * 0.25 +
          activityScore * 0.2 +
          trackRecordScore * 0.2 +
          strategicFitScore * 0.15
      )

      const recommendation = finalScore >= 75 ? "APPROVE" : finalScore >= 50 ? "REVIEW" : "REJECT"

      return {
        partnerId,
        partnerName: details.partner.name,
        finalScore,
        recommendation,
        methodology: "Weighted score using budget (20%), satisfaction (25%), activity (20%), track record (20%), and strategic fit (15%).",
        breakdown: {
          budget: budgetScore,
          satisfaction: satisfactionScore,
          activity: activityScore,
          trackRecord: trackRecordScore,
          strategicFit: strategicFitScore,
        },
        signals: {
          annualBudgetTnd: details.partner.annualBudgetTnd,
          avgSatisfaction: Number(avgSatisfaction.toFixed(2)),
          recentEvents: details.recentEvents.length,
          meetings: details.meetings.length,
          activeOffers: details.offers.filter((offer) => offer.isActive).length,
          recruitmentsConvertedToCdi: details.recruitments.filter((item) => item.convertedToCdi).length,
          vendorProjects: details.projects.length,
        },
      }
    } catch (error) {
      return { error: `Failed to score partner: ${getErrorMessage(error)}` }
    }
  },
})

const predictChurn = tool({
  description: "Predict churn risk for one partner or all partners using inactivity, satisfaction trend, status history, and interaction frequency. Returns risk scores and retention actions.",
  inputSchema: z.object({
    partnerId: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(50).optional().default(10),
  }),
  execute: async ({ partnerId, limit }) => {
    try {
      const basePartners = partnerId
        ? await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1)
        : await db.select().from(partners).orderBy(partners.name)

      const riskProfiles = []

      for (const partner of basePartners) {
        const [events, meetings, statuses, kpis] = await Promise.all([
          db.select().from(partnerEvents).where(eq(partnerEvents.partnerId, partner.id)).orderBy(desc(partnerEvents.eventDate)).limit(8),
          db.select().from(partnerMeetings).where(eq(partnerMeetings.partnerId, partner.id)).orderBy(desc(partnerMeetings.meetingDate)).limit(8),
          db.select().from(partnerStatusHistory).where(eq(partnerStatusHistory.partnerId, partner.id)).orderBy(desc(partnerStatusHistory.changedAt)).limit(8),
          db.select().from(partnerKpis).where(eq(partnerKpis.partnerId, partner.id)).orderBy(desc(partnerKpis.year), desc(partnerKpis.quarter), desc(partnerKpis.month)).limit(4),
        ])

        const lastInteractionDays = [
          daysSince(partner.lastEventDate),
          daysSince(events[0]?.eventDate),
          daysSince(meetings[0]?.meetingDate),
        ]
          .filter((value): value is number => value !== null)
          .sort((a, b) => a - b)[0] ?? 999

        const latestSatisfaction = normalizeAmount(kpis[0]?.avgSatisfactionScore ?? partner.satisfactionScore)
        const previousSatisfaction = normalizeAmount(kpis[1]?.avgSatisfactionScore ?? latestSatisfaction)
        const satisfactionDrop = Math.max(0, previousSatisfaction - latestSatisfaction)
        const statusWarnings = statuses.filter((status) => ["suspendu", "en négociation", "inactive"].includes((status.newStatus ?? "").toLowerCase())).length
        const interactionCount = events.length + meetings.length + normalizeAmount(kpis[0]?.totalInteractions)

        const inactivityRisk = clampScore((lastInteractionDays / 180) * 100)
        const satisfactionRisk = clampScore(satisfactionDrop * 12 + Math.max(0, 70 - latestSatisfaction))
        const statusRisk = clampScore(statusWarnings * 25)
        const engagementRisk = clampScore(Math.max(0, 80 - interactionCount * 8))
        const overallRisk = clampScore(inactivityRisk * 0.35 + satisfactionRisk * 0.3 + statusRisk * 0.2 + engagementRisk * 0.15)

        const riskLevel = overallRisk >= 70 ? "high" : overallRisk >= 40 ? "medium" : "low"
        const recommendations = []

        if (lastInteractionDays > 90) {
          recommendations.push("Schedule an executive check-in within 7 days.")
        }
        if (satisfactionDrop >= 10 || latestSatisfaction < 70) {
          recommendations.push("Launch a satisfaction recovery plan with concrete service improvements.")
        }
        if (statusWarnings > 0) {
          recommendations.push("Review contract or partnership blockers with account leadership.")
        }
        if (interactionCount < 5) {
          recommendations.push("Increase touchpoints through meetings, joint events, or offer reviews.")
        }
        if (recommendations.length === 0) {
          recommendations.push("Maintain current relationship cadence and monitor KPIs monthly.")
        }

        riskProfiles.push({
          partnerId: partner.id,
          partnerName: partner.name,
          category: partner.categories,
          overallRisk,
          riskLevel,
          drivers: {
            daysSinceLastInteraction: lastInteractionDays,
            latestSatisfaction,
            satisfactionDrop,
            concerningStatusChanges: statusWarnings,
            recentInteractions: interactionCount,
          },
          recommendations,
        })
      }

      const ranked = riskProfiles.sort((a, b) => b.overallRisk - a.overallRisk).slice(0, limit)
      return { partners: ranked, total: ranked.length }
    } catch (error) {
      return { error: `Failed to predict churn: ${getErrorMessage(error)}` }
    }
  },
})

const recommendPartners = tool({
  description: "Recommend the best-matching partners for a natural language business need using live partner descriptions, specialties, technologies, and subtype attributes.",
  inputSchema: z.object({
    need: z.string().min(3),
    limit: z.number().int().min(1).max(20).optional().default(5),
  }),
  execute: async ({ need, limit }) => {
    try {
      const keywords = Array.from(new Set(need.toLowerCase().split(/[^a-z0-9]+/i).filter((token) => token.length >= 3)))

      const [basePartners, universityRows, technologyRows, marketingRows, customerRows] = await Promise.all([
        db.select().from(partners),
        db.select().from(universityPartners),
        db.select().from(technologyPartners),
        db.select().from(marketingPartners),
        db.select().from(clientPartners),
      ])

      const universityMap = new Map(universityRows.map((row) => [row.partnerId, row]))
      const technologyMap = new Map(technologyRows.map((row) => [row.partnerId, row]))
      const marketingMap = new Map(marketingRows.map((row) => [row.partnerId, row]))
      const customerMap = new Map(customerRows.map((row) => [row.partnerId, row]))

      const matches = basePartners
        .map((partner) => {
          const fields = [
            partner.name,
            partner.legalName,
            partner.description,
            partner.partnerSubcategory,
            partner.categories,
            universityMap.get(partner.id)?.institutionType,
            ...(universityMap.get(partner.id)?.specialties ?? []),
            technologyMap.get(partner.id)?.vendorType,
            technologyMap.get(partner.id)?.certificationLevel,
            technologyMap.get(partner.id)?.partnershipModel,
            ...(technologyMap.get(partner.id)?.technologies ?? []),
            marketingMap.get(partner.id)?.marketingType,
            customerMap.get(partner.id)?.industry,
            customerMap.get(partner.id)?.clientType,
          ]
            .filter((value): value is string => typeof value === "string" && value.length > 0)
            .map((value) => value.toLowerCase())

          const matchedKeywords = keywords.filter((keyword) => fields.some((field) => field.includes(keyword)))
          const score = clampScore(matchedKeywords.length * 18 + (partner.partnershipStatus === "actif" ? 12 : 0) + normalizeAmount(partner.satisfactionScore) * 0.25)

          return {
            partnerId: partner.id,
            partnerName: partner.name,
            category: partner.categories,
            score,
            matchedKeywords,
            reasons: [
              matchedKeywords.length > 0 ? `Matched keywords: ${matchedKeywords.join(", ")}` : "Relevant based on category and profile metadata.",
              partner.description ? `Description fit: ${partner.description.slice(0, 140)}` : `Category fit: ${partner.categories}`,
              partner.satisfactionScore != null ? `Satisfaction score: ${partner.satisfactionScore}/100` : "No satisfaction score available.",
            ],
          }
        })
        .filter((match) => match.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      return {
        need,
        extractedKeywords: keywords,
        recommendations: matches,
      }
    } catch (error) {
      return { error: `Failed to recommend partners: ${getErrorMessage(error)}` }
    }
  },
})

const createBarChart = tool({
  description: "Create a bar chart visualization. Use for comparing values across categories.",
  inputSchema: z.object({
    data: z.array(
      z.object({
        xAxisLabel: z.string(),
        series: z.array(
          z.object({
            seriesName: z.string(),
            value: z.number(),
          })
        ),
      })
    ),
    title: z.string(),
    description: z.string().optional(),
    yAxisLabel: z.string().optional(),
  }),
  execute: async (args) => args,
})

const createLineChart = tool({
  description: "Create a line chart visualization. Use for trends over time or sequential comparisons.",
  inputSchema: z.object({
    data: z.array(
      z.object({
        xAxisLabel: z.string(),
        series: z.array(
          z.object({
            seriesName: z.string(),
            value: z.number(),
          })
        ),
      })
    ),
    title: z.string(),
    description: z.string().optional(),
    yAxisLabel: z.string().optional(),
  }),
  execute: async (args) => args,
})

const createPieChart = tool({
  description: "Create a pie chart visualization. Use for proportions or distribution shares.",
  inputSchema: z.object({
    data: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
      })
    ),
    title: z.string(),
    description: z.string().optional(),
  }),
  execute: async (args) => args,
})

const createTable = tool({
  description: "Create an interactive table with sorting, filtering, and search. Use for displaying detailed data.",
  inputSchema: z.object({
    title: z.string(),
    description: z.string().optional(),
    columns: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        type: z.enum(["string", "number", "date", "boolean"]).optional().default("string"),
      })
    ),
    data: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))),
  }),
  execute: async (args) => args,
})

const summarizePartnerPortfolio = tool({
  description: "Summarize the live partner portfolio with counts, active statuses, and high-level commercial health indicators.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const rows = await db
        .select({
          category: partners.categories,
          total: sql<number>`count(*)`,
          active: sql<number>`count(*) filter (where ${partners.partnershipStatus} = 'actif')`,
          avgSatisfaction: sql<number>`coalesce(avg(${partners.satisfactionScore}), 0)`,
          totalRevenue: sql<number>`coalesce(sum(${partners.annualRevenueGenerated}), 0)`,
        })
        .from(partners)
        .groupBy(partners.categories)
        .orderBy(partners.categories)

      return { summary: rows }
    } catch (error) {
      return { error: `Failed to summarize portfolio: ${getErrorMessage(error)}` }
    }
  },
})

const getPartnerActivityTimeline = tool({
  description: "Return a recent activity timeline for a partner using events, meetings, status changes, and notifications.",
  inputSchema: z.object({
    partnerId: z.number().int().positive(),
    limit: z.number().int().min(1).max(50).optional().default(20),
  }),
  execute: async ({ partnerId, limit }) => {
    try {
      const [events, meetings, statuses, notifications] = await Promise.all([
        db.select().from(partnerEvents).where(eq(partnerEvents.partnerId, partnerId)).limit(limit),
        db.select().from(partnerMeetings).where(eq(partnerMeetings.partnerId, partnerId)).limit(limit),
        db.select().from(partnerStatusHistory).where(eq(partnerStatusHistory.partnerId, partnerId)).limit(limit),
        db.select().from(partnerNotifications).where(eq(partnerNotifications.partnerId, partnerId)).limit(limit),
      ])

      const timeline: Array<{ date: string | null; type: string; label: string; details: string | null }> = [
        ...events.map((event) => ({
          date: event.eventDate,
          type: "event",
          label: event.eventName,
          details: event.eventType,
        })),
        ...meetings.map((meeting) => ({
          date: meeting.meetingDate instanceof Date ? meeting.meetingDate.toISOString() : null,
          type: "meeting",
          label: meeting.title,
          details: meeting.meetingType,
        })),
        ...statuses.map((status) => ({
          date: status.changedAt instanceof Date ? status.changedAt.toISOString() : null,
          type: "status_change",
          label: `${status.oldStatus ?? "unknown"} → ${status.newStatus}`,
          details: status.changeReason,
        })),
        ...notifications.map((notification) => ({
          date: notification.createdAt instanceof Date ? notification.createdAt.toISOString() : null,
          type: "notification",
          label: notification.title,
          details: notification.type,
        })),
      ]
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
        .slice(0, limit)

      return { partnerId, timeline }
    } catch (error) {
      return { error: `Failed to fetch activity timeline: ${getErrorMessage(error)}` }
    }
  },
})

const getCategoryBenchmarks = tool({
  description: "Calculate category benchmarks for satisfaction, budget, revenue, event volume, and interaction levels using live operational data.",
  inputSchema: z.object({
    category: partnerCategoryEnum.optional(),
  }),
  execute: async ({ category }) => {
    try {
      const conditions = category ? [eq(partners.categories, category)] : []

      const benchmarks = await db
        .select({
          category: partners.categories,
          avgSatisfaction: sql<number>`coalesce(avg(${partners.satisfactionScore}), 0)`,
          avgBudget: sql<number>`coalesce(avg(${partners.annualBudgetTnd}), 0)`,
          avgRevenue: sql<number>`coalesce(avg(${partners.annualRevenueGenerated}), 0)`,
          totalPartners: sql<number>`count(*)`,
        })
        .from(partners)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(partners.categories)
        .orderBy(partners.categories)

      return { benchmarks }
    } catch (error) {
      return { error: `Failed to calculate category benchmarks: ${getErrorMessage(error)}` }
    }
  },
})

async function buildPartnerOverviewReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [categoryRows, statusRows, topRevenueRows, offerSummary, eventSummary, topSatisfactionRows] = await Promise.all([
    db
      .select({
        category: partners.categories,
        partnerCount: sql<number>`count(*)`,
        activeCount: sql<number>`count(*) filter (where ${partners.partnershipStatus} = 'actif')`,
        avgSatisfaction: sql<number>`coalesce(avg(${partners.satisfactionScore}), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${partners.annualRevenueGenerated}), 0)`,
        totalBudget: sql<number>`coalesce(sum(${partners.annualBudgetTnd}), 0)`,
      })
      .from(partners)
      .groupBy(partners.categories)
      .orderBy(partners.categories),
    db
      .select({
        status: partners.partnershipStatus,
        count: sql<number>`count(*)`,
      })
      .from(partners)
      .groupBy(partners.partnershipStatus)
      .orderBy(desc(sql<number>`count(*)`)),
    db
      .select({
        name: partners.name,
        category: partners.categories,
        partnershipLevel: partners.partnershipLevel,
        revenue: partners.annualRevenueGenerated,
        satisfaction: partners.satisfactionScore,
      })
      .from(partners)
      .orderBy(desc(partners.annualRevenueGenerated), desc(partners.satisfactionScore), partners.name)
      .limit(8),
    db
      .select({
        totalOffers: sql<number>`count(*)`,
        activeOffers: sql<number>`count(*) filter (where ${offers.isActive} = true)`,
        usageCount: sql<number>`coalesce(sum(${offers.usageCount}), 0)`,
        totalValue: sql<number>`coalesce(sum(${offers.totalValueTnd}), 0)`,
      })
      .from(offers),
    db
      .select({
        totalEvents: sql<number>`count(*)`,
        totalParticipants: sql<number>`coalesce(sum(${partnerEvents.numParticipants}), 0)`,
        totalLeads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        totalConversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
        totalBudget: sql<number>`coalesce(sum(${partnerEvents.eventBudget}), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${partnerEvents.satisfactionScore}), 0)`,
      })
      .from(partnerEvents),
    db
      .select({
        name: partners.name,
        category: partners.categories,
        satisfaction: partners.satisfactionScore,
        status: partners.partnershipStatus,
      })
      .from(partners)
      .orderBy(desc(partners.satisfactionScore), partners.name)
      .limit(5),
  ])

  const totalPartners = categoryRows.reduce((sum, row) => sum + normalizeAmount(row.partnerCount), 0)
  const activePartners = categoryRows.reduce((sum, row) => sum + normalizeAmount(row.activeCount), 0)
  const totalRevenue = categoryRows.reduce((sum, row) => sum + normalizeAmount(row.totalRevenue), 0)
  const totalBudget = categoryRows.reduce((sum, row) => sum + normalizeAmount(row.totalBudget), 0)
  const weightedSatisfaction = categoryRows.reduce(
    (sum, row) => sum + normalizeAmount(row.avgSatisfaction) * normalizeAmount(row.partnerCount),
    0
  )
  const portfolioSatisfaction = totalPartners > 0 ? weightedSatisfaction / totalPartners : 0
  const highestRevenueCategory = [...categoryRows].sort(
    (left, right) => normalizeAmount(right.totalRevenue) - normalizeAmount(left.totalRevenue)
  )[0]
  const largestCategory = [...categoryRows].sort(
    (left, right) => normalizeAmount(right.partnerCount) - normalizeAmount(left.partnerCount)
  )[0]
  const healthiestStatus = [...statusRows].sort((left, right) => normalizeAmount(right.count) - normalizeAmount(left.count))[0]

  let markdown = reportPreamble(title || "Partner Overview Report", "partner-overview", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `The current partnership portfolio covers **${formatInteger(totalPartners)} active records across four strategic categories**, creating a diversified base of universities, customers, marketing allies, and supplier relationships. ${formatInteger(activePartners)} partners are currently marked as active, which means roughly ${formatPercent(totalPartners > 0 ? (activePartners / totalPartners) * 100 : 0)} of the portfolio is in an operational state rather than negotiation, suspension, or transition. That active ratio matters because it shows the platform is not only accumulating names; it is sustaining relationships that can produce revenue, events, talent, or market access.\n\n`
  markdown += `Commercially, the portfolio currently points to **${formatCurrency(totalRevenue)} in declared partner-attributed annual revenue** and **${formatCurrency(totalBudget)} in combined annual budget capacity**. The strongest revenue concentration appears in **${sentenceCase(highestRevenueCategory?.category)}**, while the largest footprint by number of partnerships sits in **${sentenceCase(largestCategory?.category)}**. This mix indicates the business is not equally monetized across categories: some segments are broad but lighter in direct revenue, while others are smaller but more commercially dense. That distinction should guide where account leadership invests relationship-management time.\n\n`
  markdown += `Operationally, the ecosystem also shows meaningful engagement depth beyond static partner records. The platform contains **${formatInteger(eventSummary[0]?.totalEvents)} tracked partnership events**, **${formatInteger(offerSummary[0]?.totalOffers)} commercial offers**, and **${formatInteger(eventSummary[0]?.totalParticipants)} total event participants**. Event activity has already generated **${formatInteger(eventSummary[0]?.totalLeads)} leads** and **${formatInteger(eventSummary[0]?.totalConversions)} conversions**, while the mean portfolio satisfaction score is approximately **${formatDecimal(portfolioSatisfaction)} / 100**. Taken together, the data suggests the portfolio is not dormant; it is functioning as a relationship engine with measurable pipeline, brand, and talent outcomes.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Total partners", formatInteger(totalPartners)],
      ["Active partners", formatInteger(activePartners)],
      ["Portfolio satisfaction", `${formatDecimal(portfolioSatisfaction)} / 100`],
      ["Annual revenue generated", formatCurrency(totalRevenue)],
      ["Annual partner budgets", formatCurrency(totalBudget)],
      ["Tracked offers", formatInteger(offerSummary[0]?.totalOffers)],
      ["Active offers", formatInteger(offerSummary[0]?.activeOffers)],
      ["Tracked events", formatInteger(eventSummary[0]?.totalEvents)],
      ["Event leads / conversions", `${formatInteger(eventSummary[0]?.totalLeads)} / ${formatInteger(eventSummary[0]?.totalConversions)}`],
      ["Most represented status", sentenceCase(healthiestStatus?.status)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Category Breakdown\n\n"
  markdown += markdownTable(
    ["Category", "Partners", "Active", "Avg Satisfaction", "Revenue", "Budget"],
    categoryRows.map((row) => [
      sentenceCase(row.category),
      formatInteger(row.partnerCount),
      formatInteger(row.activeCount),
      formatDecimal(row.avgSatisfaction),
      formatCurrency(row.totalRevenue),
      formatCurrency(row.totalBudget),
    ])
  )
  markdown += "\n\n"
  markdown += `This breakdown shows where relationship density and economic weight diverge. A category can have a large number of partners but still underperform commercially if satisfaction is middling, offer usage is low, or event conversion is weak. In contrast, smaller categories with strong satisfaction and revenue may deserve greater executive sponsorship because each additional improvement there yields a disproportionate financial impact. The current portfolio therefore benefits from being managed as a segmented system rather than a flat partner list.\n\n`

  markdown += "## Commercial Leaders\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "Level", "Revenue", "Satisfaction"],
    topRevenueRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      sentenceCase(row.partnershipLevel),
      formatCurrency(row.revenue),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `The top revenue list highlights the partners that are already carrying the largest share of commercial output. These organizations should be treated as strategic accounts with proactive governance, not just periodic follow-up. Revenue concentration is healthy when it is backed by strong satisfaction and stable status, but it becomes a vulnerability when a few accounts contribute most of the value while showing softer sentiment or weaker engagement. The portfolio should therefore monitor not only which partners generate the most revenue, but also whether those same partners are receiving enough executive attention, offer renewal planning, and relationship maintenance.\n\n`

  markdown += "## Relationship Quality Signals\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "Status", "Satisfaction"],
    topSatisfactionRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      sentenceCase(row.status),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `High-satisfaction partners create more than goodwill. They tend to renew faster, accept broader collaboration, and generate stronger advocacy in the market. The presence of clear satisfaction leaders suggests Capgemini already has repeatable practices worth scaling: responsive governance, clearer joint planning, better event execution, or more targeted offers. The important next step is to translate those practices from isolated successes into a standard operating model for portfolio management. If the best-performing relationships remain exceptions, portfolio quality will stay uneven.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Protect the revenue core.** Launch quarterly executive reviews for the highest-revenue partners so commercial performance is matched with retention discipline and cross-sell planning.\n`
  markdown += `2. **Segment by value and maturity.** Use category-level signals to separate broad-network partners from high-yield strategic accounts, then assign different cadences, KPIs, and engagement motions.\n`
  markdown += `3. **Convert activity into pipeline.** Review offers and events together to determine where partner engagement is high but monetization remains low, especially where leads are generated without corresponding conversions.\n`
  markdown += `4. **Scale satisfaction playbooks.** Document the operating habits behind the highest-satisfaction partnerships and apply them to lower-performing accounts in the same category.\n`
  markdown += `5. **Track portfolio balance monthly.** Monitor partner count, active rate, revenue concentration, and satisfaction as one leadership dashboard so growth does not come at the expense of relationship quality.\n`

  return {
    title: title || "Partner Overview Report",
    markdown,
    topic: "partner-overview",
    generatedAt: generatedAt.toISOString(),
  }
}

async function buildUniversityPartnershipsReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [universitySummary, universityLeaders, specializationRows, recruitmentTypeRows] = await Promise.all([
    db
      .select({
        totalUniversities: sql<number>`count(*)`,
        frameworkAgreements: sql<number>`count(*) filter (where ${universityPartners.hasFrameworkAgreement} = true)`,
        totalStudents: sql<number>`coalesce(sum(${universityPartners.numStudents}), 0)`,
        totalInternsPerYear: sql<number>`coalesce(sum(${universityPartners.numInternsPerYear}), 0)`,
        totalHiresPerYear: sql<number>`coalesce(sum(${universityPartners.numHiresPerYear}), 0)`,
        avgConversionToCdi: sql<number>`coalesce(avg(${universityPartners.conversionRateToCdi}), 0)`,
        avgSponsorshipBudget: sql<number>`coalesce(avg(${universityPartners.annualSponsorshipBudget}), 0)`,
        avgEventsPerYear: sql<number>`coalesce(avg(${universityPartners.numEventsPerYear}), 0)`,
      })
      .from(universityPartners),
    db
      .select({
        partnerName: partners.name,
        institutionType: universityPartners.institutionType,
        specialties: universityPartners.specialties,
        hiresPerYear: universityPartners.numHiresPerYear,
        conversionRate: universityPartners.conversionRateToCdi,
        sponsorshipBudget: universityPartners.annualSponsorshipBudget,
        recruitmentCount: sql<number>`count(${studentRecruitments.id})`,
        cdiCount: sql<number>`count(${studentRecruitments.id}) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(universityPartners)
      .innerJoin(partners, eq(partners.id, universityPartners.partnerId))
      .leftJoin(studentRecruitments, eq(studentRecruitments.universityPartnerId, universityPartners.partnerId))
      .groupBy(
        partners.name,
        universityPartners.partnerId,
        universityPartners.institutionType,
        universityPartners.specialties,
        universityPartners.numHiresPerYear,
        universityPartners.conversionRateToCdi,
        universityPartners.annualSponsorshipBudget
      )
      .orderBy(desc(sql<number>`count(${studentRecruitments.id}) filter (where ${studentRecruitments.convertedToCdi} = true)`), desc(sql<number>`count(${studentRecruitments.id})`), partners.name)
      .limit(8),
    db
      .select({
        specialization: studentRecruitments.specialization,
        count: sql<number>`count(*)`,
        cdiCount: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.specialization)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.specialization)
      .limit(8),
    db
      .select({
        recruitmentType: studentRecruitments.recruitmentType,
        count: sql<number>`count(*)`,
        cdiCount: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.recruitmentType)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.recruitmentType),
  ])

  const summary = universitySummary[0]
  const totalRecruitments = universityLeaders.reduce((sum, row) => sum + normalizeAmount(row.recruitmentCount), 0)
  const totalCdiConversions = universityLeaders.reduce((sum, row) => sum + normalizeAmount(row.cdiCount), 0)
  const leadingUniversity = universityLeaders[0]
  const dominantSpecialties = toWordList(
    specializationRows.slice(0, 3).map((row) => row.specialization ?? "Undeclared specialization")
  )

  let markdown = reportPreamble(title || "University Partnerships Report", "university-partnerships", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `Capgemini's university ecosystem currently includes **${formatInteger(summary?.totalUniversities)} academic partners**, with **${formatInteger(summary?.frameworkAgreements)} framework agreements** already formalized. These relationships represent access to approximately **${formatInteger(summary?.totalStudents)} students**, a recurring annual potential of **${formatInteger(summary?.totalInternsPerYear)} internships**, and **${formatInteger(summary?.totalHiresPerYear)} planned hires per year** based on partner-level declarations. The average conversion expectation to CDI sits at **${formatPercent(summary?.avgConversionToCdi)}**, which indicates that the university channel is not only a branding lever but a direct workforce pipeline.\n\n`
  markdown += `The operational recruitment dataset confirms that the channel is active rather than theoretical. The top tracked universities alone account for **${formatInteger(totalRecruitments)} recruitment records** and **${formatInteger(totalCdiConversions)} CDI conversions**, while average satisfaction and performance remain high enough to justify continued investment. This matters because university partnerships can easily become ceremonial if they are measured only by event presence or signed agreements. In this case, the platform data shows concrete movement from campus engagement to recruitment output.\n\n`
  markdown += `Thematically, the strongest recruiting demand is concentrated around **${dominantSpecialties}**, which gives the business a practical signal on where campus alignment is strongest today. This can inform event design, ambassador programs, internship capacity planning, and manager allocation. The presence of a clear university leader — currently **${leadingUniversity?.partnerName ?? "N/A"}** by tracked recruitment contribution — also creates a benchmark for what a mature academic partnership should look like in terms of conversion discipline, quality monitoring, and sponsorship return.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["University partners", formatInteger(summary?.totalUniversities)],
      ["Framework agreements", formatInteger(summary?.frameworkAgreements)],
      ["Student population reached", formatInteger(summary?.totalStudents)],
      ["Intern capacity per year", formatInteger(summary?.totalInternsPerYear)],
      ["Hire capacity per year", formatInteger(summary?.totalHiresPerYear)],
      ["Average CDI conversion target", formatPercent(summary?.avgConversionToCdi)],
      ["Average sponsorship budget", formatCurrency(summary?.avgSponsorshipBudget)],
      ["Average events per year", formatDecimal(summary?.avgEventsPerYear)],
      ["Tracked recruitments", formatInteger(totalRecruitments)],
      ["Tracked CDI conversions", formatInteger(totalCdiConversions)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Leading University Partners\n\n"
  markdown += markdownTable(
    ["University", "Institution Type", "Recruitments", "CDI", "Avg Performance", "Avg Satisfaction", "Conversion"],
    universityLeaders.map((row) => [
      row.partnerName,
      sentenceCase(row.institutionType),
      formatInteger(row.recruitmentCount),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
      formatPercent(row.conversionRate),
    ])
  )
  markdown += "\n\n"
  markdown += `The leading-university table shows where partnership maturity is already translating into measurable talent outcomes. Strong universities are not only those with a large student body; they are the ones where Capgemini is able to move candidates through placements, track performance, and convert the best profiles into longer-term contracts. The more balanced the mix between recruitment volume, CDI conversion, and satisfaction, the healthier the partnership. High volume without quality creates management overhead, while high quality without scale suggests untapped potential.\n\n`

  markdown += "## Talent Demand Patterns\n\n"
  markdown += markdownTable(
    ["Specialization", "Recruitments", "CDI", "Avg Performance"],
    specializationRows.map((row) => [
      row.specialization ?? "Undeclared",
      formatInteger(row.count),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
    ])
  )
  markdown += "\n\n"
  markdown += markdownTable(
    ["Recruitment Type", "Volume", "CDI", "Avg Satisfaction"],
    recruitmentTypeRows.map((row) => [
      sentenceCase(row.recruitmentType),
      formatInteger(row.count),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `These demand patterns are especially useful for planning the next academic cycle. If the platform is repeatedly converting the same specializations and recruitment types, Capgemini should formalize that signal into shared calendars with partner universities, focused employer-branding content, and manager-level workforce forecasts. Conversely, specializations with low conversion or weak performance may need better selection criteria, revised internship design, or tighter coordination between HR and technical teams. The value of this report is therefore not only descriptive; it indicates where the academic funnel is aligned and where it still leaks.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Deepen the top academic accounts.** Treat the best-performing universities as strategic talent pipelines with quarterly reviews, shared hiring plans, and earlier internship demand signals.\n`
  markdown += `2. **Use specialties to shape go-to-campus activity.** Align events, workshops, and ambassador programs around the specializations already producing the strongest conversion and performance outcomes.\n`
  markdown += `3. **Expand framework coverage selectively.** Universities without formal agreements but with visible recruitment contribution should be prioritized for structured partnership terms.\n`
  markdown += `4. **Track quality alongside volume.** Keep performance, satisfaction, and CDI conversion on the same scorecard so academic partnerships are measured by talent quality, not only student reach.\n`
  markdown += `5. **Link sponsorship to outcomes.** Compare sponsorship budgets with placement and conversion results to ensure campus investment is concentrated where Capgemini sees the strongest hiring return.\n`

  return {
    title: title || "University Partnerships Report",
    markdown,
    topic: "university-partnerships",
    generatedAt: generatedAt.toISOString(),
  }
}

async function buildRevenueAnalysisReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [categoryRevenueRows, topRevenueRows, offerSummary, eventRevenueSummary, vendorProjectSummary, dwTopRevenue] = await Promise.all([
    db
      .select({
        category: partners.categories,
        partnerCount: sql<number>`count(*)`,
        totalRevenue: sql<number>`coalesce(sum(${partners.annualRevenueGenerated}), 0)`,
        avgRevenue: sql<number>`coalesce(avg(${partners.annualRevenueGenerated}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${partners.satisfactionScore}), 0)`,
      })
      .from(partners)
      .groupBy(partners.categories)
      .orderBy(desc(sql<number>`coalesce(sum(${partners.annualRevenueGenerated}), 0)`)),
    db
      .select({
        name: partners.name,
        category: partners.categories,
        revenue: partners.annualRevenueGenerated,
        budget: partners.annualBudgetTnd,
        satisfaction: partners.satisfactionScore,
      })
      .from(partners)
      .orderBy(desc(partners.annualRevenueGenerated), desc(partners.satisfactionScore), partners.name)
      .limit(10),
    db
      .select({
        totalOffers: sql<number>`count(*)`,
        activeOffers: sql<number>`count(*) filter (where ${offers.isActive} = true)`,
        totalOfferValue: sql<number>`coalesce(sum(${offers.totalValueTnd}), 0)`,
        avgOfferValue: sql<number>`coalesce(avg(${offers.totalValueTnd}), 0)`,
        totalUsage: sql<number>`coalesce(sum(${offers.usageCount}), 0)`,
      })
      .from(offers),
    db
      .select({
        totalEventRevenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        totalEventBudget: sql<number>`coalesce(sum(${partnerEvents.eventBudget}), 0)`,
        avgRoi: sql<number>`coalesce(avg(${partnerEvents.roiEvent}), 0)`,
        totalLeads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        totalConversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
      })
      .from(partnerEvents),
    db
      .select({
        totalProjects: sql<number>`count(*)`,
        totalProjectValue: sql<number>`coalesce(sum(${vendorProjects.projectValue}), 0)`,
        totalCommission: sql<number>`coalesce(sum(${vendorProjects.commissionEarned}), 0)`,
        avgClientSatisfaction: sql<number>`coalesce(avg(${vendorProjects.clientSatisfactionScore}), 0)`,
      })
      .from(vendorProjects),
    dwPool.query(`SELECT dp.name, dp.partner_category, fpa.annual_revenue_generated, fpa.satisfaction_score
      FROM fact_partner_activity fpa
      JOIN dim_partner dp ON dp.partner_key = fpa.partner_key
      WHERE fpa.annual_revenue_generated IS NOT NULL
      ORDER BY fpa.annual_revenue_generated DESC
      LIMIT 5`),
  ])

  const totalRevenue = categoryRevenueRows.reduce((sum, row) => sum + normalizeAmount(row.totalRevenue), 0)
  const topThreeRevenue = topRevenueRows.slice(0, 3).reduce((sum, row) => sum + normalizeAmount(row.revenue), 0)
  const topThreeShare = totalRevenue > 0 ? (topThreeRevenue / totalRevenue) * 100 : 0
  const largestRevenueCategory = categoryRevenueRows[0]

  let markdown = reportPreamble(title || "Revenue Analysis Report", "revenue-analysis", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `The current partnership portfolio reports **${formatCurrency(totalRevenue)} in annual revenue contribution** across all tracked partner categories. Revenue is not evenly distributed: the leading category is **${sentenceCase(largestRevenueCategory?.category)}**, and the top three partner accounts alone represent **${formatPercent(topThreeShare)}** of the total revenue base. This degree of concentration is commercially efficient when those relationships are healthy, but it also creates exposure if leadership attention, contract renewal planning, or satisfaction monitoring are weaker than the revenue profile warrants.\n\n`
  markdown += `The revenue engine is also supported by multiple monetization layers beyond direct partner revenue declarations. The platform tracks **${formatInteger(offerSummary[0]?.totalOffers)} offers** worth **${formatCurrency(offerSummary[0]?.totalOfferValue)}**, partnership events that have already produced **${formatCurrency(eventRevenueSummary[0]?.totalEventRevenue)}** in revenue against **${formatCurrency(eventRevenueSummary[0]?.totalEventBudget)}** in budget, and **${formatInteger(vendorProjectSummary[0]?.totalProjects)} vendor projects** representing **${formatCurrency(vendorProjectSummary[0]?.totalProjectValue)}** in project value. This means the partnership portfolio should be interpreted as a blended commercial system combining direct account contribution, campaign-style offer monetization, event activation, and delivery-side project economics.\n\n`
  markdown += `From a leadership perspective, the most important question is not simply where revenue exists today, but whether the pipeline is balanced enough for tomorrow. Healthy revenue growth requires three things at the same time: a protected top-account base, a mid-tier of scalable partners, and a clear operating mechanism for converting activity into future value. The current data suggests there is a strong top layer already in place, but also a case for stronger monetization discipline in events, offers, and vendor delivery relationships so the revenue model is more diversified.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Total annual partner revenue", formatCurrency(totalRevenue)],
      ["Top-three revenue share", formatPercent(topThreeShare)],
      ["Offers tracked / active", `${formatInteger(offerSummary[0]?.totalOffers)} / ${formatInteger(offerSummary[0]?.activeOffers)}`],
      ["Offer value", formatCurrency(offerSummary[0]?.totalOfferValue)],
      ["Offer usage count", formatInteger(offerSummary[0]?.totalUsage)],
      ["Event revenue", formatCurrency(eventRevenueSummary[0]?.totalEventRevenue)],
      ["Event budget", formatCurrency(eventRevenueSummary[0]?.totalEventBudget)],
      ["Average event ROI", formatDecimal(eventRevenueSummary[0]?.avgRoi, 2)],
      ["Vendor project value", formatCurrency(vendorProjectSummary[0]?.totalProjectValue)],
      ["Vendor commission earned", formatCurrency(vendorProjectSummary[0]?.totalCommission)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Revenue by Category\n\n"
  markdown += markdownTable(
    ["Category", "Partners", "Total Revenue", "Average Revenue", "Avg Satisfaction"],
    categoryRevenueRows.map((row) => [
      sentenceCase(row.category),
      formatInteger(row.partnerCount),
      formatCurrency(row.totalRevenue),
      formatCurrency(row.avgRevenue),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `This category view makes it easier to distinguish between scale and efficiency. Categories with high total revenue but lower average satisfaction may be commercially important but operationally fragile. Categories with smaller totals but stronger satisfaction can represent expansion opportunities if the account team builds more offers, events, or project motions around them. The right management action therefore depends on whether the category problem is concentration, under-penetration, or relationship quality.\n\n`

  markdown += "## Top Revenue Accounts\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "Revenue", "Budget", "Satisfaction"],
    topRevenueRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      formatCurrency(row.revenue),
      formatCurrency(row.budget),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `The top revenue accounts should be managed as a defended growth zone. In practical terms, that means clear executive sponsorship, visible renewal milestones, and deliberate cross-sell planning. Revenue-rich accounts with strong satisfaction are the best place to expand wallet share. Revenue-rich accounts with weaker satisfaction are a warning sign: the current numbers may still look good, but future revenue could be at risk if operational issues, delayed follow-up, or reduced engagement are left unresolved.\n\n`

  markdown += "## Data Warehouse Validation Snapshot\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "DW Revenue", "DW Satisfaction"],
    dwTopRevenue.rows.map((row) => [
      String(row.name ?? "N/A"),
      sentenceCase(typeof row.partner_category === "string" ? row.partner_category : null),
      formatCurrency(typeof row.annual_revenue_generated === "number" ? row.annual_revenue_generated : String(row.annual_revenue_generated ?? 0)),
      formatDecimal(typeof row.satisfaction_score === "number" ? row.satisfaction_score : String(row.satisfaction_score ?? 0)),
    ])
  )
  markdown += "\n\n"
  markdown += `The data warehouse snapshot serves as a secondary signal that the highest-value accounts are also visible in the BI model, which is important for cross-checking planning assumptions. Alignment between the operational database and BI revenue rankings increases trust in strategic reporting. When the same partners dominate both views, leadership can use them confidently for planning, while any divergence should trigger a data quality review or a deeper look at timing differences between operational updates and warehouse refreshes.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Reduce concentration risk.** Put quarterly retention and expansion plans in place for the top revenue accounts, especially where satisfaction is not proportionate to commercial contribution.\n`
  markdown += `2. **Scale the middle tier.** Identify medium-revenue partners with strong satisfaction and use offers, events, and account planning to move them into the top-commercial cohort.\n`
  markdown += `3. **Treat events and offers as monetization channels.** Review low-ROI activities and reallocate budget toward programs that generate measurable conversions and revenue.\n`
  markdown += `4. **Link delivery and revenue reporting.** Use vendor project value, commission, and satisfaction together to evaluate which supplier relationships deserve deeper strategic investment.\n`
  markdown += `5. **Institutionalize revenue reviews.** Combine operational and warehouse signals monthly so revenue, satisfaction, and concentration can be managed as one leadership conversation.\n`

  return {
    title: title || "Revenue Analysis Report",
    markdown,
    topic: "revenue-analysis",
    generatedAt: generatedAt.toISOString(),
  }
}

type ChurnRiskProfile = {
  partnerId: number
  partnerName: string
  category: string | null
  overallRisk: number
  riskLevel: "high" | "medium" | "low"
  daysSinceLastInteraction: number
  latestSatisfaction: number
  satisfactionDrop: number
  concerningStatusChanges: number
  recentInteractions: number
}

async function buildChurnRiskReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [partnerRows, eventRows, meetingRows, statusRows, kpiRows] = await Promise.all([
    db.select().from(partners).orderBy(partners.name),
    db
      .select({
        partnerId: partnerEvents.partnerId,
        eventDate: partnerEvents.eventDate,
      })
      .from(partnerEvents)
      .orderBy(desc(partnerEvents.eventDate)),
    db
      .select({
        partnerId: partnerMeetings.partnerId,
        meetingDate: partnerMeetings.meetingDate,
      })
      .from(partnerMeetings)
      .orderBy(desc(partnerMeetings.meetingDate)),
    db
      .select({
        partnerId: partnerStatusHistory.partnerId,
        newStatus: partnerStatusHistory.newStatus,
        changedAt: partnerStatusHistory.changedAt,
      })
      .from(partnerStatusHistory)
      .orderBy(desc(partnerStatusHistory.changedAt)),
    db
      .select({
        partnerId: partnerKpis.partnerId,
        avgSatisfactionScore: partnerKpis.avgSatisfactionScore,
        totalInteractions: partnerKpis.totalInteractions,
        year: partnerKpis.year,
        quarter: partnerKpis.quarter,
        month: partnerKpis.month,
      })
      .from(partnerKpis)
      .orderBy(desc(partnerKpis.year), desc(partnerKpis.quarter), desc(partnerKpis.month)),
  ])

  const eventsByPartner = new Map<number, Array<(typeof eventRows)[number]>>()
  const meetingsByPartner = new Map<number, Array<(typeof meetingRows)[number]>>()
  const statusesByPartner = new Map<number, Array<(typeof statusRows)[number]>>()
  const kpisByPartner = new Map<number, Array<(typeof kpiRows)[number]>>()

  for (const row of eventRows) {
    const collection = eventsByPartner.get(row.partnerId) ?? []
    collection.push(row)
    eventsByPartner.set(row.partnerId, collection)
  }

  for (const row of meetingRows) {
    const collection = meetingsByPartner.get(row.partnerId) ?? []
    collection.push(row)
    meetingsByPartner.set(row.partnerId, collection)
  }

  for (const row of statusRows) {
    const collection = statusesByPartner.get(row.partnerId) ?? []
    collection.push(row)
    statusesByPartner.set(row.partnerId, collection)
  }

  for (const row of kpiRows) {
    const collection = kpisByPartner.get(row.partnerId) ?? []
    collection.push(row)
    kpisByPartner.set(row.partnerId, collection)
  }

  const riskProfiles: ChurnRiskProfile[] = partnerRows.map((partner) => {
    const partnerEventsRows = (eventsByPartner.get(partner.id) ?? []).slice(0, 8)
    const partnerMeetingsRows = (meetingsByPartner.get(partner.id) ?? []).slice(0, 8)
    const partnerStatusRows = (statusesByPartner.get(partner.id) ?? []).slice(0, 8)
    const partnerKpiRows = (kpisByPartner.get(partner.id) ?? []).slice(0, 4)

    const lastInteractionDays = [
      daysSince(partner.lastEventDate),
      daysSince(partnerEventsRows[0]?.eventDate),
      daysSince(partnerMeetingsRows[0]?.meetingDate),
    ]
      .filter((value): value is number => value !== null)
      .sort((left, right) => left - right)[0] ?? 999

    const latestSatisfaction = normalizeAmount(partnerKpiRows[0]?.avgSatisfactionScore ?? partner.satisfactionScore)
    const previousSatisfaction = normalizeAmount(partnerKpiRows[1]?.avgSatisfactionScore ?? latestSatisfaction)
    const satisfactionDrop = Math.max(0, previousSatisfaction - latestSatisfaction)
    const statusWarnings = partnerStatusRows.filter((row) =>
      ["suspendu", "en négociation", "inactive"].includes((row.newStatus ?? "").toLowerCase())
    ).length
    const interactionCount =
      partnerEventsRows.length +
      partnerMeetingsRows.length +
      normalizeAmount(partnerKpiRows[0]?.totalInteractions)

    const inactivityRisk = clampScore((lastInteractionDays / 180) * 100)
    const satisfactionRisk = clampScore(satisfactionDrop * 12 + Math.max(0, 70 - latestSatisfaction))
    const statusRisk = clampScore(statusWarnings * 25)
    const engagementRisk = clampScore(Math.max(0, 80 - interactionCount * 8))
    const overallRisk = clampScore(
      inactivityRisk * 0.35 + satisfactionRisk * 0.3 + statusRisk * 0.2 + engagementRisk * 0.15
    )

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      category: partner.categories,
      overallRisk,
      riskLevel: overallRisk >= 70 ? "high" : overallRisk >= 40 ? "medium" : "low",
      daysSinceLastInteraction: lastInteractionDays,
      latestSatisfaction,
      satisfactionDrop,
      concerningStatusChanges: statusWarnings,
      recentInteractions: interactionCount,
    }
  })

  const rankedProfiles = [...riskProfiles].sort((left, right) => right.overallRisk - left.overallRisk)
  const highRiskCount = rankedProfiles.filter((profile) => profile.riskLevel === "high").length
  const mediumRiskCount = rankedProfiles.filter((profile) => profile.riskLevel === "medium").length
  const lowRiskCount = rankedProfiles.filter((profile) => profile.riskLevel === "low").length
  const averageRisk = rankedProfiles.length > 0 ? rankedProfiles.reduce((sum, row) => sum + row.overallRisk, 0) / rankedProfiles.length : 0
  const topRiskPartners = rankedProfiles.slice(0, 10)
  const highRiskByCategory = Array.from(
    rankedProfiles
      .filter((profile) => profile.riskLevel === "high")
      .reduce((map, profile) => {
        const key = sentenceCase(profile.category)
        map.set(key, (map.get(key) ?? 0) + 1)
        return map
      }, new Map<string, number>())
  ).sort((left, right) => right[1] - left[1])

  let markdown = reportPreamble(title || "Churn Risk Report", "churn-risk", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `The partnership base currently contains **${formatInteger(rankedProfiles.length)} analyzed partners**, with **${formatInteger(highRiskCount)} high-risk relationships**, **${formatInteger(mediumRiskCount)} medium-risk relationships**, and **${formatInteger(lowRiskCount)} low-risk relationships** according to interaction recency, satisfaction trend, status volatility, and engagement depth. The average portfolio risk score is **${formatDecimal(averageRisk)} / 100**, which means the overall relationship landscape is manageable but not risk-free. The most urgent issue is not the number of partners in the database, but the subset of relationships showing simultaneous signs of inactivity and weakening sentiment.\n\n`
  markdown += `In practice, churn rarely happens because of one signal alone. It usually appears when multiple weak indicators stack together: long gaps since the last event or meeting, a visible drop in satisfaction, repeated status changes toward suspended or uncertain states, and a low cadence of recent interactions. The current data reflects exactly that pattern in the upper end of the risk ranking. This is a positive sign for the model because it highlights actionable relationship-management gaps rather than random statistical noise.\n\n`
  markdown += `The report should therefore be used as a leadership operating tool, not just an analytical snapshot. High-risk accounts need rapid intervention. Medium-risk accounts need structured re-engagement before they deteriorate further. Low-risk accounts should not be ignored either; they represent the stable base that can absorb growth initiatives, pilot offers, and cross-category collaboration. The objective is not merely to avoid churn, but to maintain a balanced portfolio where commercial expansion does not outpace relationship health.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Partners analyzed", formatInteger(rankedProfiles.length)],
      ["Average risk score", formatDecimal(averageRisk)],
      ["High-risk partners", formatInteger(highRiskCount)],
      ["Medium-risk partners", formatInteger(mediumRiskCount)],
      ["Low-risk partners", formatInteger(lowRiskCount)],
      ["Highest-risk partner", topRiskPartners[0]?.partnerName ?? "N/A"],
      ["Highest-risk category", highRiskByCategory[0]?.[0] ?? "N/A"],
    ]
  )
  markdown += "\n\n"

  markdown += "## Highest-Risk Partners\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "Risk", "Days Since Interaction", "Satisfaction", "Drop", "Status Warnings", "Interactions"],
    topRiskPartners.map((row) => [
      row.partnerName,
      sentenceCase(row.category),
      formatInteger(row.overallRisk),
      formatInteger(row.daysSinceLastInteraction),
      formatDecimal(row.latestSatisfaction),
      formatDecimal(row.satisfactionDrop),
      formatInteger(row.concerningStatusChanges),
      formatInteger(row.recentInteractions),
    ])
  )
  markdown += "\n\n"
  markdown += `The partners in this table require hands-on ownership rather than passive monitoring. Accounts with high risk and long inactivity windows should move to an immediate contact plan led by the business owner. Accounts with moderate inactivity but strong satisfaction decline may need service recovery rather than sales outreach. The real value of the ranking is that it helps distinguish which retention motion is appropriate: reactivation, escalation, executive sponsorship, or operational correction.\n\n`

  markdown += "## High-Risk Concentration by Category\n\n"
  markdown += markdownTable(
    ["Category", "High-Risk Partners"],
    highRiskByCategory.map(([category, count]) => [category, formatInteger(count)])
  )
  markdown += "\n\n"
  markdown += `Category concentration matters because churn is often systemic. If one category dominates the high-risk list, the issue may be structural: poor cadence, unclear ownership, weak service differentiation, or a category-specific value proposition that is no longer resonating. If risk is distributed evenly instead, the problem is more likely process-related across the entire portfolio. This category view therefore helps leadership decide whether to deploy targeted interventions or a broader relationship-governance reset.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Intervene within seven days for the top-risk cohort.** Assign owners and schedule executive or operational recovery touchpoints immediately for the highest-risk partners.\n`
  markdown += `2. **Separate inactivity from dissatisfaction.** Use the risk-driver pattern to decide whether each account needs re-engagement, service remediation, or commercial renegotiation.\n`
  markdown += `3. **Review unstable statuses in leadership meetings.** Repeated status degradation should trigger escalation because it often precedes churn before revenue visibly declines.\n`
  markdown += `4. **Create a medium-risk nurture cadence.** Monthly check-ins, lighter-touch events, or offer reviews can keep medium-risk accounts from sliding into the critical zone.\n`
  markdown += `5. **Embed churn review into portfolio governance.** Risk should be reviewed alongside revenue and satisfaction so account decisions are proactive rather than reactive.\n`

  return {
    title: title || "Churn Risk Report",
    markdown,
    topic: "churn-risk",
    generatedAt: generatedAt.toISOString(),
  }
}

async function buildRecruitmentPerformanceReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [summaryRows, universityRows, typeRows, teamRows, specializationRows] = await Promise.all([
    db
      .select({
        totalRecruitments: sql<number>`count(*)`,
        totalCdi: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
        avgDuration: sql<number>`coalesce(avg(${studentRecruitments.contractDurationMonths}), 0)`,
      })
      .from(studentRecruitments),
    db
      .select({
        partnerName: partners.name,
        recruitments: sql<number>`count(${studentRecruitments.id})`,
        cdiCount: sql<number>`count(${studentRecruitments.id}) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(studentRecruitments)
      .innerJoin(universityPartners, eq(universityPartners.partnerId, studentRecruitments.universityPartnerId))
      .innerJoin(partners, eq(partners.id, universityPartners.partnerId))
      .groupBy(partners.name, universityPartners.partnerId)
      .orderBy(desc(sql<number>`count(${studentRecruitments.id}) filter (where ${studentRecruitments.convertedToCdi} = true)`), desc(sql<number>`count(${studentRecruitments.id})`), partners.name)
      .limit(8),
    db
      .select({
        recruitmentType: studentRecruitments.recruitmentType,
        count: sql<number>`count(*)`,
        cdiCount: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.recruitmentType)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.recruitmentType),
    db
      .select({
        assignedTeam: studentRecruitments.assignedTeam,
        count: sql<number>`count(*)`,
        cdiCount: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.assignedTeam)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.assignedTeam)
      .limit(8),
    db
      .select({
        specialization: studentRecruitments.specialization,
        count: sql<number>`count(*)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.specialization)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.specialization)
      .limit(8),
  ])

  const summary = summaryRows[0]
  const conversionRate = normalizeAmount(summary?.totalRecruitments) > 0
    ? (normalizeAmount(summary?.totalCdi) / normalizeAmount(summary?.totalRecruitments)) * 100
    : 0

  let markdown = reportPreamble(title || "Recruitment Performance Report", "recruitment-performance", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `The recruitment pipeline sourced through university partnerships currently includes **${formatInteger(summary?.totalRecruitments)} tracked recruitment records**, of which **${formatInteger(summary?.totalCdi)} have converted to CDI**. That translates into an observed conversion rate of **${formatPercent(conversionRate)}**, supported by an average performance score of **${formatDecimal(summary?.avgPerformance)}** and average satisfaction of **${formatDecimal(summary?.avgSatisfaction)}**. These are strong signals that the recruitment funnel is producing not just volume, but a meaningful level of hiring quality and candidate experience.\n\n`
  markdown += `The next level of analysis is operational: which universities feed the best hires, which recruitment types convert most efficiently, and which teams absorb the largest share of incoming talent. That matters because recruitment performance can look positive in aggregate while still hiding avoidable inefficiencies. For example, some channels may generate many placements but weaker CDI conversion, while others create fewer hires but much stronger long-term fit. The best hiring strategy is therefore one that optimizes quality and retention, not only throughput.\n\n`
  markdown += `The dataset also provides a bridge between HR planning and partnership management. Because the source universities, assigned teams, specializations, and conversion outcomes are all visible, the platform can move beyond anecdotal campus preferences and toward evidence-based workforce sourcing. This is especially useful for prioritizing future events, internship quotas, manager preparation, and budget allocation for the academic pipeline.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Tracked recruitments", formatInteger(summary?.totalRecruitments)],
      ["CDI conversions", formatInteger(summary?.totalCdi)],
      ["Observed CDI conversion rate", formatPercent(conversionRate)],
      ["Average performance score", formatDecimal(summary?.avgPerformance)],
      ["Average satisfaction score", formatDecimal(summary?.avgSatisfaction)],
      ["Average contract duration (months)", formatDecimal(summary?.avgDuration)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Top Source Universities\n\n"
  markdown += markdownTable(
    ["University", "Recruitments", "CDI", "Avg Performance", "Avg Satisfaction"],
    universityRows.map((row) => [
      row.partnerName,
      formatInteger(row.recruitments),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `University performance should be read as a mix of scale and fit. A strong source university is one that consistently delivers candidates who perform well, integrate successfully into teams, and convert into long-term hires at an acceptable rate. Universities that generate volume without quality should be coached differently from universities that produce a smaller number of highly successful placements. This distinction helps HR teams focus their campus strategy and helps partnership managers justify deeper academic engagement where results are strongest.\n\n`

  markdown += "## Recruitment Mix\n\n"
  markdown += markdownTable(
    ["Recruitment Type", "Volume", "CDI", "Avg Performance", "Avg Satisfaction"],
    typeRows.map((row) => [
      sentenceCase(row.recruitmentType),
      formatInteger(row.count),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += markdownTable(
    ["Assigned Team", "Recruitments", "CDI"],
    teamRows.map((row) => [
      row.assignedTeam ?? "Unassigned",
      formatInteger(row.count),
      formatInteger(row.cdiCount),
    ])
  )
  markdown += "\n\n"
  markdown += `This mix view shows how the recruitment engine is being consumed internally. If a few teams receive most candidates, they may require stronger onboarding capacity, clearer mentoring structures, or better forecasting to preserve candidate experience. If certain recruitment types show lower CDI outcomes, HR may want to revisit the selection process, scope of assignments, or transition pathways from early-stage contract to permanent role. The operational lesson is that recruitment performance belongs jointly to sourcing quality and receiving-team readiness.\n\n`

  markdown += "## Skill Alignment\n\n"
  markdown += markdownTable(
    ["Specialization", "Volume", "Avg Performance", "Avg Satisfaction"],
    specializationRows.map((row) => [
      row.specialization ?? "Undeclared",
      formatInteger(row.count),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `Specialization patterns show where campus supply and Capgemini demand are best aligned. High-volume, high-performance specializations should receive more proactive campus programming and manager-level forecasting, because they already represent validated talent pools. Lower-performing specializations may need better screening, revised role matching, or a narrower target list of partner schools. This section is especially valuable for converting raw hiring data into targeted academic partnership strategy.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Prioritize quality-producing universities.** Increase engagement with institutions that combine strong recruitment volume, performance, and CDI conversion.\n`
  markdown += `2. **Tune the recruitment mix.** Review recruitment types with weaker long-term conversion and refine the pathway from internship or alternance to CDI.\n`
  markdown += `3. **Coordinate with hiring teams earlier.** Use team-level intake patterns to forecast manager demand and avoid last-minute placement friction.\n`
  markdown += `4. **Focus on validated skill pools.** Direct campus events, branding, and academic collaboration toward the specializations already showing strong performance outcomes.\n`
  markdown += `5. **Track recruitment performance monthly.** Keep conversion, satisfaction, and performance visible in the same dashboard so growth in volume does not reduce hiring quality.\n`

  return {
    title: title || "Recruitment Performance Report",
    markdown,
    topic: "recruitment-performance",
    generatedAt: generatedAt.toISOString(),
  }
}

async function buildEventImpactReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [eventSummaryRows, eventTypeRows, topEvents, categoryRows] = await Promise.all([
    db
      .select({
        totalEvents: sql<number>`count(*)`,
        totalParticipants: sql<number>`coalesce(sum(${partnerEvents.numParticipants}), 0)`,
        totalLeads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        totalConversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
        totalBudget: sql<number>`coalesce(sum(${partnerEvents.eventBudget}), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${partnerEvents.satisfactionScore}), 0)`,
        avgRoi: sql<number>`coalesce(avg(${partnerEvents.roiEvent}), 0)`,
      })
      .from(partnerEvents),
    db
      .select({
        eventType: partnerEvents.eventType,
        count: sql<number>`count(*)`,
        participants: sql<number>`coalesce(sum(${partnerEvents.numParticipants}), 0)`,
        leads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        conversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
        revenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        avgRoi: sql<number>`coalesce(avg(${partnerEvents.roiEvent}), 0)`,
      })
      .from(partnerEvents)
      .groupBy(partnerEvents.eventType)
      .orderBy(desc(sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`), partnerEvents.eventType),
    db
      .select({
        eventName: partnerEvents.eventName,
        partnerName: partners.name,
        eventType: partnerEvents.eventType,
        eventDate: partnerEvents.eventDate,
        participants: partnerEvents.numParticipants,
        leads: partnerEvents.numLeadsGenerated,
        conversions: partnerEvents.numConversions,
        revenue: partnerEvents.eventRevenue,
        roi: partnerEvents.roiEvent,
        satisfaction: partnerEvents.satisfactionScore,
      })
      .from(partnerEvents)
      .innerJoin(partners, eq(partners.id, partnerEvents.partnerId))
      .orderBy(desc(partnerEvents.eventRevenue), desc(partnerEvents.roiEvent), desc(partnerEvents.numConversions))
      .limit(8),
    db
      .select({
        category: partners.categories,
        eventCount: sql<number>`count(${partnerEvents.id})`,
        revenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        leads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        conversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
      })
      .from(partnerEvents)
      .innerJoin(partners, eq(partners.id, partnerEvents.partnerId))
      .groupBy(partners.categories)
      .orderBy(desc(sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`), partners.categories),
  ])

  const summary = eventSummaryRows[0]
  const conversionRate = normalizeAmount(summary?.totalLeads) > 0
    ? (normalizeAmount(summary?.totalConversions) / normalizeAmount(summary?.totalLeads)) * 100
    : 0
  const revenueToBudget = normalizeAmount(summary?.totalBudget) > 0
    ? (normalizeAmount(summary?.totalRevenue) / normalizeAmount(summary?.totalBudget)) * 100
    : 0

  let markdown = reportPreamble(title || "Event Impact Report", "event-impact", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `Partnership events remain one of the most visible activation channels in the portfolio. The platform currently records **${formatInteger(summary?.totalEvents)} events**, bringing together **${formatInteger(summary?.totalParticipants)} participants**, generating **${formatInteger(summary?.totalLeads)} leads**, and converting **${formatInteger(summary?.totalConversions)} of those leads** into downstream outcomes. Financially, the event layer represents **${formatCurrency(summary?.totalRevenue)} in event-linked revenue** against **${formatCurrency(summary?.totalBudget)} in event spend**, while participant satisfaction averages **${formatDecimal(summary?.avgSatisfaction)} / 100**.\n\n`
  markdown += `Those results indicate the event engine is doing more than brand visibility. It is contributing measurable pipeline and commercial value, with a lead-to-conversion rate of **${formatPercent(conversionRate)}** and a revenue-to-budget ratio of **${formatPercent(revenueToBudget)}**. That said, event programs should still be managed carefully: high attendance does not automatically mean high business impact, and attractive revenue totals can hide weak efficiency if ROI is inconsistent across event types or partner categories.\n\n`
  markdown += `The most useful leadership question is therefore: which event formats create the best combination of visibility, pipeline, and economics? The tables below answer that by breaking impact down by event type, by category, and by individual event leaders. This allows Capgemini to decide where to scale, where to redesign, and where to reduce spend if the commercial return is no longer compelling.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Tracked events", formatInteger(summary?.totalEvents)],
      ["Participants", formatInteger(summary?.totalParticipants)],
      ["Leads generated", formatInteger(summary?.totalLeads)],
      ["Conversions", formatInteger(summary?.totalConversions)],
      ["Lead-to-conversion rate", formatPercent(conversionRate)],
      ["Event budget", formatCurrency(summary?.totalBudget)],
      ["Event revenue", formatCurrency(summary?.totalRevenue)],
      ["Revenue-to-budget ratio", formatPercent(revenueToBudget)],
      ["Average event satisfaction", formatDecimal(summary?.avgSatisfaction)],
      ["Average event ROI", formatDecimal(summary?.avgRoi, 2)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Event Performance by Type\n\n"
  markdown += markdownTable(
    ["Event Type", "Events", "Participants", "Leads", "Conversions", "Revenue", "Avg ROI"],
    eventTypeRows.map((row) => [
      sentenceCase(row.eventType),
      formatInteger(row.count),
      formatInteger(row.participants),
      formatInteger(row.leads),
      formatInteger(row.conversions),
      formatCurrency(row.revenue),
      formatDecimal(row.avgRoi, 2),
    ])
  )
  markdown += "\n\n"
  markdown += `Different event types create different kinds of value. Some formats are better at awareness and participation, while others are better at lead capture or revenue creation. The practical implication is that event planning should use a portfolio approach: awareness-oriented events can still be justified, but they should not consume the same budget logic as conversion-oriented programs. The strongest event strategy is one that clearly distinguishes branding, demand generation, recruitment activation, and relationship maintenance.\n\n`

  markdown += "## Top Performing Events\n\n"
  markdown += markdownTable(
    ["Event", "Partner", "Type", "Date", "Leads", "Conversions", "Revenue", "ROI", "Satisfaction"],
    topEvents.map((row) => [
      row.eventName,
      row.partnerName,
      sentenceCase(row.eventType),
      formatReportDate(row.eventDate),
      formatInteger(row.leads),
      formatInteger(row.conversions),
      formatCurrency(row.revenue),
      formatDecimal(row.roi, 2),
      formatInteger(row.satisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `Top-performing events should be treated as repeatable operating models, not one-off successes. If a small set of events repeatedly combine strong conversion, revenue, and participant satisfaction, they should become templates for future planning. The underlying drivers may include partner fit, target audience clarity, event content quality, or better post-event follow-up. Replicating those mechanics is usually more valuable than simply increasing the total number of events.\n\n`

  markdown += "## Event Contribution by Partner Category\n\n"
  markdown += markdownTable(
    ["Category", "Events", "Revenue", "Leads", "Conversions"],
    categoryRows.map((row) => [
      sentenceCase(row.category),
      formatInteger(row.eventCount),
      formatCurrency(row.revenue),
      formatInteger(row.leads),
      formatInteger(row.conversions),
    ])
  )
  markdown += "\n\n"
  markdown += `Category-level event contribution shows whether the event engine is balanced or over-dependent on one partner segment. If one category dominates revenue while another dominates participation, Capgemini should decide intentionally whether that mix reflects strategy or simply historical habit. This distinction helps budget owners decide where to scale proven formats and where to redesign event models that are visible but commercially weak.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Double down on high-return formats.** Replicate the event structures that already combine revenue, conversions, and strong participant satisfaction.\n`
  markdown += `2. **Separate awareness KPIs from commercial KPIs.** Avoid judging brand-building events and revenue-driving events by the same success criteria.\n`
  markdown += `3. **Tighten post-event follow-up.** Events with strong lead generation but weaker conversion need better handoff into account, HR, or campaign workflows.\n`
  markdown += `4. **Review category allocation.** Compare event spend and outcomes by partner category to ensure resources align with strategic goals, not just historical calendars.\n`
  markdown += `5. **Institutionalize event ROI reviews.** Add monthly event-performance checkpoints so future budgets are guided by evidence instead of attendance alone.\n`

  return {
    title: title || "Event Impact Report",
    markdown,
    topic: "event-impact",
    generatedAt: generatedAt.toISOString(),
  }
}

const generateReport = tool({
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

const tools = {
  queryPartners,
  queryAnalytics,
  getPartnerDetails,
  scorePartner,
  predictChurn,
  recommendPartners,
  generateReport,
  createBarChart,
  createLineChart,
  createPieChart,
  createTable,
  summarizePartnerPortfolio,
  getPartnerActivityTimeline,
  getCategoryBenchmarks,
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  if (!process.env.OPENROUTER_KEY) {
    return NextResponse.json({ error: "OPENROUTER_KEY is not configured" }, { status: 500 })
  }

  try {
    const body = (await req.json()) as { messages?: UIMessage[] }
    const incomingMessages = body.messages ?? []

    if (incomingMessages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    const userId = Number(user.sub)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user identifier" }, { status: 400 })
    }

    const threadId = await ensureThreadForUser(userId, user.userType, incomingMessages)
    await persistIncomingMessages(threadId, incomingMessages)

    const uiMessages = incomingMessages.map((msg) => ({
      ...msg,
      parts: msg.parts ?? [{ type: "text" as const, text: (msg as unknown as { content?: string }).content || "" }],
    }))

    const modelMessages = await convertToModelMessages(uiMessages, { tools })

    const result = streamText({
      model: openrouter.chat(OPENROUTER_MODEL_ID),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
      stopWhen: ({ steps }) => steps.length >= 10,
      onError: async ({ error }) => {
        console.error("OpenRouter stream error:", formatOpenRouterError(error), error)
      },
      onFinish: async ({ response }) => {
        const responseMessages = response.messages.map((message) => ({
          role: message.role,
          content: extractResponseText(message.content),
          parts: Array.isArray(message.content) ? message.content : null,
        }))

        await persistAssistantResponse(threadId, responseMessages)
      },
    })

    return result.toUIMessageStreamResponse({
      onError: formatOpenRouterError,
    })
  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json(
      { error: formatOpenRouterError(error) },
      { status: getOpenRouterStatusCode(error) ?? 500 }
    )
  }
}
