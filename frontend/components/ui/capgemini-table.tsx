"use client"

import React, { useState, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/frontend/lib/utils"
import { Spinner } from "@/frontend/components/ui/spinner"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CapgeminiTableColumn<T> {
  key: string
  label: string
  /** flex-grow weight (relative width), e.g. 1, 2, 3 */
  weight: number
  render: (row: T, index: number) => ReactNode
  headerClass?: string
}

export interface CapgeminiTableProps<T> {
  title: string
  subtitle?: string
  data: T[]
  columns: CapgeminiTableColumn<T>[]
  /** Returns a Tailwind gradient class string for each row, e.g. "from-green-500/10 to-transparent" */
  getRowGradient?: (row: T) => string
  /** Called when a row is clicked – show detail panel */
  onRowClick?: (row: T) => void
  /** Render expanded detail content inside the panel overlay */
  renderDetail?: (row: T, onClose: () => void) => ReactNode
  loading?: boolean
  emptyMessage?: string
  /** Content rendered in the header right side (search, filters, buttons) */
  headerActions?: ReactNode
  className?: string
  keyExtractor: (row: T) => string | number
}

// ─── Row entrance variants ────────────────────────────────────────────────────
const rowVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.97, filter: "blur(4px)" },
  visible: {
    opacity: 1, x: 0, scale: 1, filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 400, damping: 28, mass: 0.6 },
  },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CapgeminiTable<T>({
  title,
  subtitle,
  data,
  columns,
  getRowGradient,
  onRowClick,
  renderDetail,
  loading = false,
  emptyMessage = "Aucune donnée",
  headerActions,
  className,
  keyExtractor,
}: CapgeminiTableProps<T>) {
  const [selectedRow, setSelectedRow] = useState<T | null>(null)

  const handleRowClick = (row: T) => {
    if (renderDetail) setSelectedRow(row)
    onRowClick?.(row)
  }

  const closeDetail = () => setSelectedRow(null)

  // Build CSS grid-template-columns from weights
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: columns.map(c => `${c.weight}fr`).join(" "),
    gap: "12px",
    alignItems: "center",
  }

  return (
    <div className={cn("relative w-full border border-border/40 rounded-2xl bg-card shadow-sm overflow-hidden", className)}>
      {/* ── Card Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-border/40 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <span className="ml-2 rounded-full bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5">
            {data.length}
          </span>
        </div>
        {headerActions && <div className="flex items-center gap-2 flex-wrap">{headerActions}</div>}
      </div>

      {/* ── Column Headers ── */}
      <div
        className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/20 bg-muted/30"
        style={gridStyle}
      >
        {columns.map(col => (
          <div key={col.key} className={col.headerClass}>
            {col.label}
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="p-3 space-y-1.5">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">{emptyMessage}</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1.5"
          >
            {data.map((row, i) => {
              const gradient = getRowGradient?.(row)
              const clickable = !!renderDetail || !!onRowClick
              return (
                <motion.div
                  key={keyExtractor(row)}
                  variants={rowVariants}
                  className="relative"
                  whileHover={clickable ? { y: -1, transition: { type: "spring", stiffness: 400, damping: 25 } } : {}}
                  onClick={clickable ? () => handleRowClick(row) : undefined}
                  style={clickable ? { cursor: "pointer" } : undefined}
                >
                  <div className="relative bg-muted/40 border border-border/40 rounded-xl overflow-hidden hover:border-border/70 hover:bg-muted/60 transition-colors duration-150 px-5 py-3.5">
                      {/* Status gradient overlay */}
                      {gradient && (
                        <>
                          <div
                            className={cn("absolute inset-0 pointer-events-none bg-gradient-to-r to-transparent opacity-70", gradient)}
                            style={{ backgroundSize: "35% 100%", backgroundPosition: "left", backgroundRepeat: "no-repeat" }}
                          />
                          <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl", gradient.replace("to-transparent", "").trim().replace(/from-([\w-/]+)\/\d+/, "bg-$1"))} />
                        </>
                      )}
                      <div className="relative" style={gridStyle}>
                        {columns.map(col => (
                          <div key={col.key} className="min-w-0">
                            {col.render(row, i)}
                          </div>
                        ))}
                      </div>
                    </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* ── Detail Overlay ── */}
      <AnimatePresence>
        {selectedRow && renderDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col rounded-2xl z-20 overflow-hidden"
          >
            {renderDetail(selectedRow, closeDetail)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Shared badge helpers ────────────────────────────────────────────────────

export function StatusBadge({ status, label, variant }: {
  status: "success" | "warning" | "error" | "info" | "neutral"
  label: string
  variant?: "dot" | "badge"
}) {
  const colors = {
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    error: "bg-red-500/10 border-red-500/30 text-red-500",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-500",
    neutral: "bg-muted border-border text-muted-foreground",
  }
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap",
      colors[status],
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-emerald-500": status === "success",
        "bg-amber-500": status === "warning",
        "bg-red-500": status === "error",
        "bg-blue-500": status === "info",
        "bg-muted-foreground": status === "neutral",
      })} />
      {label}
    </span>
  )
}

export function DetailPanel({
  onClose,
  title,
  children,
  icon,
}: {
  onClose: () => void
  title: string
  children: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-sm"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">{children}</div>
    </div>
  )
}

export function DetailCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 border border-border/30">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}
