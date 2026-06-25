"use client"

import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { CAPABILITIES } from "./capabilities"

interface PromptStartersProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Compact capability chips. Intentionally flat (no nested cards) so the empty
 * state stays light. Each chip inserts a concrete, ready-to-run prompt.
 */
export function PromptStarters({ onSelect, disabled, className }: PromptStartersProps) {
  return (
    <div
      className={cn("flex flex-wrap justify-center gap-2", className)}
      role="list"
      aria-label="Capacités suggérées"
    >
      {CAPABILITIES.map((capability) => (
        <button
          key={capability.id}
          type="button"
          role="listitem"
          onClick={() => onSelect(capability.prompt)}
          disabled={disabled}
          title={capability.description}
          className={cn(
            "group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5",
            "text-xs font-medium text-foreground/90 transition-colors",
            "hover:border-primary/40 hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <HugeiconsIcon
            icon={capability.icon}
            className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary"
          />
          {capability.label}
        </button>
      ))}
    </div>
  )
}
