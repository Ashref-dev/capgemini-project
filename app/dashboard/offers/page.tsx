"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tag01Icon,
  UserIcon,
  Calendar01Icon,
  Delete01Icon,
  PercentSquareIcon,
  MoneyBag01Icon,
} from "@hugeicons/core-free-icons"
import { SparklesText } from "@/frontend/components/ui/sparkles-text"
import { AddButton } from "@/frontend/components/ui/add-button"
import { CardStack, CardStackItem } from "@/frontend/components/ui/card-stack"
import { cn } from "@/frontend/lib/utils"

interface Offer {
  id: number
  partnerId: number
  title: string
  description: string | null
  discountType: string | null
  startDate: string | null
  endDate: string | null
  termsConditions: string | null
  isActive: boolean | null
  usageCount: number | null
  totalValueTnd: string | null
  targetAudience: string | null
  partner?: { id: number; name: string } | null
}

type OfferCardItem = CardStackItem & {
  offer: Offer
}

const discountGradients: Record<string, string> = {
  percentage: "from-[#0070AD] via-[#005a8e] to-[#003d61]",
  fixed: "from-emerald-600 via-emerald-700 to-emerald-900",
}

const audienceGradients: Record<string, string> = {
  employees: "from-[#0070AD] via-[#005a8e] to-[#003d61]",
  students: "from-purple-600 via-purple-700 to-purple-900",
  all: "from-amber-600 via-amber-700 to-amber-900",
}

function getCardGradient(offer: Offer): string {
  if (offer.targetAudience && offer.targetAudience !== "employees") {
    return audienceGradients[offer.targetAudience] ?? "from-slate-600 via-slate-700 to-slate-900"
  }
  return discountGradients[offer.discountType ?? ""] ?? "from-[#0070AD] via-[#005a8e] to-[#003d61]"
}

const audienceLabels: Record<string, string> = {
  employees: "Employés",
  students: "Étudiants",
  all: "Tous",
}

const discountLabels: Record<string, string> = {
  percentage: "Pourcentage",
  fixed: "Montant fixe",
}

export default function OffersPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    partnerId: "",
    title: "",
    description: "",
    discountType: "percentage",
    startDate: "",
    endDate: "",
    termsConditions: "",
    targetAudience: "employees",
  })

  const isAdmin = user?.role === "admin" || user?.role === "manager"

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/offers")
      const data = await res.json()
      if (res.ok) setOffers(data.offers)
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les offres" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.partnerId) {
      toast.error("Erreur", { description: "Titre et ID partenaire requis" })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success("Offre créée")
        setShowForm(false)
        setForm({
          partnerId: "",
          title: "",
          description: "",
          discountType: "percentage",
          startDate: "",
          endDate: "",
          termsConditions: "",
          targetAudience: "employees",
        })
        fetchOffers()
      } else {
        const data = await res.json()
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette offre ?")) return
    try {
      const res = await fetch(`/api/offers?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Offre supprimée")
        fetchOffers()
      } else {
        const data = await res.json()
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    }
  }

  if (!user) return null

  const stackItems: OfferCardItem[] = offers.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description ?? undefined,
    offer: o,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Tag01Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Offres" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-1">
              {offers.length} offre{offers.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {isAdmin && (
          <AddButton label="Nouvelle offre" onClick={() => setShowForm(!showForm)} />
        )}
      </div>

      {/* Creation Form */}
      {showForm && isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="p-4 border border-border rounded-xl bg-card space-y-4"
        >
          <h2 className="font-semibold text-sm">Ajouter une offre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>ID Partenaire *</Label>
              <Input
                type="number"
                value={form.partnerId}
                onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Titre *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type de remise</Label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="percentage">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Audience cible</Label>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="employees">Employés</option>
                <option value="students">Étudiants</option>
                <option value="all">Tous</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Date début</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date fin</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Conditions</Label>
            <Input
              value={form.termsConditions}
              onChange={(e) => setForm({ ...form, termsConditions: e.target.value })}
            />
          </div>
          <AddButton
            type="submit"
            label={saving ? "Enregistrement..." : "Ajouter"}
            disabled={saving}
          />
        </form>
      )}

      {/* Offers display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucune offre</div>
      ) : (
        <div className="w-full">
          <CardStack<OfferCardItem>
            items={stackItems}
            cardWidth={560}
            cardHeight={340}
            autoAdvance
            intervalMs={3500}
            pauseOnHover
            showDots
            overlap={0.44}
            spreadDeg={44}
            renderCard={(item, { active }) => {
              const o = item.offer
              const gradient = getCardGradient(o)
              return (
                <div className={cn("relative h-full w-full bg-gradient-to-br", gradient)}>
                  {/* Decorative circles */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

                  {/* Status badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full",
                        o.isActive
                          ? "bg-white/20 text-white"
                          : "bg-black/20 text-white/70"
                      )}
                    >
                      {o.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex h-full flex-col justify-between p-6">
                    {/* Top */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
                          <HugeiconsIcon
                            icon={o.discountType === "fixed" ? MoneyBag01Icon : PercentSquareIcon}
                            className="w-4 h-4 text-white"
                          />
                        </div>
                        {o.discountType && (
                          <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
                            {discountLabels[o.discountType]}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mt-2 line-clamp-2">{o.title}</h3>
                      {o.description && (
                        <p className="text-sm text-white/80 line-clamp-2 mt-1">{o.description}</p>
                      )}
                    </div>

                    {/* Bottom info */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 text-xs text-white/80">
                        {o.partner?.name && (
                          <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1">
                            <HugeiconsIcon icon={UserIcon} className="w-3 h-3" />
                            {o.partner.name}
                          </span>
                        )}
                        {o.targetAudience && (
                          <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1">
                            {audienceLabels[o.targetAudience] ?? o.targetAudience}
                          </span>
                        )}
                        {(o.startDate || o.endDate) && (
                          <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1">
                            <HugeiconsIcon icon={Calendar01Icon} className="w-3 h-3" />
                            {o.startDate
                              ? new Date(o.startDate).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : ""}
                            {o.startDate && o.endDate ? " → " : ""}
                            {o.endDate
                              ? new Date(o.endDate).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                        )}
                      </div>

                      {o.termsConditions && active && (
                        <p className="text-xs text-white/60 italic line-clamp-1">
                          {o.termsConditions}
                        </p>
                      )}

                      {isAdmin && active && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(o.id)
                          }}
                          className="flex items-center gap-1 text-xs text-white/60 hover:text-white/90 transition-colors"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="w-3.5 h-3.5" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            }}
          />
        </div>
      )}
    </div>
  )
}
