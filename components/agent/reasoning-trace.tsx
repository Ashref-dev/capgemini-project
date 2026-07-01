"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiBrain01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface ReasoningTraceProps {
  text: string
  isStreaming?: boolean
  className?: string
}

export function ReasoningTrace({ text, isStreaming, className }: ReasoningTraceProps) {
  // While the model is actively reasoning, expand by default so the live trace
  // is visible; once it settles, collapse to keep the transcript quiet. A manual
  // toggle overrides this automatic behavior.
  const [manualOpen, setManualOpen] = React.useState<boolean | null>(null)
  const open = manualOpen ?? Boolean(isStreaming)
  const trimmed = text.trim()

  if (!trimmed) {
    return null
  }

  return (
    <div className={cn("rounded-lg", className)}>
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <HugeiconsIcon icon={AiBrain01Icon} className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1">{isStreaming ? "Réflexion en cours…" : "Réflexion"}</span>
        {isStreaming ? (
          <span className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-muted-foreground/50"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </span>
        ) : (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="whitespace-pre-wrap border-t border-border/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
              {trimmed}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
