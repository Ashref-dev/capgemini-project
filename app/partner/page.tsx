"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Discount01Icon,
  Calendar03Icon,
  ContactBookIcon,
  AnalyticsUpIcon,
  ArrowRight01Icon,
  UserIcon,
  ChartIncreaseIcon,
  Medal01Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { BallpitHero } from "@/components/ui/ballpit-hero"
import { GradientStatCard } from "@/components/ui/gradient-stat-card"
import { SparklesText } from "@/components/ui/sparkles-text"
import { cn } from "@/lib/utils"

interface PartnerData {
  partner: {
    id: number
    name: string
    categories: string | null
    partnershipStatus: string | null
    partnershipLevel: string | null
    partnershipStartDate: string | null
    satisfactionScore: number | null
    annualBudgetTnd: number | null
    email: string | null
  }
  stats: {
    offerCount: number
    eventCount: number
    contactCount: number
    rank: number | null
    totalPartners: number
    globalAvgSatisfaction: number | null
    globalAvgBudget: number | null
    categoryAvgSatisfaction: number | null
    categoryAvgBudget: number | null
    categoryCount: number
  }
}

const categoryLabels: Record<string, string> = {
  customer: "Client",
  marketing: "Marketing",
  supplier: "Fournisseur",
  university: "Université",
}

const statusLabels: Record<string, string> = {
  actif: "Actif",
  inactif: "Inactif",
  prospect: "Prospect",
  en_negociation: "En négociation",
  termine: "Terminé",
}

export default function PartnerDashboard() {
  const [data, setData] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>
  }

  if (!data?.partner) {
    return <div className="text-muted-foreground">Impossible de charger vos données.</div>
  }

  const { partner, stats } = data

  const quickLinks = [
    { label: "Mes Offres",      href: "/partner/offers",   icon: Discount01Icon,  count: stats.offerCount,   glowColor: "blue"    as const },
    { label: "Mes Événements",  href: "/partner/events",   icon: Calendar03Icon,  count: stats.eventCount,   glowColor: "emerald" as const },
    { label: "Mes Contacts",    href: "/partner/contacts", icon: ContactBookIcon, count: stats.contactCount, glowColor: "violet"  as const },
    { label: "Statistiques",    href: "/partner/stats",    icon: AnalyticsUpIcon, count: null,               glowColor: "amber"   as const },
  ]

  // Animated bar helper
  const Bar = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
    return (
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <BallpitHero
        greeting={new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir"}
        name={partner.name}
        subtitle={`${categoryLabels[partner.categories || ""] || partner.categories} • ${statusLabels[partner.partnershipStatus || ""] || partner.partnershipStatus}${partner.partnershipLevel ? ` • Niveau : ${partner.partnershipLevel}` : ""}`}
        badge={categoryLabels[partner.categories || ""] || partner.categories || undefined}
      />

      {/* KPI stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((item, i) => (
          <motion.div key={item.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={item.href} className="block group">
              <GradientStatCard
                icon={item.icon}
                value={item.count !== null ? String(item.count) : "→"}
                label={item.label}
                glowColor={item.glowColor}
                index={i}
              />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Summary section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-primary" />
          </div>
          <SparklesText text="Synthèse du partenariat" className="text-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary shrink-0" />
                <h3 className="font-semibold text-foreground">Mon profil</h3>
              </div>
              <Link href="/partner/profile" className="text-xs text-primary hover:underline">Modifier →</Link>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Score satisfaction", value: partner.satisfactionScore !== null ? `${partner.satisfactionScore}/100` : "N/A", icon: ChartIncreaseIcon, color: "text-emerald-500" },
                { label: "Budget annuel", value: partner.annualBudgetTnd ? `${partner.annualBudgetTnd.toLocaleString()} TND` : "N/A", icon: MoneyBag02Icon, color: "text-amber-500" },
                { label: "Classement", value: stats.rank ? `#${stats.rank} / ${stats.totalPartners}` : "N/A", icon: Medal01Icon, color: "text-violet-500" },
                { label: "Début du partenariat", value: partner.partnershipStartDate ? new Date(partner.partnershipStartDate).toLocaleDateString("fr-FR") : "N/A", icon: Calendar03Icon, color: "text-blue-500" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HugeiconsIcon icon={row.icon} className={cn("w-3.5 h-3.5", row.color)} />
                    {row.label}
                  </div>
                  <span className="font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Comparison card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-blue-500 shrink-0" />
                <h3 className="font-semibold text-foreground">
                  Comparaison — {categoryLabels[partner.categories || ""] || partner.categories}
                </h3>
              </div>
              <Link href="/partner/stats" className="text-xs text-primary hover:underline">Stats →</Link>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Ma satisfaction</span>
                  <span className="font-bold text-foreground">{partner.satisfactionScore ?? 0}/100</span>
                </div>
                <Bar value={partner.satisfactionScore ?? 0} max={100} color="bg-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Moyenne catégorie ({stats.categoryCount})</span>
                  <span className="font-semibold text-muted-foreground">{stats.categoryAvgSatisfaction ?? 0}/100</span>
                </div>
                <Bar value={stats.categoryAvgSatisfaction ?? 0} max={100} color="bg-blue-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Moyenne globale ({stats.totalPartners})</span>
                  <span className="font-semibold text-muted-foreground">{stats.globalAvgSatisfaction ?? 0}/100</span>
                </div>
                <Bar value={stats.globalAvgSatisfaction ?? 0} max={100} color="bg-muted-foreground/40" />
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>● Moi &nbsp;● Catégorie &nbsp;● Global</span>
                  <span>{stats.totalPartners} partenaires au total</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
