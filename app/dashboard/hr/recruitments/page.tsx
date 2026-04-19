"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Input } from "@/frontend/components/ui/input"
import { Button } from "@/frontend/components/ui/button"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MortarboardIcon, Delete01Icon } from "@hugeicons/core-free-icons"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge, DetailPanel, DetailCard } from "@/frontend/components/ui/capgemini-table"
import { SparklesText } from "@/frontend/components/ui/sparkles-text"
import { GradientStatCard } from "@/frontend/components/ui/gradient-stat-card"
import { AddButton } from "@/frontend/components/ui/add-button"

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
  const [universities, setUniversities] = useState<{ id: number; name: string }[]>([])

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

  const fetchUniversities = useCallback(async () => {
    try {
      const res = await fetch("/api/partners?category=university")
      const data = await res.json()
      if (res.ok) {
        setUniversities(data.partners?.map((p: { id: number; name: string }) => ({ id: p.id, name: p.name })) || [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchRecruitments()
    fetchUniversities()
  }, [fetchRecruitments, fetchUniversities])

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
            <SparklesText text="Recrutements Étudiants" className="text-2xl" />
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
                <select
                  value={form.universityPartnerId}
                  onChange={(e) => setForm({ ...form, universityPartnerId: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
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
        renderDetail={(r, onClose) => (
          <DetailPanel onClose={onClose} title={`${r.studentFirstName} ${r.studentLastName}`}>
            <div className="grid grid-cols-2 gap-3">
              <DetailCard label="Email" value={r.studentEmail || "—"} />
              <DetailCard label="Type" value={recruitmentTypeLabels[r.recruitmentType || ""] || r.recruitmentType || "—"} />
              <DetailCard label="Spécialisation" value={r.specialization || "—"} />
              <DetailCard label="Niveau" value={r.degreeLevel || "—"} />
              <DetailCard label="Début" value={new Date(r.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
              <DetailCard label="Fin" value={r.endDate ? new Date(r.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
              <DetailCard label="Durée contrat" value={r.contractDurationMonths ? `${r.contractDurationMonths} mois` : "—"} />
              <DetailCard label="Projet" value={r.assignedProject || "—"} />
              <DetailCard label="Équipe" value={r.assignedTeam || "—"} />
              <DetailCard label="Manager" value={r.managerName || "—"} />
              <DetailCard label="Score performance" value={r.performanceScore != null ? `${r.performanceScore}/10` : "—"} />
              <DetailCard label="Score satisfaction" value={r.satisfactionScore != null ? `${r.satisfactionScore}/10` : "—"} />
              <DetailCard label="Converti CDI" value={<StatusBadge status={r.convertedToCdi ? "success" : "neutral"} label={r.convertedToCdi ? "Oui" : "Non"} />} />
            </div>
          </DetailPanel>
        )}
      />
    </div>
  )
}

