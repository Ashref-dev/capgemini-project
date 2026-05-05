"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Edit01Icon,
  Delete02Icon,
  Calendar03Icon,
  Money01Icon,
  UserMultiple02Icon,
  CheckmarkCircle02Icon,
  CheckmarkSquare01Icon,
  FileAttachmentIcon,
  AlertCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { useAuth } from "@/frontend/hooks/use-auth"
import { Button } from "@/frontend/components/ui/button"
import { toast } from "@/frontend/components/ui/toast"
import { cn } from "@/frontend/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs"
import {
  ProjectStatusBadge,
  ProjectHealthDot,
  ProjectPriorityBadge,
} from "@/frontend/components/projects/project-status-badge"
import { ProjectForm, type Project } from "@/frontend/components/projects/project-form"
import { ProjectGantt, type GanttMilestone } from "@/frontend/components/projects/project-gantt"
import { MilestonesTab } from "@/frontend/components/projects/milestones-tab"
import { TasksTab } from "@/frontend/components/projects/tasks-tab"
import { TeamTab } from "@/frontend/components/projects/team-tab"
import { DocumentsTab } from "@/frontend/components/projects/documents-tab"

interface ProjectDetail {
  project: Project
  counts: { milestones: number; tasks: number; allocations: number; documents: number }
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return "—"
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function formatBudget(b: number | null, ccy: string | null): string {
  if (b == null) return "Non défini"
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: ccy ?? "TND", maximumFractionDigits: 0 }).format(b)
}

const TAB_KEYS = ["overview", "milestones", "tasks", "team", "documents"] as const
type TabKey = (typeof TAB_KEYS)[number]

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const projectId = Number(params.id)
  const isAdmin = user?.role === "admin" || user?.role === "manager"

  const [data, setData] = React.useState<ProjectDetail | null>(null)
  const [milestones, setMilestones] = React.useState<GanttMilestone[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const initialTab = (searchParams.get("tab") as TabKey | null) ?? "overview"
  const [tab, setTab] = React.useState<TabKey>(TAB_KEYS.includes(initialTab) ? initialTab : "overview")

  const fetchAll = React.useCallback(async () => {
    if (!Number.isFinite(projectId) || projectId <= 0) {
      setError("ID projet invalide")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [detailRes, msRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/milestones`),
      ])
      const detail = await detailRes.json()
      if (!detailRes.ok) throw new Error(detail.error ?? "Projet introuvable")
      setData(detail)
      const ms = await msRes.json()
      if (msRes.ok) setMilestones(ms.milestones ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  React.useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [tab, router, searchParams])

  const handleSaved = (saved: Project) => {
    setData((prev) => (prev ? { ...prev, project: { ...prev.project, ...saved } } : prev))
    setEditOpen(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? "Suppression impossible")
      toast.success("Projet supprimé")
      router.push("/dashboard/projects")
    } catch (e) {
      toast.error("Erreur", { description: (e as Error).message })
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted/40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["s1", "s2", "s3", "s4"].map((k) => (
            <div key={k} className="h-20 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-6 py-12 text-center">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-7 w-7 text-destructive" />
        <p className="text-sm font-medium text-foreground">{error ?? "Projet introuvable"}</p>
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-1.5 h-3.5 w-3.5" />
            Retour à la liste
          </Button>
        </Link>
      </div>
    )
  }

  const p = data.project
  const counts = data.counts

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/projects" className="hover:text-foreground">
          Projets
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{p.name}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <ProjectHealthDot health={p.health} size="lg" className="mt-2" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">{p.name}</h1>
                <ProjectStatusBadge status={p.status} />
                <ProjectPriorityBadge priority={p.priority} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {p.partnerName ? (
                  <Link
                    href={`/dashboard/partners`}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <HugeiconsIcon icon={UserMultiple02Icon} className="h-3.5 w-3.5" />
                    {p.partnerName}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <HugeiconsIcon icon={UserMultiple02Icon} className="h-3.5 w-3.5" />
                    Projet interne
                  </span>
                )}
                {p.ownerName && <span>Responsable : {p.ownerName}</span>}
                {(p.startDate || p.endDate) && (
                  <span className="inline-flex items-center gap-1">
                    <HugeiconsIcon icon={Calendar03Icon} className="h-3.5 w-3.5" />
                    {formatDate(p.startDate)} → {formatDate(p.endDate)}
                  </span>
                )}
                {p.budget != null && (
                  <span className="inline-flex items-center gap-1">
                    <HugeiconsIcon icon={Money01Icon} className="h-3.5 w-3.5" />
                    {formatBudget(p.budget, p.currency)}
                  </span>
                )}
              </div>
              {p.tags && p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <HugeiconsIcon icon={Edit01Icon} className="mr-1.5 h-3.5 w-3.5" />
                Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <HugeiconsIcon icon={Delete02Icon} className="mr-1.5 h-3.5 w-3.5" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {p.description && (
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{p.description}</p>
        )}

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Avancement global</span>
            <span className="font-semibold tabular-nums text-foreground">{p.percentComplete}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${p.percentComplete}%` }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: "milestones" as TabKey, label: "Jalons", value: counts.milestones, icon: CheckmarkCircle02Icon, tint: "text-blue-600" },
          { key: "tasks" as TabKey, label: "Tâches", value: counts.tasks, icon: CheckmarkSquare01Icon, tint: "text-amber-600" },
          { key: "team" as TabKey, label: "Équipe", value: counts.allocations, icon: UserMultiple02Icon, tint: "text-emerald-600" },
          { key: "documents" as TabKey, label: "Documents", value: counts.documents, icon: FileAttachmentIcon, tint: "text-slate-500" },
        ].map((stat, i) => (
          <motion.button
            type="button"
            key={stat.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
            onClick={() => setTab(stat.key)}
            className={cn(
              "group rounded-2xl border border-border/60 bg-card p-4 text-left shadow-sm transition-all hover:shadow-md",
              tab === stat.key && "ring-2 ring-primary/40",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <HugeiconsIcon icon={stat.icon} className={cn("h-4 w-4", stat.tint)} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{stat.value}</p>
          </motion.button>
        ))}
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Roadmap des jalons</h2>
        </div>
        <ProjectGantt
          milestones={milestones}
          startDate={p.startDate}
          endDate={p.endDate}
          onMilestoneClick={() => setTab("milestones")}
        />
      </section>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
        <TabsList className="h-10 w-full justify-start gap-1 bg-muted/40 p-1">
          <TabsTrigger value="overview" className="text-xs">
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs">
            Jalons
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs">
            Tâches
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs">
            Équipe
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            Documents
          </TabsTrigger>
        </TabsList>

        <div className="pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="overview">
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground">Aperçu rapide</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sélectionnez un onglet pour explorer les jalons, tâches, équipe ou documents.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Statut</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        <ProjectStatusBadge status={p.status} />
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Santé</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        <ProjectHealthDot health={p.health} withLabel />
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Priorité</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        <ProjectPriorityBadge priority={p.priority} />
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Budget</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{formatBudget(p.budget, p.currency)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="milestones">
                <MilestonesTab projectId={projectId} isAdmin={isAdmin} onChange={() => void fetchAll()} />
              </TabsContent>
              <TabsContent value="tasks">
                <TasksTab projectId={projectId} isAdmin={isAdmin} onChange={() => void fetchAll()} />
              </TabsContent>
              <TabsContent value="team">
                <TeamTab projectId={projectId} isAdmin={isAdmin} onChange={() => void fetchAll()} />
              </TabsContent>
              <TabsContent value="documents">
                <DocumentsTab projectId={projectId} isAdmin={isAdmin} onChange={() => void fetchAll()} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>

      <ProjectForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialValue={p}
        onSaved={handleSaved}
      />

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={() => !deleting && setConfirmDelete(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Supprimer ce projet ?</h3>
                  <p className="text-xs text-muted-foreground">Action irréversible.</p>
                </div>
              </div>
              <p className="mb-3 rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">{p.name}</p>
              <p className="mb-5 text-xs text-muted-foreground">
                Tous les jalons, tâches, allocations et documents associés seront également supprimés.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
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
