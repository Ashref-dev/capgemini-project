"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiChat02Icon,
  PresentationBarChart01Icon,
  AnalyticsUpIcon,
  ChartIncreaseIcon,
  Briefcase01Icon,
  UserMultiple02Icon,
  SparklesIcon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface CapabilityCard {
  icon: typeof AiChat02Icon
  label: string
  description: string
  prompt: string
  tint: string
  iconClass: string
}

const CAPABILITIES: CapabilityCard[] = [
  {
    icon: ChartIncreaseIcon,
    label: "Scoring partenaire",
    description: "Évaluer un partenaire sur 5 dimensions et recommander APPROVE / REVIEW / REJECT.",
    prompt: "Score le partenaire BIAT et dis-moi s'il faut renouveler.",
    tint: "from-blue-500/10 to-blue-500/5",
    iconClass: "text-blue-600 dark:text-blue-300",
  },
  {
    icon: AnalyticsUpIcon,
    label: "Risque de churn",
    description: "Modèle Activity-Decay : qui est en train de décrocher et pourquoi.",
    prompt: "Calcule le risque de churn pour le partenaire id 1 et liste les 3 raisons principales.",
    tint: "from-rose-500/10 to-rose-500/5",
    iconClass: "text-rose-600 dark:text-rose-300",
  },
  {
    icon: Briefcase01Icon,
    label: "Santé des projets",
    description: "Quels projets sont à risque (Red / Yellow) et pourquoi.",
    prompt: "Quels projets sont actuellement à risque ? Montre les pires en premier.",
    tint: "from-amber-500/10 to-amber-500/5",
    iconClass: "text-amber-600 dark:text-amber-300",
  },
  {
    icon: UserMultiple02Icon,
    label: "Recommander un staffing",
    description: "Suggérer les meilleurs employés Capgemini pour un projet donné.",
    prompt: "Recommande le staffing optimal pour le projet 1.",
    tint: "from-emerald-500/10 to-emerald-500/5",
    iconClass: "text-emerald-600 dark:text-emerald-300",
  },
  {
    icon: PresentationBarChart01Icon,
    label: "Rapport portefeuille",
    description: "Génère un rapport markdown synthétique avec graphiques et tableaux.",
    prompt: "Génère un rapport d'aperçu du portefeuille partenaires Q1.",
    tint: "from-violet-500/10 to-violet-500/5",
    iconClass: "text-violet-600 dark:text-violet-300",
  },
  {
    icon: SparklesIcon,
    label: "RAG sur documents",
    description: "Cite les chunks de tes documents partenaires / projets.",
    prompt: "Cherche dans nos documents : quelles sont les conditions de partenariat avec Microsoft Tunisie ?",
    tint: "from-cyan-500/10 to-cyan-500/5",
    iconClass: "text-cyan-600 dark:text-cyan-300",
  },
]

interface AgentEmptyStateProps {
  userName?: string | null
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function AgentEmptyState({ userName, onSelect, disabled }: AgentEmptyStateProps) {
  const greeting = React.useMemo(() => {
    const h = new Date().getHours()
    if (h < 6) return "Bonne nuit"
    if (h < 12) return "Bonjour"
    if (h < 18) return "Bon après-midi"
    return "Bonsoir"
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-blue-500/10 to-emerald-500/10 ring-1 ring-primary/25">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
            animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <HugeiconsIcon icon={Rocket01Icon} className="relative h-5 w-5 text-primary" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          IntelliConnect AI
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {greeting}{userName ? `, ${userName.split(" ")[0]}` : ""} 👋
        </h2>
        <p className="max-w-md text-xs text-muted-foreground">
          Votre analyste partenariat. Choisissez une capacité ou tapez votre question.
        </p>
      </motion.div>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-2 lg:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <motion.button
            type="button"
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06 + i * 0.03, ease: [0.32, 0.72, 0, 1] }}
            onClick={() => onSelect(c.prompt)}
            disabled={disabled}
            className={cn(
              "group relative flex h-full flex-col items-start gap-1.5 overflow-hidden rounded-xl border border-border/60 bg-card p-3 text-left shadow-sm transition-all",
              "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 -z-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                c.tint,
              )}
            />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 ring-1 ring-border/60 transition-transform duration-300 group-hover:scale-105">
              <HugeiconsIcon icon={c.icon} className={cn("h-3.5 w-3.5", c.iconClass)} />
            </div>
            <p className="relative text-xs font-semibold text-foreground">{c.label}</p>
            <p className="relative line-clamp-2 text-[11px] leading-snug text-muted-foreground">{c.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
