"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Loading03Icon,
  Edit01Icon,
  Delete02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/frontend/lib/utils"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { toast } from "@/frontend/components/ui/toast"
import { SubFormModal } from "./sub-form-modal"

export type Milestone = {
  id: number
  projectId: number
  name: string
  dueDate: string | null
  status: "pending" | "in_progress" | "done" | "missed"
  order: number
  blockers: string | null
  description: string | null
}

const STATUS_OPTIONS = [
  { value: "pending", label: "À venir" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminé" },
  { value: "missed", label: "Manqué" },
] as const

const STATUS_TINTS: Record<Milestone["status"], string> = {
  pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  missed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

function relativeDays(d: string | null): string | null {
  if (!d) return null
  const due = new Date(d).getTime()
  if (Number.isNaN(due)) return null
  const days = Math.round((due - Date.now()) / (1000 * 60 * 60 * 24))
  if (days === 0) return "aujourd'hui"
  if (days > 0) return `dans ${days} j`
  return `en retard de ${Math.abs(days)} j`
}

interface MilestonesTabProps {
  projectId: number
  isAdmin: boolean
  onChange?: () => void
}

export function MilestonesTab({ projectId, isAdmin, onChange }: MilestonesTabProps) {
  const [items, setItems] = React.useState<Milestone[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Milestone | null>(null)
  const [confirmId, setConfirmId] = React.useState<number | null>(null)

  const fetchAll = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur de chargement")
      setItems(data.milestones ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  React.useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const handleSaved = () => {
    setFormOpen(false)
    setEditing(null)
    void fetchAll()
    onChange?.()
  }

  const handleDelete = async () => {
    if (confirmId == null) return
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones/${confirmId}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? "Erreur de suppression")
      }
      toast.success("Jalon supprimé")
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
          <h3 className="text-sm font-semibold text-foreground">Jalons du projet</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} jalon{items.length > 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
            Ajouter un jalon
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {["m1", "m2", "m3"].map((k) => (
            <div key={k} className="h-20 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center">
          <HugeiconsIcon icon={Calendar03Icon} className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Aucun jalon planifié</p>
          <p className="text-xs text-muted-foreground">Découpez votre projet en étapes mesurables.</p>
        </div>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-border/50 pl-6">
          <AnimatePresence initial={false}>
            {items.map((m, i) => {
              const rel = relativeDays(m.dueDate)
              return (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.04 }}
                  className="relative"
                >
                  <span
                    className={cn(
                      "absolute -left-[31px] top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background ring-2",
                      m.status === "done"
                        ? "bg-emerald-500 ring-emerald-200 dark:ring-emerald-900/40"
                        : m.status === "missed"
                        ? "bg-red-500 ring-red-200 dark:ring-red-900/40"
                        : m.status === "in_progress"
                        ? "bg-amber-500 ring-amber-200 dark:ring-amber-900/40"
                        : "bg-blue-500 ring-blue-200 dark:ring-blue-900/40",
                    )}
                  >
                    {m.status === "done" && (
                      <HugeiconsIcon icon={Tick02Icon} className="h-2.5 w-2.5 text-white" />
                    )}
                  </span>
                  <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">{m.name}</h4>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                              STATUS_TINTS[m.status],
                            )}
                          >
                            {STATUS_OPTIONS.find((o) => o.value === m.status)?.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {m.dueDate
                            ? `Échéance : ${new Date(m.dueDate).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}${rel ? ` · ${rel}` : ""}`
                            : "Sans date"}
                        </p>
                        {m.description && (
                          <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                        )}
                        {m.blockers && (
                          <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                            <HugeiconsIcon icon={AlertCircleIcon} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{m.blockers}</span>
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            aria-label="Modifier"
                            onClick={() => {
                              setEditing(m)
                              setFormOpen(true)
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <HugeiconsIcon icon={Edit01Icon} className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Supprimer"
                            onClick={() => setConfirmId(m.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>
      )}

      <MilestoneFormModal
        open={formOpen}
        projectId={projectId}
        initialValue={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSaved={handleSaved}
      />

      {confirmId != null && (
        <ConfirmModal
          title="Supprimer ce jalon ?"
          message="Les tâches rattachées resteront mais n'auront plus de jalon parent."
          onCancel={() => setConfirmId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

interface MilestoneFormModalProps {
  open: boolean
  projectId: number
  initialValue: Milestone | null
  onClose: () => void
  onSaved: () => void
}

function MilestoneFormModal({ open, projectId, initialValue, onClose, onSaved }: MilestoneFormModalProps) {
  const isEdit = Boolean(initialValue)
  const [form, setForm] = React.useState({
    name: "",
    dueDate: "",
    status: "pending" as Milestone["status"],
    order: 0,
    blockers: "",
    description: "",
  })
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<{ name?: string }>({})

  React.useEffect(() => {
    if (!open) return
    if (initialValue) {
      setForm({
        name: initialValue.name,
        dueDate: initialValue.dueDate ?? "",
        status: initialValue.status,
        order: initialValue.order,
        blockers: initialValue.blockers ?? "",
        description: initialValue.description ?? "",
      })
    } else {
      setForm({ name: "", dueDate: "", status: "pending", order: 0, blockers: "", description: "" })
    }
    setErrors({})
  }, [open, initialValue])

  const submit = async () => {
    if (!form.name.trim()) {
      setErrors({ name: "Le nom est requis" })
      return
    }
    setSaving(true)
    try {
      const url = isEdit
        ? `/api/projects/${projectId}/milestones/${initialValue!.id}`
        : `/api/projects/${projectId}/milestones`
      const method = isEdit ? "PATCH" : "POST"
      const body = {
        name: form.name.trim(),
        dueDate: form.dueDate || null,
        status: form.status,
        order: form.order,
        blockers: form.blockers.trim() || null,
        description: form.description.trim() || null,
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
      toast.success(isEdit ? "Jalon mis à jour" : "Jalon créé")
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <SubFormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier le jalon" : "Nouveau jalon"}
      icon={CheckmarkCircle02Icon}
      onSubmit={submit}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ms-name" className="text-sm font-semibold">
            Nom *
          </Label>
          <Input
            id="ms-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="ex. Phase 1 — Conception"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ms-due" className="text-sm font-semibold">
            Date d&apos;échéance
          </Label>
          <Input
            id="ms-due"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ms-status" className="text-sm font-semibold">
            Statut
          </Label>
          <select
            id="ms-status"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Milestone["status"] }))}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ms-order" className="text-sm font-semibold">
            Ordre
          </Label>
          <Input
            id="ms-order"
            type="number"
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) || 0 }))}
            min={0}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ms-block" className="text-sm font-semibold">
            Bloqueurs
          </Label>
          <textarea
            id="ms-block"
            value={form.blockers}
            onChange={(e) => setForm((p) => ({ ...p, blockers: e.target.value }))}
            rows={2}
            placeholder="Dépendances ou risques bloquants…"
            className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm dark:bg-input/30"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ms-desc" className="text-sm font-semibold">
            Description
          </Label>
          <textarea
            id="ms-desc"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm dark:bg-input/30"
          />
        </div>
      </div>
    </SubFormModal>
  )
}

function ConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
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
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
        </div>
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
            className="gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            {busy && <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />}
            Supprimer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
