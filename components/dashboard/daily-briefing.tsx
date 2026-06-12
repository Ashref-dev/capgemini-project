"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  ChartIncreaseIcon,
  Rocket01Icon,
  UserMultiple02Icon,
  Calendar03Icon,
  AnalyticsUpIcon,
  ArrowRight01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

interface BriefingInsight {
  id: string
  icon: "alert" | "trending" | "rocket" | "users" | "calendar" | "sparkle"
  tone: "danger" | "warning" | "success" | "info"
  title: string
  body: string
  href: string | null
  cta: string | null
}

interface DailyBriefing {
  generatedAt: string
  insights: BriefingInsight[]
}

const ICON_MAP = {
  alert: AlertCircleIcon,
  trending: ChartIncreaseIcon,
  rocket: Rocket01Icon,
  users: UserMultiple02Icon,
  calendar: Calendar03Icon,
  sparkle: AnalyticsUpIcon,
} as const

const TONE_TINTS: Record<BriefingInsight["tone"], string> = {
  danger: "bg-red-50 text-red-600 ring-red-200/60 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900/40",
  warning: "bg-amber-50 text-amber-600 ring-amber-200/60 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/40",
  success: "bg-emerald-50 text-emerald-600 ring-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/40",
  info: "bg-blue-50 text-blue-600 ring-blue-200/60 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/40",
}

const TONE_BORDER: Record<BriefingInsight["tone"], string> = {
  danger: "border-red-200/40 dark:border-red-900/30",
  warning: "border-amber-200/40 dark:border-amber-900/30",
  success: "border-emerald-200/40 dark:border-emerald-900/30",
  info: "border-blue-200/40 dark:border-blue-900/30",
}

export function DailyBriefing() {
  const [data, setData] = React.useState<DailyBriefing | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch("/api/dashboard/briefing")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as DailyBriefing
        if (!cancelled) setData(json)
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <section
        aria-busy="true"
        className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-6 w-32 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["sk1", "sk2", "sk3"].map((k) => (
            <div key={k} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      </section>
    )
  }

  if (error || !data || data.insights.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Briefing quotidien
          </span>
          <h2 className="text-sm font-semibold text-foreground">
            Ce qui mérite votre attention aujourd&apos;hui
          </h2>
        </div>
        <HugeiconsIcon
          icon={Loading03Icon}
          aria-hidden
          className="hidden h-3.5 w-3.5 text-muted-foreground opacity-0"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AnimatePresence>
          {data.insights.map((insight, i) => {
            const Icon = ICON_MAP[insight.icon] ?? AnalyticsUpIcon
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                key={`${insight.id}-card`}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-4 transition-all",
                  TONE_BORDER[insight.tone],
                  insight.href && "hover:-translate-y-0.5 hover:shadow-md",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
                      TONE_TINTS[insight.tone],
                    )}
                  >
                    <HugeiconsIcon icon={Icon} className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-tight text-foreground">
                      {insight.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{insight.body}</p>
                  </div>
                </div>
                {insight.href && insight.cta && (
                  <div className="mt-3 flex items-center justify-end">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-transform group-hover:translate-x-0.5">
                      {insight.cta}
                      <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                    </span>
                  </div>
                )}
              </motion.div>
            )
            return insight.href ? (
              <Link key={insight.id} href={insight.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={insight.id}>{card}</div>
            )
          })}
        </AnimatePresence>
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Généré {new Date(data.generatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ·
        IA déterministe (sans hallucinations)
      </p>
    </motion.section>
  )
}
