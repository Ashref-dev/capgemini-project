"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Spinner } from "@/frontend/components/ui/spinner"

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projets</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos projets avec Capgemini
          </p>
        </div>
        <Link href="/partner/projects/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            {globalStats && <p className="text-xs text-muted-foreground mt-1">Global : {globalStats.total}</p>}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Terminés</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">En cours</p>
            <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Valeur totale</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalValue.toLocaleString()}</p>
            {globalStats && <p className="text-xs text-muted-foreground mt-1">Moy. : {globalStats.avgValue.toLocaleString()}</p>}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Satisfaction</p>
            <p className="text-2xl font-bold text-foreground">{stats.avgSatisfaction ?? "—"}</p>
            {globalStats && <p className="text-xs text-muted-foreground mt-1">Global : {globalStats.avgSatisfaction ?? "—"}</p>}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">À temps</p>
            <p className="text-2xl font-bold text-primary">{stats.onTimeRate}%</p>
            {globalStats && <p className="text-xs text-muted-foreground mt-1">Global : {globalStats.onTimeRate}%</p>}
          </div>
        </motion.div>
      )}

      {/* Project list */}
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-xl p-8 text-center"
        >
          <HugeiconsIcon icon={Folder01Icon} className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucun projet pour le moment.</p>
          <Link href="/partner/projects/new">
            <Button variant="outline" className="mt-4">
              Ajouter un projet
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{p.projectName}</h3>
                    {p.projectStatus && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          statusColors[p.projectStatus] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[p.projectStatus] || p.projectStatus}
                      </span>
                    )}
                    {p.isReferenceProject && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                        Référence
                      </span>
                    )}
                    {p.deliveryStatus && (
                      <span className={`text-xs font-medium ${deliveryColors[p.deliveryStatus] || ""}`}>
                        {deliveryLabels[p.deliveryStatus] || p.deliveryStatus}
                        {p.delayDays !== null && p.delayDays > 0 && ` (+${p.delayDays}j)`}
                      </span>
                    )}
                  </div>
                  {p.projectDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.projectDescription}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {p.clientName && <span>Client : {p.clientName}</span>}
                    {p.projectType && <span>Type : {p.projectType}</span>}
                    <span>
                      Du {new Date(p.startDate).toLocaleDateString("fr-FR")}
                      {p.endDate && ` au ${new Date(p.endDate).toLocaleDateString("fr-FR")}`}
                    </span>
                    {p.durationMonths && <span>{p.durationMonths} mois</span>}
                  </div>
                  {p.technologiesUsed && p.technologiesUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.technologiesUsed.map((t) => (
                        <span
                          key={t}
                          className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.notes && <p className="text-sm text-muted-foreground italic mt-1">{p.notes}</p>}
                </div>
                <div className="text-right space-y-1 shrink-0 ml-4">
                  {p.projectValue !== null && (
                    <div className="text-sm">
                      <span className="font-semibold text-foreground">{p.projectValue.toLocaleString()} TND</span>
                    </div>
                  )}
                  {p.clientSatisfactionScore !== null && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Satisfaction </span>
                      <span className="font-semibold text-foreground">{p.clientSatisfactionScore}/100</span>
                    </div>
                  )}
                  {(p.numConsultantsCapgemini || p.numConsultantsVendor) && (
                    <div className="text-xs text-muted-foreground">
                      {p.numConsultantsCapgemini && `${p.numConsultantsCapgemini} Capgemini`}
                      {p.numConsultantsCapgemini && p.numConsultantsVendor && " + "}
                      {p.numConsultantsVendor && `${p.numConsultantsVendor} Vendor`}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
