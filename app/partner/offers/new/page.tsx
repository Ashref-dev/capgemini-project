"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkSquare01Icon, Discount01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import Link from "next/link"

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountType: "percentage",
    startDate: "",
    endDate: "",
    termsConditions: "",
    targetAudience: "",
    isActive: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error("Le titre est requis")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/partner/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success("Offre créée avec succès")
        router.push("/partner/offers")
      } else {
        const data = await res.json()
        toast.error(data.error || "Erreur lors de la création")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/partner/offers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Retour aux offres
        </Link>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <HugeiconsIcon icon={Discount01Icon} className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Nouvelle offre</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/partner/offers">
                <Button type="button" variant="ghost" disabled={loading}>
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                form="offer-form"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? (
                  "Création..."
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />
                    Créer
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Form */}
          <form id="offer-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                  Titre de l&apos;offre *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ex: Réduction 20% sur les licences"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre offre..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountType" className="text-sm font-semibold text-foreground">
                  Type de réduction *
                </Label>
                <select
                  id="discountType"
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed">Montant fixe</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-sm font-semibold text-foreground">
                  Audience cible
                </Label>
                <Input
                  id="targetAudience"
                  name="targetAudience"
                  value={form.targetAudience}
                  onChange={handleChange}
                  placeholder="Ex: Employés Capgemini"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold text-foreground">
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold text-foreground">
                  Date de fin
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="termsConditions" className="text-sm font-semibold text-foreground">
                  Conditions
                </Label>
                <Textarea
                  id="termsConditions"
                  name="termsConditions"
                  value={form.termsConditions}
                  onChange={handleChange}
                  placeholder="Conditions et termes de l'offre..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="rounded border-input"
                />
                <Label htmlFor="isActive" className="text-sm font-semibold text-foreground">
                  Offre active
                </Label>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
