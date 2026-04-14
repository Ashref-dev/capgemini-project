"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Badge } from "@/frontend/components/ui/badge"
import { Input } from "@/frontend/components/ui/input"
import { Button } from "@/frontend/components/ui/button"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Add01Icon,
  Delete01Icon,
  CheckmarkSquare01Icon,
} from "@hugeicons/core-free-icons"

interface Event {
  id: number
  partnerId: number
  eventName: string
  eventType: string | null
  eventDate: string
  eventLocation: string | null
  numParticipants: number | null
  numCapgeminiAttendees: number | null
  eventBudget: number | null
  satisfactionScore: number | null
  eventStatus: string | null
  notes: string | null
  partner?: { id: number; name: string }
}

interface Partner {
  id: number
  name: string
}

const statusColors: Record<string, string> = {
  planifie: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  en_cours: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  termine: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  annule: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export default function HREventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const [form, setForm] = useState({
    partnerId: "",
    eventName: "",
    eventType: "",
    eventDate: "",
    eventLocation: "",
    numParticipants: "",
    numCapgeminiAttendees: "",
    eventBudget: "",
    eventStatus: "planifie",
    notes: "",
  })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/events")
      const data = await res.json()
      if (res.ok) {
        setEvents(data.events)
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les événements" })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/partners")
      const data = await res.json()
      if (res.ok) {
        setPartners(data.partners?.map((p: Partner) => ({ id: p.id, name: p.name })) || [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchEvents()
    fetchPartners()
  }, [fetchEvents, fetchPartners])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.partnerId || !form.eventName || !form.eventDate) {
      toast.error("Partenaire, nom et date requis")
      return
    }

    setFormLoading(true)
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          partnerId: Number(form.partnerId),
          numParticipants: form.numParticipants ? Number(form.numParticipants) : null,
          numCapgeminiAttendees: form.numCapgeminiAttendees ? Number(form.numCapgeminiAttendees) : null,
          eventBudget: form.eventBudget ? Number(form.eventBudget) : null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Événement créé", { description: `${form.eventName} ajouté avec succès.` })
        setShowForm(false)
        setForm({
          partnerId: "",
          eventName: "",
          eventType: "",
          eventDate: "",
          eventLocation: "",
          numParticipants: "",
          numCapgeminiAttendees: "",
          eventBudget: "",
          eventStatus: "planifie",
          notes: "",
        })
        fetchEvents()
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de créer l'événement" })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet événement ?")) return
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Événement supprimé")
        fetchEvents()
      } else {
        const data = await res.json()
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de supprimer" })
    }
  }

  const filtered = events.filter((e) => {
    const matchSearch = `${e.eventName} ${e.partner?.name || ""}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || e.eventStatus === statusFilter
    return matchSearch && matchStatus
  })

  const upcoming = events.filter((e) => new Date(e.eventDate) >= new Date()).length
  const totalBudget = events.reduce((sum, e) => sum + (e.eventBudget || 0), 0)
  const totalParticipants = events.reduce((sum, e) => sum + (e.numParticipants || 0), 0)

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Calendar03Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Organisation des Événements</h1>
            <p className="text-sm text-muted-foreground">
              {events.length} événement{events.length > 1 ? "s" : ""} • {upcoming} à venir
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Total Événements</div>
          <div className="text-2xl font-bold mt-1">{events.length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">À venir</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{upcoming}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Budget Total</div>
          <div className="text-2xl font-bold mt-1">{totalBudget.toLocaleString()} TND</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Total Participants</div>
          <div className="text-2xl font-bold mt-1">{totalParticipants}</div>
        </motion.div>
      </div>

      {/* Creation Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border border-border rounded-xl bg-card overflow-hidden"
        >
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <h2 className="text-lg font-semibold">Organiser un Nouvel Événement</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Partenaire *</Label>
                <select
                  value={form.partnerId}
                  onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nom de l&apos;événement *</Label>
                <Input value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Type</Label>
                <Input value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} placeholder="ex: Conférence, Workshop..." />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Date *</Label>
                <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Lieu</Label>
                <Input value={form.eventLocation} onChange={(e) => setForm({ ...form, eventLocation: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nombre participants</Label>
                <Input type="number" value={form.numParticipants} onChange={(e) => setForm({ ...form, numParticipants: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Participants Capgemini</Label>
                <Input type="number" value={form.numCapgeminiAttendees} onChange={(e) => setForm({ ...form, numCapgeminiAttendees: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Budget (TND)</Label>
                <Input type="number" value={form.eventBudget} onChange={(e) => setForm({ ...form, eventBudget: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Statut</Label>
                <select
                  value={form.eventStatus}
                  onChange={(e) => setForm({ ...form, eventStatus: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {formLoading ? "Création..." : (
                  <><HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />Créer l&apos;événement</>
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-72" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="planifie">Planifié</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucun événement trouvé</div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Événement</th>
                <th className="text-left px-4 py-3 font-medium">Partenaire</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Lieu</th>
                <th className="text-left px-4 py-3 font-medium">Participants</th>
                <th className="text-left px-4 py-3 font-medium">Budget</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((evt) => (
                <tr key={evt.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{evt.eventName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{evt.partner?.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{evt.eventType || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(evt.eventDate).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{evt.eventLocation || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {evt.numParticipants || "—"}
                    {evt.numCapgeminiAttendees ? ` (${evt.numCapgeminiAttendees} Cap.)` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {evt.eventBudget ? `${evt.eventBudget.toLocaleString()} TND` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${statusColors[evt.eventStatus || ""] || ""}`}>
                      {evt.eventStatus?.replace("_", " ") || "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(evt.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
