"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, AnalyticsUpIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

interface MethodologyHeaderProps {
  methodologies: string[]
  rationale?: string
  assumptions?: string[]
}

export function MethodologyHeader({
  methodologies,
  rationale,
  assumptions = [],
}: MethodologyHeaderProps) {
  const hasDetails = Boolean(rationale) || assumptions.length > 0
  const [open, setOpen] = React.useState(hasDetails)

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-2.5 py-1.5">
      <button
        type="button"
        disabled={!hasDetails}
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 text-left",
          hasDetails && "cursor-pointer"
        )}
      >
        <HugeiconsIcon icon={AnalyticsUpIcon} className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.2} />
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Méthode
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {methodologies.map((m) => (
            <span
              key={m}
              className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
            >
              {m}
            </span>
          ))}
        </div>
        {hasDetails && (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
            strokeWidth={2}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-primary/15 pt-3">
              {rationale && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pourquoi ces méthodes
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">{rationale}</p>
                </div>
              )}
              {assumptions.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Hypothèses
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {assumptions.map((a) => (
                      <li
                        key={a}
                        className="flex items-start gap-1.5 text-sm text-foreground/80"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
