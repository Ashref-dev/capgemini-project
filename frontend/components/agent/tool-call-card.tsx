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

import { cn } from "@/frontend/lib/utils"

type ToolCallStatus = "pending" | "success" | "error"

interface ToolCallCardProps {
  toolName: string
  status: ToolCallStatus
  input?: unknown
  output?: unknown
  errorText?: string
  defaultOpen?: boolean
}

const statusMeta: Record<ToolCallStatus, { label: string; tone: string; icon: typeof Loading03Icon }> = {
  pending: {
    label: "Running",
    tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
    icon: Loading03Icon,
  },
  success: {
    label: "Done",
    tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    icon: CheckmarkCircle02Icon,
  },
  error: {
    label: "Failed",
    tone: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
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

function humanizeToolName(name: string): string {
  return name
    .replace(/^(create|get|query|generate|run)/, (m) => m + " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function ToolCallCard({
  toolName,
  status,
  input,
  output,
  errorText,
  defaultOpen = false,
}: ToolCallCardProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const meta = statusMeta[status]
  const Icon = meta.icon

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm transition-colors",
        "border-border/70 hover:border-border"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-3 py-2 text-left"
      >
        <span
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
            meta.tone
          )}
        >
          <HugeiconsIcon
            icon={Icon}
            className={cn("h-3.5 w-3.5", status === "pending" && "animate-spin")}
            strokeWidth={2.5}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-xs font-semibold text-foreground">
              {toolName}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                meta.tone
              )}
            >
              {meta.label}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {humanizeToolName(toolName)}
          </p>
        </div>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60"
          >
            <div className="space-y-2 bg-muted/30 px-3 py-3">
              {status === "error" && errorText && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                  {errorText}
                </div>
              )}
              {input !== undefined && (
                <ToolJsonBlock label="Input" value={input} />
              )}
              {output !== undefined && status === "success" && (
                <ToolJsonBlock label="Output" value={output} />
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
      <pre className="max-h-64 overflow-auto rounded-lg border border-border/60 bg-background/80 p-2.5 text-[11px] leading-relaxed text-foreground">
        <code>{stringifyJson(value)}</code>
      </pre>
    </div>
  )
}
