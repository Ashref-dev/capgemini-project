import { tool } from "ai"
import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { partnerCategoryEnum } from "../partner-data"
import { getErrorMessage } from "../utils"
import { db } from "@/lib/server/db/config"
import { partnerEvents, partnerMeetings, partnerNotifications, partners, partnerStatusHistory } from "@/lib/server/db/schema"

export const summarizePartnerPortfolio = tool({
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

export const getPartnerActivityTimeline = tool({
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

export const getCategoryBenchmarks = tool({
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
