"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkSquare01Icon, Calendar03Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { toast } from "@/frontend/components/ui/toast"
import Link from "next/link"

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    eventName: "",
    eventType: "",
    eventDate: "",
    eventLocation: "",
    numParticipants: "",
    numCapgeminiAttendees: "",
    numLeadsGenerated: "",
    numConversions: "",
    eventBudget: "",
    satisfactionScore: "",
    eventStatus: "planifie",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.eventName.trim() || !form.eventDate) {
      toast.error("Le nom et la date sont requis")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/partner/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          numParticipants: form.numParticipants || null,
          numCapgeminiAttendees: form.numCapgeminiAttendees || null,
          numLeadsGenerated: form.numLeadsGenerated || null,
          numConversions: form.numConversions || null,
          eventBudget: form.eventBudget || null,
          satisfactionScore: form.satisfactionScore || null,
        }),
      })

      if (res.ok) {
        toast.success("Événement créé avec succès")
        router.push("/partner/events")
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
          href="/partner/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Retour aux événements
        </Link>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Nouvel événement</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/partner/events">
                <Button type="button" variant="ghost" disabled={loading}>
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                form="event-form"
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
          <form id="event-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="eventName" className="text-sm font-semibold text-foreground">
                  Nom de l&apos;événement *
                </Label>
                <Input
                  id="eventName"
                  name="eventName"
                  value={form.eventName}
                  onChange={handleChange}
                  placeholder="Ex: Journée portes ouvertes"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-sm font-semibold text-foreground">
                  Type d&apos;événement
                </Label>
                <Input
                  id="eventType"
                  name="eventType"
                  value={form.eventType}
                  onChange={handleChange}
                  placeholder="Ex: Conférence, Workshop..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-sm font-semibold text-foreground">
                  Date *
                </Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventLocation" className="text-sm font-semibold text-foreground">
                  Lieu
                </Label>
                <Input
                  id="eventLocation"
                  name="eventLocation"
                  value={form.eventLocation}
                  onChange={handleChange}
                  placeholder="Ex: Tunis, Hôtel Africa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventStatus" className="text-sm font-semibold text-foreground">
                  Statut
                </Label>
                <select
                  id="eventStatus"
                  name="eventStatus"
                  value={form.eventStatus}
                  onChange={handleChange}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numParticipants" className="text-sm font-semibold text-foreground">
                  Nombre de participants
                </Label>
                <Input
                  id="numParticipants"
                  name="numParticipants"
                  type="number"
                  value={form.numParticipants}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numCapgeminiAttendees" className="text-sm font-semibold text-foreground">
                  Participants Capgemini
                </Label>
                <Input
                  id="numCapgeminiAttendees"
                  name="numCapgeminiAttendees"
                  type="number"
                  value={form.numCapgeminiAttendees}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numLeadsGenerated" className="text-sm font-semibold text-foreground">
                  Leads générés
                </Label>
                <Input
                  id="numLeadsGenerated"
                  name="numLeadsGenerated"
                  type="number"
                  value={form.numLeadsGenerated}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numConversions" className="text-sm font-semibold text-foreground">
                  Conversions
                </Label>
                <Input
                  id="numConversions"
                  name="numConversions"
                  type="number"
                  value={form.numConversions}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventBudget" className="text-sm font-semibold text-foreground">
                  Budget (TND)
                </Label>
                <Input
                  id="eventBudget"
                  name="eventBudget"
                  type="number"
                  value={form.eventBudget}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="satisfactionScore" className="text-sm font-semibold text-foreground">
                  Score satisfaction (0-100)
                </Label>
                <Input
                  id="satisfactionScore"
                  name="satisfactionScore"
                  type="number"
                  min="0"
                  max="100"
                  value={form.satisfactionScore}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Notes supplémentaires..."
                  rows={3}
                />
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
