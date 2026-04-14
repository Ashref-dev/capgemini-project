"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Badge } from "@/frontend/components/ui/badge"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"

interface Notification {
  id: number; partnerId: number; type: string; title: string; message: string
  emailSent: boolean; emailSubject: string | null; isRead: boolean
  sentBy: string | null; createdAt: string
}

const notifTypeColors: Record<string, string> = {
  email: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  system: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  meeting: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  document: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  status_change: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  general: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
}

const notifTypeLabels: Record<string, string> = {
  email: "Email",
  system: "Système",
  meeting: "Réunion",
  document: "Document",
  status_change: "Changement statut",
  general: "Général",
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

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HugeiconsIcon icon={Mail01Icon} className="w-6 h-6 text-primary" />
          Mes Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {notifications.length} notification{notifications.length > 1 ? "s" : ""}
          {unreadCount > 0 && <span className="text-primary font-medium"> ({unreadCount} non lue{unreadCount > 1 ? "s" : ""})</span>}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HugeiconsIcon icon={Mail01Icon} className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-5 transition-colors ${
                n.isRead ? "border-border bg-card" : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-[10px] ${notifTypeColors[n.type] || ""}`}>
                      {notifTypeLabels[n.type] || n.type}
                    </Badge>
                    {n.emailSent && (
                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">
                        Email envoyé ✓
                      </Badge>
                    )}
                    {!n.emailSent && n.type === "email" && (
                      <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-300">
                        Email non envoyé — message ci-dessous
                      </Badge>
                    )}
                    {!n.isRead && (
                      <Badge className="text-[10px] bg-primary/20 text-primary">Non lu</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground">{n.title}</h3>
                  {n.emailSubject && (
                    <p className="text-xs text-muted-foreground mt-0.5">Sujet : {n.emailSubject}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{n.message}</p>
                  {n.sentBy && (
                    <p className="text-xs text-muted-foreground mt-2">De : {n.sentBy}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => markAsRead(n.id)}>
                      <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-3 h-3 mr-1" />
                      Marquer lu
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
