"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  AlertCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/frontend/lib/utils"

type StepStatus = "pending" | "in_progress" | "completed" | "blocked"

interface PlanStep {
  id: string
  title: string
  status: StepStatus
  note?: string
}

interface AnalysisPlanProps {
  objective: string
  steps: PlanStep[]
}

const stepIconMap: Record<StepStatus, { icon: typeof Loading03Icon; tone: string; spin?: boolean }> = {
  pending: {
    icon: Loading03Icon,
    tone: "text-muted-foreground/50 bg-muted border-border",
  },
  in_progress: {
    icon: Loading03Icon,
    tone: "text-primary bg-primary/15 border-primary/40",
    spin: true,
  },
  completed: {
    icon: Tick02Icon,
    tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/40",
  },
  blocked: {
    icon: AlertCircleIcon,
    tone: "text-red-600 dark:text-red-400 bg-red-500/15 border-red-500/40",
  },
}

export function AnalysisPlan({ objective, steps }: AnalysisPlanProps) {
  const completedCount = steps.filter((s) => s.status === "completed").length
  const totalCount = steps.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allDone = completedCount === totalCount
  const [open, setOpen] = React.useState(true)

  React.useEffect(() => {
    if (allDone) setOpen(false)
  }, [allDone])

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">Analysis plan</span>
            <span className="text-xs font-medium text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{objective}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
            strokeWidth={2}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60"
          >
            <ol className="space-y-1 p-2">
              {steps.map((step) => {
                const meta = stepIconMap[step.status]
                const Icon = meta.icon
                return (
                  <li
                    key={step.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-2 py-1.5 transition-colors",
                      step.status === "in_progress" && "bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        meta.tone
                      )}
                    >
                      <HugeiconsIcon
                        icon={Icon}
                        className={cn("h-3 w-3", meta.spin && "animate-spin")}
                        strokeWidth={3}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          step.status === "completed" && "text-muted-foreground line-through",
                          step.status === "in_progress" && "font-medium text-foreground",
                          step.status === "pending" && "text-foreground/80",
                          step.status === "blocked" && "text-red-700 dark:text-red-300"
                        )}
                      >
                        {step.title}
                      </p>
                      {step.note && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.note}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
