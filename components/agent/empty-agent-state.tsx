"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiChat02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { CAPABILITIES } from "./capabilities"
import { PromptStarters } from "./prompt-starters"

interface EmptyAgentStateProps {
  userName?: string | null
  onSelect: (prompt: string) => void
  disabled?: boolean
}

function useGreeting(): string {
  return React.useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 6) return "Bonne nuit"
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon après-midi"
    return "Bonsoir"
  }, [])
}

const EXAMPLE_PROMPTS = CAPABILITIES.slice(0, 3).map((capability) => capability.prompt)

export function EmptyAgentState({ userName, onSelect, disabled }: EmptyAgentStateProps) {
  const greeting = useGreeting()
  const reduceMotion = useReducedMotion()
  const firstName = userName?.trim().split(/\s+/)[0] ?? null

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-[840px] flex-col items-center text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <HugeiconsIcon icon={AiChat02Icon} className="h-5 w-5 text-primary" />
        </div>

        <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="mt-1.5 max-w-md text-pretty text-sm text-muted-foreground">
          Votre analyste partenariat IntelliConnect. Choisissez une capacité ou posez votre question
          — réponses basées uniquement sur vos données réelles.
        </p>

        <PromptStarters onSelect={onSelect} disabled={disabled} className="mt-6" />

        <div className="mt-8 w-full max-w-xl">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Exemples de questions</p>
          <div className="flex flex-col gap-1.5">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSelect(prompt)}
                disabled={disabled}
                className={cn(
                  "w-full truncate rounded-lg border border-border/70 bg-card px-3 py-2 text-left text-sm text-foreground/90 transition-colors",
                  "hover:border-primary/40 hover:bg-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
                title={prompt}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
