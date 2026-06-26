"use client"

import { motion, useReducedMotion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { SUGGESTION_PILLS, type CapabilityStarter } from "./capabilities"

interface PromptStartersProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
  className?: string
  starters?: CapabilityStarter[]
}

export function PromptStarters({ onSelect, disabled, className, starters = SUGGESTION_PILLS }: PromptStartersProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        "flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="list"
      aria-label="Suggestions de démonstration"
    >
      {starters.map((capability, index) => (
        <motion.button
          key={capability.id}
          type="button"
          role="listitem"
          onClick={() => onSelect(capability.prompt)}
          disabled={disabled}
          title={capability.description}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: reduceMotion ? 0 : index * 0.04, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          className={cn(
            "group inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            capability.featured
              ? "border-primary/30 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/15"
              : "border-border bg-card text-foreground/90 hover:border-primary/40 hover:bg-accent hover:text-foreground",
          )}
        >
          <HugeiconsIcon
            icon={capability.icon}
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              capability.featured ? "text-primary" : "text-muted-foreground group-hover:text-primary",
            )}
          />
          {capability.label}
        </motion.button>
      ))}
    </div>
  )
}
