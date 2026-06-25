import { tool } from "ai"
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm"
import { z } from "zod"

import { daysSince, clampScore, normalizeAmount } from "../format"
import { fetchPartnerDetailsBundle, partnerCategoryEnum } from "../partner-data"
import { getErrorMessage } from "../utils"
import { db } from "@/lib/server/db/config"
import { dwPool } from "@/lib/server/db/dw-config"
import {
  clientPartners,
  marketingPartners,
  partnerEvents,
  partnerKpis,
  partnerMeetings,
  partners,
  partnerStatusHistory,
  technologyPartners,
  universityPartners,
} from "@/lib/server/db/schema"

export const queryPartners = tool({
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

export const queryAnalytics = tool({
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

export const getPartnerDetails = tool({
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

async function scoreSinglePartner(partnerId: number) {
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
}

export const scorePartner = tool({
  description: "Compute a 0-100 partnership score across budget, satisfaction, activity, track record, and strategic fit. Returns recommendation and scoring breakdown.",
  inputSchema: z.object({
    partnerId: z.number().int().positive().optional(),
    partnerIds: z.array(z.number().int().positive()).min(1).max(10).optional(),
  }),
  execute: async ({ partnerId, partnerIds }) => {
    if (partnerIds) {
      return { partners: await Promise.all(partnerIds.map((id) => scoreSinglePartner(id))) }
    }

    if (partnerId === undefined) {
      return { error: "Partner ID is required" }
    }

    return scoreSinglePartner(partnerId)
  },
})

export const predictChurn = tool({
  description: "Predict churn risk for one partner or all partners using inactivity, satisfaction trend, status history, and interaction frequency. Returns risk scores and retention actions.",
  inputSchema: z.object({
    partnerId: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(50).optional().default(10),
  }),
  execute: async ({ partnerId, limit }) => {
    try {
      const basePartners = partnerId
        ? await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1)
        : await db.select().from(partners).orderBy(partners.name).limit(Math.min(limit, 50))

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

export const recommendPartners = tool({
  description: "Recommend the best-matching partners for a natural language business need using live partner descriptions, specialties, technologies, and subtype attributes.",
  inputSchema: z.object({
    need: z.string().min(3),
    limit: z.number().int().min(1).max(20).optional().default(5),
  }),
  execute: async ({ need, limit }) => {
    try {
      const keywords = Array.from(new Set(need.toLowerCase().split(/[^a-z0-9]+/i).filter((token) => token.length >= 3)))

      const basePartners = await db.select().from(partners).limit(500)
      const candidateIds = basePartners.map((partner) => partner.id)
      const [universityRows, technologyRows, marketingRows, customerRows] = await Promise.all([
        db.select().from(universityPartners).where(inArray(universityPartners.partnerId, candidateIds)),
        db.select().from(technologyPartners).where(inArray(technologyPartners.partnerId, candidateIds)),
        db.select().from(marketingPartners).where(inArray(marketingPartners.partnerId, candidateIds)),
        db.select().from(clientPartners).where(inArray(clientPartners.partnerId, candidateIds)),
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
