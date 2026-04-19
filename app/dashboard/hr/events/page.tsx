"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Input } from "@/frontend/components/ui/input"
import { Button } from "@/frontend/components/ui/button"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge, DetailPanel, DetailCard } from "@/frontend/components/ui/capgemini-table"
import { SparklesText } from "@/frontend/components/ui/sparkles-text"
import { GradientStatCard } from "@/frontend/components/ui/gradient-stat-card"
import { AddButton } from "@/frontend/components/ui/add-button"

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
            <SparklesText text="Organisation des Événements" className="text-2xl" />
            <p className="text-sm text-muted-foreground">
              {events.length} événement{events.length > 1 ? "s" : ""} • {upcoming} à venir
            </p>
          </div>
        </div>
        <AddButton label="Nouvel événement" onClick={() => setShowForm(!showForm)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GradientStatCard value={events.length} label="Total Événements" glowColor="blue" index={0} />
        <GradientStatCard value={upcoming} label="À venir" glowColor="cyan" index={1} />
        <GradientStatCard value={`${totalBudget.toLocaleString()} TND`} label="Budget Total" glowColor="amber" index={2} />
        <GradientStatCard value={totalParticipants} label="Total Participants" glowColor="violet" index={3} />
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
              <AddButton type="submit" label={formLoading ? "Création..." : "Créer l'événement"} disabled={formLoading} />
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
      <CapgeminiTable<Event>
        title="Événements partenaires"
        subtitle="Cliquer sur un événement pour voir les détails"
        data={filtered}
        columns={[
          {
            key: "name", label: "Événement", weight: 2,
            render: evt => (
              <div>
                <p className="font-semibold text-sm text-foreground">{evt.eventName}</p>
                {evt.eventType && <p className="text-xs text-muted-foreground mt-0.5">{evt.eventType}</p>}
              </div>
            ),
          },
          {
            key: "partner", label: "Partenaire", weight: 1.5,
            render: evt => <span className="text-sm text-muted-foreground">{evt.partner?.name || "—"}</span>,
          },
          {
            key: "date", label: "Date", weight: 1.5,
            render: evt => (
              <span className="text-sm font-mono text-foreground">
                {new Date(evt.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            ),
          },
          {
            key: "location", label: "Lieu", weight: 1.5,
            render: evt => <span className="text-sm text-muted-foreground">{evt.eventLocation || "—"}</span>,
          },
          {
            key: "participants", label: "Participants", weight: 1,
            render: evt => (
              <span className="text-sm text-muted-foreground">
                {evt.numParticipants || "—"}
                {evt.numCapgeminiAttendees ? <span className="text-xs ml-1 text-primary">({evt.numCapgeminiAttendees} Cap.)</span> : null}
              </span>
            ),
          },
          {
            key: "budget", label: "Budget", weight: 1.5,
            render: evt => <span className="text-sm text-muted-foreground">{evt.eventBudget ? `${evt.eventBudget.toLocaleString()} TND` : "—"}</span>,
          },
          {
            key: "status", label: "Statut", weight: 1,
            render: evt => {
              const s = evt.eventStatus || ""
              const v = s === "termine" ? "success" : s === "en_cours" ? "warning" : s === "annule" ? "error" : "info"
              return <StatusBadge status={v} label={s.replace("_", " ") || "—"} />
            },
          },
          {
            key: "actions", label: "", weight: 0.5,
            render: evt => (
              <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleDelete(evt.id) }} className="text-red-500 hover:text-red-600 p-1">
                <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
              </Button>
            ),
          },
        ] satisfies CapgeminiTableColumn<Event>[]}
        loading={loading}
        emptyMessage="Aucun événement trouvé"
        keyExtractor={evt => evt.id}
        getRowGradient={evt => {
          const s = evt.eventStatus || ""
          return s === "termine" ? "from-emerald-500/8 to-transparent" : s === "en_cours" ? "from-amber-500/8 to-transparent" : s === "annule" ? "from-red-500/8 to-transparent" : "from-blue-500/8 to-transparent"
        }}
        renderDetail={(evt, onClose) => (
          <DetailPanel onClose={onClose} title={evt.eventName}>
            <div className="grid grid-cols-2 gap-3">
              <DetailCard label="Partenaire" value={evt.partner?.name || "—"} />
              <DetailCard label="Type" value={evt.eventType || "—"} />
              <DetailCard label="Date" value={new Date(evt.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
              <DetailCard label="Lieu" value={evt.eventLocation || "—"} />
              <DetailCard label="Participants" value={evt.numParticipants?.toString() || "—"} />
              <DetailCard label="Participants Capgemini" value={evt.numCapgeminiAttendees?.toString() || "—"} />
              <DetailCard label="Budget" value={evt.eventBudget ? `${evt.eventBudget.toLocaleString()} TND` : "—"} />
              <DetailCard label="Score satisfaction" value={evt.satisfactionScore != null ? `${evt.satisfactionScore}/10` : "—"} />
              <DetailCard label="Statut" value={<StatusBadge status={evt.eventStatus === "termine" ? "success" : evt.eventStatus === "en_cours" ? "warning" : evt.eventStatus === "annule" ? "error" : "info"} label={evt.eventStatus?.replace("_", " ") || "—"} />} />
            </div>
            {evt.notes && <DetailCard label="Notes" value={<p className="text-sm text-foreground leading-relaxed">{evt.notes}</p>} />}
          </DetailPanel>
        )}
      />
    </div>
  )
}

