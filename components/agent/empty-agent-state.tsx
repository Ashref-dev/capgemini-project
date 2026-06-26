"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiChat02Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"

interface EmptyAgentStateProps {
  userName?: string | null
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

export function EmptyAgentState({ userName }: EmptyAgentStateProps) {
  const greeting = useGreeting()
  const reduceMotion = useReducedMotion()
  const firstName = userName?.trim().split(/\s+/)[0] ?? null

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  }
  const item = reduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
      }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-[640px] flex-col items-center text-center"
      >
        <motion.div variants={item} className="relative">
          {!reduceMotion ? (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl bg-primary/25 blur-xl"
              animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.92, 1.06, 0.92] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <HugeiconsIcon icon={AiChat02Icon} className="h-6 w-6" />
          </div>
        </motion.div>

        <motion.h2
          variants={item}
          className="mt-6 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </motion.h2>

        <motion.p variants={item} className="mt-2 max-w-md text-pretty text-sm leading-6 text-muted-foreground">
          Votre analyste partenariat IntelliConnect. Posez une question ou lancez une démonstration —
          chaque réponse s&apos;appuie uniquement sur vos données réelles.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-7 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80"
        >
          <span>Suggestions sous le champ de saisie</span>
          {!reduceMotion ? (
            <motion.span
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-primary"
            >
              <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5 text-primary" />
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
