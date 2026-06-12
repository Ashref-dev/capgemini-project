"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AnalyticsUpIcon, DashboardSquare01Icon,
  UserGroupIcon, Calendar03Icon, Folder01Icon, MortarboardIcon,
  MoneyBag02Icon, ChartLineData03Icon, ChartIncreaseIcon,
} from "@hugeicons/core-free-icons"
import { SparklesText } from "@/components/ui/sparkles-text"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface BIData {
  byCategory: { partner_category: string; count: string }[]
  byStatus: { statut_partenariat: string; count: string }[]
  byLevel: { partnership_level: string; count: string }[]
  topRevenue: { name: string; partner_category: string; annual_revenue_generated: string; satisfaction_score: string }[]
  eventsSummary: { total_events: string; total_participants: string; total_budget: string; total_revenue: string }
  projectsSummary: { total_projects: string; total_value: string; avg_satisfaction: string }
  recruitmentSummary: { total_students: string; total_cdi: string; avg_satisfaction: string }
}

// ─── DualBarChart — ActivityStatsCard style ──────────────────────────────────
function DualBarChart({
  data, labelKey, valueKey, primaryColor, secondaryColor,
}: {
  data: Record<string, string>[]
  labelKey: string
  valueKey: string
  primaryColor: string
  secondaryColor: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1)
  const total = data.reduce((acc, d) => acc + (Number(d[valueKey]) || 0), 0)
  return (
    <div className="space-y-0.5">
      {data.map((d, i) => {
        const current = Number(d[valueKey]) || 0
        const prevRatio = 0.58 + (i % 5) * 0.07
        const previous = Math.round(current * prevRatio)
        const pct = Math.max((current / max) * 100, 6)
        const prevPct = Math.max((previous / max) * 100, 4)
        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors cursor-default",
              hovered === i ? "bg-muted/70" : "hover:bg-muted/30"
            )}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="text-xs font-medium w-28 truncate text-right text-muted-foreground capitalize shrink-0">
              {d[labelKey] || "N/A"}
            </span>
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", primaryColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", secondaryColor)}
                  style={{ width: `${prevPct}%` }}
                />
              </div>
            </div>
            <span className={cn(
              "text-xs font-bold w-7 text-right shrink-0 tabular-nums transition-colors",
              hovered === i ? "text-foreground" : "text-muted-foreground"
            )}>{current}</span>
          </div>
        )
      })}
      <div className="pt-2 border-t border-border/50 flex justify-between text-xs px-2 mt-1">
        <span className="text-muted-foreground">Total</span>
        <span className="font-bold text-foreground">{total.toLocaleString("fr-FR")}</span>
      </div>
    </div>
  )
}

// ─── Top 10 Revenue — horizontal bars, CleanWireframe inspired ───────────────
function RevenueBarChart({
  data,
}: {
  data: { name: string; partner_category: string; annual_revenue_generated: string; satisfaction_score: string }[]
}) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  const sorted = [...data].sort(
    (a, b) => Number(b.annual_revenue_generated) - Number(a.annual_revenue_generated)
  )
  const maxVal = Math.max(...sorted.map((d) => Number(d.annual_revenue_generated) || 0), 1)
  const total = sorted.reduce((acc, d) => acc + (Number(d.annual_revenue_generated) || 0), 0)
  const avg = sorted.length > 0 ? total / sorted.length : 0
  const peak = Number(sorted[0]?.annual_revenue_generated) || 0

  const barPalette = [
    { gradient: "from-blue-500 to-blue-400",      label: "text-blue-500" },
    { gradient: "from-violet-500 to-violet-400",  label: "text-violet-500" },
    { gradient: "from-cyan-500 to-cyan-400",      label: "text-cyan-500" },
    { gradient: "from-amber-500 to-amber-400",    label: "text-amber-500" },
    { gradient: "from-emerald-500 to-emerald-400",label: "text-emerald-500" },
    { gradient: "from-indigo-500 to-indigo-400",  label: "text-indigo-500" },
    { gradient: "from-rose-500 to-rose-400",      label: "text-rose-500" },
    { gradient: "from-orange-500 to-orange-400",  label: "text-orange-500" },
    { gradient: "from-teal-500 to-teal-400",      label: "text-teal-500" },
    { gradient: "from-pink-500 to-pink-400",      label: "text-pink-500" },
  ]

  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(maxVal * r))

  const metrics = [
    { label: "Pic de revenu",  value: formatTND(peak),  border: "border-blue-500",    dot: "bg-blue-500" },
    { label: "Revenu moyen",   value: formatTND(avg),   border: "border-amber-500",   dot: "bg-amber-500" },
    { label: "Total revenus",  value: formatTND(total), border: "border-emerald-500", dot: "bg-emerald-500" },
  ]

  return (
    <div className="space-y-4">
      {/* Bars */}
      <div className="space-y-0.5">
        {sorted.map((p, i) => {
          const val = Number(p.annual_revenue_generated) || 0
          const pct = Math.max((val / maxVal) * 100, 1.5)
          const palette = barPalette[i % barPalette.length]
          const sat = p.satisfaction_score ? Number(p.satisfaction_score).toFixed(1) : null
          const isHovered = hoveredBar === i
          return (
            <div
              key={i}
              className={cn(
                "relative flex items-center gap-3 px-2 py-2 rounded-lg transition-colors cursor-default",
                isHovered ? "bg-muted/70" : "hover:bg-muted/30"
              )}
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Name column */}
              <div className="w-44 shrink-0 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground w-5 shrink-0 tabular-nums">#{i + 1}</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate leading-tight">{p.name}</div>
                  <div className={cn("text-[10px] truncate leading-tight", palette.label)}>{p.partner_category}</div>
                </div>
              </div>

              {/* Bar */}
              <div className="flex-1 relative">
                <div className="h-6 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r", palette.gradient)}
                    style={{
                      width: animated ? `${pct}%` : "0%",
                      transition: `width ${700 + i * 60}ms cubic-bezier(0.4,0,0.2,1) ${i * 50}ms`,
                    }}
                  />
                </div>
              </div>

              {/* Value + satisfaction */}
              <div className="w-28 text-right shrink-0">
                <div className={cn("text-xs font-bold tabular-nums transition-colors", isHovered ? palette.label : "text-muted-foreground")}>
                  {formatTND(val)}
                </div>
                {sat && (
                  <div className="text-[10px] text-muted-foreground tabular-nums">★ {sat}/10</div>
                )}
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-20 bg-popover border border-border text-popover-foreground rounded-lg px-3 py-1.5 shadow-xl text-xs whitespace-nowrap pointer-events-none">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-muted-foreground ml-2">{formatTND(val)}</span>
                  {sat && <span className="ml-1 text-muted-foreground">· ★ {sat}/10</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[9px] text-muted-foreground border-t border-border/30 pt-1.5 ml-48 mr-28 tabular-nums">
        {xTicks.map((t, i) => (
          <span key={i}>{t === 0 ? "0" : formatTND(t)}</span>
        ))}
      </div>

      {/* Metrics cards */}
      <div className="flex gap-3 pt-1">
        {metrics.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-xl border-2 bg-card p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-md",
              m.border
            )}
          >
            <div className={cn("w-2 h-2 rounded-full mb-2", m.dot)} />
            <div className="text-base font-bold text-foreground leading-tight">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatNum(n: string | number | null) {
  if (!n) return "0"
  const num = Number(n)
  if (isNaN(num)) return "0"
  return num.toLocaleString("fr-FR")
}

function formatTND(n: string | number | null) {
  if (!n) return "0 TND"
  const num = Number(n)
  if (isNaN(num)) return "0 TND"
  return num.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " TND"
}

// ─── KPI Card colors ─────────────────────────────────────────────────────────
const kpiColors = {
  blue:    { stroke: "#3B82F6", iconBg: "bg-blue-500/10",    iconText: "text-blue-500",    topBar: "from-blue-500 to-blue-400",     borderHover: "group-hover:border-blue-400/50",    bgAccent: "from-blue-500/5" },
  violet:  { stroke: "#8B5CF6", iconBg: "bg-violet-500/10",  iconText: "text-violet-500",  topBar: "from-violet-500 to-violet-400", borderHover: "group-hover:border-violet-400/50",  bgAccent: "from-violet-500/5" },
  cyan:    { stroke: "#06B6D4", iconBg: "bg-cyan-500/10",    iconText: "text-cyan-500",    topBar: "from-cyan-500 to-cyan-400",     borderHover: "group-hover:border-cyan-400/50",    bgAccent: "from-cyan-500/5" },
  amber:   { stroke: "#F59E0B", iconBg: "bg-amber-500/10",   iconText: "text-amber-500",   topBar: "from-amber-500 to-amber-400",   borderHover: "group-hover:border-amber-400/50",   bgAccent: "from-amber-500/5" },
  emerald: { stroke: "#22C55E", iconBg: "bg-emerald-500/10", iconText: "text-emerald-500", topBar: "from-emerald-500 to-emerald-400",borderHover: "group-hover:border-emerald-400/50", bgAccent: "from-emerald-500/5" },
  indigo:  { stroke: "#6366F1", iconBg: "bg-indigo-500/10",  iconText: "text-indigo-500",  topBar: "from-indigo-500 to-indigo-400", borderHover: "group-hover:border-indigo-400/50",  bgAccent: "from-indigo-500/5" },
  rose:    { stroke: "#F43F5E", iconBg: "bg-rose-500/10",    iconText: "text-rose-500",    topBar: "from-rose-500 to-rose-400",     borderHover: "group-hover:border-rose-400/50",    bgAccent: "from-rose-500/5" },
} as const
type KPIColor = keyof typeof kpiColors

// ─── Smooth SVG path helper ───────────────────────────────────────────────────
function _generateSmoothPath(points: number[], width: number, height: number): string {
  if (!points || points.length < 2) return `M 0 ${height}`
  const xStep = width / (points.length - 1)
  const coords = points.map((p, i) => ({
    x: i * xStep,
    y: height - (p / 100) * (height * 0.8) - height * 0.1,
  }))
  let path = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const { x: x1, y: y1 } = coords[i]
    const { x: x2, y: y2 } = coords[i + 1]
    const midX = (x1 + x2) / 2
    path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`
  }
  return path
}

// ─── Unified KPI Card ─────────────────────────────────────────────────────────
function KPICard({
  label, value, sub, subPositive, icon, color, chartData, gradId, href,
}: {
  label: string; value: string; sub?: string; subPositive?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; color: KPIColor
  chartData: number[]; gradId: string; href?: string
}) {
  const lineRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const W = 120, H = 48
  const linePath = useMemo(() => _generateSmoothPath(chartData, W, H), [chartData])
  const areaPath = useMemo(
    () => (linePath.startsWith("M") ? `${linePath} L ${W} ${H} L 0 ${H} Z` : ""),
    [linePath]
  )
  const { stroke, iconBg, iconText, topBar, borderHover, bgAccent } = kpiColors[color]

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)
  const rotateX = useTransform(springY, [-0.5, 0.5], ["6deg", "-6deg"])
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-6deg", "6deg"])

  useEffect(() => {
    const path = lineRef.current
    const area = areaRef.current
    if (!path || !area) return
    const len = path.getTotalLength()
    path.style.transition = "none"
    path.style.strokeDasharray = `${len} ${len}`
    path.style.strokeDashoffset = `${len}`
    area.style.transition = "none"
    area.style.opacity = "0"
    path.getBoundingClientRect()
    path.style.transition = "stroke-dashoffset 1.2s ease-in-out"
    path.style.strokeDashoffset = "0"
    area.style.transition = "opacity 1.2s ease-in-out 0.3s"
    area.style.opacity = "1"
  }, [linePath])

  return (
    <motion.div style={{ perspective: "1000px" }} className="group">
      <motion.div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
          mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
        }}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "relative flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden",
          "transition-[border-color,box-shadow] duration-300 hover:shadow-lg dark:hover:shadow-black/30",
          borderHover
        )}
      >
        {/* Colored top bar matching the curve color */}
        <div className={cn("h-[3px] bg-gradient-to-r shrink-0", topBar)} />
        {/* Subtle bg accent wash */}
        <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-50 pointer-events-none", bgAccent)} />

        <div className="relative z-10 p-5 flex-1 space-y-3" style={{ transform: "translateZ(12px)", transformStyle: "preserve-3d" }}>
          {/* Header: icône + label + mini courbe */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110", iconBg)}>
                <HugeiconsIcon icon={icon} className={cn("w-4 h-4", iconText)} />
              </div>
              <span className="text-sm font-medium text-muted-foreground truncate">{label}</span>
            </div>
            <div className="shrink-0" style={{ width: 80, height: 40 }}>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path ref={areaRef} d={areaPath} fill={`url(#${gradId})`} />
                <path ref={lineRef} d={linePath} fill="none" stroke={stroke} strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          {/* Grande valeur */}
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          {/* Sous-info */}
          {sub && (
            <span className={cn(
              "text-sm font-medium",
              subPositive === true  ? "text-emerald-600 dark:text-emerald-400" :
              subPositive === false ? "text-red-500 dark:text-red-400"         : "text-muted-foreground"
            )}>
              {sub}
            </span>
          )}
        </div>
        {href && (
          <div className="relative z-10 flex justify-end border-t border-border">
            <Link href={href} className="px-5 py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Voir plus →
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function BIDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<BIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "powerbi">("overview")
  const [powerbiUrls, setPowerbiUrls] = useState<{ label: string; url: string }[]>([
    { label: "Dashboard Partenariats", url: "" },
  ])
  const [newLabel, setNewLabel] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [selectedPBI, setSelectedPBI] = useState(0)

  const fetchBI = useCallback(async () => {
    try {
      const res = await fetch("/api/bi")
      const json = await res.json()
      if (res.ok) setData(json)
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les données BI" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBI()
  }, [fetchBI])

  if (!user) return null

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Données indisponibles</div>
  }

  const isAnalyst = user?.role === "analyst"

  const totalPartners = data.byCategory.reduce((acc, c) => acc + Number(c.count), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={AnalyticsUpIcon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Dashboard BI" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-1">Vue d&apos;ensemble depuis le Data Warehouse</p>
          </div>
        </div>
        <div className="flex items-center bg-white/60 dark:bg-white/5 border border-blue-100 dark:border-white/10 rounded-2xl p-1.5 gap-1.5 shadow-sm backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold transition-all duration-200",
              activeTab === "overview"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
            )}
          >
            <HugeiconsIcon icon={AnalyticsUpIcon} className="w-4 h-4" />
            Vue d&apos;ensemble
          </button>
          <button
            onClick={() => setActiveTab("powerbi")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold transition-all duration-200",
              activeTab === "powerbi"
                ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md shadow-violet-500/25"
                : "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
            )}
          >
            <HugeiconsIcon icon={DashboardSquare01Icon} className="w-4 h-4" />
            Power BI
          </button>
        </div>
      </div>

      {activeTab === "powerbi" ? (
        <div className="space-y-6">
          {/* PowerBI Dashboard List */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={DashboardSquare01Icon} className="w-5 h-5 text-primary" />
                Dashboards Power BI
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Intégrez vos dashboards Power BI en collant l&apos;URL d&apos;intégration (Publish to web)
              </p>
            </div>

            {/* Tab list for multiple dashboards */}
            {powerbiUrls.length > 0 && (
              <div className="flex gap-1 p-3 border-b border-border bg-muted/30 overflow-x-auto">
                {powerbiUrls.map((pbi, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPBI(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedPBI === i
                        ? "bg-blue-600 text-white"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {pbi.label || `Dashboard ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Iframe display */}
            <div className="p-4">
              {powerbiUrls[selectedPBI]?.url ? (
                <div className="rounded-lg overflow-hidden border border-border">
                  <iframe
                    title={powerbiUrls[selectedPBI].label}
                    src={powerbiUrls[selectedPBI].url}
                    className="w-full border-0"
                    style={{ height: "600px" }}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <HugeiconsIcon icon={DashboardSquare01Icon} className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Aucun dashboard configuré</p>
                  <p className="text-xs mt-1">Ajoutez une URL Power BI &quot;Publish to web&quot; ci-dessous</p>
                </div>
              )}
            </div>
          </div>

          {/* Add new dashboard - Analyst only */}
          {isAnalyst && (
          <div className="border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Ajouter un dashboard Power BI</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nom du dashboard</Label>
                <Input
                  placeholder="Ex: Suivi Partenariats"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">URL d&apos;intégration Power BI</Label>
                <Input
                  placeholder="https://app.powerbi.com/view?r=..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!newUrl.trim()) {
                    toast.error("L'URL est requise")
                    return
                  }
                  setPowerbiUrls((urls) => [...urls, { label: newLabel || `Dashboard ${urls.length + 1}`, url: newUrl.trim() }])
                  setSelectedPBI(powerbiUrls.length)
                  setNewLabel("")
                  setNewUrl("")
                  toast.success("Dashboard ajouté")
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors h-auto"
              >
                Ajouter
              </Button>
              {powerbiUrls.length > 0 && powerbiUrls[selectedPBI]?.url && (
                <button
                  className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => {
                    setPowerbiUrls((urls) => urls.filter((_, i) => i !== selectedPBI))
                    setSelectedPBI(0)
                    toast.info("Dashboard supprimé")
                  }}
                >
                  Supprimer le dashboard sélectionné
                </button>
              )}
            </div>
          </div>
          )}
        </div>
      ) : (
        <>

      {/* ── KPI cards Row 1 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total partenaires"
          value={formatNum(totalPartners)}
          sub={`${formatNum(data.byStatus.find(s => s.statut_partenariat === "actif")?.count || 0)} actifs`}
          subPositive
          icon={UserGroupIcon} color="blue"
          chartData={[55, 60, 58, 68, 65, 75, 72]}
          gradId="bi-partners"
          href="/dashboard/partners"
        />
        <KPICard
          label="Événements"
          value={formatNum(data.eventsSummary.total_events)}
          sub={`${formatNum(data.eventsSummary.total_participants)} participants`}
          icon={Calendar03Icon} color="violet"
          chartData={[30, 45, 38, 55, 42, 62, 50]}
          gradId="bi-events"
          href="/dashboard/events"
        />
        <KPICard
          label="Projets"
          value={formatNum(data.projectsSummary.total_projects)}
          sub={formatTND(data.projectsSummary.total_value)}
          icon={Folder01Icon} color="cyan"
          chartData={[20, 32, 28, 42, 35, 50, 44]}
          gradId="bi-projects"
          href="/dashboard/partners"
        />
        <KPICard
          label="Étudiants recrutés"
          value={formatNum(data.recruitmentSummary.total_students)}
          sub={`${formatNum(data.recruitmentSummary.total_cdi)} CDI`}
          subPositive
          icon={MortarboardIcon} color="amber"
          chartData={[40, 36, 50, 46, 60, 56, 68]}
          gradId="bi-students"
          href="/dashboard/hr/recruitments"
        />
      </div>

      {/* ── KPI cards Row 2 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          label="Budget événements"
          value={formatTND(data.eventsSummary.total_budget)}
          sub={`Revenu : ${formatTND(data.eventsSummary.total_revenue)}`}
          subPositive
          icon={MoneyBag02Icon} color="emerald"
          chartData={[40, 52, 48, 65, 58, 72, 68]}
          gradId="bi-budget"
          href="/dashboard/events"
        />
        <KPICard
          label="Satisfaction projets"
          value={`${Number(data.projectsSummary.avg_satisfaction || 0).toFixed(1)}/10`}
          sub="Score moyen"
          subPositive={Number(data.projectsSummary.avg_satisfaction || 0) >= 7}
          icon={ChartLineData03Icon} color="indigo"
          chartData={[60, 65, 58, 72, 68, 76, 80]}
          gradId="bi-sat-proj"
          href="/dashboard/partners"
        />
        <KPICard
          label="Satisfaction recrutement"
          value={`${Number(data.recruitmentSummary.avg_satisfaction || 0).toFixed(1)}/10`}
          sub="Score moyen"
          subPositive={Number(data.recruitmentSummary.avg_satisfaction || 0) >= 7}
          icon={ChartIncreaseIcon} color="rose"
          chartData={[55, 60, 52, 68, 62, 74, 78]}
          gradId="bi-sat-rec"
          href="/dashboard/hr/recruitments"
        />
      </div>

      {/* ── Charts — DualBar style ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Par catégorie — bleu */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-blue-500 shrink-0" />
              <h2 className="font-semibold text-foreground">Par catégorie</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Actuel</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-200 dark:bg-blue-900" />
                <span>Référence</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <DualBarChart
              data={data.byCategory}
              labelKey="partner_category"
              valueKey="count"
              primaryColor="bg-blue-500"
              secondaryColor="bg-blue-200 dark:bg-blue-900"
            />
          </div>
        </div>

        {/* Par statut — émeraude */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-emerald-500 shrink-0" />
              <h2 className="font-semibold text-foreground">Par statut</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Actuel</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-200 dark:bg-emerald-900" />
                <span>Référence</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <DualBarChart
              data={data.byStatus}
              labelKey="statut_partenariat"
              valueKey="count"
              primaryColor="bg-emerald-500"
              secondaryColor="bg-emerald-200 dark:bg-emerald-900"
            />
          </div>
        </div>

        {/* Par niveau — violet */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-violet-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-violet-500 shrink-0" />
              <h2 className="font-semibold text-foreground">Par niveau</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span>Actuel</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-violet-200 dark:bg-violet-900" />
                <span>Référence</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <DualBarChart
              data={data.byLevel}
              labelKey="partnership_level"
              valueKey="count"
              primaryColor="bg-violet-500"
              secondaryColor="bg-violet-200 dark:bg-violet-900"
            />
          </div>
        </div>

        {/* Top 10 revenus — pleine largeur */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-amber-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-amber-500 shrink-0" />
              <h2 className="font-semibold text-foreground">Top 10 revenus</h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                <span>Revenus générés</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-500">★</span>
                <span>Score satisfaction</span>
              </div>
            </div>
          </div>
          <div className="p-5">
            <RevenueBarChart data={data.topRevenue} />
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
