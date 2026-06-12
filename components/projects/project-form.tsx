"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Dialog as DialogPrimitive } from "radix-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Briefcase01Icon,
  Cancel01Icon,
  CheckmarkSquare01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PartnerSelect } from "@/components/ui/partner-select"
import { toast } from "@/components/ui/toast"
import { EmployeeSelect } from "./employee-select"
import {
  HEALTH_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  type ProjectHealth,
  type ProjectPriority,
  type ProjectStatus,
} from "./project-status-badge"

export interface Project {
  id: number
  name: string
  partnerId: number | null
  ownerEmployeeId: number | null
  status: ProjectStatus
  health: ProjectHealth
  priority: ProjectPriority
  startDate: string | null
  endDate: string | null
  budget: number | null
  currency: string | null
  percentComplete: number
  tags: string[]
  description: string | null
  partnerName?: string | null
  ownerName?: string | null
  createdAt?: string
  updatedAt?: string
}

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  initialValue?: Project | null
  onSaved: (project: Project) => void
}

interface FormState {
  name: string
  partnerId: string
  ownerEmployeeId: string
  status: ProjectStatus
  health: ProjectHealth
  priority: ProjectPriority
  startDate: string
  endDate: string
  budget: string
  currency: string
  percentComplete: string
  tagsInput: string
  tags: string[]
  description: string
}

function blankForm(): FormState {
  return {
    name: "",
    partnerId: "",
    ownerEmployeeId: "",
    status: "active",
    health: "G",
    priority: "medium",
    startDate: "",
    endDate: "",
    budget: "",
    currency: "TND",
    percentComplete: "0",
    tagsInput: "",
    tags: [],
    description: "",
  }
}

function fromProject(p: Project): FormState {
  return {
    name: p.name,
    partnerId: p.partnerId != null ? String(p.partnerId) : "",
    ownerEmployeeId: p.ownerEmployeeId != null ? String(p.ownerEmployeeId) : "",
    status: p.status,
    health: p.health,
    priority: p.priority,
    startDate: p.startDate ?? "",
    endDate: p.endDate ?? "",
    budget: p.budget != null ? String(p.budget) : "",
    currency: p.currency ?? "TND",
    percentComplete: String(p.percentComplete ?? 0),
    tagsInput: "",
    tags: p.tags ?? [],
    description: p.description ?? "",
  }
}

export function ProjectForm({ open, onClose, initialValue, onSaved }: ProjectFormProps) {
  const isEdit = Boolean(initialValue)
  const [form, setForm] = React.useState<FormState>(() => (initialValue ? fromProject(initialValue) : blankForm()))
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(initialValue ? fromProject(initialValue) : blankForm())
      setErrors({})
    }
  }, [open, initialValue])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const addTagsFromInput = () => {
    const raw = form.tagsInput.trim()
    if (!raw) return
    const newTags = raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !form.tags.includes(t))
    if (newTags.length > 0) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, ...newTags], tagsInput: "" }))
    } else {
      setForm((prev) => ({ ...prev, tagsInput: "" }))
    }
  }

  const removeTag = (tag: string) => setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = "Le nom est requis"
    if (form.name.length > 200) next.name = "Maximum 200 caractères"
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = "La date de fin doit être postérieure à la date de début"
    }
    if (form.percentComplete) {
      const pct = Number(form.percentComplete)
      if (Number.isNaN(pct) || pct < 0 || pct > 100) next.percentComplete = "Entre 0 et 100"
    }
    if (form.budget) {
      const b = Number(form.budget)
      if (Number.isNaN(b) || b < 0) next.budget = "Doit être un nombre positif"
    }
    if (form.currency && form.currency.length !== 3) next.currency = "Code à 3 lettres (ex: TND)"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        status: form.status,
        health: form.health,
        priority: form.priority,
        currency: form.currency || "TND",
        percentComplete: Number(form.percentComplete) || 0,
        tags: form.tags,
      }
      payload.partnerId = form.partnerId ? Number(form.partnerId) : null
      payload.ownerEmployeeId = form.ownerEmployeeId ? Number(form.ownerEmployeeId) : null
      payload.startDate = form.startDate || null
      payload.endDate = form.endDate || null
      payload.budget = form.budget ? Number(form.budget) : null
      payload.description = form.description.trim() || null

      const url = isEdit ? `/api/projects/${initialValue!.id}` : "/api/projects"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(isEdit ? "Mise à jour impossible" : "Création impossible", {
          description: data.error ?? "Erreur inconnue",
        })
        return
      }
      toast.success(isEdit ? "Projet mis à jour" : "Projet créé", {
        description: data.project?.name,
      })
      onSaved(data.project as Project)
      onClose()
    } catch (err) {
      toast.error("Erreur réseau", { description: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/30 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-7xl -translate-x-1/2 -translate-y-1/2",
            "max-h-[90vh] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HugeiconsIcon icon={Briefcase01Icon} className="h-4.5 w-4.5" />
                </div>
                <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                  {isEdit ? "Modifier le projet" : "Nouveau projet"}
                </DialogPrimitive.Title>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="gap-2 bg-blue-600 font-medium text-white hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={CheckmarkSquare01Icon} className="h-4 w-4" />
                      {isEdit ? "Enregistrer" : "Créer le projet"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="proj-name" className="text-sm font-semibold">
                    Nom du projet *
                  </Label>
                  <Input
                    id="proj-name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="ex. Migration Cloud Phase 2"
                    required
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Partenaire</Label>
                  <PartnerSelect
                    value={form.partnerId}
                    onChange={(id) => update("partnerId", id)}
                    placeholder="Aucun (projet interne)"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Responsable</Label>
                  <EmployeeSelect
                    value={form.ownerEmployeeId}
                    onChange={(id) => update("ownerEmployeeId", id)}
                    placeholder="Sélectionner un responsable"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proj-status" className="text-sm font-semibold">
                    Statut
                  </Label>
                  <select
                    id="proj-status"
                    value={form.status}
                    onChange={(e) => update("status", e.target.value as ProjectStatus)}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm dark:bg-input/30"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="proj-health" className="text-sm font-semibold">
                      Santé
                    </Label>
                    <select
                      id="proj-health"
                      value={form.health}
                      onChange={(e) => update("health", e.target.value as ProjectHealth)}
                      className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm dark:bg-input/30"
                    >
                      {HEALTH_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proj-priority" className="text-sm font-semibold">
                      Priorité
                    </Label>
                    <select
                      id="proj-priority"
                      value={form.priority}
                      onChange={(e) => update("priority", e.target.value as ProjectPriority)}
                      className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm dark:bg-input/30"
                    >
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proj-start" className="text-sm font-semibold">
                    Date de début
                  </Label>
                  <Input
                    id="proj-start"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proj-end" className="text-sm font-semibold">
                    Date de fin
                  </Label>
                  <Input
                    id="proj-end"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                    aria-invalid={Boolean(errors.endDate)}
                  />
                  {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="proj-budget" className="text-sm font-semibold">
                      Budget
                    </Label>
                    <Input
                      id="proj-budget"
                      type="number"
                      min={0}
                      value={form.budget}
                      onChange={(e) => update("budget", e.target.value)}
                      placeholder="0"
                      aria-invalid={Boolean(errors.budget)}
                    />
                    {errors.budget && <p className="text-xs text-destructive">{errors.budget}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proj-currency" className="text-sm font-semibold">
                      Devise
                    </Label>
                    <Input
                      id="proj-currency"
                      value={form.currency}
                      onChange={(e) => update("currency", e.target.value.toUpperCase().slice(0, 3))}
                      maxLength={3}
                      placeholder="TND"
                      aria-invalid={Boolean(errors.currency)}
                    />
                    {errors.currency && <p className="text-xs text-destructive">{errors.currency}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proj-percent" className="text-sm font-semibold">
                    Avancement (%)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="proj-percent"
                      type="number"
                      min={0}
                      max={100}
                      value={form.percentComplete}
                      onChange={(e) => update("percentComplete", e.target.value)}
                      className="w-24"
                      aria-invalid={Boolean(errors.percentComplete)}
                    />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={false}
                        animate={{ width: `${Math.min(100, Math.max(0, Number(form.percentComplete) || 0))}%` }}
                        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {Math.min(100, Math.max(0, Number(form.percentComplete) || 0))}%
                    </span>
                  </div>
                  {errors.percentComplete && <p className="text-xs text-destructive">{errors.percentComplete}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="proj-tags" className="text-sm font-semibold">
                    Tags / compétences
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="proj-tags"
                      value={form.tagsInput}
                      onChange={(e) => update("tagsInput", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault()
                          addTagsFromInput()
                        }
                      }}
                      placeholder="Séparez par des virgules : cloud, ai, finance"
                    />
                    <Button type="button" variant="outline" onClick={addTagsFromInput}>
                      Ajouter
                    </Button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {form.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {tag}
                          <button
                            type="button"
                            aria-label={`Retirer ${tag}`}
                            onClick={() => removeTag(tag)}
                            className="rounded-full p-0.5 hover:bg-primary/20"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="proj-desc" className="text-sm font-semibold">
                    Description
                  </Label>
                  <textarea
                    id="proj-desc"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    placeholder="Objectifs, livrables, contexte…"
                    className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  />
                </div>
              </div>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
