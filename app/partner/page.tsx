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
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Spinner } from "@/frontend/components/ui/spinner"
import { BallpitHero } from "@/frontend/components/ui/ballpit-hero"

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
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (!data?.partner) {
    return <div className="text-muted-foreground">Impossible de charger vos données.</div>
  }

  const { partner, stats } = data

  const quickLinks = [
    { label: "Mes Offres", href: "/partner/offers", icon: Discount01Icon, count: stats.offerCount, color: "text-blue-600" },
    { label: "Mes Événements", href: "/partner/events", icon: Calendar03Icon, count: stats.eventCount, color: "text-green-600" },
    { label: "Mes Contacts", href: "/partner/contacts", icon: ContactBookIcon, count: stats.contactCount, color: "text-purple-600" },
    { label: "Statistiques", href: "/partner/stats", icon: AnalyticsUpIcon, count: null, color: "text-orange-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <BallpitHero
        greeting={new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir"}
        name={partner.name}
        subtitle={`${categoryLabels[partner.categories || ""] || partner.categories} • ${statusLabels[partner.partnershipStatus || ""] || partner.partnershipStatus}${partner.partnershipLevel ? ` • Niveau : ${partner.partnershipLevel}` : ""}`}
        badge={categoryLabels[partner.categories || ""] || partner.categories || undefined}
      />

      {/* Quick stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={item.href}>
              <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-primary/10 ${item.color}`}>
                    <HugeiconsIcon icon={item.icon} className="w-5 h-5" />
                  </div>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  {item.count !== null && (
                    <p className="text-2xl font-bold text-foreground mt-1">{item.count}</p>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-4">Mon profil</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Score satisfaction</span>
              <span className="font-medium">{partner.satisfactionScore ?? "N/A"}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget annuel</span>
              <span className="font-medium">
                {partner.annualBudgetTnd ? `${partner.annualBudgetTnd.toLocaleString()} TND` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Classement</span>
              <span className="font-medium">
                {stats.rank ? `${stats.rank}/${stats.totalPartners}` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Début partenariat</span>
              <span className="font-medium">
                {partner.partnershipStartDate
                  ? new Date(partner.partnershipStartDate).toLocaleDateString("fr-FR")
                  : "N/A"}
              </span>
            </div>
          </div>
          <Link
            href="/partner/profile"
            className="block mt-4 text-sm text-primary hover:underline"
          >
            Modifier mon profil →
          </Link>
        </motion.div>

        {/* Category comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-4">
            Comparaison ({categoryLabels[partner.categories || ""] || partner.categories})
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ma satisfaction</span>
              <span className="font-medium">{partner.satisfactionScore ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moyenne catégorie</span>
              <span className="font-medium">{stats.categoryAvgSatisfaction ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moyenne globale</span>
              <span className="font-medium">{stats.globalAvgSatisfaction ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Partenaires dans ma catégorie</span>
              <span className="font-medium">{stats.categoryCount}</span>
            </div>
          </div>
          <Link
            href="/partner/stats"
            className="block mt-4 text-sm text-primary hover:underline"
          >
            Voir les statistiques complètes →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
