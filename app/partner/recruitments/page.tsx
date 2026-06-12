"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MortarboardIcon, UserGroupIcon, CheckmarkCircle01Icon,
  ChartIncreaseIcon, UserStarIcon, Calendar03Icon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { GradientStatCard } from "@/components/ui/gradient-stat-card"
import { AddButton } from "@/components/ui/add-button"
import { SparklesText } from "@/components/ui/sparkles-text"
import { cn } from "@/lib/utils"

interface Recruitment {
  id: number; studentFirstName: string | null; studentLastName: string | null
  studentEmail: string | null; recruitmentType: string | null; startDate: string
  endDate: string | null; degreeLevel: string | null; specialization: string | null
  assignedProject: string | null; assignedTeam: string | null; managerName: string | null
  performanceScore: number | null; satisfactionScore: number | null
  convertedToCdi: boolean; notes: string | null
}
interface Stats {
  total: number; converted: number; conversionRate: number
  avgPerformance: number | null; avgSatisfaction: number | null
}

const typeLabels: Record<string, string> = {
  stage: "Stage", alternance: "Alternance", vie: "VIE",
  cdi_jeune_diplome: "CDI Jeune Diplômé", contrat_pro: "Contrat Pro",
}
const typeColors: Record<string, string> = {
  stage:            "bg-blue-500/10 text-blue-600 border-blue-500/20",
  alternance:       "bg-violet-500/10 text-violet-600 border-violet-500/20",
  vie:              "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cdi_jeune_diplome:"bg-amber-500/10 text-amber-600 border-amber-500/20",
  contrat_pro:      "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

export default function RecruitmentListPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [globalStats, setGlobalStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/partner/recruitments")
      .then((r) => r.json())
      .then((d) => { if (d.recruitments) { setRecruitments(d.recruitments); setStats(d.stats); setGlobalStats(d.globalStats) } })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={MortarboardIcon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Recrutements" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-0.5">Gérez les recrutements étudiants de votre établissement</p>
          </div>
        </div>
        <Link href="/partner/recruitments/new">
          <AddButton label="Nouveau recrutement" />
        </Link>
      </motion.div>

      {/* Stats cards */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {[
            { icon: UserGroupIcon,          value: String(stats.total),             label: "Total",           sub: globalStats ? `Global : ${globalStats.total}` : undefined,               glowColor: "blue"    as const },
            { icon: CheckmarkCircle01Icon,  value: String(stats.converted),         label: "Convertis CDI",   sub: globalStats ? `Global : ${globalStats.converted}` : undefined,          glowColor: "emerald" as const },
            { icon: ChartIncreaseIcon,      value: `${stats.conversionRate}%`,      label: "Taux conversion", sub: globalStats ? `Global : ${globalStats.conversionRate}%` : undefined,    glowColor: "amber"   as const },
            { icon: UserStarIcon,           value: String(stats.avgPerformance ?? "—"), label: "Perf. moy.",  sub: globalStats ? `Global : ${globalStats.avgPerformance ?? "—"}` : undefined, glowColor: "violet" as const },
            { icon: ChartIncreaseIcon,      value: String(stats.avgSatisfaction ?? "—"), label: "Satisf. moy.", sub: globalStats ? `Global : ${globalStats.avgSatisfaction ?? "—"}` : undefined, glowColor: "cyan" as const },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}>
              <GradientStatCard icon={c.icon} value={c.value} label={c.label} sub={c.sub} glowColor={c.glowColor} index={i} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recruitment list */}
      {recruitments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-10 text-center"
        >
          <HugeiconsIcon icon={MortarboardIcon} className="w-12 h-12 mx-auto opacity-20 mb-3 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">Aucun recrutement pour le moment.</p>
          <Link href="/partner/recruitments/new">
            <AddButton label="Ajouter un recrutement" className="mt-4 mx-auto" />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {recruitments.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className={cn("h-1", typeColors[r.recruitmentType || ""]?.includes("blue") ? "bg-blue-500" : typeColors[r.recruitmentType || ""]?.includes("violet") ? "bg-violet-500" : typeColors[r.recruitmentType || ""]?.includes("emerald") ? "bg-emerald-500" : typeColors[r.recruitmentType || ""]?.includes("amber") ? "bg-amber-500" : "bg-rose-500")} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">
                        {r.studentFirstName} {r.studentLastName}
                      </h3>
                      {r.recruitmentType && (
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", typeColors[r.recruitmentType] || "bg-muted text-muted-foreground border-border")}>
                          {typeLabels[r.recruitmentType] || r.recruitmentType}
                        </span>
                      )}
                      {r.convertedToCdi && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          CDI ✓
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {r.degreeLevel && <span>Niveau : {r.degreeLevel}</span>}
                      {r.specialization && <span>Spécialisation : {r.specialization}</span>}
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar03Icon} className="w-3 h-3" />
                        Du {new Date(r.startDate).toLocaleDateString("fr-FR")}
                        {r.endDate && ` au ${new Date(r.endDate).toLocaleDateString("fr-FR")}`}
                      </span>
                    </div>
                    {(r.assignedProject || r.assignedTeam || r.managerName) && (
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {r.assignedProject && <span>Projet : {r.assignedProject}</span>}
                        {r.assignedTeam && <span>Équipe : {r.assignedTeam}</span>}
                        {r.managerName && <span>Manager : {r.managerName}</span>}
                      </div>
                    )}
                    {r.notes && <p className="text-xs text-muted-foreground italic">{r.notes}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-4 space-y-1">
                    {r.performanceScore !== null && (
                      <div className="text-xs bg-muted/50 rounded-lg px-2.5 py-1">
                        <span className="text-muted-foreground">Perf. </span>
                        <span className="font-bold text-foreground">{r.performanceScore}/100</span>
                      </div>
                    )}
                    {r.satisfactionScore !== null && (
                      <div className="text-xs bg-muted/50 rounded-lg px-2.5 py-1">
                        <span className="text-muted-foreground">Satisf. </span>
                        <span className="font-bold text-foreground">{r.satisfactionScore}/100</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
