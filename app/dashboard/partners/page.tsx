"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete01Icon, Building06Icon } from "@hugeicons/core-free-icons"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge, DetailPanel, DetailCard } from "@/components/ui/capgemini-table"
import { SparklesText } from "@/components/ui/sparkles-text"
import { AddButton } from "@/components/ui/add-button"

interface Partner {
  id: number
  name: string
  legalName: string | null
  categories: string | null
  partnerSubcategory: string | null
  partnershipLevel: string | null
  partnershipStatus: string | null
  country: string | null
  email: string | null
  phone: string | null
  partnershipStartDate: string | null
  satisfactionScore: number | null
  annualBudgetTnd: number | null
}

const CATEGORIES = ["customer", "marketing", "supplier", "university"]
const STATUSES = ["actif", "en_negociation", "inactif", "termine"]
const LEVELS = ["Standard", "Stratégique", "Exclusif", "actif"]

const statusColors: Record<string, string> = {
  actif: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  en_negociation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  inactif: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  termine: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  prospect: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
}

const categoryLabels: Record<string, string> = {
  customer: "Client",
  marketing: "Marketing",
  supplier: "Fournisseur",
  university: "Université",
}

export default function PartnersPage() {
  const { user } = useAuth()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [level, setLevel] = useState("")

  const isAdmin = user?.role === "admin" || user?.role === "manager"

  // Suspension/reactivation modal state
  const [statusModal, setStatusModal] = useState<{
    open: boolean
    partner: Partner | null
    action: "suspend" | "reactivate"
  }>({ open: false, partner: null, action: "suspend" })
  const [statusReason, setStatusReason] = useState("")
  const [statusLoading, setStatusLoading] = useState(false)

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (status) params.set("status", status)
    if (level) params.set("level", level)
    if (search) params.set("search", search)

    try {
      const res = await fetch(`/api/partners?${params}`)
      const data = await res.json()
      if (res.ok) {
        setPartners(data.partners)
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les partenaires" })
    } finally {
      setLoading(false)
    }
  }, [category, status, level, search])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Supprimer le partenaire "${name}" ?`)) return
    try {
      const res = await fetch(`/api/partners/manage?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Partenaire supprimé")
        fetchPartners()
      } else {
        const data = await res.json()
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    }
  }

  const handleStatusChange = async () => {
    if (!statusModal.partner || !statusReason.trim()) {
      toast.error("Le motif est requis")
      return
    }
    setStatusLoading(true)
    try {
      const res = await fetch("/api/partners/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: statusModal.partner.id,
          action: statusModal.action,
          reason: statusReason.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        setStatusModal({ open: false, partner: null, action: "suspend" })
        setStatusReason("")
        fetchPartners()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setStatusLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Building06Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Partenaires" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-1">
              {partners.length} partenaire{partners.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link href="/dashboard/partners/new">
            <AddButton label="Nouveau partenaire" />
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Rechercher par nom..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => (<option key={c} value={c}>{categoryLabels[c]}</option>))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          <option value="">Tous statuts</option>
          {STATUSES.map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          <option value="">Tous niveaux</option>
          {LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
        </select>
        {(category || status || level || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setCategory(""); setStatus(""); setLevel(""); setSearch("") }}>
            Réinitialiser
          </Button>
        )}
      </div>

      <CapgeminiTable<Partner>
        title="Partenaires"
        subtitle="Cliquer sur un partenaire pour voir les détails"
        data={partners}
        columns={[
          {
            key: "name", label: "Nom", weight: 2,
            render: p => (
              <div>
                <p className="font-semibold text-sm text-foreground">{p.name}</p>
                {p.legalName && p.legalName !== p.name && <p className="text-xs text-muted-foreground">{p.legalName}</p>}
                {p.partnerSubcategory && <p className="text-xs text-primary/70">{p.partnerSubcategory}</p>}
              </div>
            ),
          },
          {
            key: "cat", label: "Catégorie", weight: 1.5,
            render: p => <StatusBadge status="neutral" label={categoryLabels[p.categories || ""] || p.categories || "—"} />,
          },
          {
            key: "level", label: "Niveau", weight: 1.2,
            render: p => <span className="text-sm text-muted-foreground">{p.partnershipLevel || "—"}</span>,
          },
          {
            key: "status", label: "Statut", weight: 1.2,
            render: p => {
              const s = p.partnershipStatus?.trim() || ""
              const v = s === "actif" ? "success" : s === "en_negociation" ? "warning" : s === "termine" ? "error" : "neutral"
              return <StatusBadge status={v} label={s.replace("_", " ") || "—"} />
            },
          },
          {
            key: "country", label: "Pays", weight: 1,
            render: p => <span className="text-sm text-muted-foreground">{p.country || "—"}</span>,
          },
          {
            key: "email", label: "Email", weight: 1.8,
            render: p => <span className="text-xs text-muted-foreground">{p.email || "—"}</span>,
          },
          {
            key: "actions", label: "", weight: 1.5,
            render: p => (
              <div className="flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
                <Link href={`/dashboard/partners/${p.id}/communications`}>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs px-2">Comms</Button>
                </Link>
                <Link href={`/dashboard/partners/${p.id}/documents`}>
                  <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 text-xs px-2">Docs</Button>
                </Link>
                {isAdmin && (
                  <>
                    <Link href={`/dashboard/partners/${p.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-xs px-2">Modifier</Button>
                    </Link>
                    {p.partnershipStatus?.trim() !== "inactif" ? (
                      <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600 text-xs px-2" onClick={() => { setStatusModal({ open: true, partner: p, action: "suspend" }); setStatusReason("") }}>Suspendre</Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-600 text-xs px-2" onClick={() => { setStatusModal({ open: true, partner: p, action: "reactivate" }); setStatusReason("") }}>Réactiver</Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 p-1" onClick={() => handleDelete(p.id, p.name)}>
                      <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ),
          },
        ] satisfies CapgeminiTableColumn<Partner>[]}
        loading={loading}
        emptyMessage="Aucun partenaire trouvé"
        keyExtractor={p => p.id}
        getRowGradient={p => {
          const s = p.partnershipStatus?.trim() || ""
          return s === "actif" ? "from-emerald-500/8 to-transparent" : s === "en_negociation" ? "from-amber-500/8 to-transparent" : s === "termine" ? "from-red-500/8 to-transparent" : "from-slate-500/8 to-transparent"
        }}
        renderDetail={(p, onClose) => (
          <DetailPanel onClose={onClose} title={p.name}>
            <div className="grid grid-cols-2 gap-3">
              <DetailCard label="Raison sociale" value={p.legalName || "—"} />
              <DetailCard label="Catégorie" value={categoryLabels[p.categories || ""] || p.categories || "—"} />
              <DetailCard label="Sous-catégorie" value={p.partnerSubcategory || "—"} />
              <DetailCard label="Niveau" value={p.partnershipLevel || "—"} />
              <DetailCard label="Statut" value={<StatusBadge status={p.partnershipStatus?.trim() === "actif" ? "success" : p.partnershipStatus?.trim() === "en_negociation" ? "warning" : p.partnershipStatus?.trim() === "termine" ? "error" : "neutral"} label={p.partnershipStatus?.replace("_", " ") || "—"} />} />
              <DetailCard label="Pays" value={p.country || "—"} />
              <DetailCard label="Email" value={p.email || "—"} />
              <DetailCard label="Téléphone" value={p.phone || "—"} />
              <DetailCard label="Depuis" value={p.partnershipStartDate ? new Date(p.partnershipStartDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
              <DetailCard label="Score satisfaction" value={p.satisfactionScore != null ? `${p.satisfactionScore}/10` : "—"} />
              <DetailCard label="Budget annuel" value={p.annualBudgetTnd != null ? `${p.annualBudgetTnd.toLocaleString()} TND` : "—"} />
            </div>
          </DetailPanel>
        )}
      />

      {/* Suspension/Reactivation Modal */}
      {statusModal.open && statusModal.partner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
            <div className={`p-6 border-b border-border ${
              statusModal.action === "suspend"
                ? "bg-gradient-to-r from-orange-500/10 via-red-500/10 to-transparent"
                : "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-transparent"
            }`}>
              <h2 className="text-lg font-semibold text-foreground">
                {statusModal.action === "suspend" ? "⚠️ Suspendre le partenaire" : "✅ Réactiver le partenaire"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {statusModal.partner.name} — Statut actuel : {statusModal.partner.partnershipStatus}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Motif {statusModal.action === "suspend" ? "de la suspension" : "de la réactivation"} *
                </Label>
                <Textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  rows={4}
                  placeholder={
                    statusModal.action === "suspend"
                      ? "Décrivez la raison de la suspension du partenariat..."
                      : "Décrivez la raison de la réactivation du partenariat..."
                  }
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {statusModal.action === "suspend"
                  ? "Un email sera envoyé au partenaire pour l'informer de la suspension et planifier une réunion."
                  : "Un email sera envoyé au partenaire pour l'informer de la réactivation et planifier une réunion de reprise."}
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusModal({ open: false, partner: null, action: "suspend" })
                  setStatusReason("")
                }}
                disabled={statusLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={statusLoading || !statusReason.trim()}
                className={
                  statusModal.action === "suspend"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }
              >
                {statusLoading
                  ? "En cours..."
                  : statusModal.action === "suspend"
                    ? "Confirmer la suspension"
                    : "Confirmer la réactivation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
