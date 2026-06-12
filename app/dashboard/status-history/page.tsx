"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge, DetailPanel, DetailCard } from "@/components/ui/capgemini-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon } from "@hugeicons/core-free-icons"
import { SparklesText } from "@/components/ui/sparkles-text"

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

function statusVariant(s: string): "success" | "warning" | "error" | "neutral" | "info" {
  switch (s) {
    case "actif": return "success"
    case "en_negociation": return "warning"
    case "inactif": return "error"
    case "termine": return "error"
    default: return "neutral"
  }
}

function statusGradient(s: string): string {
  switch (s) {
    case "actif": return "from-emerald-500/10 to-transparent"
    case "en_negociation": return "from-amber-500/10 to-transparent"
    case "inactif": return "from-red-500/10 to-transparent"
    case "termine": return "from-red-500/10 to-transparent"
    default: return "from-muted/20 to-transparent"
  }
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

  useEffect(() => { fetchHistory() }, [fetchHistory])

  if (!user) return null

  const columns: CapgeminiTableColumn<StatusHistory>[] = [
    {
      key: "partner", label: "Partenaire", weight: 2,
      render: h => <span className="font-semibold text-sm text-foreground">{h.partner?.name || `Partenaire #${h.partnerId}`}</span>,
    },
    {
      key: "old", label: "Ancien statut", weight: 1.5,
      render: h => h.oldStatus
        ? <StatusBadge status={statusVariant(h.oldStatus)} label={h.oldStatus.replace("_", " ")} />
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "new", label: "Nouveau statut", weight: 1.5,
      render: h => <StatusBadge status={statusVariant(h.newStatus)} label={h.newStatus.replace("_", " ")} />,
    },
    {
      key: "date", label: "Date", weight: 2,
      render: h => (
        <span className="text-sm text-foreground font-mono">
          {new Date(h.changedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      key: "by", label: "Modifié par", weight: 1.5,
      render: h => <span className="text-sm text-muted-foreground">{h.changedBy || "—"}</span>,
    },
    {
      key: "reason", label: "Raison", weight: 2,
      render: h => <span className="text-sm text-muted-foreground truncate block max-w-[200px]">{h.changeReason || "—"}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-primary" />
        </div>
        <div>
          <SparklesText text="Historique des statuts" className="text-2xl" />
          <p className="text-sm text-muted-foreground mt-1">{history.length} changement{history.length > 1 ? "s" : ""}</p>
        </div>
      </div>
      <CapgeminiTable<StatusHistory>
        title="Changements de statut"
        subtitle="Tous les changements de statut des partenaires"
        data={history}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun historique disponible"
        keyExtractor={h => h.id}
        getRowGradient={h => statusGradient(h.newStatus)}
        renderDetail={(h, onClose) => (
          <DetailPanel onClose={onClose} title={`Changement #${h.id}`}>
            <div className="grid grid-cols-2 gap-3">
              <DetailCard label="Partenaire" value={h.partner?.name || `#${h.partnerId}`} />
              <DetailCard label="Date" value={new Date(h.changedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
              <DetailCard label="Ancien statut" value={h.oldStatus ? <StatusBadge status={statusVariant(h.oldStatus)} label={h.oldStatus.replace("_", " ")} /> : "—"} />
              <DetailCard label="Nouveau statut" value={<StatusBadge status={statusVariant(h.newStatus)} label={h.newStatus.replace("_", " ")} />} />
              <DetailCard label="Modifié par" value={h.changedBy || "—"} />
            </div>
            {h.changeReason && (
              <DetailCard label="Raison du changement" value={<p className="text-sm text-foreground leading-relaxed">{h.changeReason}</p>} />
            )}
          </DetailPanel>
        )}
      />
    </div>
  )
}
