"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Discount01Icon, Calendar03Icon, UserGroupIcon, ChartIncreaseIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { AddButton } from "@/components/ui/add-button"
import { SparklesText } from "@/components/ui/sparkles-text"
import { cn } from "@/lib/utils"
import { formatOfferAudience, formatDiscountValue } from "@/lib/format"
import Link from "next/link"

interface Offer {
  id: number; title: string; description: string | null; discountType: string
  startDate: string | null; endDate: string | null; isActive: boolean
  usageCount: number | null; totalValueTnd: string | null
  targetAudience: string | null; termsConditions: string | null; createdAt: string
}

export default function PartnerOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/partner/offers")
      .then((r) => r.json())
      .then((d) => setOffers(d.offers || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Discount01Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Mes Offres" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-0.5">{offers.length} offre{offers.length > 1 ? "s" : ""} au total</p>
          </div>
        </div>
        <Link href="/partner/offers/new">
          <AddButton label="Nouvelle offre" />
        </Link>
      </motion.div>

      {offers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-card border border-border rounded-xl"
        >
          <HugeiconsIcon icon={Discount01Icon} className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground font-medium">Aucune offre pour le moment</p>
          <Link href="/partner/offers/new">
            <AddButton label="Créer votre première offre" className="mt-4 mx-auto" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
            >
              {/* Colored top bar */}
              <div className={cn("h-1", offer.isActive ? "bg-emerald-500" : "bg-muted-foreground/30")} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{offer.title}</h3>
                    </div>
                    {offer.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{offer.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      {offer.startDate && (
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={Calendar03Icon} className="w-3 h-3" />
                          Du {new Date(offer.startDate).toLocaleDateString("fr-FR")}
                          {offer.endDate && ` au ${new Date(offer.endDate).toLocaleDateString("fr-FR")}`}
                        </span>
                      )}
                      {offer.targetAudience && (
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
                          {formatOfferAudience(offer.targetAudience)}
                        </span>
                      )}
                      {offer.usageCount !== null && offer.usageCount > 0 && (
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={ChartIncreaseIcon} className="w-3 h-3" />
                          {offer.usageCount} utilisation{offer.usageCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    <Badge variant={offer.isActive ? "default" : "secondary"} className="text-xs">
                      {offer.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatDiscountValue(offer.discountType, offer.totalValueTnd)}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
