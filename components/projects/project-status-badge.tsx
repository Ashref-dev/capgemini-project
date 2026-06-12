"use client"

import { cn } from "@/lib/utils"

export type ProjectStatus = "planned" | "active" | "on_hold" | "done" | "cancelled"
export type ProjectHealth = "R" | "Y" | "G"
export type ProjectPriority = "low" | "medium" | "high" | "critical"

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planifié",
  active: "Actif",
  on_hold: "En pause",
  done: "Terminé",
  cancelled: "Annulé",
}

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  planned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-blue-200/50 dark:ring-blue-800/50",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-emerald-200/50 dark:ring-emerald-800/50",
  on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-amber-200/50 dark:ring-amber-800/50",
  done: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 ring-slate-200/50 dark:ring-slate-700/50",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 ring-rose-200/50 dark:ring-rose-800/50",
}

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

const HEALTH_CLASSES: Record<ProjectHealth, { dot: string; ring: string }> = {
  R: { dot: "bg-red-500", ring: "ring-red-200 dark:ring-red-900/40" },
  Y: { dot: "bg-amber-500", ring: "ring-amber-200 dark:ring-amber-900/40" },
  G: { dot: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-900/40" },
}

const HEALTH_LABELS: Record<ProjectHealth, string> = {
  R: "À risque",
  Y: "Attention",
  G: "Sain",
}

export function ProjectHealthDot({
  health,
  size = "md",
  className,
  withLabel = false,
}: {
  health: ProjectHealth
  size?: "sm" | "md" | "lg"
  className?: string
  withLabel?: boolean
}) {
  const sizeClass = size === "sm" ? "h-2 w-2" : size === "lg" ? "h-3 w-3" : "h-2.5 w-2.5"
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} title={HEALTH_LABELS[health]}>
      <span
        role="img"
        aria-label={HEALTH_LABELS[health]}
        className={cn("inline-block rounded-full ring-2", HEALTH_CLASSES[health].dot, HEALTH_CLASSES[health].ring, sizeClass)}
      />
      {withLabel && <span className="text-xs text-muted-foreground">{HEALTH_LABELS[health]}</span>}
    </span>
  )
}

const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
}

const PRIORITY_CLASSES: Record<ProjectPriority, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-bold uppercase tracking-wider",
}

export function ProjectPriorityBadge({ priority, className }: { priority: ProjectPriority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PRIORITY_CLASSES[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planned", label: "Planifié" },
  { value: "active", label: "Actif" },
  { value: "on_hold", label: "En pause" },
  { value: "done", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
]

export const PRIORITY_OPTIONS: { value: ProjectPriority; label: string }[] = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyen" },
  { value: "high", label: "Élevé" },
  { value: "critical", label: "Critique" },
]

export const HEALTH_OPTIONS: { value: ProjectHealth; label: string }[] = [
  { value: "G", label: "Sain (Green)" },
  { value: "Y", label: "Attention (Yellow)" },
  { value: "R", label: "À risque (Red)" },
]
