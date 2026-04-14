"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { Badge } from "@/frontend/components/ui/badge"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"

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
        setForm({ partnerId: "", title: "", description: "", discountType: "percentage", startDate: "", endDate: "", termsConditions: "", targetAudience: "employees" })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Offres</h1>
          <p className="text-sm text-muted-foreground mt-1">{offers.length} offre{offers.length > 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Fermer" : "+ Nouvelle offre"}
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="p-4 border border-border rounded-lg space-y-4">
          <h2 className="font-semibold text-sm">Ajouter une offre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>ID Partenaire *</Label>
              <Input type="number" value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Titre *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
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
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? "Enregistrement..." : "Ajouter"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucune offre</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((o) => (
            <div key={o.id} className="p-4 border border-border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{o.title}</h3>
                  <p className="text-sm text-muted-foreground">{o.description || ""}</p>
                </div>
                <Badge variant={o.isActive ? "default" : "secondary"}>
                  {o.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{o.partner?.name || `Partenaire #${o.partnerId}`}</span>
                {o.discountType && <><span>•</span><span className="capitalize">{o.discountType === "percentage" ? "Pourcentage" : "Montant fixe"}</span></>}
                {o.targetAudience && <><span>•</span><span className="capitalize">{o.targetAudience}</span></>}
                {o.startDate && <><span>•</span><span>Du {new Date(o.startDate).toLocaleDateString("fr-FR")}</span></>}
                {o.endDate && <><span>au {new Date(o.endDate).toLocaleDateString("fr-FR")}</span></>}
              </div>
              {o.termsConditions && (
                <p className="text-xs text-muted-foreground italic">{o.termsConditions}</p>
              )}
              {isAdmin && (
                <div className="pt-2">
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(o.id)}>
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
