"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, Tick02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/frontend/lib/utils"

export type GanttMilestone = {
  id: number
  name: string
  dueDate: string | null
  status: "pending" | "in_progress" | "done" | "missed"
  order: number
}

interface ProjectGanttProps {
  milestones: GanttMilestone[]
  startDate: string | null
  endDate: string | null
  onMilestoneClick?: (m: GanttMilestone) => void
  className?: string
}

const STATUS_BAR: Record<GanttMilestone["status"], string> = {
  pending: "fill-blue-500/30 stroke-blue-500/70",
  in_progress: "fill-blue-500/70 stroke-blue-600",
  done: "fill-emerald-500/70 stroke-emerald-600",
  missed: "fill-red-500/70 stroke-red-600",
}

const ROW_HEIGHT = 44
const LABEL_WIDTH = 180
const HEADER_HEIGHT = 42
const PADDING_BOTTOM = 18

function parseISO(d: string | null): number | null {
  if (!d) return null
  const t = new Date(d).getTime()
  return Number.isNaN(t) ? null : t
}

function formatShortDate(t: number): string {
  return new Date(t).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

function formatLongDate(t: number): string {
  return new Date(t).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

export function ProjectGantt({ milestones, startDate, endDate, onMilestoneClick, className }: ProjectGanttProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = React.useState(0)
  const [hoverId, setHoverId] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const sorted = React.useMemo(
    () =>
      milestones
        .slice()
        .sort((a, b) => (a.order - b.order) || ((parseISO(a.dueDate) ?? 0) - (parseISO(b.dueDate) ?? 0))),
    [milestones],
  )

  const datedMilestones = sorted.filter((m) => parseISO(m.dueDate) !== null)
  const projectStart = parseISO(startDate)
  const projectEnd = parseISO(endDate)

  if (sorted.length === 0 || (datedMilestones.length === 0 && !projectStart && !projectEnd)) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 py-10 text-center",
          className,
        )}
      >
        <HugeiconsIcon icon={Calendar03Icon} className="h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Pas encore de jalons datés</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Ajoutez des jalons avec des dates d&apos;échéance pour visualiser la roadmap.
        </p>
      </div>
    )
  }

  const allTimes: number[] = []
  if (projectStart) allTimes.push(projectStart)
  if (projectEnd) allTimes.push(projectEnd)
  for (const m of datedMilestones) {
    const t = parseISO(m.dueDate)
    if (t !== null) allTimes.push(t)
  }

  const today = Date.now()
  const minTime = Math.min(...allTimes, today)
  const maxTime = Math.max(...allTimes, today)
  const safeRange = Math.max(maxTime - minTime, 1)

  const barAreaWidth = Math.max(width - LABEL_WIDTH, 100)
  const totalHeight = HEADER_HEIGHT + sorted.length * ROW_HEIGHT + PADDING_BOTTOM

  const xFor = (t: number) => LABEL_WIDTH + ((t - minTime) / safeRange) * barAreaWidth

  const tickCount = Math.min(6, Math.max(2, Math.floor(barAreaWidth / 130)))
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => minTime + (safeRange * i) / tickCount)

  const todayX = xFor(today)
  const showToday = today >= minTime && today <= maxTime

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card p-1 shadow-sm",
        className,
      )}
    >
      <svg width={width || "100%"} height={totalHeight} className="block">
        <defs>
          <linearGradient id="gantt-row-bg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.04" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t} className="text-muted-foreground">
            <line
              x1={xFor(t)}
              y1={HEADER_HEIGHT}
              x2={xFor(t)}
              y2={totalHeight - PADDING_BOTTOM}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray="3 4"
            />
            <text x={xFor(t)} y={20} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {formatShortDate(t)}
            </text>
          </g>
        ))}

        {sorted.map((m, i) => {
          const y = HEADER_HEIGHT + i * ROW_HEIGHT
          return (
            <g key={`bg-${m.id}`} className="text-foreground">
              <rect x={LABEL_WIDTH} y={y} width={barAreaWidth} height={ROW_HEIGHT - 6} fill="url(#gantt-row-bg)" />
              <text
                x={LABEL_WIDTH - 12}
                y={y + ROW_HEIGHT / 2 + 4}
                textAnchor="end"
                aria-label={m.name}
                className="fill-foreground text-[12px] font-medium"
              >
                {m.name.length > 22 ? m.name.slice(0, 21) + "…" : m.name}
              </text>
            </g>
          )
        })}

        {sorted.map((m, i) => {
          const due = parseISO(m.dueDate)
          if (due === null) return null
          const prev = i > 0 ? parseISO(sorted[i - 1]?.dueDate ?? null) : projectStart ?? minTime
          const startT = prev ?? projectStart ?? minTime
          const x1 = xFor(Math.min(startT, due))
          const x2 = xFor(Math.max(startT, due))
          const w = Math.max(x2 - x1, 6)
          const y = HEADER_HEIGHT + i * ROW_HEIGHT + 8
          const isHover = hoverId === m.id

          return (
            <motion.g
              key={`bar-${m.id}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.04 * i, ease: [0.32, 0.72, 0, 1] }}
              className={cn("cursor-pointer", isHover && "drop-shadow-md")}
              onMouseEnter={() => setHoverId(m.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onMilestoneClick?.(m)}
            >
              <rect
                x={x1}
                y={y}
                width={w}
                height={ROW_HEIGHT - 16}
                rx={6}
                ry={6}
                strokeWidth={1.25}
                className={cn(STATUS_BAR[m.status], "transition-transform")}
                style={{ transform: isHover ? "translateY(-1px)" : undefined, transformOrigin: "center" }}
              />
              {m.status === "done" && (
                <g transform={`translate(${x2 - 18}, ${y + (ROW_HEIGHT - 16) / 2 - 6})`}>
                  <circle cx={6} cy={6} r={7} className="fill-emerald-600" />
                  <foreignObject x={0} y={0} width={12} height={12}>
                    <div className="flex h-3 w-3 items-center justify-center text-white">
                      <HugeiconsIcon icon={Tick02Icon} className="h-3 w-3" />
                    </div>
                  </foreignObject>
                </g>
              )}
              {m.status === "missed" && (
                <g transform={`translate(${x2 - 18}, ${y + (ROW_HEIGHT - 16) / 2 - 6})`}>
                  <circle cx={6} cy={6} r={7} className="fill-red-600" />
                  <foreignObject x={0} y={0} width={12} height={12}>
                    <div className="flex h-3 w-3 items-center justify-center text-white">
                      <HugeiconsIcon icon={AlertCircleIcon} className="h-3 w-3" />
                    </div>
                  </foreignObject>
                </g>
              )}
            </motion.g>
          )
        })}

        {showToday && (
          <g>
            <line
              x1={todayX}
              y1={HEADER_HEIGHT - 6}
              x2={todayX}
              y2={totalHeight - PADDING_BOTTOM}
              stroke="currentColor"
              className="text-red-500"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <rect x={todayX - 26} y={HEADER_HEIGHT - 22} width={52} height={16} rx={8} className="fill-red-500" />
            <text x={todayX} y={HEADER_HEIGHT - 11} textAnchor="middle" className="fill-white text-[10px] font-semibold">
              Aujourd&apos;hui
            </text>
          </g>
        )}
      </svg>

      {hoverId !== null && (() => {
        const m = sorted.find((x) => x.id === hoverId)
        if (!m) return null
        const due = parseISO(m.dueDate)
        return (
          <div className="pointer-events-none absolute right-3 top-3 max-w-xs rounded-xl border border-border/60 bg-popover px-3 py-2 text-xs shadow-lg">
            <p className="font-semibold text-foreground">{m.name}</p>
            <p className="text-muted-foreground">
              {due ? `Échéance : ${formatLongDate(due)}` : "Sans date"}
            </p>
            <p className="mt-1 text-muted-foreground">
              Statut : <span className="font-medium text-foreground">{m.status}</span>
            </p>
          </div>
        )
      })()}
    </div>
  )
}
