"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, MapPinIcon, UserGroupIcon, MoneyBag02Icon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { AddButton } from "@/components/ui/add-button"
import { SparklesText } from "@/components/ui/sparkles-text"
import { cn } from "@/lib/utils"
import { formatEventType, formatEventStatus } from "@/lib/format"
import Link from "next/link"

interface PartnerEvent {
  id: number; eventName: string; eventType: string | null; eventDate: string
  eventLocation: string | null; numParticipants: number | null; eventBudget: number | null
  eventStatus: string | null; notes: string | null; createdAt: string
}

const statusBar: Record<string, string> = {
  planifie: "bg-blue-500", en_cours: "bg-emerald-500",
  termine: "bg-slate-400",  annule: "bg-red-400",
}

const statusBadge: Record<string, string> = {
  planifie: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  en_cours: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  termine:  "bg-slate-500/10 text-slate-600 border-slate-500/20",
  annule:   "bg-red-500/10 text-red-600 border-red-500/20",
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

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Calendar03Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Mes Événements" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-0.5">{events.length} événement{events.length > 1 ? "s" : ""} au total</p>
          </div>
        </div>
        <Link href="/partner/events/new">
          <AddButton label="Nouvel événement" />
        </Link>
      </motion.div>

      {events.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-card border border-border rounded-xl"
        >
          <HugeiconsIcon icon={Calendar03Icon} className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">Aucun événement pour le moment</p>
          <Link href="/partner/events/new">
            <AddButton label="Créer votre premier événement" className="mt-4 mx-auto" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className={cn("h-1", statusBar[event.eventStatus || ""] || "bg-muted")} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{event.eventName}</h3>
                    {event.notes && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{event.notes}</p>}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar03Icon} className="w-3 h-3" />
                        {new Date(event.eventDate).toLocaleDateString("fr-FR")}
                      </span>
                      {event.eventLocation && (
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={MapPinIcon} className="w-3 h-3" />
                          {event.eventLocation}
                        </span>
                      )}
                      {event.eventType && <span>{formatEventType(event.eventType)}</span>}
                      {event.numParticipants && (
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
                          {event.numParticipants} participants
                        </span>
                      )}
                      {event.eventBudget && (
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={MoneyBag02Icon} className="w-3 h-3" />
                          {event.eventBudget.toLocaleString()} TND
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0", statusBadge[event.eventStatus || ""] || "bg-muted text-muted-foreground border-border")}>
                    {formatEventStatus(event.eventStatus)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
