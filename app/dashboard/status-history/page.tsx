"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Badge } from "@/frontend/components/ui/badge"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"

interface StatusHistory {
  id: number
  partnerId: number
  oldStatus: string | null
  newStatus: string
  changedAt: string
  changedBy: string | null
  changeReason: string | null
  partner?: { id: number; name: string } | null
}

export default function StatusHistoryPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/status-history")
      const data = await res.json()
      if (res.ok) setHistory(data.history)
    } catch {
      toast.error("Erreur", { description: "Impossible de charger l'historique" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const statusColor = (s: string) => {
    switch (s) {
      case "actif": return "default"
      case "en_negociation": return "secondary"
      case "inactif": return "outline"
      case "termine": return "destructive"
      default: return "outline"
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historique des statuts</h1>
        <p className="text-sm text-muted-foreground mt-1">{history.length} changement{history.length > 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucun historique</div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium">Partenaire</th>
                <th className="text-left p-3 font-medium">Ancien statut</th>
                <th className="text-left p-3 font-medium">Nouveau statut</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Modifié par</th>
                <th className="text-left p-3 font-medium">Raison</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{h.partner?.name || `Partenaire #${h.partnerId}`}</td>
                  <td className="p-3">
                    <Badge variant={statusColor(h.oldStatus || "") as "default" | "secondary" | "destructive" | "outline"}>
                      {h.oldStatus || "—"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={statusColor(h.newStatus) as "default" | "secondary" | "destructive" | "outline"}>
                      {h.newStatus}
                    </Badge>
                  </td>
                  <td className="p-3">{new Date(h.changedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="p-3 text-muted-foreground">{h.changedBy || "—"}</td>
                  <td className="p-3 max-w-xs truncate text-muted-foreground">{h.changeReason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
