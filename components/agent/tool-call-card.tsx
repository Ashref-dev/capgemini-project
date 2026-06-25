"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { getToolLabel } from "@/components/agent/tool-labels"

export type ToolCallStatus = "pending" | "success" | "error"

export interface ToolCallCardProps {
  toolName: string
  status: ToolCallStatus
  input?: unknown
  output?: unknown
  errorText?: string
  defaultOpen?: boolean
}

const statusMeta: Record<ToolCallStatus, { label: string; tone: string; icon: typeof Loading03Icon }> = {
  pending: {
    label: "En cours",
    tone: "text-primary",
    icon: Loading03Icon,
  },
  success: {
    label: "Terminé",
    tone: "text-success",
    icon: CheckmarkCircle02Icon,
  },
  error: {
    label: "Échec",
    tone: "text-destructive",
    icon: AlertCircleIcon,
  },
}

function stringifyJson(value: unknown): string {
  if (value === undefined) return "undefined"
  try {
    return JSON.stringify(value, null, 2) ?? "undefined"
  } catch {
    return String(value)
  }
}

export function ToolCallCard({
  toolName,
  status,
  input,
  output,
  errorText,
  defaultOpen = false,
}: ToolCallCardProps) {
  const meta = statusMeta[status]
  const Icon = meta.icon
  const label = getToolLabel(toolName)

  const hasDetail =
    input !== undefined ||
    (output !== undefined && status === "success") ||
    (status === "error" && Boolean(errorText))

  const [open, setOpen] = React.useState(defaultOpen && hasDetail)

  return (
    <div className="group">
      <button
        type="button"
        disabled={!hasDetail}
        onClick={() => hasDetail && setOpen((o) => !o)}
        aria-expanded={hasDetail ? open : undefined}
        aria-label={`Détail de l'outil ${label} — ${meta.label}`}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          hasDetail && "cursor-pointer hover:bg-muted/50"
        )}
      >
        <HugeiconsIcon
          icon={Icon}
          className={cn("h-3.5 w-3.5 shrink-0", meta.tone, status === "pending" && "animate-spin")}
          strokeWidth={2.5}
        />
        <span className="truncate text-xs font-medium text-foreground">{label}</span>
        <span className={cn("shrink-0 text-[10px] font-medium uppercase tracking-wide", meta.tone)}>
          {meta.label}
        </span>
        {hasDetail && (
          <span className="ml-auto shrink-0">
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
              strokeWidth={2}
            />
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-2 rounded-md bg-muted/40 px-2.5 py-2.5">
              {status === "error" && errorText && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {errorText}
                </div>
              )}
              {input !== undefined && <ToolJsonBlock label="Entrée" value={input} />}
              {output !== undefined && status === "success" && (
                <ToolJsonBlock label="Résultat" value={output} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ToolJsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <pre className="max-h-64 overflow-auto rounded-md bg-background/60 p-2.5 text-[11px] leading-relaxed text-foreground">
        <code>{stringifyJson(value)}</code>
      </pre>
    </div>
  )
}
