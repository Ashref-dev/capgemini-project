"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Copy01Icon,
  Delete01Icon,
  GiftIcon,
  MoneyBag01Icon,
  PercentSquareIcon,
  Tag01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { AddButton } from "@/components/ui/add-button"
import { CardStack, CardStackItem } from "@/components/ui/card-stack"
import { PartnerSelect } from "@/components/ui/partner-select"
import { cn } from "@/lib/utils"

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
const companyDomains: Record<string, string> = {
  accenture: "accenture.com",
  adobe: "adobe.com",
  amenbank: "amenbank.com.tn",
  amazon: "amazon.com",
  biat: "biat.com.tn",
  capgemini: "capgemini.com",
  coca: "coca-cola.com",
  dell: "dell.com",
  esprit: "esprit.tn",
  freeoui: "freeoui.tn",
  google: "google.com",
  hp: "hp.com",
  ibm: "ibm.com",
  ihec: "ihec.rnu.tn",
  insat: "insat.rnu.tn",
  lafayette: "lafayette.com.tn",
  microsoft: "microsoft.com",
  orange: "orange.tn",
  oracle: "oracle.com",
  pluxee: "pluxeegroup.com",
  pluxy: "pluxeegroup.com",
  salesforce: "salesforce.com",
  starbucks: "starbucks.com",
  tunisair: "tunisair.com",
}


function getPartnerDomain(name: string | null | undefined): string | null {
  if (!name) return null
  const normalized = name.toLowerCase()
  const match = Object.entries(companyDomains).find(([company]) => normalized.includes(company))
  return match?.[1] ?? null
}

function getOfferCode(offer: Offer): string {
  const partnerPrefix = (offer.partner?.name ?? "IC")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase()
  return `${partnerPrefix || "IC"}-${offer.id.toString(36).toUpperCase().padStart(4, "0")}`
}

function getOfferExplanation(offer: Offer): string {
  const partner = offer.partner?.name ?? "partenaire"
  const audience = offer.targetAudience ? audienceLabels[offer.targetAudience] ?? "bénéficiaires" : "bénéficiaires"
  if (offer.description) return offer.description
  return `Avantage négocié avec ${partner} pour les ${audience.toLowerCase()}. Réclamez l’offre pour obtenir un code à utiliser auprès du partenaire.`
}

function OfferLogo({ name }: { name: string | null | undefined }) {
  const domain = getPartnerDomain(name)
  return (
    <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white/15 ring-1 ring-white/20">
      {domain ? (
        <Image
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          width={28}
          height={28}
          className="rounded-md"
        />
      ) : (
        <span className="text-sm font-semibold text-white">{(name ?? "IC").slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}

export default function OffersPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [claimedOfferId, setClaimedOfferId] = useState<number | null>(null)
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

  const resetForm = () => {
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
  }

  const claimOffer = async (offer: Offer) => {
    setClaimedOfferId(offer.id)
    const code = getOfferCode(offer)
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Code copié", { description: `Le code ${code} est prêt à être utilisé.` })
    } catch {
      toast.success("Offre réclamée", { description: `Votre code est ${code}.` })
    }
  }

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/offers")
      const data: { offers?: Offer[]; error?: string } = await res.json()
      if (res.ok) {
        setOffers(data.offers ?? [])
      } else {
        toast.error("Erreur", { description: data.error ?? "Impossible de charger les offres" })
      }
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
    if (!form.title.trim() || !form.partnerId) {
      toast.error("Erreur", { description: "Partenaire et titre requis" })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data: { error?: string } = await res.json()
      if (res.ok) {
        toast.success("Offre créée", { description: "La nouvelle offre est disponible dans le carrousel." })
        setShowForm(false)
        resetForm()
        await fetchOffers()
      } else {
        toast.error("Erreur", { description: data.error ?? "Impossible de créer l’offre" })
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
      const data: { error?: string } = await res.json()
      if (res.ok) {
        toast.success("Offre supprimée")
        await fetchOffers()
      } else {
        toast.error("Erreur", { description: data.error ?? "Impossible de supprimer l’offre" })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    }
  }

  if (!user) return null

  const stackItems: OfferCardItem[] = offers.map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description ?? undefined,
    offer,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Tag01Icon} className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Offres</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Avantages partenaires centralisés pour les équipes et les étudiants. Réclamez une offre pour révéler un code promo utilisable auprès du partenaire.
            </p>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {offers.length} offre{offers.length > 1 ? "s" : ""} disponible{offers.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {isAdmin && (
          <AddButton label={showForm ? "Fermer" : "Nouvelle offre"} onClick={() => setShowForm(!showForm)} />
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-muted/35 p-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ajouter une offre</h2>
            <p className="mt-1 text-sm text-muted-foreground">Une description claire évite les offres vagues et rend le code promo exploitable.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Partenaire *</Label>
              <PartnerSelect value={form.partnerId} onChange={(id) => setForm({ ...form, partnerId: id })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Titre *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Type de remise</Label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
                <option value="percentage">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Audience cible</Label>
              <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
                <option value="employees">Employés</option>
                <option value="students">Étudiants</option>
                <option value="all">Tous</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Date début</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Date fin</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Conditions</Label>
            <Input value={form.termsConditions} onChange={(e) => setForm({ ...form, termsConditions: e.target.value })} />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Ajouter l’offre"}</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-2xl bg-muted/35 py-14 text-center">
          <HugeiconsIcon icon={GiftIcon} className="mx-auto mb-3 size-10 text-muted-foreground opacity-50" />
          <p className="font-medium text-foreground">Aucune offre pour le moment</p>
          <p className="mt-1 text-sm text-muted-foreground">Ajoutez une première offre partenaire pour afficher un code promo.</p>
        </div>
      ) : (
        <div className="w-full">
          <CardStack<OfferCardItem>
            items={stackItems}
            cardWidth={560}
            cardHeight={360}
            autoAdvance
            intervalMs={3500}
            pauseOnHover
            showDots
            overlap={0.44}
            spreadDeg={44}
            renderCard={(item, { active }) => {
              const offer = item.offer
              const gradient = getCardGradient(offer)
              const claimed = claimedOfferId === offer.id
              return (
                <div className={cn("relative h-full w-full bg-gradient-to-br", gradient)}>
                  <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/5" />
                  <div className="absolute -bottom-8 -left-8 size-36 rounded-full bg-white/5" />

                  <div className="absolute right-4 top-4 z-10">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", offer.isActive ? "bg-white/20 text-white" : "bg-black/20 text-white/70")}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="flex items-start gap-3 pr-20">
                        <OfferLogo name={offer.partner?.name} />
                        <div className="min-w-0">
                          <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                            {discountLabels[offer.discountType ?? ""] ?? "Avantage"}
                          </span>
                          <h3 className="mt-1 line-clamp-2 text-xl font-bold text-white">{offer.title}</h3>
                        </div>
                      </div>
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/85">{getOfferExplanation(offer)}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 text-xs text-white/80">
                        {offer.partner?.name && (
                          <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                            <HugeiconsIcon icon={UserIcon} className="size-3" />
                            {offer.partner.name}
                          </span>
                        )}
                        {offer.targetAudience && (
                          <span className="rounded-full bg-white/10 px-2.5 py-1">
                            {audienceLabels[offer.targetAudience] ?? offer.targetAudience}
                          </span>
                        )}
                        {(offer.startDate || offer.endDate) && (
                          <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                            <HugeiconsIcon icon={Calendar01Icon} className="size-3" />
                            {offer.startDate ? new Date(offer.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""}
                            {offer.startDate && offer.endDate ? " → " : ""}
                            {offer.endDate ? new Date(offer.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : ""}
                          </span>
                        )}
                      </div>

                      {offer.termsConditions && active && (
                        <p className="line-clamp-1 text-xs italic text-white/65">{offer.termsConditions}</p>
                      )}

                      {claimed && active && (
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/15 px-3 py-2 text-white ring-1 ring-white/20">
                          <span className="text-xs text-white/70">Code promo</span>
                          <span className="font-mono text-sm font-semibold tracking-wide">{getOfferCode(offer)}</span>
                        </div>
                      )}

                      {active && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-full justify-center gap-2 bg-white text-primary hover:bg-white/90"
                          onClick={(e) => {
                            e.stopPropagation()
                            claimOffer(offer)
                          }}
                        >
                          <HugeiconsIcon icon={claimed ? Copy01Icon : GiftIcon} className="size-4" />
                          {claimed ? "Copier le code" : "Réclamer l’offre"}
                        </Button>
                      )}

                      {isAdmin && active && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(offer.id)
                          }}
                          className="flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-white/90"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
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

