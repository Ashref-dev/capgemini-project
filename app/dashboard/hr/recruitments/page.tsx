"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MortarboardIcon, Delete01Icon } from "@hugeicons/core-free-icons"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge } from "@/components/ui/capgemini-table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { GradientStatCard } from "@/components/ui/gradient-stat-card"
import { AddButton } from "@/components/ui/add-button"
import { PartnerSelect } from "@/components/ui/partner-select"

interface Recruitment {
  id: number
  universityPartnerId: number
  studentFirstName: string | null
  studentLastName: string | null
  studentEmail: string | null
  studentPhone: string | null
  recruitmentType: string | null
  contractDurationMonths: number | null
  startDate: string
  endDate: string | null
  degreeLevel: string | null
  specialization: string | null
  skills: string[] | null
  assignedProject: string | null
  assignedTeam: string | null
  managerName: string | null
  managerEmail: string | null
  performanceScore: number | null
  satisfactionScore: number | null
  convertedToCdi: boolean
  notes: string | null
  createdAt: string | null
  universityPartner?: { partnerId: number } & Record<string, unknown>
}

const recruitmentTypeLabels: Record<string, string> = {
  stage: "Stage",
  alternance: "Alternance",
  vie: "VIE",
  cdi_jeune_diplome: "CDI Jeune Diplômé",
  contrat_pro: "Contrat Pro",
}

const typeColors: Record<string, string> = {
  stage: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  alternance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  vie: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cdi_jeune_diplome: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  contrat_pro: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
}

export default function HRRecruitmentsPage() {
  const { user } = useAuth()
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [selectedRecruitment, setSelectedRecruitment] = useState<Recruitment | null>(null)
  const [form, setForm] = useState({
    universityPartnerId: "",
    studentFirstName: "",
    studentLastName: "",
    studentEmail: "",
    studentPhone: "",
    recruitmentType: "stage",
    contractDurationMonths: "",
    startDate: "",
    endDate: "",
    degreeLevel: "",
    specialization: "",
    assignedProject: "",
    assignedTeam: "",
    managerName: "",
    managerEmail: "",
    notes: "",
  })

  const fetchRecruitments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/hr/recruitments")
      const data = await res.json()
      if (res.ok) {
        setRecruitments(data.recruitments)
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les recrutements" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecruitments()
  }, [fetchRecruitments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.universityPartnerId || !form.startDate) {
      toast.error("Partenaire universitaire et date de début requis")
      return
    }

    setFormLoading(true)
    try {
      const res = await fetch("/api/hr/recruitments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          universityPartnerId: Number(form.universityPartnerId),
          contractDurationMonths: form.contractDurationMonths ? Number(form.contractDurationMonths) : null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Recrutement créé", { description: `${form.studentFirstName} ${form.studentLastName} ajouté.` })
        setShowForm(false)
        setForm({
          universityPartnerId: "",
          studentFirstName: "",
          studentLastName: "",
          studentEmail: "",
          studentPhone: "",
          recruitmentType: "stage",
          contractDurationMonths: "",
          startDate: "",
          endDate: "",
          degreeLevel: "",
          specialization: "",
          assignedProject: "",
          assignedTeam: "",
          managerName: "",
          managerEmail: "",
          notes: "",
        })
        fetchRecruitments()
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de créer le recrutement" })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce recrutement ?")) return
    try {
      const res = await fetch(`/api/hr/recruitments?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Recrutement supprimé")
        fetchRecruitments()
      } else {
        const data = await res.json()
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de supprimer" })
    }
  }

  const filtered = recruitments.filter((r) => {
    const name = `${r.studentFirstName || ""} ${r.studentLastName || ""} ${r.studentEmail || ""}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase())
    const matchType = !typeFilter || r.recruitmentType === typeFilter
    return matchSearch && matchType
  })

  const cdiCount = recruitments.filter((r) => r.convertedToCdi).length
  const activeCount = recruitments.filter((r) => !r.endDate || new Date(r.endDate) >= new Date()).length

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={MortarboardIcon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Recrutements Étudiants</h1>
            <p className="text-sm text-muted-foreground">
              {recruitments.length} recrutement{recruitments.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
          <AddButton label="Nouveau recrutement" onClick={() => setShowForm(!showForm)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GradientStatCard value={recruitments.length} label="Total Recrutements" glowColor="blue" index={0} />
        <GradientStatCard value={activeCount} label="En cours" glowColor="cyan" index={1} />
        <GradientStatCard value={cdiCount} label="Convertis CDI" glowColor="emerald" index={2} />
        <GradientStatCard
          value={`${recruitments.length > 0 ? Math.round((cdiCount / recruitments.length) * 100) : 0}%`}
          label="Taux Conversion CDI"
          glowColor="violet"
          index={3}
        />
      </div>

      {/* Creation Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border border-border rounded-xl bg-card overflow-hidden"
        >
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <h2 className="text-lg font-semibold">Nouveau Recrutement</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Université partenaire *</Label>
                <PartnerSelect
                  value={form.universityPartnerId}
                  onChange={(id) => setForm({ ...form, universityPartnerId: id })}
                  category="university"
                  placeholder="Sélectionner une université..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Prénom étudiant</Label>
                <Input value={form.studentFirstName} onChange={(e) => setForm({ ...form, studentFirstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nom étudiant</Label>
                <Input value={form.studentLastName} onChange={(e) => setForm({ ...form, studentLastName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Email étudiant</Label>
                <Input type="email" value={form.studentEmail} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Téléphone étudiant</Label>
                <Input value={form.studentPhone} onChange={(e) => setForm({ ...form, studentPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Type de recrutement</Label>
                <select
                  value={form.recruitmentType}
                  onChange={(e) => setForm({ ...form, recruitmentType: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                >
                  {Object.entries(recruitmentTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Durée (mois)</Label>
                <Input type="number" value={form.contractDurationMonths} onChange={(e) => setForm({ ...form, contractDurationMonths: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Date début *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Date fin</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Niveau diplôme</Label>
                <Input value={form.degreeLevel} onChange={(e) => setForm({ ...form, degreeLevel: e.target.value })} placeholder="ex: Master 2, Licence 3..." />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Spécialisation</Label>
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="ex: Informatique, Finance..." />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Projet assigné</Label>
                <Input value={form.assignedProject} onChange={(e) => setForm({ ...form, assignedProject: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Équipe assignée</Label>
                <Input value={form.assignedTeam} onChange={(e) => setForm({ ...form, assignedTeam: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nom manager</Label>
                <Input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Email manager</Label>
                <Input type="email" value={form.managerEmail} onChange={(e) => setForm({ ...form, managerEmail: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-2 pt-2">
              <AddButton type="submit" label={formLoading ? "Création..." : "Créer le recrutement"} disabled={formLoading} />
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">Tous les types</option>
          {Object.entries(recruitmentTypeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <CapgeminiTable<Recruitment>
        title="Recrutements & Stages"
        subtitle="Cliquer sur un recrutement pour voir les détails"
        data={filtered}
        columns={[
          {
            key: "student", label: "Étudiant", weight: 2,
            render: r => (
              <div>
                <p className="font-semibold text-sm text-foreground">{r.studentFirstName} {r.studentLastName}</p>
                {r.studentEmail && <p className="text-xs text-muted-foreground mt-0.5">{r.studentEmail}</p>}
              </div>
            ),
          },
          {
            key: "type", label: "Type", weight: 1.5,
            render: r => {
              const t = r.recruitmentType || ""
              const v = t === "cdi" ? "success" : t === "cdd" ? "info" : t === "stage" ? "warning" : "neutral"
              return <StatusBadge status={v} label={recruitmentTypeLabels[t] || t || "—"} />
            },
          },
          {
            key: "spec", label: "Spécialisation", weight: 1.5,
            render: r => (
              <div>
                <p className="text-sm text-muted-foreground">{r.specialization || "—"}</p>
                {r.degreeLevel && <p className="text-xs text-muted-foreground">{r.degreeLevel}</p>}
              </div>
            ),
          },
          {
            key: "period", label: "Période", weight: 1.5,
            render: r => (
              <div className="text-xs text-muted-foreground font-mono">
                <p>{new Date(r.startDate).toLocaleDateString("fr-FR")}</p>
                {r.endDate && <p>→ {new Date(r.endDate).toLocaleDateString("fr-FR")}</p>}
                {r.contractDurationMonths && <p className="text-primary">{r.contractDurationMonths} mois</p>}
              </div>
            ),
          },
          {
            key: "project", label: "Projet / Équipe", weight: 1.5,
            render: r => (
              <div>
                <p className="text-sm text-muted-foreground">{r.assignedProject || "—"}</p>
                {r.assignedTeam && <p className="text-xs text-muted-foreground">Équipe: {r.assignedTeam}</p>}
              </div>
            ),
          },
          {
            key: "score", label: "Score", weight: 1,
            render: r => r.performanceScore != null ? (
              <div>
                <span className="font-semibold text-sm">{r.performanceScore}/10</span>
                {r.satisfactionScore != null && <span className="text-xs text-muted-foreground ml-1">({r.satisfactionScore}/10)</span>}
              </div>
            ) : <span className="text-muted-foreground text-sm">—</span>,
          },
          {
            key: "cdi", label: "CDI", weight: 0.8,
            render: r => <StatusBadge status={r.convertedToCdi ? "success" : "neutral"} label={r.convertedToCdi ? "Oui" : "Non"} />,
          },
          {
            key: "actions", label: "", weight: 0.5,
            render: r => (
              <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleDelete(r.id) }} className="text-red-500 hover:text-red-600 p-1">
                <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
              </Button>
            ),
          },
        ] satisfies CapgeminiTableColumn<Recruitment>[]}
        loading={loading}
        emptyMessage="Aucun recrutement trouvé"
        keyExtractor={r => r.id}
        getRowGradient={r => {
          const t = r.recruitmentType || ""
          return t === "cdi" ? "from-emerald-500/8 to-transparent" : t === "cdd" ? "from-blue-500/8 to-transparent" : "from-amber-500/8 to-transparent"
        }}
        onRowClick={setSelectedRecruitment}
      />

      <Sheet open={!!selectedRecruitment} onOpenChange={(open) => !open && setSelectedRecruitment(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selectedRecruitment && (
            <div className="flex min-h-full flex-col">
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle>{selectedRecruitment.studentFirstName} {selectedRecruitment.studentLastName}</SheetTitle>
                <SheetDescription>
                  {recruitmentTypeLabels[selectedRecruitment.recruitmentType || ""] || selectedRecruitment.recruitmentType || "Recrutement"}
                  {selectedRecruitment.specialization ? ` · ${selectedRecruitment.specialization}` : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 px-6 py-5">
                <dl>
                  {[
                    { label: "Email", value: selectedRecruitment.studentEmail || "—" },
                    { label: "Téléphone", value: selectedRecruitment.studentPhone || "—" },
                    { label: "Spécialisation", value: selectedRecruitment.specialization || "—" },
                    { label: "Niveau", value: selectedRecruitment.degreeLevel || "—" },
                    { label: "Début", value: new Date(selectedRecruitment.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) },
                    { label: "Fin", value: selectedRecruitment.endDate ? new Date(selectedRecruitment.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                    { label: "Durée contrat", value: selectedRecruitment.contractDurationMonths ? `${selectedRecruitment.contractDurationMonths} mois` : "—" },
                    { label: "Projet assigné", value: selectedRecruitment.assignedProject || "—" },
                    { label: "Équipe", value: selectedRecruitment.assignedTeam || "—" },
                    { label: "Manager", value: selectedRecruitment.managerName || "—" },
                    { label: "Score performance", value: selectedRecruitment.performanceScore != null ? `${selectedRecruitment.performanceScore}/10` : "—" },
                    { label: "Score satisfaction", value: selectedRecruitment.satisfactionScore != null ? `${selectedRecruitment.satisfactionScore}/10` : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="border-b border-border py-3 last:border-b-0">
                      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                  <div className="border-b border-border py-3 last:border-b-0">
                    <dt className="text-xs font-medium text-muted-foreground">Converti CDI</dt>
                    <dd className="mt-1"><StatusBadge status={selectedRecruitment.convertedToCdi ? "success" : "neutral"} label={selectedRecruitment.convertedToCdi ? "Oui" : "Non"} /></dd>
                  </div>
                  {selectedRecruitment.notes && (
                    <div className="py-3">
                      <dt className="text-xs font-medium text-muted-foreground">Notes</dt>
                      <dd className="mt-1 text-sm text-foreground">{selectedRecruitment.notes}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

