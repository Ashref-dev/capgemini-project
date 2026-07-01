"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Discount01Icon,
  Calendar03Icon,
  UserGroupIcon,
  ChartIncreaseIcon,
  ArrowLeft01Icon,
  Edit02Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { AddButton } from "@/components/ui/add-button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { formatOfferAudience, formatDiscountValue } from "@/lib/format"
import Link from "next/link"

interface Offer {
  id: number
  partnerId: number
  title: string
  description: string | null
  discountType: string
  startDate: string | null
  endDate: string | null
  termsConditions: string | null
  isActive: boolean
  usageCount: number | null
  totalValueTnd: string | null
  targetAudience: string | null
  createdAt: string
  partner: { id: number; name: string }
}

interface OfferForm {
  title: string
  description: string
  discountType: string
  totalValueTnd: string
  startDate: string
  endDate: string
  targetAudience: string
  isActive: boolean
  termsConditions: string
}

const emptyForm: OfferForm = {
  title: "",
  description: "",
  discountType: "percentage",
  totalValueTnd: "",
  startDate: "",
  endDate: "",
  targetAudience: "",
  isActive: true,
  termsConditions: "",
}

function cleanDescription(value: string | null): string {
  if (!value) return ""
  return value.replace(/^\s*\[demo:[^\]]*\]\s*/i, "")
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

export default function PartnerOffersPage() {
  const params = useParams()
  const { user } = useAuth()
  const partnerId = params.id as string
  const isAdmin = user?.role === "admin" || user?.role === "manager"

  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [partnerName, setPartnerName] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [form, setForm] = useState<OfferForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteOffer, setDeleteOffer] = useState<Offer | null>(null)

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/offers")
      const data = await res.json()
      if (res.ok) {
        const all: Offer[] = data.offers || []
        const mine = all.filter((o) => o.partnerId === Number(partnerId))
        setOffers(mine)
        if (mine.length > 0) setPartnerName(mine[0].partner.name)
      } else {
        toast.error("Erreur", { description: "Impossible de charger les offres" })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les offres" })
    } finally {
      setLoading(false)
    }
  }, [partnerId])

  const fetchPartnerName = useCallback(async () => {
    try {
      const res = await fetch(`/api/partners?search=&category=&status=&level=`)
      const data = await res.json()
      if (res.ok) {
        const partner = data.partners?.find((p: { id: number }) => p.id === Number(partnerId))
        if (partner) setPartnerName(partner.name)
      }
    } catch {}
  }, [partnerId])

  useEffect(() => {
    fetchOffers()
    fetchPartnerName()
  }, [fetchOffers, fetchPartnerName])

  const startCreate = () => {
    setEditingOffer(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const startEdit = (offer: Offer) => {
    setEditingOffer(offer)
    setForm({
      title: offer.title,
      description: cleanDescription(offer.description),
      discountType: offer.discountType || "percentage",
      totalValueTnd: offer.totalValueTnd ?? "",
      startDate: offer.startDate ?? "",
      endDate: offer.endDate ?? "",
      targetAudience: offer.targetAudience ?? "",
      isActive: offer.isActive,
      termsConditions: offer.termsConditions ?? "",
    })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error("Erreur", { description: "Le titre est requis" })
      return
    }

    setSaving(true)
    const payload = {
      ...(editingOffer ? { id: editingOffer.id } : { partnerId: Number(partnerId) }),
      title: form.title.trim(),
      description: form.description.trim() || null,
      discountType: form.discountType,
      totalValueTnd: form.totalValueTnd.trim() || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      targetAudience: form.targetAudience.trim() || null,
      isActive: form.isActive,
      termsConditions: form.termsConditions.trim() || null,
    }

    try {
      const res = await fetch("/api/offers", {
        method: editingOffer ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data: { error?: string } = await res.json()
      if (res.ok) {
        toast.success(editingOffer ? "Offre mise à jour" : "Offre créée", {
          description: editingOffer
            ? "Les modifications ont été enregistrées."
            : "La nouvelle offre est disponible dans la liste.",
        })
        setFormOpen(false)
        setEditingOffer(null)
        setForm(emptyForm)
        await fetchOffers()
      } else {
        toast.error("Erreur", { description: data.error ?? "Impossible d'enregistrer l'offre" })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteOffer) return
    setSaving(true)
    try {
      const res = await fetch(`/api/offers?id=${deleteOffer.id}`, { method: "DELETE" })
      const data: { error?: string } = await res.json()
      if (res.ok) {
        toast.success("Offre supprimée", { description: "La liste des offres a été mise à jour." })
        setDeleteOffer(null)
        await fetchOffers()
      } else {
        toast.error("Erreur", { description: data.error ?? "Impossible de supprimer cette offre" })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard/partners">
            <Button variant="ghost" size="sm" className="shrink-0">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <HugeiconsIcon icon={Discount01Icon} className="w-6 h-6 text-primary" />
              Offres{partnerName ? " — " + partnerName : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {offers.length} offre{offers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {isAdmin && <AddButton label="Nouvelle offre" onClick={startCreate} className="shrink-0" />}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <HugeiconsIcon icon={Discount01Icon} className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-medium">Aucune offre pour ce partenaire</p>
          <p className="text-xs mt-1">Aucune offre n&apos;est associée à ce partenaire pour le moment.</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {offers.map((offer) => {
            const description = cleanDescription(offer.description)
            return (
              <motion.div
                key={offer.id}
                variants={item}
                className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
              >
                {/* Colored top bar */}
                <div className={cn("h-1", offer.isActive ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{offer.title}</h3>
                      {description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
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
                  {isAdmin && (
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => startEdit(offer)}
                      >
                        <HugeiconsIcon icon={Edit02Icon} className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => setDeleteOffer(offer)}
                      >
                        <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                        Supprimer
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Create / Edit form */}
      {isAdmin && (
        <Sheet open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); setEditingOffer(null) } }}>
          <SheetContent side="right" className="flex w-full flex-col overflow-y-auto p-0 sm:max-w-xl">
            <SheetHeader className="border-b border-border px-6 py-5 text-left">
              <SheetTitle>{editingOffer ? "Modifier l'offre" : "Nouvelle offre"}</SheetTitle>
              <SheetDescription>
                {partnerName ? `Pour ${partnerName}` : "Renseignez les informations de l'offre."}
              </SheetDescription>
            </SheetHeader>

            <form id="offer-form" onSubmit={handleSubmit} className="flex-1 space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="offer-title">Titre *</Label>
                <Input
                  id="offer-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex. Remise partenaire 2025"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="offer-description">Description</Label>
                <Textarea
                  id="offer-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez l'offre en quelques mots"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="offer-discount-type">Type de remise</Label>
                  <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                    <SelectTrigger id="offer-discount-type">
                      <SelectValue placeholder="Type de remise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage</SelectItem>
                      <SelectItem value="fixed">Montant fixe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="offer-value">Valeur (TND)</Label>
                  <Input
                    id="offer-value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.totalValueTnd}
                    onChange={(e) => setForm({ ...form, totalValueTnd: e.target.value })}
                    placeholder="Ex. 150"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="offer-start">Date de début</Label>
                  <Input
                    id="offer-start"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="offer-end">Date de fin</Label>
                  <Input
                    id="offer-end"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="offer-audience">Public cible</Label>
                <Input
                  id="offer-audience"
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  placeholder="Ex. Étudiants, Employés, Entreprises"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="offer-terms">Conditions générales</Label>
                <Textarea
                  id="offer-terms"
                  value={form.termsConditions}
                  onChange={(e) => setForm({ ...form, termsConditions: e.target.value })}
                  placeholder="Conditions d'utilisation de l'offre (optionnel)"
                  rows={3}
                />
              </div>
              <label className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="size-4 rounded border-border accent-primary"
                />
                Offre active
              </label>
            </form>

            <SheetFooter className="border-t border-border px-6 py-4">
              <Button type="button" variant="ghost" onClick={() => { setFormOpen(false); setEditingOffer(null) }}>
                Annuler
              </Button>
              <Button type="submit" form="offer-form" disabled={saving}>
                {saving ? "Enregistrement..." : editingOffer ? "Enregistrer" : "Créer l'offre"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOffer !== null} onOpenChange={(open) => { if (!open) setDeleteOffer(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette offre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement {deleteOffer ? `« ${deleteOffer.title} »` : "cette offre"} de la fiche partenaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={saving} onClick={(event) => { event.preventDefault(); handleDelete() }}>
              {saving ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
