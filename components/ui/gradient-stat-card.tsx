"use client"

import React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

export type StatGlowColor = "blue" | "amber" | "emerald" | "red" | "violet" | "cyan"

interface GradientStatCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  value: React.ReactNode
  label: string
  sub?: string
  glowColor?: StatGlowColor
  index?: number
  valueClassName?: string
}

const accentConfigs: Record<
  StatGlowColor,
  {
    iconBg: string
    iconColor: string
    valueColor: string
    borderHover: string
    topBar: string
    bgAccent: string
  }
> = {
  blue: {
    iconBg: "bg-[#0070AD]/10 dark:bg-[#12ABDB]/10",
    iconColor: "text-[#0070AD] dark:text-[#12ABDB]",
    valueColor: "text-[#0070AD] dark:text-[#12ABDB]",
    borderHover: "group-hover:border-[#0070AD]/40 dark:group-hover:border-[#12ABDB]/25",
    topBar: "from-[#0070AD] to-[#12ABDB]",
    bgAccent: "from-[#0070AD]/5 dark:from-[#12ABDB]/5",
  },
  amber: {
    iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    valueColor: "text-amber-600 dark:text-amber-400",
    borderHover: "group-hover:border-amber-400/40 dark:group-hover:border-amber-400/25",
    topBar: "from-amber-500 to-amber-300",
    bgAccent: "from-amber-500/5 dark:from-amber-400/5",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    valueColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "group-hover:border-emerald-400/40 dark:group-hover:border-emerald-400/25",
    topBar: "from-emerald-500 to-emerald-300",
    bgAccent: "from-emerald-500/5 dark:from-emerald-400/5",
  },
  red: {
    iconBg: "bg-red-500/10 dark:bg-red-400/10",
    iconColor: "text-red-600 dark:text-red-400",
    valueColor: "text-red-600 dark:text-red-400",
    borderHover: "group-hover:border-red-400/40 dark:group-hover:border-red-400/25",
    topBar: "from-red-500 to-red-300",
    bgAccent: "from-red-500/5 dark:from-red-400/5",
  },
  violet: {
    iconBg: "bg-violet-500/10 dark:bg-violet-400/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    valueColor: "text-violet-600 dark:text-violet-400",
    borderHover: "group-hover:border-violet-400/40 dark:group-hover:border-violet-400/25",
    topBar: "from-violet-500 to-violet-300",
    bgAccent: "from-violet-500/5 dark:from-violet-400/5",
  },
  cyan: {
    iconBg: "bg-cyan-500/10 dark:bg-cyan-400/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    valueColor: "text-cyan-600 dark:text-cyan-400",
    borderHover: "group-hover:border-cyan-400/40 dark:group-hover:border-cyan-400/25",
    topBar: "from-cyan-500 to-cyan-300",
    bgAccent: "from-cyan-500/5 dark:from-cyan-400/5",
  },
}

export function GradientStatCard({
  icon,
  value,
  label,
  sub,
  glowColor = "blue",
  index = 0,
  valueClassName,
}: GradientStatCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(springY, [-0.5, 0.5], ["8deg", "-8deg"])
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-8deg", "8deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const accent = accentConfigs[glowColor]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      style={{ perspective: "1000px" }}
      className="group"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
          "transition-[border-color,box-shadow] duration-300 hover:shadow-md dark:hover:shadow-black/20",
          accent.borderHover
        )}
      >
        {/* Colored top accent bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r opacity-90", accent.topBar)} />

        {/* Subtle colored bg wash behind content */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br to-transparent opacity-60 pointer-events-none",
            accent.bgAccent
          )}
        />

        {/* Content */}
        <div
          style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
          className="relative flex items-center gap-4 p-5"
        >
          {icon && (
            <div
              className={cn(
                "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                accent.iconBg
              )}
            >
              <HugeiconsIcon icon={icon} className={cn("h-5 w-5", accent.iconColor)} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className={cn("text-2xl font-bold leading-tight", accent.valueColor, valueClassName)}>
              {value}
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground truncate">{label}</div>
            {sub && <div className="mt-0.5 text-xs text-muted-foreground/70 truncate">{sub}</div>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
