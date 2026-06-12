import { desc, eq } from "drizzle-orm"

import { db } from "@/lib/server/db/config"
import {
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
} from "@/lib/server/db/schema"

type Recommendation = "APPROVE" | "REVIEW" | "REJECT"
type DimensionKey = "budget" | "satisfaction" | "activity" | "trackRecord" | "strategicFit"

export interface ScoreDimensionResult {
  key: DimensionKey
  label: string
  weight: number
  score: number
  signals: string[]
}

export interface PartnerScoreResult {
  partnerId: number
  partnerName: string
  category: string | null
  finalScore: number
  recommendation: Recommendation
  methodology: string
  breakdown: Record<DimensionKey, number>
  dimensions: ScoreDimensionResult[]
  signals: {
    annualBudgetTnd: number
    avgSatisfaction: number
    recentEvents: number
    meetings: number
    activeOffers: number
    recruitmentsConvertedToCdi: number
    vendorProjects: number
    totalInteractions: number
  }
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

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} TND`
}

function formatDecimal(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
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

export async function computePartnerScore(partnerId: number): Promise<PartnerScoreResult | null> {
  const details = await fetchPartnerDetailsBundle(partnerId)

  if (!details) {
    return null
  }

  const latestKpi = details.kpis[0]
  const annualBudgetTnd = normalizeAmount(details.partner.annualBudgetTnd)
  const budgetScore = clampScore(Math.min(100, (annualBudgetTnd / 200000) * 100))

  const satisfactionValues = [
    details.partner.satisfactionScore,
    ...details.recentEvents.map((event) => event.satisfactionScore),
    ...details.meetings.map((meeting) => meeting.satisfactionScore),
    latestKpi ? normalizeAmount(latestKpi.avgSatisfactionScore) : null,
  ].filter((value): value is number => typeof value === "number")

  const avgSatisfaction = satisfactionValues.length > 0
    ? satisfactionValues.reduce((sum, value) => sum + value, 0) / satisfactionValues.length
    : 0
  const satisfactionScore = clampScore(avgSatisfaction)

  const totalInteractions = normalizeAmount(latestKpi?.totalInteractions)
  const activitySignals =
    details.recentEvents.length * 8 +
    details.meetings.length * 5 +
    details.offers.length * 3 +
    totalInteractions
  const activityScore = clampScore(Math.min(100, activitySignals))

  const recruitmentsConvertedToCdi = details.recruitments.filter((item) => item.convertedToCdi).length
  const vendorProjectsCount = details.projects.length
  const trackRecordBase =
    vendorProjectsCount * 10 +
    recruitmentsConvertedToCdi * 8 +
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

  const recommendation: Recommendation = finalScore >= 75 ? "APPROVE" : finalScore >= 50 ? "REVIEW" : "REJECT"
  const activeOffers = details.offers.filter((offer) => offer.isActive).length
  const contactCount = details.contacts.length
  const notificationCount = details.notifications.length

  const dimensions: ScoreDimensionResult[] = [
    {
      key: "budget",
      label: "Budget",
      weight: 20,
      score: budgetScore,
      signals: [
        `Annual budget: ${formatCurrency(annualBudgetTnd)}`,
        `Scoring cap reached at 200,000 TND reference budget`,
        `Current partner level: ${details.partner.partnershipLevel ?? "Not defined"}`,
      ],
    },
    {
      key: "satisfaction",
      label: "Satisfaction",
      weight: 25,
      score: satisfactionScore,
      signals: [
        `Average satisfaction: ${formatDecimal(avgSatisfaction, 2)}/100`,
        `Signals used: ${satisfactionValues.length} score${satisfactionValues.length > 1 ? "s" : ""}`,
        `Latest KPI satisfaction: ${latestKpi?.avgSatisfactionScore ? `${formatDecimal(normalizeAmount(latestKpi.avgSatisfactionScore), 2)}/100` : "Unavailable"}`,
      ],
    },
    {
      key: "activity",
      label: "Activity",
      weight: 20,
      score: activityScore,
      signals: [
        `Recent events: ${details.recentEvents.length}`,
        `Meetings logged: ${details.meetings.length}`,
        `Active offers: ${activeOffers} • KPI interactions: ${totalInteractions}`,
      ],
    },
    {
      key: "trackRecord",
      label: "Track Record",
      weight: 20,
      score: trackRecordScore,
      signals: [
        `Vendor projects: ${vendorProjectsCount}`,
        `Recruitments converted to CDI: ${recruitmentsConvertedToCdi}`,
        `Conversion rate: ${latestKpi?.conversionRate ? `${formatDecimal(normalizeAmount(latestKpi.conversionRate), 2)}%` : "Unavailable"}`,
      ],
    },
    {
      key: "strategicFit",
      label: "Strategic Fit",
      weight: 15,
      score: strategicFitScore,
      signals: [
        `Category: ${details.partner.categories ?? "Unspecified"}`,
        `Status/level: ${details.partner.partnershipStatus ?? "Unspecified"} • ${details.partner.partnershipLevel ?? "Unspecified"}`,
        `Strategic boosts: ${[
          details.subtypeDetails.technology?.hasDedicatedSupport ? "Dedicated support" : null,
          details.subtypeDetails.university?.hasFrameworkAgreement ? "Framework agreement" : null,
          contactCount > 0 ? `${contactCount} contact${contactCount > 1 ? "s" : ""}` : null,
          notificationCount > 0 ? `${notificationCount} recent notification${notificationCount > 1 ? "s" : ""}` : null,
        ].filter((value): value is string => value !== null).join(" • ") || "No additional boosts"}`,
      ],
    },
  ]

  return {
    partnerId,
    partnerName: details.partner.name,
    category: details.partner.categories,
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
    dimensions,
    signals: {
      annualBudgetTnd,
      avgSatisfaction: Number(avgSatisfaction.toFixed(2)),
      recentEvents: details.recentEvents.length,
      meetings: details.meetings.length,
      activeOffers,
      recruitmentsConvertedToCdi,
      vendorProjects: vendorProjectsCount,
      totalInteractions,
    },
  }
}
