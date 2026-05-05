"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiChat02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/frontend/lib/utils"

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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur",
        className,
      )}
      aria-live="polite"
      aria-label="Agent en réflexion"
    >
      <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-blue-500/10 to-emerald-500/10 ring-1 ring-primary/20">
        <motion.div
          className="absolute inset-0 rounded-xl bg-primary/20 blur-md"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <HugeiconsIcon icon={AiChat02Icon} className="relative h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <motion.span
          key={phraseIdx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-foreground via-foreground/70 to-foreground bg-[length:200%_100%] bg-clip-text text-sm font-medium text-transparent"
          style={{ animation: "shimmer 2.4s ease-in-out infinite" }}
        >
          {PHRASES[phraseIdx]}
        </motion.span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1 w-1 rounded-full bg-primary/60"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
        }
      `}</style>
    </motion.div>
  )
}
