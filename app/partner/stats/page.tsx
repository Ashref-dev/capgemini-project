"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Spinner } from "@/frontend/components/ui/spinner"

interface PartnerData {
  partner: {
    id: number
    name: string
    categories: string | null
    satisfactionScore: number | null
    annualBudgetTnd: number | null
  }
  stats: {
    offerCount: number
    eventCount: number
    contactCount: number
    rank: number | null
    totalPartners: number
    globalAvgSatisfaction: number | null
    globalAvgBudget: number | null
    categoryAvgSatisfaction: number | null
    categoryAvgBudget: number | null
    categoryCount: number
  }
}

interface RecruitmentStats {
  stats: {
    total: number
    converted: number
    conversionRate: number
    avgPerformance: number | null
    avgSatisfaction: number | null
  }
  globalStats: {
    total: number
    converted: number
    conversionRate: number
    avgPerformance: number | null
    avgSatisfaction: number | null
  }
}

interface ProjectStats {
  stats: {
    total: number
    completed: number
    inProgress: number
    totalValue: number
    avgSatisfaction: number | null
    onTimeRate: number
  }
  globalStats: {
    total: number
    completed: number
    avgSatisfaction: number | null
    avgValue: number
    onTimeRate: number
  }
}

const categoryLabels: Record<string, string> = {
  customer: "Client",
  marketing: "Marketing",
  supplier: "Fournisseur",
  university: "Université",
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
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
          if (recRes.ok) {
            const recData = await recRes.json()
            setRecruitmentData(recData)
          }
        } else if (meData.partner?.categories === "supplier") {
          const projRes = await fetch("/api/partner/projects")
          if (projRes.ok) {
            const projData = await projRes.json()
            setProjectData(projData)
          }
        }
      } catch {}
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (!data?.partner) {
    return <div className="text-muted-foreground">Impossible de charger les statistiques.</div>
  }

  const { partner, stats } = data
  const maxSatisfaction = 100

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
        <p className="text-muted-foreground mt-1">
          Votre position par rapport aux autres partenaires
        </p>
      </motion.div>

      {/* Rank card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="font-semibold text-foreground mb-2">Classement général</h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-primary">
            {stats.rank ?? "—"}
          </span>
          <span className="text-muted-foreground text-lg mb-1">/ {stats.totalPartners} partenaires actifs</span>
        </div>
      </motion.div>

      {/* Satisfaction comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6 space-y-4"
      >
        <h3 className="font-semibold text-foreground">Score de satisfaction</h3>
        <StatBar
          label={`Vous (${partner.name})`}
          value={partner.satisfactionScore ?? 0}
          max={maxSatisfaction}
          color="bg-primary"
        />
        <StatBar
          label={`Moyenne ${categoryLabels[partner.categories || ""] || "catégorie"} (${stats.categoryCount} partenaires)`}
          value={stats.categoryAvgSatisfaction ?? 0}
          max={maxSatisfaction}
          color="bg-blue-400"
        />
        <StatBar
          label={`Moyenne globale (${stats.totalPartners} partenaires)`}
          value={stats.globalAvgSatisfaction ?? 0}
          max={maxSatisfaction}
          color="bg-muted-foreground/50"
        />
      </motion.div>

      {/* Budget comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-6 space-y-4"
      >
        <h3 className="font-semibold text-foreground">Budget annuel (TND)</h3>
        {(() => {
          const maxBudget = Math.max(
            partner.annualBudgetTnd ?? 0,
            stats.categoryAvgBudget ?? 0,
            stats.globalAvgBudget ?? 0,
            1
          )
          return (
            <>
              <StatBar
                label="Votre budget"
                value={partner.annualBudgetTnd ?? 0}
                max={maxBudget}
                color="bg-green-500"
              />
              <StatBar
                label={`Moyenne ${categoryLabels[partner.categories || ""] || "catégorie"}`}
                value={stats.categoryAvgBudget ?? 0}
                max={maxBudget}
                color="bg-green-300"
              />
              <StatBar
                label="Moyenne globale"
                value={stats.globalAvgBudget ?? 0}
                max={maxBudget}
                color="bg-muted-foreground/50"
              />
            </>
          )
        })()}
      </motion.div>

      {/* Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Votre activité</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-foreground">{stats.offerCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Offres</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{stats.eventCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Événements</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{stats.contactCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Contacts</p>
          </div>
        </div>
      </motion.div>

      {/* University recruitment stats */}
      {partner.categories === "university" && recruitmentData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-foreground">Statistiques de recrutement</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-foreground">{recruitmentData.stats.total}</p>
                <p className="text-sm text-muted-foreground mt-1">Recrutements</p>
                <p className="text-xs text-muted-foreground">Global : {recruitmentData.globalStats.total}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{recruitmentData.stats.converted}</p>
                <p className="text-sm text-muted-foreground mt-1">Convertis CDI</p>
                <p className="text-xs text-muted-foreground">Global : {recruitmentData.globalStats.converted}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{recruitmentData.stats.conversionRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">Taux conversion</p>
                <p className="text-xs text-muted-foreground">Global : {recruitmentData.globalStats.conversionRate}%</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{recruitmentData.stats.avgPerformance ?? "—"}</p>
                <p className="text-sm text-muted-foreground mt-1">Perf. moyenne</p>
                <p className="text-xs text-muted-foreground">Global : {recruitmentData.globalStats.avgPerformance ?? "—"}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-foreground">Comparaison recrutement</h3>
            {(() => {
              const maxPerf = 100
              return (
                <>
                  <StatBar
                    label="Votre performance moyenne"
                    value={recruitmentData.stats.avgPerformance ?? 0}
                    max={maxPerf}
                    color="bg-primary"
                  />
                  <StatBar
                    label="Performance globale moyenne"
                    value={recruitmentData.globalStats.avgPerformance ?? 0}
                    max={maxPerf}
                    color="bg-muted-foreground/50"
                  />
                  <StatBar
                    label="Votre satisfaction moyenne"
                    value={recruitmentData.stats.avgSatisfaction ?? 0}
                    max={maxPerf}
                    color="bg-green-500"
                  />
                  <StatBar
                    label="Satisfaction globale moyenne"
                    value={recruitmentData.globalStats.avgSatisfaction ?? 0}
                    max={maxPerf}
                    color="bg-green-300"
                  />
                </>
              )
            })()}
          </motion.div>
        </>
      )}

      {/* Supplier project stats */}
      {partner.categories === "supplier" && projectData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-foreground">Statistiques projets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-foreground">{projectData.stats.total}</p>
                <p className="text-sm text-muted-foreground mt-1">Projets</p>
                <p className="text-xs text-muted-foreground">Global : {projectData.globalStats.total}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{projectData.stats.completed}</p>
                <p className="text-sm text-muted-foreground mt-1">Terminés</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-600">{projectData.stats.inProgress}</p>
                <p className="text-sm text-muted-foreground mt-1">En cours</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{projectData.stats.totalValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Valeur totale</p>
                <p className="text-xs text-muted-foreground">Moy. : {projectData.globalStats.avgValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{projectData.stats.avgSatisfaction ?? "—"}</p>
                <p className="text-sm text-muted-foreground mt-1">Satisfaction</p>
                <p className="text-xs text-muted-foreground">Global : {projectData.globalStats.avgSatisfaction ?? "—"}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{projectData.stats.onTimeRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">À temps</p>
                <p className="text-xs text-muted-foreground">Global : {projectData.globalStats.onTimeRate}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-foreground">Comparaison projets</h3>
            {(() => {
              const maxSat = 100
              return (
                <>
                  <StatBar
                    label="Votre satisfaction client"
                    value={projectData.stats.avgSatisfaction ?? 0}
                    max={maxSat}
                    color="bg-primary"
                  />
                  <StatBar
                    label="Satisfaction globale moyenne"
                    value={projectData.globalStats.avgSatisfaction ?? 0}
                    max={maxSat}
                    color="bg-muted-foreground/50"
                  />
                  <StatBar
                    label="Votre taux de livraison à temps"
                    value={projectData.stats.onTimeRate}
                    max={100}
                    color="bg-green-500"
                  />
                  <StatBar
                    label="Taux global de livraison à temps"
                    value={projectData.globalStats.onTimeRate}
                    max={100}
                    color="bg-green-300"
                  />
                </>
              )
            })()}
          </motion.div>
        </>
      )}
    </div>
  )
}
