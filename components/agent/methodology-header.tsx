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
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-3 backdrop-blur-sm">
      <button
        type="button"
        disabled={!hasDetails}
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3 text-left",
          hasDetails && "cursor-pointer"
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <HugeiconsIcon icon={AnalyticsUpIcon} className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            Methodology
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {methodologies.map((m) => (
              <span
                key={m}
                className="inline-flex items-center rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {m}
              </span>
            ))}
          </div>
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
                    Why these methods
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">{rationale}</p>
                </div>
              )}
              {assumptions.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Assumptions
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
