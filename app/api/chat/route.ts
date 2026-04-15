import { convertToModelMessages, streamText, tool, type UIMessage } from "ai"
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

const tools = {
  queryPartners,
  queryAnalytics,
  getPartnerDetails,
  scorePartner,
  predictChurn,
  recommendPartners,
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
      model: openrouter.chat("nvidia/nemotron-3-super-120b-a12b:free"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
      stopWhen: ({ steps }) => steps.length >= 10,
      onFinish: async ({ response }) => {
        const responseMessages = response.messages.map((message) => ({
          role: message.role,
          content: extractResponseText(message.content),
          parts: Array.isArray(message.content) ? message.content : null,
        }))

        await persistAssistantResponse(threadId, responseMessages)
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
