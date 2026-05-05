"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { HelpCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/frontend/lib/utils"

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
    <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 p-4 dark:border-amber-400/30 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
          <HugeiconsIcon icon={HelpCircleIcon} className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-300/80">
            Clarification needed
          </p>
          <p className="text-sm font-medium leading-snug text-amber-950 dark:text-amber-50">
            {question}
          </p>
          {reason && (
            <p className="text-xs leading-snug text-amber-800/80 dark:text-amber-200/80">
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
                "group inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs font-medium transition-all",
                "border-amber-500/40 text-amber-900 hover:border-amber-500 hover:bg-amber-500/10",
                "dark:border-amber-400/40 dark:text-amber-100 dark:hover:border-amber-400 dark:hover:bg-amber-400/10",
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
