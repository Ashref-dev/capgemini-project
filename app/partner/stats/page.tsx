"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Medal01Icon, ChartIncreaseIcon, MoneyBag02Icon, UserGroupIcon,
  Discount01Icon, Calendar03Icon, ContactBookIcon, UserStarIcon,
  CheckmarkCircle01Icon, ClockIcon, AnalyticsUpIcon, BarChartIcon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { GradientStatCard } from "@/components/ui/gradient-stat-card"
import { SparklesText } from "@/components/ui/sparkles-text"
import { cn } from "@/lib/utils"

interface PartnerData {
  partner: { id: number; name: string; categories: string | null; satisfactionScore: number | null; annualBudgetTnd: number | null }
  stats: { offerCount: number; eventCount: number; contactCount: number; rank: number | null; totalPartners: number; globalAvgSatisfaction: number | null; globalAvgBudget: number | null; categoryAvgSatisfaction: number | null; categoryAvgBudget: number | null; categoryCount: number }
}
interface RecruitmentStats {
  stats: { total: number; converted: number; conversionRate: number; avgPerformance: number | null; avgSatisfaction: number | null }
  globalStats: { total: number; converted: number; conversionRate: number; avgPerformance: number | null; avgSatisfaction: number | null }
}
interface ProjectStats {
  stats: { total: number; completed: number; inProgress: number; totalValue: number; avgSatisfaction: number | null; onTimeRate: number }
  globalStats: { total: number; completed: number; avgSatisfaction: number | null; avgValue: number; onTimeRate: number }
}

const categoryLabels: Record<string, string> = {
  customer: "Client", marketing: "Marketing", supplier: "Fournisseur", university: "Université",
}

// Dual bar chart component
function DualBar({ label, mine, theirs, mineLabel, theirsLabel, max, unit = "" }: {
  label: string; mine: number; theirs: number; mineLabel: string; theirsLabel: string; max: number; unit?: string
}) {
  const pctMine = max > 0 ? Math.min((mine / max) * 100, 100) : 0
  const pctTheirs = max > 0 ? Math.min((theirs / max) * 100, 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-0.5">
        <span>{label}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-20 text-[11px] text-foreground font-medium shrink-0 text-right">{mineLabel}</div>
          <div className="flex-1 h-5 bg-muted/40 rounded-md overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pctMine}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary rounded-md flex items-center justify-end pr-1.5">
              <span className="text-[10px] font-bold text-white">{mine}{unit}</span>
            </motion.div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 text-[11px] text-muted-foreground shrink-0 text-right">{theirsLabel}</div>
          <div className="flex-1 h-5 bg-muted/40 rounded-md overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pctTheirs}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="h-full bg-blue-400/70 rounded-md flex items-center justify-end pr-1.5">
              <span className="text-[10px] font-bold text-white">{theirs}{unit}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PartnerStatsPage() {
  const [data, setData] = useState<PartnerData | null>(null)
  const [recruitmentData, setRecruitmentData] = useState<RecruitmentStats | null>(null)
  const [projectData, setProjectData] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const meRes = await fetch("/api/partner/me")
        const meData = await meRes.json()
        setData(meData)
        if (meData.partner?.categories === "university") {
          const recRes = await fetch("/api/partner/recruitments")
          if (recRes.ok) setRecruitmentData(await recRes.json())
        } else if (meData.partner?.categories === "supplier") {
          const projRes = await fetch("/api/partner/projects")
          if (projRes.ok) setProjectData(await projRes.json())
        }
      } catch {}
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!data?.partner) return <div className="text-muted-foreground">Impossible de charger les statistiques.</div>

  const { partner, stats } = data

  const kpiCards = [
    { icon: Medal01Icon,       value: stats.rank ? `#${stats.rank}` : "-", label: "Classement",            sub: `/ ${stats.totalPartners} partenaires`, glowColor: "amber"   as const },
    { icon: ChartIncreaseIcon,  value: `${partner.satisfactionScore ?? "-"}`, label: "Satisfaction",       sub: "score /100",                             glowColor: "emerald" as const },
    { icon: MoneyBag02Icon,     value: partner.annualBudgetTnd ? `${(partner.annualBudgetTnd/1000).toFixed(0)}K` : "-", label: "Budget annuel", sub: "TND", glowColor: "blue" as const },
    { icon: UserGroupIcon,      value: `${stats.categoryCount}`, label: "Pairs catégorie",                 sub: categoryLabels[partner.categories || ""] || "-", glowColor: "violet" as const },
  ]

  const activityCards = [
    { icon: Discount01Icon,   value: String(stats.offerCount),   label: "Offres",      glowColor: "cyan"    as const },
    { icon: Calendar03Icon,   value: String(stats.eventCount),   label: "Événements",  glowColor: "emerald" as const },
    { icon: ContactBookIcon,  value: String(stats.contactCount), label: "Contacts",    glowColor: "violet"  as const },
  ]

  const maxBudget = Math.max(partner.annualBudgetTnd ?? 0, stats.categoryAvgBudget ?? 0, stats.globalAvgBudget ?? 0, 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={BarChartIcon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Statistiques & Performance" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-0.5">Votre position par rapport aux autres partenaires</p>
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GradientStatCard icon={card.icon} value={card.value} label={card.label} sub={card.sub} glowColor={card.glowColor} index={i} />
          </motion.div>
        ))}
      </div>

      {/* Satisfaction + Budget comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Satisfaction */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
        >
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={ChartIncreaseIcon} className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Score de satisfaction</h3>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <DualBar
              label="Vous vs. catégorie"
              mine={partner.satisfactionScore ?? 0}
              theirs={stats.categoryAvgSatisfaction ?? 0}
              mineLabel="Vous"
              theirsLabel={`Moy. ${categoryLabels[partner.categories || ""] || ""}`}
              max={100}
            />
            <DualBar
              label="Vous vs. global"
              mine={partner.satisfactionScore ?? 0}
              theirs={stats.globalAvgSatisfaction ?? 0}
              mineLabel="Vous"
              theirsLabel="Moy. globale"
              max={100}
            />
          </div>
        </motion.div>

        {/* Budget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
        >
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-emerald-500/5 to-transparent">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={MoneyBag02Icon} className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-foreground text-sm">Budget annuel (TND)</h3>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <DualBar
              label="Vous vs. catégorie"
              mine={partner.annualBudgetTnd ?? 0}
              theirs={stats.categoryAvgBudget ?? 0}
              mineLabel="Vous"
              theirsLabel={`Moy. ${categoryLabels[partner.categories || ""] || ""}`}
              max={maxBudget}
            />
            <DualBar
              label="Vous vs. global"
              mine={partner.annualBudgetTnd ?? 0}
              theirs={stats.globalAvgBudget ?? 0}
              mineLabel="Vous"
              theirsLabel="Moy. globale"
              max={maxBudget}
            />
          </div>
        </motion.div>
      </div>

      {/* Activity */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <h3 className="font-semibold text-foreground">Votre activité</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {activityCards.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.06 }}>
              <GradientStatCard icon={c.icon} value={c.value} label={c.label} glowColor={c.glowColor} index={i} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* University: recruitment stats */}
      {partner.categories === "university" && recruitmentData && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-violet-500" />
            <h3 className="font-semibold text-foreground">Recrutements universitaires</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: UserGroupIcon,       value: String(recruitmentData.stats.total),            label: "Recrutements",     sub: `Global : ${recruitmentData.globalStats.total}`,            glowColor: "blue"    as const },
              { icon: CheckmarkCircle01Icon, value: String(recruitmentData.stats.converted),      label: "Convertis CDI",    sub: `Global : ${recruitmentData.globalStats.converted}`,         glowColor: "emerald" as const },
              { icon: ChartIncreaseIcon,   value: `${recruitmentData.stats.conversionRate}%`,     label: "Taux conversion",  sub: `Global : ${recruitmentData.globalStats.conversionRate}%`,   glowColor: "amber"   as const },
              { icon: UserStarIcon,        value: String(recruitmentData.stats.avgPerformance ?? "-"), label: "Perf. moyenne", sub: `Global : ${recruitmentData.globalStats.avgPerformance ?? "-"}`, glowColor: "violet" as const },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.06 }}>
                <GradientStatCard icon={c.icon} value={c.value} label={c.label} sub={c.sub} glowColor={c.glowColor} index={i} />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
          >
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-violet-500/5 to-transparent">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={AnalyticsUpIcon} className="w-4 h-4 text-violet-500" />
                <h3 className="font-semibold text-foreground text-sm">Comparaison recrutement</h3>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <DualBar label="Performance moyenne" mine={recruitmentData.stats.avgPerformance ?? 0} theirs={recruitmentData.globalStats.avgPerformance ?? 0} mineLabel="Vous" theirsLabel="Globale" max={100} />
              <DualBar label="Satisfaction moyenne" mine={recruitmentData.stats.avgSatisfaction ?? 0} theirs={recruitmentData.globalStats.avgSatisfaction ?? 0} mineLabel="Vous" theirsLabel="Globale" max={100} />
              <DualBar label="Taux de conversion" mine={recruitmentData.stats.conversionRate} theirs={recruitmentData.globalStats.conversionRate} mineLabel="Vous" theirsLabel="Globale" max={100} unit="%" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Supplier: project stats */}
      {partner.categories === "supplier" && projectData && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            <h3 className="font-semibold text-foreground">Projets technologiques</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: BarChartIcon,       value: String(projectData.stats.total),            label: "Projets",        sub: `Global : ${projectData.globalStats.total}`,                         glowColor: "blue"    as const },
              { icon: CheckmarkCircle01Icon, value: String(projectData.stats.completed),        label: "Terminés",       sub: "",                                                                  glowColor: "emerald" as const },
              { icon: ClockIcon,           value: String(projectData.stats.inProgress),        label: "En cours",       sub: "",                                                                  glowColor: "amber"   as const },
              { icon: MoneyBag02Icon,      value: `${(projectData.stats.totalValue/1000).toFixed(0)}K`, label: "Valeur totale", sub: `Moy. ${(projectData.globalStats.avgValue/1000).toFixed(0)}K TND`, glowColor: "cyan"  as const },
              { icon: ChartIncreaseIcon,   value: String(projectData.stats.avgSatisfaction ?? "-"), label: "Satisfaction",  sub: `Global : ${projectData.globalStats.avgSatisfaction ?? "-"}`,    glowColor: "violet" as const },
              { icon: Medal01Icon,        value: `${projectData.stats.onTimeRate}%`,           label: "À temps",        sub: `Global : ${projectData.globalStats.onTimeRate}%`,                   glowColor: "red"    as const },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.06 }}>
                <GradientStatCard icon={c.icon} value={c.value} label={c.label} sub={c.sub} glowColor={c.glowColor} index={i} />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
          >
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-blue-500/5 to-transparent">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={AnalyticsUpIcon} className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-foreground text-sm">Comparaison projets</h3>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <DualBar label="Satisfaction client" mine={projectData.stats.avgSatisfaction ?? 0} theirs={projectData.globalStats.avgSatisfaction ?? 0} mineLabel="Vous" theirsLabel="Globale" max={100} />
              <DualBar label="Livraison à temps" mine={projectData.stats.onTimeRate} theirs={projectData.globalStats.onTimeRate} mineLabel="Vous" theirsLabel="Globale" max={100} unit="%" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
