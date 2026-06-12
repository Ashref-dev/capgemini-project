import { db } from "@/lib/server/db/config"
import { partners, projects } from "@/lib/server/db/schema"
import { eq, sql, and, inArray } from "drizzle-orm"
import {
  identifyAtRiskProjects,
  recommendStaffing,
} from "@/lib/server/services/project-analytics"

export type BriefingInsight = {
  id: string
  icon: "alert" | "trending" | "rocket" | "users" | "calendar" | "sparkle"
  tone: "danger" | "warning" | "success" | "info"
  title: string
  body: string
  href: string | null
  cta: string | null
}

export type DailyBriefing = {
  generatedAt: string
  insights: BriefingInsight[]
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

const cache = new Map<string, { value: DailyBriefing; expiresAt: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000

export async function buildDailyBriefing(userId: number): Promise<DailyBriefing> {
  const key = `${userId}:${todayKey()}`
  const cached = cache.get(key)
  if (cached && Date.now() < cached.expiresAt) return cached.value

  const insights: BriefingInsight[] = []

  try {
    const atRisk = await identifyAtRiskProjects()
    if (atRisk.length > 0) {
      const top = atRisk[0]!
      insights.push({
        id: "at-risk",
        icon: "alert",
        tone: "danger",
        title: `${atRisk.length} projet${atRisk.length > 1 ? "s" : ""} à risque`,
        body: `Le plus critique : « ${top.projectName} » (score ${top.score}/100). ${top.topReasons[0] ?? ""}`,
        href: `/dashboard/projects/${top.projectId}`,
        cta: "Voir le projet",
      })
    } else {
      insights.push({
        id: "all-clear",
        icon: "sparkle",
        tone: "success",
        title: "Aucun projet à risque",
        body: "Tous vos projets actifs sont en bonne santé. Bon travail !",
        href: "/dashboard/projects",
        cta: "Voir le portefeuille",
      })
    }
  } catch (e) {
    console.error("[briefing] at-risk failed:", e)
  }

  try {
    const stalePartnersResult = await db
      .select({
        id: partners.id,
        name: partners.name,
        updatedAt: partners.updatedAt,
        daysIdle: sql<number>`extract(epoch from (now() - ${partners.updatedAt})) / 86400`,
      })
      .from(partners)
      .where(sql`${partners.updatedAt} < now() - interval '60 days'`)
      .orderBy(partners.updatedAt)
      .limit(5)

    if (stalePartnersResult.length > 0) {
      const top = stalePartnersResult[0]!
      const days = Math.round(Number(top.daysIdle))
      insights.push({
        id: "stale-partners",
        icon: "calendar",
        tone: "warning",
        title: `${stalePartnersResult.length} partenaire${stalePartnersResult.length > 1 ? "s" : ""} inactif${stalePartnersResult.length > 1 ? "s" : ""}`,
        body: `${top.name} n'a pas été mis à jour depuis ${days} jours. Pensez à reprendre contact.`,
        href: `/dashboard/partners`,
        cta: "Réactiver",
      })
    }
  } catch (e) {
    console.error("[briefing] stale partners failed:", e)
  }

  try {
    const activeProjectsList = await db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(and(inArray(projects.status, ["planned", "active", "on_hold"]), eq(projects.percentComplete, 0)))
      .limit(3)

    if (activeProjectsList.length > 0) {
      const proj = activeProjectsList[0]!
      try {
        const recs = await recommendStaffing(proj.id)
        if (recs.length > 0) {
          const top = recs[0]!
          insights.push({
            id: "staffing",
            icon: "users",
            tone: "info",
            title: `Suggestion de staffing pour « ${proj.name} »`,
            body: `${top.fullName} (${top.role ?? "—"}) — fit ${top.fitScore}/100, disponibilité ${top.availabilityPercent}%.`,
            href: `/dashboard/projects/${proj.id}?tab=team`,
            cta: "Voir l'équipe",
          })
        }
      } catch (e) {
        console.error("[briefing] staffing recommendations failed:", e)
      }
    }

    if (insights.length < 3) {
      const totalProjects = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
      const totalPartners = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(partners)

      insights.push({
        id: "snapshot",
        icon: "trending",
        tone: "info",
        title: "Snapshot de votre portefeuille",
        body: `${totalProjects[0]?.count ?? 0} projets et ${totalPartners[0]?.count ?? 0} partenaires sous gestion.`,
        href: "/dashboard/bi",
        cta: "Voir les analytics",
      })
    }
  } catch (e) {
    console.error("[briefing] staffing/snapshot failed:", e)
  }

  const result: DailyBriefing = {
    generatedAt: new Date().toISOString(),
    insights: insights.slice(0, 3),
  }

  cache.set(key, { value: result, expiresAt: Date.now() + CACHE_TTL_MS })
  return result
}
