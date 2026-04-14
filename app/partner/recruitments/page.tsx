"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MortarboardIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Spinner } from "@/frontend/components/ui/spinner"

interface Recruitment {
  id: number
  studentFirstName: string | null
  studentLastName: string | null
  studentEmail: string | null
  recruitmentType: string | null
  startDate: string
  endDate: string | null
  degreeLevel: string | null
  specialization: string | null
  assignedProject: string | null
  assignedTeam: string | null
  managerName: string | null
  performanceScore: number | null
  satisfactionScore: number | null
  convertedToCdi: boolean
  notes: string | null
}

interface Stats {
  total: number
  converted: number
  conversionRate: number
  avgPerformance: number | null
  avgSatisfaction: number | null
}

const typeLabels: Record<string, string> = {
  stage: "Stage",
  alternance: "Alternance",
  vie: "VIE",
  cdi_jeune_diplome: "CDI Jeune Diplômé",
  contrat_pro: "Contrat Pro",
}

const typeColors: Record<string, string> = {
  stage: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  alternance: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  vie: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cdi_jeune_diplome: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  contrat_pro: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
}

export default function RecruitmentListPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [globalStats, setGlobalStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/partner/recruitments")
      .then((r) => r.json())
      .then((d) => {
        if (d.recruitments) {
          setRecruitments(d.recruitments)
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
          <h1 className="text-2xl font-bold text-foreground">Recrutements</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les recrutements étudiants de votre établissement
          </p>
        </div>
        <Link href="/partner/recruitments/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
            Nouveau recrutement
          </Button>
        </Link>
      </motion.div>

      {/* Stats cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            {globalStats && (
              <p className="text-xs text-muted-foreground mt-1">Global : {globalStats.total}</p>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Convertis CDI</p>
            <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
            {globalStats && (
              <p className="text-xs text-muted-foreground mt-1">Global : {globalStats.converted}</p>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Taux conversion</p>
            <p className="text-2xl font-bold text-primary">{stats.conversionRate}%</p>
            {globalStats && (
              <p className="text-xs text-muted-foreground mt-1">Global : {globalStats.conversionRate}%</p>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Perf. moyenne</p>
            <p className="text-2xl font-bold text-foreground">{stats.avgPerformance ?? "—"}</p>
            {globalStats && (
              <p className="text-xs text-muted-foreground mt-1">Global : {globalStats.avgPerformance ?? "—"}</p>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Satisfaction moy.</p>
            <p className="text-2xl font-bold text-foreground">{stats.avgSatisfaction ?? "—"}</p>
            {globalStats && (
              <p className="text-xs text-muted-foreground mt-1">Global : {globalStats.avgSatisfaction ?? "—"}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Recruitment list */}
      {recruitments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-xl p-8 text-center"
        >
          <HugeiconsIcon icon={MortarboardIcon} className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucun recrutement pour le moment.</p>
          <Link href="/partner/recruitments/new">
            <Button variant="outline" className="mt-4">
              Ajouter un recrutement
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {recruitments.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {r.studentFirstName} {r.studentLastName}
                    </h3>
                    {r.recruitmentType && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          typeColors[r.recruitmentType] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {typeLabels[r.recruitmentType] || r.recruitmentType}
                      </span>
                    )}
                    {r.convertedToCdi && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        CDI ✓
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {r.degreeLevel && <span>Niveau : {r.degreeLevel}</span>}
                    {r.specialization && <span>Spécialisation : {r.specialization}</span>}
                    <span>
                      Du {new Date(r.startDate).toLocaleDateString("fr-FR")}
                      {r.endDate && ` au ${new Date(r.endDate).toLocaleDateString("fr-FR")}`}
                    </span>
                  </div>
                  {(r.assignedProject || r.assignedTeam) && (
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      {r.assignedProject && <span>Projet : {r.assignedProject}</span>}
                      {r.assignedTeam && <span>Équipe : {r.assignedTeam}</span>}
                    </div>
                  )}
                  {r.managerName && (
                    <p className="text-sm text-muted-foreground">Manager : {r.managerName}</p>
                  )}
                  {r.notes && (
                    <p className="text-sm text-muted-foreground italic mt-1">{r.notes}</p>
                  )}
                </div>
                <div className="text-right space-y-1 shrink-0 ml-4">
                  {r.performanceScore !== null && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Perf. </span>
                      <span className="font-semibold text-foreground">{r.performanceScore}/100</span>
                    </div>
                  )}
                  {r.satisfactionScore !== null && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Satisfaction </span>
                      <span className="font-semibold text-foreground">{r.satisfactionScore}/100</span>
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
