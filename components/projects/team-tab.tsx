"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  UserMultiple02Icon,
  Edit01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { SubFormModal } from "./sub-form-modal"
import { EmployeeSelect } from "./employee-select"

export type Allocation = {
  id: number
  projectId: number
  employeeId: number
  role: string | null
  ftePercent: number
  startDate: string | null
  endDate: string | null
  employeeName?: string
  employeeEmail?: string
  employeeRole?: string | null
}

function initials(name: string | null | undefined): string {
  if (!name) return "—"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return "—"
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

interface TeamTabProps {
  projectId: number
  isAdmin: boolean
  onChange?: () => void
}

export function TeamTab({ projectId, isAdmin, onChange }: TeamTabProps) {
  const [items, setItems] = React.useState<Allocation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Allocation | null>(null)
  const [confirmId, setConfirmId] = React.useState<number | null>(null)

  const fetchAll = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/allocations`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur de chargement")
      setItems(data.allocations ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  React.useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const handleDelete = async () => {
    if (confirmId == null) return
    try {
      const res = await fetch(`/api/projects/${projectId}/allocations/${confirmId}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? "Erreur de suppression")
      }
      toast.success("Membre retiré")
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
          <h3 className="text-sm font-semibold text-foreground">Équipe projet</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} membre{items.length > 1 ? "s" : ""}
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
            Ajouter un membre
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["a", "b", "c"].map((k) => (
            <div key={k} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center">
          <HugeiconsIcon icon={UserMultiple02Icon} className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Aucun membre alloué</p>
          <p className="text-xs text-muted-foreground">
            Ajoutez les contributeurs et leur pourcentage d&apos;implication.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {items.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.04 }}
                className="group rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 text-sm font-bold text-primary ring-1 ring-primary/20">
                    {initials(a.employeeName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {a.employeeName ?? `#${a.employeeId}`}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{a.employeeEmail ?? "—"}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {a.role ?? "—"}{" "}
                      {a.employeeRole && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                          · {a.employeeRole}
                        </span>
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label="Modifier"
                        onClick={() => {
                          setEditing(a)
                          setFormOpen(true)
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <HugeiconsIcon icon={Edit01Icon} className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Retirer"
                        onClick={() => setConfirmId(a.id)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Implication</span>
                    <span className="font-semibold tabular-nums text-foreground">{a.ftePercent}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, a.ftePercent))}%` }}
                      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                    />
                  </div>
                  {(a.startDate || a.endDate) && (
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(a.startDate)} → {formatDate(a.endDate)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AllocationFormModal
        open={formOpen}
        projectId={projectId}
        initialValue={editing}
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
        <ConfirmDelete onCancel={() => setConfirmId(null)} onConfirm={handleDelete} />
      )}
    </div>
  )
}

interface AllocationFormProps {
  open: boolean
  projectId: number
  initialValue: Allocation | null
  onClose: () => void
  onSaved: () => void
}

function AllocationFormModal({ open, projectId, initialValue, onClose, onSaved }: AllocationFormProps) {
  const isEdit = Boolean(initialValue)
  const [form, setForm] = React.useState({
    employeeId: "",
    role: "",
    ftePercent: "100",
    startDate: "",
    endDate: "",
  })
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<{ employeeId?: string; ftePercent?: string; endDate?: string }>({})

  React.useEffect(() => {
    if (!open) return
    if (initialValue) {
      setForm({
        employeeId: String(initialValue.employeeId),
        role: initialValue.role ?? "",
        ftePercent: String(initialValue.ftePercent),
        startDate: initialValue.startDate ?? "",
        endDate: initialValue.endDate ?? "",
      })
    } else {
      setForm({ employeeId: "", role: "", ftePercent: "100", startDate: "", endDate: "" })
    }
    setErrors({})
  }, [open, initialValue])

  const submit = async () => {
    const next: typeof errors = {}
    if (!form.employeeId) next.employeeId = "Sélectionnez un employé"
    const fte = Number(form.ftePercent)
    if (Number.isNaN(fte) || fte < 0 || fte > 100) next.ftePercent = "Entre 0 et 100"
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = "Doit être après la date de début"
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    try {
      const url = isEdit
        ? `/api/projects/${projectId}/allocations/${initialValue!.id}`
        : `/api/projects/${projectId}/allocations`
      const method = isEdit ? "PATCH" : "POST"
      const body = {
        employeeId: Number(form.employeeId),
        role: form.role.trim() || null,
        ftePercent: fte,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
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
      toast.success(isEdit ? "Allocation mise à jour" : "Membre ajouté")
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <SubFormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier l'allocation" : "Ajouter un membre"}
      icon={UserMultiple02Icon}
      onSubmit={submit}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold">Employé *</Label>
          <EmployeeSelect
            value={form.employeeId}
            onChange={(id) => setForm((p) => ({ ...p, employeeId: id }))}
            disabled={isEdit}
          />
          {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="al-role" className="text-sm font-semibold">
            Rôle sur le projet
          </Label>
          <Input
            id="al-role"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            placeholder="ex. Tech Lead"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="al-fte" className="text-sm font-semibold">
            Implication (%)
          </Label>
          <Input
            id="al-fte"
            type="number"
            min={0}
            max={100}
            value={form.ftePercent}
            onChange={(e) => setForm((p) => ({ ...p, ftePercent: e.target.value }))}
            aria-invalid={Boolean(errors.ftePercent)}
          />
          {errors.ftePercent && <p className="text-xs text-destructive">{errors.ftePercent}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="al-start" className="text-sm font-semibold">
            Début
          </Label>
          <Input
            id="al-start"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="al-end" className="text-sm font-semibold">
            Fin
          </Label>
          <Input
            id="al-end"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            aria-invalid={Boolean(errors.endDate)}
          />
          {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
        </div>
      </div>
    </SubFormModal>
  )
}

function ConfirmDelete({
  onCancel,
  onConfirm,
}: {
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
        <h3 className="mb-2 text-base font-semibold text-foreground">Retirer ce membre ?</h3>
        <p className="text-sm text-muted-foreground">L&apos;allocation sera supprimée du projet.</p>
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
            Retirer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
