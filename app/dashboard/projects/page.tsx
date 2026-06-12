"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Briefcase01Icon,
  PlusSignIcon,
  Search01Icon,
  Loading03Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  ClockIcon,
  Folder01Icon,
  ArrowRight01Icon,
  Edit01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import {
  ProjectStatusBadge,
  ProjectHealthDot,
  ProjectPriorityBadge,
  STATUS_OPTIONS,
  HEALTH_OPTIONS,
  type ProjectHealth,
  type ProjectStatus,
} from "@/components/projects/project-status-badge"
import { ProjectForm, type Project } from "@/components/projects/project-form"

type HealthFilter = "all" | ProjectHealth
type StatusFilter = "all" | ProjectStatus

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return "—"
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin" || user?.role === "manager"

  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [healthFilter, setHealthFilter] = React.useState<HealthFilter>("all")
  const [showForm, setShowForm] = React.useState(false)
  const [editing, setEditing] = React.useState<Project | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState<Project | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const debouncedSearch = useDebouncedValue(search, 300)

  const fetchProjects = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim())
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (healthFilter !== "all") params.set("health", healthFilter)
      params.set("limit", "100")
      const res = await fetch(`/api/projects?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur de chargement")
      setProjects(data.projects ?? [])
    } catch (err) {
      setError((err as Error).message)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, healthFilter])

  React.useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  const stats = React.useMemo(() => {
    const total = projects.length
    const active = projects.filter((p) => p.status === "active").length
    const atRisk = projects.filter((p) => p.health === "R").length
    const done = projects.filter((p) => p.status === "done").length
    return { total, active, atRisk, done }
  }, [projects])

  const handleSaved = (saved: Project) => {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...prev[idx], ...saved }
        return next
      }
      return [saved, ...prev]
    })
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${confirmDelete.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible")
      setProjects((prev) => prev.filter((p) => p.id !== confirmDelete.id))
      toast.success("Projet supprimé", { description: confirmDelete.name })
      setConfirmDelete(null)
    } catch (err) {
      toast.error("Erreur", { description: (err as Error).message })
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={Briefcase01Icon} className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Projets
            </span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Vos projets
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Suivez l&apos;avancement, l&apos;équipe et les jalons de chaque projet Capgemini.
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="gap-2 self-start bg-blue-600 font-medium text-white hover:bg-blue-700"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            Nouveau projet
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, icon: Folder01Icon, tint: "text-blue-600" },
          { label: "Actifs", value: stats.active, icon: CheckmarkCircle02Icon, tint: "text-emerald-600" },
          { label: "À risque", value: stats.atRisk, icon: AlertCircleIcon, tint: "text-red-600" },
          { label: "Terminés", value: stats.done, icon: ClockIcon, tint: "text-slate-500" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 + i * 0.05, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
              <HugeiconsIcon icon={card.icon} className={cn("h-4 w-4", card.tint)} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un projet…"
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous statuts</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Santé</span>
          {(["all", ...HEALTH_OPTIONS.map((o) => o.value)] as HealthFilter[]).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHealthFilter(h)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                healthFilter === h
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {h === "all" ? "Tous" : <ProjectHealthDot health={h as ProjectHealth} size="sm" />}
              {h !== "all" && (h === "G" ? "Sain" : h === "Y" ? "Attention" : "À risque")}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Liste des projets</h2>
            <p className="text-xs text-muted-foreground">
              {projects.length} projet{projects.length > 1 ? "s" : ""} affiché
              {projects.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 p-5">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <div key={k} className="h-14 animate-pulse rounded-xl bg-muted/50" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-10 w-10 text-destructive" />
            <p className="text-sm font-medium text-foreground">Impossible de charger les projets</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void fetchProjects()}>
              Réessayer
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={Folder01Icon} className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-foreground">Aucun projet pour le moment</p>
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              Créez votre premier projet pour commencer à suivre vos jalons et votre équipe.
            </p>
            {isAdmin && (
              <Button
                onClick={() => {
                  setEditing(null)
                  setShowForm(true)
                }}
                className="mt-1 gap-2 bg-blue-600 font-medium text-white hover:bg-blue-700"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                Créer un projet
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            <AnimatePresence initial={false}>
              {projects.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.02 }}
                  className="group relative"
                >
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <ProjectHealthDot health={p.health} size="md" className="mt-1" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">{p.name}</span>
                          <ProjectStatusBadge status={p.status} />
                          <ProjectPriorityBadge priority={p.priority} />
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {p.partnerName ?? "Projet interne"}
                          {p.ownerName && ` · ${p.ownerName}`}
                          {p.endDate && ` · jusqu'au ${formatDate(p.endDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center gap-3 sm:w-auto sm:gap-4">
                      <div className="flex w-full flex-col gap-1 sm:w-32">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Avancement</span>
                          <span className="tabular-nums">{p.percentComplete}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.percentComplete}%` }}
                            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              aria-label="Modifier"
                              onClick={(e) => {
                                e.preventDefault()
                                setEditing(p)
                                setShowForm(true)
                              }}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Supprimer"
                              onClick={(e) => {
                                e.preventDefault()
                                setConfirmDelete(p)
                              }}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <ProjectForm
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditing(null)
        }}
        initialValue={editing}
        onSaved={handleSaved}
      />

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={() => !deleting && setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Supprimer ce projet ?</h3>
                  <p className="text-xs text-muted-foreground">Cette action est irréversible.</p>
                </div>
              </div>
              <p className="mb-4 rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">{confirmDelete.name}</p>
              <p className="mb-5 text-xs text-muted-foreground">
                Tous les jalons, tâches, allocations et documents associés seront également supprimés.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="gap-2 bg-red-600 text-white hover:bg-red-700"
                >
                  {deleting ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                      Suppression…
                    </>
                  ) : (
                    "Supprimer définitivement"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
