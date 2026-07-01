"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, Delete01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge } from "@/components/ui/capgemini-table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SparklesText } from "@/components/ui/sparkles-text"
import { GradientStatCard } from "@/components/ui/gradient-stat-card"
import { AddButton } from "@/components/ui/add-button"
import { PartnerSelect } from "@/components/ui/partner-select"
import { formatEventType, formatEventStatus } from "@/lib/format"

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

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

export default function HREventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

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

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

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
                <PartnerSelect
                  value={form.partnerId}
                  onChange={(id) => setForm({ ...form, partnerId: id })}
                  required
                />
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
                {evt.eventType && <p className="text-xs text-muted-foreground mt-0.5">{formatEventType(evt.eventType)}</p>}
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
              return <StatusBadge status={v} label={formatEventStatus(s)} />
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
        onRowClick={setSelectedEvent}
      />

      {/* Detail drawer */}
      <Sheet open={selectedEvent !== null} onOpenChange={(open) => { if (!open) setSelectedEvent(null) }}>
        <SheetContent side="right" className="flex w-full flex-col overflow-y-auto p-0 sm:max-w-xl">
          {selectedEvent && (
            <>
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle>{selectedEvent.eventName}</SheetTitle>
                <SheetDescription asChild>
                  <span className="flex flex-wrap items-center gap-2">
                    {selectedEvent.eventType && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {formatEventType(selectedEvent.eventType)}
                      </span>
                    )}
                    <span>{selectedEvent.partner?.name || "Partenaire inconnu"}</span>
                  </span>
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 px-6 py-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
                  <DetailRow label="Partenaire" value={selectedEvent.partner?.name || "—"} />
                  <DetailRow label="Type" value={selectedEvent.eventType ? formatEventType(selectedEvent.eventType) : "—"} />
                  <DetailRow label="Date" value={new Date(selectedEvent.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
                  <DetailRow label="Lieu" value={selectedEvent.eventLocation || "—"} />
                  <DetailRow label="Participants" value={selectedEvent.numParticipants?.toString() || "—"} />
                  <DetailRow label="Participants Capgemini" value={selectedEvent.numCapgeminiAttendees?.toString() || "—"} />
                  <DetailRow label="Budget" value={selectedEvent.eventBudget ? `${selectedEvent.eventBudget.toLocaleString("fr-FR")} TND` : "—"} />
                  <DetailRow label="Score satisfaction" value={selectedEvent.satisfactionScore != null ? `${selectedEvent.satisfactionScore}/10` : "—"} />
                  <DetailRow
                    label="Statut"
                    value={<StatusBadge status={selectedEvent.eventStatus === "termine" ? "success" : selectedEvent.eventStatus === "en_cours" ? "warning" : selectedEvent.eventStatus === "annule" ? "error" : "info"} label={formatEventStatus(selectedEvent.eventStatus)} />}
                  />
                  {selectedEvent.notes && (
                    <div className="sm:col-span-2">
                      <DetailRow label="Notes" value={<span className="leading-relaxed">{selectedEvent.notes}</span>} />
                    </div>
                  )}
                </dl>
              </div>

              <SheetFooter className="border-t border-border px-6 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    const id = selectedEvent.id
                    setSelectedEvent(null)
                    void handleDelete(id)
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  Supprimer
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

