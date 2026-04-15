"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  ArrowLeft01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import { Badge } from "@/frontend/components/ui/badge"
import { Button } from "@/frontend/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/frontend/components/ui/chart"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { cn } from "@/frontend/lib/utils"

type Recommendation = "APPROVE" | "REVIEW" | "REJECT"
type DimensionKey = "budget" | "satisfaction" | "activity" | "trackRecord" | "strategicFit"

interface ScoreDimensionResult {
  key: DimensionKey
  label: string
  weight: number
  score: number
  signals: string[]
}

interface PartnerScoreResponse {
  partnerId: number
  partnerName: string
  category: string | null
  finalScore: number
  recommendation: Recommendation
  methodology: string
  breakdown: Record<DimensionKey, number>
  dimensions: ScoreDimensionResult[]
  signals: {
    annualBudgetTnd: number
    avgSatisfaction: number
    recentEvents: number
    meetings: number
    activeOffers: number
    recruitmentsConvertedToCdi: number
    vendorProjects: number
    totalInteractions: number
  }
}

const SCORE_RING_SIZE = 220
const SCORE_RING_STROKE = 16
const SCORE_CIRCLE_RADIUS = (SCORE_RING_SIZE - SCORE_RING_STROKE) / 2
const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_CIRCLE_RADIUS

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const categoryLabels: Record<string, string> = {
  customer: "Client",
  marketing: "Marketing",
  supplier: "Fournisseur",
  university: "Université",
}

const tierPalette: Record<Recommendation, { color: string; soft: string; badge: string; icon: typeof CheckmarkCircle02Icon }> = {
  APPROVE: {
    color: "#2D8C3C",
    soft: "rgba(45, 140, 60, 0.12)",
    badge: "border-[rgba(45,140,60,0.25)] bg-[rgba(45,140,60,0.12)] text-[rgb(45,140,60)] dark:text-[rgb(120,214,135)]",
    icon: CheckmarkCircle02Icon,
  },
  REVIEW: {
    color: "#E5A100",
    soft: "rgba(229, 161, 0, 0.12)",
    badge: "border-[rgba(229,161,0,0.25)] bg-[rgba(229,161,0,0.12)] text-[rgb(171,116,0)] dark:text-[rgb(245,201,88)]",
    icon: AlertCircleIcon,
  },
  REJECT: {
    color: "#D4351C",
    soft: "rgba(212, 53, 28, 0.12)",
    badge: "border-[rgba(212,53,28,0.25)] bg-[rgba(212,53,28,0.12)] text-[rgb(212,53,28)] dark:text-[rgb(255,135,118)]",
    icon: Cancel01Icon,
  },
}

function getScoreTier(score: number): Recommendation {
  if (score >= 75) return "APPROVE"
  if (score >= 50) return "REVIEW"
  return "REJECT"
}

function formatCategory(category: string | null) {
  if (!category) {
    return "Non catégorisé"
  }

  return categoryLabels[category] ?? category
}

function formatWeight(weight: number) {
  return `${weight}% weight`
}

function AnimatedScore({ score, color }: { score: number; color: string }) {
  const shouldReduceMotion = useReducedMotion()
  const motionValue = useMotionValue(0)
  const roundedValue = useTransform(motionValue, (value) => Math.round(value))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const unsubscribe = roundedValue.on("change", (latest) => setDisplayValue(latest))
    return unsubscribe
  }, [roundedValue])

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(score)
      return
    }

    const controls = animate(motionValue, score, {
      duration: 1.1,
      ease: "easeOut",
    })

    return () => controls.stop()
  }, [motionValue, score, shouldReduceMotion])

  const dashOffset = SCORE_CIRCUMFERENCE - (score / 100) * SCORE_CIRCUMFERENCE

  return (
    <div className="relative flex items-center justify-center">
      <svg width={SCORE_RING_SIZE} height={SCORE_RING_SIZE} className="-rotate-90 overflow-visible" role="img" aria-label={`Partner score ${score} out of 100`}>
        <title>{`Partner score ${score} out of 100`}</title>
        <circle
          cx={SCORE_RING_SIZE / 2}
          cy={SCORE_RING_SIZE / 2}
          r={SCORE_CIRCLE_RADIUS}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={SCORE_RING_STROKE}
          className="text-border"
        />
        <motion.circle
          cx={SCORE_RING_SIZE / 2}
          cy={SCORE_RING_SIZE / 2}
          r={SCORE_CIRCLE_RADIUS}
          fill="transparent"
          stroke={color}
          strokeWidth={SCORE_RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={SCORE_CIRCUMFERENCE}
          initial={{ strokeDashoffset: SCORE_CIRCUMFERENCE }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full border border-border/60 bg-card/80 backdrop-blur-sm">
        <span className="text-5xl font-bold tracking-tight tabular-nums" style={{ color }}>
          {displayValue}
        </span>
        <span className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Score / 100
        </span>
      </div>
    </div>
  )
}

export default function PartnerScoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<PartnerScoreResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchScore() {
      setLoading(true)

      try {
        const response = await fetch(`/api/partners/${id}/score`)
        const payload = (await response.json()) as PartnerScoreResponse | { error?: string }

        if (!response.ok || !("finalScore" in payload)) {
          toast.error("Erreur", {
            description: "error" in payload && payload.error ? payload.error : "Impossible de calculer le score partenaire.",
          })
          setData(null)
          return
        }

        setData(payload)
      } catch {
        toast.error("Erreur", {
          description: "Impossible de charger l'explication du score partenaire.",
        })
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchScore()
  }, [id])

  const radarData = useMemo(() => {
    if (!data) {
      return []
    }

    return data.dimensions.map((dimension) => ({
      dimension: dimension.label,
      score: dimension.score,
      fullMark: 100,
    }))
  }, [data])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/partners">
          <Button variant="ghost" size="sm">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-1 w-4 h-4" />
            Retour
          </Button>
        </Link>
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Score partenaire indisponible.
        </div>
      </div>
    )
  }

  const scoreTier = getScoreTier(data.finalScore)
  const palette = tierPalette[scoreTier]
  const RecommendationIcon = palette.icon

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/partners">
            <Button variant="ghost" size="sm" className="mt-1">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-1 w-4 h-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Partner Compatibility Score</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              AI explainability view for the partnership fit assessment.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-7 rounded-full px-3 text-sm">
            {data.partnerName}
          </Badge>
          <Badge variant="outline" className="h-7 rounded-full px-3 text-sm">
            {formatCategory(data.category)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="border-border bg-card/95">
            <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 pb-4">
              <CardTitle className="text-xl">Score summary</CardTitle>
              <CardDescription>
                Weighted across five dimensions to support an approval decision.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:items-center">
              <AnimatedScore score={data.finalScore} color={palette.color} />

              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={cn("h-8 rounded-full border px-3 text-sm font-semibold", palette.badge)}>
                    <HugeiconsIcon icon={RecommendationIcon} className="mr-1.5 h-4 w-4" />
                    {data.recommendation}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {data.methodology}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: "Budget", value: `${data.signals.annualBudgetTnd.toLocaleString("fr-FR")} TND` },
                    { label: "Satisfaction", value: `${data.signals.avgSatisfaction.toLocaleString("fr-FR")} / 100` },
                    { label: "Activity", value: `${data.signals.recentEvents + data.signals.meetings} touchpoints` },
                    { label: "Track record", value: `${data.signals.vendorProjects + data.signals.recruitmentsConvertedToCdi} outcomes` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border/80 bg-muted/30 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <Card className="border-border bg-card/95">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl">Dimension radar</CardTitle>
              <CardDescription>
                Relative performance across budget, satisfaction, activity, track record, and strategic fit.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="mx-auto h-[320px] w-full max-w-[460px] aspect-auto">
                <RadarChart data={radarData} outerRadius="72%">
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => <span className="font-medium">{value}/100</span>} />} />
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: "currentColor", fontSize: 12 }} className="text-muted-foreground" />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke={palette.color}
                    fill={palette.color}
                    fillOpacity={0.24}
                    dot={{ r: 4, fill: palette.color }}
                  />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
      >
        {data.dimensions.map((dimension, index) => (
          <motion.div
            key={dimension.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22 + index * 0.06 }}
          >
            <Card className="h-full border-border bg-card/95">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{dimension.label}</CardTitle>
                    <CardDescription>{formatWeight(dimension.weight)}</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="h-8 rounded-full border px-3 text-sm font-semibold"
                    style={{
                      borderColor: palette.soft,
                      backgroundColor: palette.soft,
                      color: palette.color,
                    }}
                  >
                    {dimension.score}/100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                    <span>Dimension score</span>
                    <span>{dimension.score}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${dimension.score}%` }}
                      transition={{ duration: 0.7, delay: 0.28 + index * 0.05, ease: "easeOut" }}
                      style={{ backgroundColor: palette.color }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Key signals
                  </div>
                  <ul className="space-y-2 text-sm text-foreground">
                    {dimension.signals.map((signal) => (
                      <li key={signal} className="flex gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
                        <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: palette.color }} />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.32 }}
      >
        <Card className="border-border bg-card/95">
          <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 pb-4">
            <CardTitle className="text-xl">Scoring methodology</CardTitle>
            <CardDescription>
              How the AI explainability layer turns partner activity into a recommendation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="text-sm font-semibold text-foreground">1. Weighted dimensions</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Budget, satisfaction, activity, track record, and strategic fit are each normalized to a 0-100 scale, then combined using fixed weights.
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="text-sm font-semibold text-foreground">2. Evidence-based signals</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The score relies on operational data already stored in the platform: KPIs, events, meetings, offers, recruitments, projects, and partner profile metadata.
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="text-sm font-semibold text-foreground">3. Decision thresholds</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Scores from 75-100 are APPROVE, 50-74 are REVIEW, and below 50 are REJECT, helping teams decide whether to progress, validate, or stop the partnership opportunity.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
