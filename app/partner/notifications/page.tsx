"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, CheckmarkSquare01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { SparklesText } from "@/components/ui/sparkles-text"
import { cn } from "@/lib/utils"

interface Notification {
  id: number; partnerId: number; type: string; title: string; message: string
  emailSent: boolean; emailSubject: string | null; isRead: boolean
  sentBy: string | null; createdAt: string
}

const notifTypeColors: Record<string, string> = {
  email:         "bg-blue-500/10 text-blue-500 border-blue-500/20",
  system:        "bg-slate-500/10 text-slate-500 border-slate-500/20",
  meeting:       "bg-violet-500/10 text-violet-500 border-violet-500/20",
  document:      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  status_change: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  general:       "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
}

const notifTypeLabels: Record<string, string> = {
  email: "Email", system: "Système", meeting: "Réunion",
  document: "Document", status_change: "Changement statut", general: "Général",
}

export default function PartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      if (res.ok) setNotifications(data.notifications || [])
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les notifications" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "PATCH" })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead)
      await Promise.all(unread.map(n => fetch(`/api/notifications?id=${n.id}`, { method: "PATCH" })))
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success("Toutes les notifications marquées comme lues")
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Mail01Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Mes Notifications" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-0.5">
              {notifications.length} notification{notifications.length > 1 ? "s" : ""}
              {unreadCount > 0 && (
                <span className="text-primary font-medium"> - {unreadCount} non lue{unreadCount > 1 ? "s" : ""}</span>
              )}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllRead} variant="outline" size="sm" className="text-xs gap-1.5">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-3.5 h-3.5" />
            Tout marquer comme lu
          </Button>
        )}
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-card border border-border rounded-xl"
        >
          <HugeiconsIcon icon={Mail01Icon} className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-muted-foreground">Aucune notification</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "rounded-xl border overflow-hidden transition-colors",
                  n.isRead ? "border-border bg-card" : "border-primary/20 bg-primary/3"
                )}
              >
                <div className="flex">
                  {/* Left accent bar */}
                  {!n.isRead && <div className="w-1 shrink-0 bg-primary" />}

                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center flex-wrap gap-1.5 mb-2">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", notifTypeColors[n.type] || "bg-muted text-muted-foreground border-border")}>
                            {notifTypeLabels[n.type] || n.type}
                          </span>
                          {n.emailSent && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Email envoyé
                            </span>
                          )}
                          {!n.isRead && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              Nouveau
                            </span>
                          )}
                        </div>

                        <h3 className={cn("font-semibold text-sm", n.isRead ? "text-foreground/80" : "text-foreground")}>
                          {n.title}
                        </h3>
                        {n.emailSubject && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">Sujet : {n.emailSubject}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground/70">
                          <span>
                            {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit", month: "long", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                          {n.sentBy && <span>- De : {n.sentBy}</span>}
                        </div>
                      </div>

                      {/* Mark read button */}
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          title="Marquer comme lu"
                          className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors group mt-0.5"
                        >
                          <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 group-hover:text-primary" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
