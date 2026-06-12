"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  CheckmarkSquare01Icon,
  Edit01Icon,
  Delete02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { SubFormModal } from "./sub-form-modal"
import { EmployeeSelect } from "./employee-select"

export type Task = {
  id: number
  projectId: number
  milestoneId: number | null
  name: string
  assigneeEmployeeId: number | null
  dueDate: string | null
  status: "todo" | "doing" | "done" | "blocked"
  blockerText: string | null
  assigneeName?: string | null
  milestoneName?: string | null
}

const COLUMNS: { key: Task["status"]; label: string; tint: string }[] = [
  { key: "todo", label: "À faire", tint: "border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/30" },
  { key: "doing", label: "En cours", tint: "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/30" },
  { key: "done", label: "Terminé", tint: "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30" },
  { key: "blocked", label: "Bloqué", tint: "border-red-500/40 bg-red-50/50 dark:bg-red-950/30" },
]

function initials(name: string | null | undefined): string {
  if (!name) return "—"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDateShort(d: string | null): string | null {
  if (!d) return null
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return null
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

interface TasksTabProps {
  projectId: number
  isAdmin: boolean
  onChange?: () => void
}

export function TasksTab({ projectId, isAdmin, onChange }: TasksTabProps) {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = React.useState<Task["status"]>("todo")
  const [confirmId, setConfirmId] = React.useState<number | null>(null)

  const fetchAll = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur de chargement")
      setTasks(data.tasks ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  React.useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const updateStatus = async (taskId: number, status: Task["status"]) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? "Erreur")
      }
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
      onChange?.()
    } catch (e) {
      toast.error("Erreur", { description: (e as Error).message })
    }
  }

  const handleDelete = async () => {
    if (confirmId == null) return
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${confirmId}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? "Erreur de suppression")
      }
      toast.success("Tâche supprimée")
      setConfirmId(null)
      void fetchAll()
      onChange?.()
    } catch (e) {
      toast.error("Erreur", { description: (e as Error).message })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tableau des tâches</h3>
          <p className="text-xs text-muted-foreground">
            {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setDefaultStatus("todo")
              setFormOpen(true)
            }}
            className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
            Nouvelle tâche
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key)
          return (
            <div key={col.key} className={cn("flex min-h-[180px] flex-col rounded-2xl border p-3", col.tint)}>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {col.label}{" "}
                  <span className="ml-1 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] tabular-nums">
                    {colTasks.length}
                  </span>
                </h4>
                {isAdmin && (
                  <button
                    type="button"
                    aria-label="Ajouter une tâche"
                    onClick={() => {
                      setEditing(null)
                      setDefaultStatus(col.key)
                      setFormOpen(true)
                    }}
                    className="rounded-md p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {loading ? (
                <div className="space-y-2">
                  {["k1", "k2"].map((k) => (
                    <div key={k} className="h-16 animate-pulse rounded-lg bg-muted/50" />
                  ))}
                </div>
              ) : colTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/50 py-6 text-center text-xs text-muted-foreground">
                  Aucune tâche
                </p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {colTasks.map((t) => {
                      const due = formatDateShort(t.dueDate)
                      return (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="group rounded-xl border border-border/60 bg-card p-3 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{t.name}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {t.assigneeName && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                                      {initials(t.assigneeName)}
                                    </span>
                                    {t.assigneeName}
                                  </span>
                                )}
                                {due && (
                                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                    {due}
                                  </span>
                                )}
                                {t.milestoneName && (
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {t.milestoneName}
                                  </span>
                                )}
                              </div>
                              {t.blockerText && (
                                <div className="mt-2 flex items-start gap-1.5 rounded-md bg-red-100/60 px-2 py-1 text-[10px] text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                  <HugeiconsIcon icon={AlertCircleIcon} className="mt-0.5 h-3 w-3 shrink-0" />
                                  {t.blockerText}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            {isAdmin ? (
                              <select
                                value={t.status}
                                onChange={(e) => void updateStatus(t.id, e.target.value as Task["status"])}
                                className="h-6 rounded-md border border-input bg-transparent px-1.5 text-[10px] dark:bg-input/30"
                                aria-label="Changer le statut"
                              >
                                {COLUMNS.map((c) => (
                                  <option key={c.key} value={c.key}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span />
                            )}
                            {isAdmin && (
                              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  aria-label="Modifier"
                                  onClick={() => {
                                    setEditing(t)
                                    setFormOpen(true)
                                  }}
                                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                  <HugeiconsIcon icon={Edit01Icon} className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Supprimer"
                                  onClick={() => setConfirmId(t.id)}
                                  className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                >
                                  <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <TaskFormModal
        open={formOpen}
        projectId={projectId}
        initialValue={editing}
        defaultStatus={defaultStatus}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSaved={() => {
          setFormOpen(false)
          setEditing(null)
          void fetchAll()
          onChange?.()
        }}
      />

      {confirmId != null && (
        <ConfirmDelete
          message="Cette tâche sera supprimée définitivement."
          onCancel={() => setConfirmId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

interface TaskFormProps {
  open: boolean
  projectId: number
  initialValue: Task | null
  defaultStatus: Task["status"]
  onClose: () => void
  onSaved: () => void
}

function TaskFormModal({ open, projectId, initialValue, defaultStatus, onClose, onSaved }: TaskFormProps) {
  const isEdit = Boolean(initialValue)
  const [form, setForm] = React.useState({
    name: "",
    assigneeEmployeeId: "",
    dueDate: "",
    status: defaultStatus,
    blockerText: "",
  })
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<{ name?: string }>({})

  React.useEffect(() => {
    if (!open) return
    if (initialValue) {
      setForm({
        name: initialValue.name,
        assigneeEmployeeId:
          initialValue.assigneeEmployeeId != null ? String(initialValue.assigneeEmployeeId) : "",
        dueDate: initialValue.dueDate ?? "",
        status: initialValue.status,
        blockerText: initialValue.blockerText ?? "",
      })
    } else {
      setForm({ name: "", assigneeEmployeeId: "", dueDate: "", status: defaultStatus, blockerText: "" })
    }
    setErrors({})
  }, [open, initialValue, defaultStatus])

  const submit = async () => {
    if (!form.name.trim()) {
      setErrors({ name: "Le nom est requis" })
      return
    }
    setSaving(true)
    try {
      const url = isEdit
        ? `/api/projects/${projectId}/tasks/${initialValue!.id}`
        : `/api/projects/${projectId}/tasks`
      const method = isEdit ? "PATCH" : "POST"
      const body = {
        name: form.name.trim(),
        assigneeEmployeeId: form.assigneeEmployeeId ? Number(form.assigneeEmployeeId) : null,
        dueDate: form.dueDate || null,
        status: form.status,
        blockerText: form.blockerText.trim() || null,
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error("Erreur", { description: data.error ?? "Sauvegarde impossible" })
        return
      }
      toast.success(isEdit ? "Tâche mise à jour" : "Tâche créée")
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <SubFormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier la tâche" : "Nouvelle tâche"}
      icon={CheckmarkSquare01Icon}
      onSubmit={submit}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="t-name" className="text-sm font-semibold">
            Nom *
          </Label>
          <Input
            id="t-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="ex. Implémenter le module de paiement"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Assigné à</Label>
          <EmployeeSelect
            value={form.assigneeEmployeeId}
            onChange={(id) => setForm((p) => ({ ...p, assigneeEmployeeId: id }))}
            placeholder="Aucun assigné"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="t-due" className="text-sm font-semibold">
            Échéance
          </Label>
          <Input
            id="t-due"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="t-status" className="text-sm font-semibold">
            Statut
          </Label>
          <select
            id="t-status"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Task["status"] }))}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30"
          >
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="t-block" className="text-sm font-semibold">
            Bloqueur
          </Label>
          <textarea
            id="t-block"
            value={form.blockerText}
            onChange={(e) => setForm((p) => ({ ...p, blockerText: e.target.value }))}
            rows={2}
            className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm dark:bg-input/30"
          />
        </div>
      </div>
    </SubFormModal>
  )
}

function ConfirmDelete({
  message,
  onCancel,
  onConfirm,
}: {
  message: string
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}) {
  const [busy, setBusy] = React.useState(false)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onClick={() => !busy && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
      >
        <h3 className="mb-2 text-base font-semibold text-foreground">Supprimer ?</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Annuler
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await onConfirm()
              } finally {
                setBusy(false)
              }
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Supprimer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
