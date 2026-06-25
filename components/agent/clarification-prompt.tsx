"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { HelpCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

interface ClarificationPromptProps {
  question: string
  reason?: string
  options?: string[]
  onSelect?: (answer: string) => void
}

export function ClarificationPrompt({
  question,
  reason,
  options = [],
  onSelect,
}: ClarificationPromptProps) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-warning/15 text-warning">
          <HugeiconsIcon icon={HelpCircleIcon} className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-warning">
            Clarification requise
          </p>
          <p className="text-sm font-medium leading-snug text-foreground">
            {question}
          </p>
          {reason && (
            <p className="text-xs leading-snug text-muted-foreground">
              {reason}
            </p>
          )}
        </div>
      </div>

      {options.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pl-10">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect?.(opt)}
              className={cn(
                "group inline-flex items-center gap-1 rounded-md border bg-background px-3 py-1 text-xs font-medium transition-all",
                "border-warning/40 text-foreground hover:border-warning hover:bg-warning/10",
                "active:scale-95"
              )}
            >
              {opt}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
