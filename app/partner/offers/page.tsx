"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Discount01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Badge } from "@/frontend/components/ui/badge"
import { Spinner } from "@/frontend/components/ui/spinner"
import Link from "next/link"

interface Offer {
  id: number
  title: string
  description: string | null
  discountType: string
  startDate: string | null
  endDate: string | null
  isActive: boolean
  usageCount: number | null
  totalValueTnd: string | null
  targetAudience: string | null
  termsConditions: string | null
  createdAt: string
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Offres</h1>
          <p className="text-muted-foreground mt-1">{offers.length} offre(s) au total</p>
        </div>
        <Link href="/partner/offers/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
            Nouvelle offre
          </Button>
        </Link>
      </motion.div>

      {offers.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <HugeiconsIcon icon={Discount01Icon} className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune offre pour le moment</p>
          <Link href="/partner/offers/new">
            <Button variant="outline" className="mt-4">
              Créer votre première offre
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{offer.title}</h3>
                  {offer.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant={offer.isActive ? "default" : "secondary"}>
                    {offer.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">
                    {offer.discountType === "percentage" ? "Pourcentage" : "Montant fixe"}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {offer.startDate && (
                  <span>Début : {new Date(offer.startDate).toLocaleDateString("fr-FR")}</span>
                )}
                {offer.endDate && (
                  <span>Fin : {new Date(offer.endDate).toLocaleDateString("fr-FR")}</span>
                )}
                {offer.targetAudience && <span>Audience : {offer.targetAudience}</span>}
                {offer.usageCount !== null && offer.usageCount > 0 && (
                  <span>Utilisations : {offer.usageCount}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
