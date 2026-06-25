"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  ArrowUpRight01Icon,
  Building06Icon,
  CheckmarkCircle02Icon,
  Delete01Icon,
  Edit02Icon,
  FileAttachmentIcon,
  MessageMultiple02Icon,
  PauseCircleIcon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge } from "@/components/ui/capgemini-table"
import { AddButton } from "@/components/ui/add-button"
import { formatPartnerCategory, formatPartnerStatus, formatPartnershipLevel } from "@/lib/format"

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

function statusVariant(status: string | null | undefined) {
  const normalized = status?.trim()
  if (normalized === "actif") return "success"
  if (normalized === "en_negociation") return "warning"
  if (normalized === "termine") return "error"
  return "neutral"
}

function PartnerDetailField({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

export default function PartnersPage() {
  const { user } = useAuth()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [level, setLevel] = useState("")
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

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

  const columns = useMemo<CapgeminiTableColumn<Partner>[]>(() => [
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
      render: p => <StatusBadge status="neutral" label={formatPartnerCategory(p.categories)} />,
    },
    {
      key: "level", label: "Niveau", weight: 1.2,
      render: p => <span className="text-sm text-muted-foreground">{p.partnershipLevel ? formatPartnershipLevel(p.partnershipLevel) : "—"}</span>,
    },
    {
      key: "status", label: "Statut", weight: 1.2,
      render: p => {
        const s = p.partnershipStatus?.trim() || ""
        return <StatusBadge status={statusVariant(s)} label={formatPartnerStatus(s)} />
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
      key: "actions", label: "Actions", weight: 2.4,
      render: p => (
        <div className="flex flex-wrap justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <Link href={`/dashboard/partners/${p.id}/communications`}>
            <Button variant="outline" size="sm" className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs">
              <HugeiconsIcon icon={MessageMultiple02Icon} className="size-3.5" />
              Communications
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3" />
            </Button>
          </Link>
          <Link href={`/dashboard/partners/${p.id}/documents`}>
            <Button variant="outline" size="sm" className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs">
              <HugeiconsIcon icon={FileAttachmentIcon} className="size-3.5" />
              Documents
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3" />
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Link href={`/dashboard/partners/${p.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs">
                  <HugeiconsIcon icon={Edit02Icon} className="size-3.5" />
                  Modifier
                </Button>
              </Link>
              {p.partnershipStatus?.trim() !== "inactif" ? (
                <Button variant="ghost" size="sm" className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-orange-600 hover:text-orange-700" onClick={() => { setStatusModal({ open: true, partner: p, action: "suspend" }); setStatusReason("") }}>
                  <HugeiconsIcon icon={PauseCircleIcon} className="size-3.5" />
                  Suspendre
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => { setStatusModal({ open: true, partner: p, action: "reactivate" }); setStatusReason("") }}>
                  <HugeiconsIcon icon={Refresh01Icon} className="size-3.5" />
                  Réactiver
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-red-600 hover:text-red-700" onClick={() => handleDelete(p.id, p.name)}>
                <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [isAdmin, setStatusModal, setStatusReason, handleDelete])

  const getRowGradient = useCallback((p: Partner) => {
    const s = p.partnershipStatus?.trim() || ""
    return s === "actif" ? "from-emerald-500/8 to-transparent"
      : s === "en_negociation" ? "from-amber-500/8 to-transparent"
      : s === "termine" ? "from-red-500/8 to-transparent"
      : "from-slate-500/8 to-transparent"
  }, [])

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Building06Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              Partenaires
            </h1>
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
          {CATEGORIES.map((c) => (<option key={c} value={c}>{formatPartnerCategory(c)}</option>))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          <option value="">Tous statuts</option>
          {STATUSES.map((s) => (<option key={s} value={s}>{formatPartnerStatus(s)}</option>))}
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
        columns={columns}
        loading={loading}
        emptyMessage="Aucun partenaire trouvé"
        keyExtractor={p => p.id}
        onRowClick={setSelectedPartner}
        getRowGradient={getRowGradient}
      />

      <Sheet open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-2xl">
          {selectedPartner && (
            <div className="flex min-h-full flex-col">
              <SheetHeader className="border-b border-border bg-muted/30 px-6 py-5 text-left">
                <div className="flex items-start gap-3 pr-8">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HugeiconsIcon icon={Building06Icon} className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-xl">{selectedPartner.name}</SheetTitle>
                    <SheetDescription>
                      {selectedPartner.legalName || formatPartnerCategory(selectedPartner.categories) || "Détails du partenaire"}
                    </SheetDescription>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={statusVariant(selectedPartner.partnershipStatus)} label={formatPartnerStatus(selectedPartner.partnershipStatus)} />
                      <StatusBadge status="neutral" label={formatPartnerCategory(selectedPartner.categories)} />
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 space-y-6 px-6 py-5">
                <section>
                  <h3 className="text-sm font-semibold text-foreground">Informations générales</h3>
                  <dl className="mt-2">
                    <PartnerDetailField label="Raison sociale" value={selectedPartner.legalName || "—"} />
                    <PartnerDetailField label="Sous-catégorie" value={selectedPartner.partnerSubcategory || "—"} />
                    <PartnerDetailField label="Niveau" value={selectedPartner.partnershipLevel ? formatPartnershipLevel(selectedPartner.partnershipLevel) : "—"} />
                    <PartnerDetailField label="Pays" value={selectedPartner.country || "—"} />
                  </dl>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-foreground">Contact</h3>
                  <dl className="mt-2">
                    <PartnerDetailField label="Email" value={selectedPartner.email || "—"} />
                    <PartnerDetailField label="Téléphone" value={selectedPartner.phone || "—"} />
                  </dl>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-foreground">Partenariat</h3>
                  <dl className="mt-2">
                    <PartnerDetailField
                      label="Depuis"
                      value={selectedPartner.partnershipStartDate ? new Date(selectedPartner.partnershipStartDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                    />
                    <PartnerDetailField label="Score satisfaction" value={selectedPartner.satisfactionScore != null ? `${selectedPartner.satisfactionScore}/10` : "—"} />
                    <PartnerDetailField label="Budget annuel" value={selectedPartner.annualBudgetTnd != null ? `${selectedPartner.annualBudgetTnd.toLocaleString()} TND` : "—"} />
                  </dl>
                </section>
              </div>

              <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card px-6 py-4">
                <Button asChild variant="outline" className="cursor-pointer">
                  <Link href={`/dashboard/partners/${selectedPartner.id}/communications`}>
                    <HugeiconsIcon icon={MessageMultiple02Icon} className="size-4" />
                    Communications
                  </Link>
                </Button>
                <Button asChild variant="outline" className="cursor-pointer">
                  <Link href={`/dashboard/partners/${selectedPartner.id}/documents`}>
                    <HugeiconsIcon icon={FileAttachmentIcon} className="size-4" />
                    Documents
                  </Link>
                </Button>
                {isAdmin && (
                  <Button asChild className="cursor-pointer">
                    <Link href={`/dashboard/partners/${selectedPartner.id}/edit`}>
                      <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                      Modifier
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Suspension/Reactivation Modal */}
      <Dialog
        open={statusModal.open}
        onOpenChange={(o) => {
          if (!o) {
            setStatusModal({ open: false, partner: null, action: "suspend" })
            setStatusReason("")
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HugeiconsIcon
                icon={statusModal.action === "suspend" ? AlertCircleIcon : CheckmarkCircle02Icon}
                className={statusModal.action === "suspend" ? "size-5 text-destructive" : "size-5 text-primary"}
              />
              {statusModal.action === "suspend" ? "Suspendre le partenaire" : "Réactiver le partenaire"}
            </DialogTitle>
            <DialogDescription>
              {statusModal.partner?.name} — Statut actuel : {formatPartnerStatus(statusModal.partner?.partnershipStatus)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
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

          <DialogFooter>
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
            {statusModal.action === "suspend" ? (
              <Button
                variant="destructive"
                onClick={handleStatusChange}
                disabled={statusLoading || !statusReason.trim()}
              >
                {statusLoading ? "En cours..." : "Confirmer la suspension"}
              </Button>
            ) : (
              <Button
                onClick={handleStatusChange}
                disabled={statusLoading || !statusReason.trim()}
              >
                {statusLoading ? "En cours..." : "Confirmer la réactivation"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
