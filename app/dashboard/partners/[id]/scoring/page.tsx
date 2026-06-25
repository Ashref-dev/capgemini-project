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

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

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
  return `Pondération ${weight} %`
}

const dimensionLabels: Record<DimensionKey, string> = {
  budget: "Budget",
  satisfaction: "Satisfaction",
  activity: "Activité",
  trackRecord: "Historique",
  strategicFit: "Alignement stratégique",
}

function formatDimensionLabel(dimension: ScoreDimensionResult) {
  return dimensionLabels[dimension.key] ?? dimension.label
}

const radarDimensionLabels: Record<DimensionKey, string> = {
  budget: "Budget",
  satisfaction: "Satisfaction",
  activity: "Activité",
  trackRecord: "Historique",
  strategicFit: "Stratégie",
}

function formatRadarLabel(dimension: ScoreDimensionResult) {
  return radarDimensionLabels[dimension.key] ?? dimension.label
}

const recommendationLabels: Record<Recommendation, string> = {
  APPROVE: "Approuver",
  REVIEW: "À revoir",
  REJECT: "Rejeter",
}

// Localize the English signal strings from scoring.ts at render time only (its logic must not change).
const SIGNAL_LABEL_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ["Scoring cap reached at 200,000 TND reference budget", "Plafond de score atteint à 200 000 TND de budget de référence"],
  ["Annual budget:", "Budget annuel :"],
  ["Current partner level:", "Niveau de partenaire actuel :"],
  ["Average satisfaction:", "Satisfaction moyenne :"],
  ["Signals used:", "Signaux utilisés :"],
  ["Latest KPI satisfaction:", "Satisfaction KPI récente :"],
  ["Recent events:", "Événements récents :"],
  ["Meetings logged:", "Réunions enregistrées :"],
  ["Active offers:", "Offres actives :"],
  ["KPI interactions:", "Interactions KPI :"],
  ["Vendor projects:", "Projets fournisseur :"],
  ["Recruitments converted to CDI:", "Recrutements convertis en CDI :"],
  ["Conversion rate:", "Taux de conversion :"],
  ["Category:", "Catégorie :"],
  ["Status/level:", "Statut/niveau :"],
  ["Strategic boosts:", "Atouts stratégiques :"],
]

const SIGNAL_VALUE_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bNot defined\b/g, "Non défini"],
  [/\bUnavailable\b/g, "Indisponible"],
  [/\bUnspecified\b/g, "Non précisé"],
  [/\bDedicated support\b/g, "Support dédié"],
  [/\bFramework agreement\b/g, "Convention cadre"],
  [/\bNo additional boosts\b/g, "Aucun atout supplémentaire"],
  [/\brecent notifications\b/g, "notifications récentes"],
  [/\brecent notification\b/g, "notification récente"],
  [/\bsupplier\b/gi, "Fournisseur"],
  [/\bcustomer\b/gi, "Client"],
  [/\buniversity\b/gi, "Université"],
  [/\bmarketing\b/gi, "Marketing"],
  [/\bplatinum\b/gi, "Platine"],
  [/\bgold\b/gi, "Or"],
  [/\bsilver\b/gi, "Argent"],
  [/\bbronze\b/gi, "Bronze"],
  [/\ben_negociation\b/gi, "En négociation"],
  [/\binactif\b/gi, "Inactif"],
  [/\bactif\b/gi, "Actif"],
  [/\btermine\b/gi, "Terminé"],
]

function translateScoreSignal(signal: string): string {
  let result = signal
  for (const [from, to] of SIGNAL_LABEL_REPLACEMENTS) {
    result = result.split(from).join(to)
  }
  for (const [pattern, replacement] of SIGNAL_VALUE_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }
  return result
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
      <svg width={SCORE_RING_SIZE} height={SCORE_RING_SIZE} className="-rotate-90 overflow-visible" role="img" aria-label={`Score partenaire ${score} sur 100`}>
        <title>{`Score partenaire ${score} sur 100`}</title>
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
      <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full border border-border/60 bg-card">
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
      dimension: formatRadarLabel(dimension),
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
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
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
            <h1 className="text-2xl font-bold">Score de compatibilité partenaire</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vue explicative de l&apos;IA pour l&apos;évaluation de l&apos;adéquation du partenariat.
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
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl">Synthèse du score</CardTitle>
              <CardDescription>
                Pondéré sur cinq dimensions pour appuyer une décision d&apos;approbation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-stretch lg:gap-8">
              <div className="flex items-center justify-center">
                <AnimatedScore score={data.finalScore} color={palette.color} />
              </div>

              <div className="flex min-w-0 flex-col gap-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Badge className={cn("h-8 rounded-full border px-3 text-sm font-semibold", palette.badge)}>
                    <HugeiconsIcon icon={RecommendationIcon} className="mr-1.5 h-4 w-4" />
                    {recommendationLabels[data.recommendation]}
                  </Badge>
                  <span className="min-w-0 text-sm text-muted-foreground">
                    {data.methodology}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:flex-1 lg:auto-rows-fr">
                  {[
                    {
                      label: "Budget",
                      value: data.signals.annualBudgetTnd.toLocaleString("fr-FR"),
                      unit: "TND",
                    },
                    {
                      label: "Satisfaction",
                      value: data.signals.avgSatisfaction.toLocaleString("fr-FR"),
                      unit: "/ 100",
                    },
                    {
                      label: "Activité",
                      value: (data.signals.recentEvents + data.signals.meetings).toLocaleString("fr-FR"),
                      unit: "points de contact",
                    },
                    {
                      label: "Historique",
                      value: (data.signals.vendorProjects + data.signals.recruitmentsConvertedToCdi).toLocaleString("fr-FR"),
                      unit: "résultats",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex min-w-0 flex-col justify-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 p-3"
                    >
                      <div className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </div>
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1">
                        <span className="text-base font-semibold tabular-nums text-foreground">
                          {item.value}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">{item.unit}</span>
                      </div>
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
              <CardTitle className="text-xl">Radar des dimensions</CardTitle>
              <CardDescription>
                Performance relative sur le budget, la satisfaction, l&apos;activité, l&apos;historique et l&apos;alignement stratégique.
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
                    <CardTitle>{formatDimensionLabel(dimension)}</CardTitle>
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
                    <span>Score de la dimension</span>
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
                    Signaux clés
                  </div>
                  <ul className="space-y-2 text-sm text-foreground">
                    {dimension.signals.map((signal) => (
                      <li key={signal} className="flex gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
                        <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: palette.color }} />
                        <span>{translateScoreSignal(signal)}</span>
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
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-xl">Méthodologie de scoring</CardTitle>
            <CardDescription>
              Comment la couche d&apos;explicabilité IA transforme l&apos;activité du partenaire en recommandation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
            <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
              <div className="text-sm font-semibold text-foreground">1. Dimensions pondérées</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Le budget, la satisfaction, l&apos;activité, l&apos;historique et l&apos;alignement stratégique sont chacun normalisés sur une échelle de 0 à 100, puis combinés selon des pondérations fixes.
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
              <div className="text-sm font-semibold text-foreground">2. Signaux fondés sur des preuves</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Le score s&apos;appuie sur les données opérationnelles déjà présentes dans la plateforme : KPIs, événements, réunions, offres, recrutements, projets et métadonnées du profil partenaire.
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
              <div className="text-sm font-semibold text-foreground">3. Seuils de décision</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Un score de 75 à 100 vaut « Approuver », de 50 à 74 « À revoir », et en dessous de 50 « Rejeter », ce qui aide les équipes à décider de poursuivre, valider ou arrêter l&apos;opportunité de partenariat.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
