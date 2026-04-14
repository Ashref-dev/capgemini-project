"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Calendar03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Badge } from "@/frontend/components/ui/badge"
import { Spinner } from "@/frontend/components/ui/spinner"
import Link from "next/link"

interface PartnerEvent {
  id: number
  eventName: string
  eventType: string | null
  eventDate: string
  eventLocation: string | null
  numParticipants: number | null
  eventBudget: number | null
  eventStatus: string | null
  notes: string | null
  createdAt: string
}

const statusLabels: Record<string, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  planifie: "outline",
  en_cours: "default",
  termine: "secondary",
  annule: "destructive",
}

export default function PartnerEventsPage() {
  const [events, setEvents] = useState<PartnerEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/partner/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
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
          <h1 className="text-2xl font-bold text-foreground">Mes Événements</h1>
          <p className="text-muted-foreground mt-1">{events.length} événement(s) au total</p>
        </div>
        <Link href="/partner/events/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </Link>
      </motion.div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <HugeiconsIcon icon={Calendar03Icon} className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucun événement pour le moment</p>
          <Link href="/partner/events/new">
            <Button variant="outline" className="mt-4">
              Créer votre premier événement
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{event.eventName}</h3>
                  {event.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.notes}</p>
                  )}
                </div>
                <Badge variant={statusColors[event.eventStatus || ""] || "outline"}>
                  {statusLabels[event.eventStatus || ""] || event.eventStatus}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Date : {new Date(event.eventDate).toLocaleDateString("fr-FR")}</span>
                {event.eventLocation && <span>Lieu : {event.eventLocation}</span>}
                {event.eventType && <span>Type : {event.eventType}</span>}
                {event.numParticipants && <span>Participants : {event.numParticipants}</span>}
                {event.eventBudget && <span>Budget : {event.eventBudget.toLocaleString()} TND</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
