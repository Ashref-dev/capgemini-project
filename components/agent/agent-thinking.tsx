"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiChat02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const PHRASES = [
  "Analyse en cours…",
  "Interrogation des données…",
  "Synthèse des résultats…",
  "Construction de la réponse…",
]

export function AgentThinking({ className }: { className?: string }) {
  const [phraseIdx, setPhraseIdx] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setPhraseIdx((i) => (i + 1) % PHRASES.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className={cn("inline-flex items-center gap-2.5 text-sm text-muted-foreground", className)}
      aria-live="polite"
      aria-label="L'agent réfléchit"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
        <HugeiconsIcon icon={AiChat02Icon} className="h-3.5 w-3.5 text-primary" />
      </span>
      <motion.span
        key={phraseIdx}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="font-medium text-foreground"
      >
        {PHRASES[phraseIdx]}
      </motion.span>
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full bg-primary/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </span>
    </div>
  )
}
