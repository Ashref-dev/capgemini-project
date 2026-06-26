"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AnalyticsUpIcon,
  ArrowDown01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  AlertCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  selectCurrentStep,
  type PlanModel,
  type PlanStep,
  type StepStatus,
} from "./plan-selector"

interface PlanHudProps {
  plan: PlanModel | null
}

/**
 * Discriminated union describing the floating HUD's visibility mode.
 * `collapsed` is the default compact pill, `expanded` reveals the full
 * checklist, and `hidden` reduces the HUD to a single re-open chip so plan
 * visibility is never permanently lost.
 */
type HudState =
  | { kind: "collapsed" }
  | { kind: "expanded" }
  | { kind: "hidden" }

const stepIconMap: Record<
  StepStatus,
  { icon: typeof Loading03Icon; tone: string; spin?: boolean }
> = {
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
    tone: "text-success bg-success/15 border-success/40",
  },
  blocked: {
    icon: AlertCircleIcon,
    tone: "text-destructive bg-destructive/15 border-destructive/40",
  },
}

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-card"

export function PlanHud({ plan }: PlanHudProps) {
  const reduceMotion = useReducedMotion()
  const [state, setState] = React.useState<HudState>({ kind: "collapsed" })

  if (plan === null) {
    return null
  }

  const { step, index, total, completed, done } = selectCurrentStep(plan)
  const progress = total > 0 ? (completed / total) * 100 : 0
  const currentStatus: StepStatus = step?.status ?? "pending"

  // Reveal animation tuned for floating overlay; suppressed under reduced motion.
  const collapseTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: "easeOut" as const }
  const progressTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const }
  const expandInitial = reduceMotion
    ? { height: "auto", opacity: 1 }
    : { height: 0, opacity: 0 }
  const expandExit = reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }

  const leadIcon =
    currentStatus === "blocked"
      ? AlertCircleIcon
      : done && currentStatus !== "in_progress"
        ? CheckmarkCircle02Icon
        : currentStatus === "completed"
          ? CheckmarkCircle02Icon
          : Loading03Icon
  const leadSpin = currentStatus === "in_progress"
  const leadTone =
    currentStatus === "blocked"
      ? "text-destructive bg-destructive/15"
      : done
        ? "text-success bg-success/15"
        : "text-primary bg-primary/15"

  // ----- HIDDEN: a single re-open chip -----------------------------------
  if (state.kind === "hidden") {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={collapseTransition}
        className="w-fit"
      >
        <button
          type="button"
          aria-label="Rouvrir le plan"
          onClick={() => setState({ kind: "collapsed" })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border bg-card/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/40",
            FOCUS_RING
          )}
        >
          <HugeiconsIcon
            icon={AnalyticsUpIcon}
            className="h-3.5 w-3.5 shrink-0 text-primary"
            strokeWidth={2.2}
          />
          <span>Plan</span>
          <span className="font-semibold text-muted-foreground">
            {completed}/{total}
          </span>
        </button>
      </motion.div>
    )
  }

  const expanded = state.kind === "expanded"

  // ----- COLLAPSED / EXPANDED share the pill header ----------------------
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={collapseTransition}
      className="w-[min(20rem,calc(100%-1.5rem))] overflow-hidden rounded-lg border border-border bg-card/95 shadow-sm"
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            leadTone
          )}
          aria-hidden="true"
        >
          <HugeiconsIcon
            icon={leadIcon}
            className={cn("h-4 w-4", leadSpin && "animate-spin")}
            strokeWidth={2.4}
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Plan d&apos;analyse
            </span>
            {done ? (
              <span className="inline-flex items-center rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                Terminé
              </span>
            ) : (
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {index + 1}/{total}
              </span>
            )}
          </div>
          <p
            className="mt-0.5 truncate text-sm font-medium leading-snug text-foreground"
            title={step?.title ?? "Plan terminé"}
          >
            {step?.title ?? "Plan terminé"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label={expanded ? "Réduire le plan" : "Afficher le plan"}
            aria-expanded={expanded}
            onClick={() =>
              setState({ kind: expanded ? "collapsed" : "expanded" })
            }
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
              FOCUS_RING
            )}
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={cn(
                "h-4 w-4 transition-transform",
                expanded && "rotate-180"
              )}
              strokeWidth={2}
            />
          </button>
          <button
            type="button"
            aria-label="Masquer le plan"
            onClick={() => setState({ kind: "hidden" })}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
              FOCUS_RING
            )}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Thin progress bar — completed / total */}
      <div className="h-1 w-full overflow-hidden bg-muted">
        <motion.div
          className={cn("h-full", done ? "bg-success" : "bg-primary")}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={progressTransition}
        />
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={expandInitial}
            animate={{ height: "auto", opacity: 1 }}
            exit={expandExit}
            transition={collapseTransition}
            className="overflow-hidden border-t border-border/60"
          >
            <ol className="max-h-[18rem] space-y-0.5 overflow-y-auto p-2">
              {plan.steps.map((planStep: PlanStep) => {
                const meta = stepIconMap[planStep.status]
                const Icon = meta.icon
                return (
                  <li
                    key={planStep.id}
                    className={cn(
                      "flex items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors",
                      planStep.status === "in_progress" && "bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        meta.tone
                      )}
                      aria-hidden="true"
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
                          "text-[13px] leading-snug",
                          planStep.status === "completed" &&
                            "text-muted-foreground line-through",
                          planStep.status === "in_progress" &&
                            "font-medium text-foreground",
                          planStep.status === "pending" && "text-foreground/80",
                          planStep.status === "blocked" &&
                            "text-destructive"
                        )}
                      >
                        {planStep.title}
                      </p>
                      {planStep.note && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {planStep.note}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>

            <div className="flex justify-end border-t border-border/60 px-2 py-1.5">
              <button
                type="button"
                aria-label="Réduire le plan"
                onClick={() => setState({ kind: "collapsed" })}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
                  FOCUS_RING
                )}
              >
                <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5 rotate-180" strokeWidth={2} />
                Réduire
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
