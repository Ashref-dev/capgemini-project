"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/toast"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge } from "@/components/ui/capgemini-table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon } from "@hugeicons/core-free-icons"
import { SparklesText } from "@/components/ui/sparkles-text"
import { formatPartnerStatus } from "@/lib/format"

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

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

export default function StatusHistoryPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<StatusHistory | null>(null)

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
        ? <StatusBadge status={statusVariant(h.oldStatus)} label={formatPartnerStatus(h.oldStatus)} />
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "new", label: "Nouveau statut", weight: 1.5,
      render: h => <StatusBadge status={statusVariant(h.newStatus)} label={formatPartnerStatus(h.newStatus)} />,
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
        onRowClick={setSelectedItem}
      />

      {/* Detail drawer */}
      <Sheet open={selectedItem !== null} onOpenChange={(open) => { if (!open) setSelectedItem(null) }}>
        <SheetContent side="right" className="flex w-full flex-col overflow-y-auto p-0 sm:max-w-xl">
          {selectedItem && (
            <>
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle>{selectedItem.partner?.name || `Partenaire #${selectedItem.partnerId}`}</SheetTitle>
                <SheetDescription asChild>
                  <span className="flex flex-wrap items-center gap-2">
                    {selectedItem.oldStatus ? (
                      <StatusBadge status={statusVariant(selectedItem.oldStatus)} label={formatPartnerStatus(selectedItem.oldStatus)} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                    <span aria-hidden="true">→</span>
                    <StatusBadge status={statusVariant(selectedItem.newStatus)} label={formatPartnerStatus(selectedItem.newStatus)} />
                  </span>
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 px-6 py-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
                  <DetailRow label="Partenaire" value={selectedItem.partner?.name || `#${selectedItem.partnerId}`} />
                  <DetailRow
                    label="Date"
                    value={new Date(selectedItem.changedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  />
                  <DetailRow
                    label="Ancien statut"
                    value={selectedItem.oldStatus ? <StatusBadge status={statusVariant(selectedItem.oldStatus)} label={formatPartnerStatus(selectedItem.oldStatus)} /> : "—"}
                  />
                  <DetailRow
                    label="Nouveau statut"
                    value={<StatusBadge status={statusVariant(selectedItem.newStatus)} label={formatPartnerStatus(selectedItem.newStatus)} />}
                  />
                  <DetailRow label="Modifié par" value={selectedItem.changedBy || "—"} />
                  {selectedItem.changeReason && (
                    <div className="sm:col-span-2">
                      <DetailRow label="Raison du changement" value={<span className="leading-relaxed">{selectedItem.changeReason}</span>} />
                    </div>
                  )}
                </dl>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
