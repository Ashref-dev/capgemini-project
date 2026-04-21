"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon, BarChartIcon, CheckmarkCircle01Icon,
  ClockIcon, MoneyBag02Icon, ChartIncreaseIcon, Medal01Icon,
  Calendar03Icon, UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@/frontend/components/ui/spinner"
import { GradientStatCard } from "@/frontend/components/ui/gradient-stat-card"
import { AddButton } from "@/frontend/components/ui/add-button"
import { SparklesText } from "@/frontend/components/ui/sparkles-text"
import { cn } from "@/frontend/lib/utils"

interface Project {
  id: number
  projectName: string
  projectDescription: string | null
  clientName: string | null
  projectType: string | null
  technologiesUsed: string[] | null
  startDate: string
  endDate: string | null
  durationMonths: number | null
  projectValue: number | null
  licenseCost: number | null
  servicesCost: number | null
  commissionEarned: number | null
  deliveryStatus: string | null
  delayDays: number | null
  clientSatisfactionScore: number | null
  numConsultantsCapgemini: number | null
  numConsultantsVendor: number | null
  projectStatus: string | null
  isReferenceProject: boolean
  caseStudyUrl: string | null
  notes: string | null
}

interface Stats {
  total: number
  completed: number
  inProgress: number
  totalValue: number
  avgSatisfaction: number | null
  onTimeRate: number
}

interface GlobalStats {
  total: number
  completed: number
  avgSatisfaction: number | null
  avgValue: number
  onTimeRate: number
}

const statusLabels: Record<string, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
}

const statusColors: Record<string, string> = {
  planifie: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  en_cours: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  termine: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  annule: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

const deliveryLabels: Record<string, string> = {
  en_avance: "En avance",
  a_temps: "À temps",
  en_retard: "En retard",
}

const deliveryColors: Record<string, string> = {
  en_avance: "text-green-600",
  a_temps: "text-primary",
  en_retard: "text-red-600",
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/partner/projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.projects) {
          setProjects(d.projects)
          setStats(d.stats)
          setGlobalStats(d.globalStats)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Folder01Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Mes Projets" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-0.5">Gérez vos projets avec Capgemini</p>
          </div>
        </div>
        <Link href="/partner/projects/new">
          <AddButton label="Nouveau projet" />
        </Link>
      </motion.div>

      {/* Stats cards */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {[
            { icon: BarChartIcon,        value: String(stats.total),            label: "Total",        sub: globalStats ? `Global : ${globalStats.total}` : undefined,               glowColor: "blue"    as const },
            { icon: CheckmarkCircle01Icon, value: String(stats.completed),        label: "Terminés",     sub: undefined,                                                               glowColor: "emerald" as const },
            { icon: ClockIcon,            value: String(stats.inProgress),        label: "En cours",     sub: undefined,                                                               glowColor: "amber"   as const },
            { icon: MoneyBag02Icon,       value: `${(stats.totalValue/1000).toFixed(0)}K`, label: "Valeur", sub: globalStats ? `Moy. ${(globalStats.avgValue/1000).toFixed(0)}K TND` : undefined, glowColor: "cyan" as const },
            { icon: ChartIncreaseIcon,    value: String(stats.avgSatisfaction ?? "—"), label: "Satisf.",  sub: globalStats ? `Global : ${globalStats.avgSatisfaction ?? "—"}` : undefined, glowColor: "violet" as const },
            { icon: Medal01Icon,         value: `${stats.onTimeRate}%`,           label: "À temps",     sub: globalStats ? `Global : ${globalStats.onTimeRate}%` : undefined,          glowColor: "red"    as const },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}>
              <GradientStatCard icon={c.icon} value={c.value} label={c.label} sub={c.sub} glowColor={c.glowColor} index={i} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Project list */}
      {projects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-10 text-center"
        >
          <HugeiconsIcon icon={Folder01Icon} className="w-12 h-12 mx-auto opacity-20 mb-3 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">Aucun projet pour le moment.</p>
          <Link href="/partner/projects/new">
            <AddButton label="Ajouter un projet" className="mt-4 mx-auto" />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className={cn("h-1", statusColors[p.projectStatus || ""]?.includes("blue") ? "bg-blue-500" : statusColors[p.projectStatus || ""]?.includes("amber") ? "bg-amber-500" : statusColors[p.projectStatus || ""]?.includes("green") ? "bg-emerald-500" : "bg-red-400")} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{p.projectName}</h3>
                      {p.projectStatus && (
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", statusColors[p.projectStatus] || "bg-muted text-muted-foreground border-border")}>
                          {statusLabels[p.projectStatus] || p.projectStatus}
                        </span>
                      )}
                      {p.isReferenceProject && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                          Référence
                        </span>
                      )}
                      {p.deliveryStatus && (
                        <span className={cn("text-[10px] font-semibold", deliveryColors[p.deliveryStatus] || "")}>
                          {deliveryLabels[p.deliveryStatus] || p.deliveryStatus}
                          {p.delayDays !== null && p.delayDays > 0 && ` (+${p.delayDays}j)`}
                        </span>
                      )}
                    </div>
                    {p.projectDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.projectDescription}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {p.clientName && <span>Client : {p.clientName}</span>}
                      {p.projectType && <span>Type : {p.projectType}</span>}
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar03Icon} className="w-3 h-3" />
                        Du {new Date(p.startDate).toLocaleDateString("fr-FR")}
                        {p.endDate && ` au ${new Date(p.endDate).toLocaleDateString("fr-FR")}`}
                      </span>
                      {p.durationMonths && <span>{p.durationMonths} mois</span>}
                      {(p.numConsultantsCapgemini || p.numConsultantsVendor) && (
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
                          {p.numConsultantsCapgemini && `${p.numConsultantsCapgemini} Capgemini`}
                          {p.numConsultantsCapgemini && p.numConsultantsVendor && " + "}
                          {p.numConsultantsVendor && `${p.numConsultantsVendor} Vendor`}
                        </span>
                      )}
                    </div>
                    {p.technologiesUsed && p.technologiesUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.technologiesUsed.map((t) => (
                          <span key={t} className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border/50">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-4 space-y-1">
                    {p.projectValue !== null && (
                      <div className="text-xs bg-muted/50 rounded-lg px-2.5 py-1">
                        <span className="font-bold text-foreground">{p.projectValue.toLocaleString()} TND</span>
                      </div>
                    )}
                    {p.clientSatisfactionScore !== null && (
                      <div className="text-xs bg-muted/50 rounded-lg px-2.5 py-1">
                        <span className="text-muted-foreground">Satisf. </span>
                        <span className="font-bold text-foreground">{p.clientSatisfactionScore}/100</span>
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

