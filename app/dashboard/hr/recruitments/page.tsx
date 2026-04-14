"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Badge } from "@/frontend/components/ui/badge"
import { Input } from "@/frontend/components/ui/input"
import { Button } from "@/frontend/components/ui/button"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MortarboardIcon,
  Add01Icon,
  Delete01Icon,
  CheckmarkSquare01Icon,
} from "@hugeicons/core-free-icons"

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
            <h1 className="text-2xl font-bold">Recrutements Étudiants</h1>
            <p className="text-sm text-muted-foreground">
              {recruitments.length} recrutement{recruitments.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
          Nouveau recrutement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Total Recrutements</div>
          <div className="text-2xl font-bold mt-1">{recruitments.length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">En cours</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{activeCount}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Convertis CDI</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{cdiCount}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Taux Conversion CDI</div>
          <div className="text-2xl font-bold mt-1">
            {recruitments.length > 0 ? Math.round((cdiCount / recruitments.length) * 100) : 0}%
          </div>
        </motion.div>
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
              <Button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {formLoading ? "Création..." : (
                  <><HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />Créer le recrutement</>
                )}
              </Button>
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
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucun recrutement trouvé</div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Étudiant</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Spécialisation</th>
                <th className="text-left px-4 py-3 font-medium">Période</th>
                <th className="text-left px-4 py-3 font-medium">Projet/Équipe</th>
                <th className="text-left px-4 py-3 font-medium">Score</th>
                <th className="text-left px-4 py-3 font-medium">CDI</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.studentFirstName} {r.studentLastName}</div>
                    <div className="text-xs text-muted-foreground">{r.studentEmail || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${typeColors[r.recruitmentType || ""] || ""}`}>
                      {recruitmentTypeLabels[r.recruitmentType || ""] || r.recruitmentType || "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground">{r.specialization || "—"}</div>
                    {r.degreeLevel && <div className="text-xs text-muted-foreground">{r.degreeLevel}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div>{new Date(r.startDate).toLocaleDateString("fr-FR")}</div>
                    {r.endDate && <div>→ {new Date(r.endDate).toLocaleDateString("fr-FR")}</div>}
                    {r.contractDurationMonths && <div>{r.contractDurationMonths} mois</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted-foreground text-xs">{r.assignedProject || "—"}</div>
                    {r.assignedTeam && <div className="text-xs text-muted-foreground">Équipe: {r.assignedTeam}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {r.performanceScore != null ? (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{r.performanceScore}/10</span>
                        {r.satisfactionScore != null && (
                          <span className="text-xs text-muted-foreground">({r.satisfactionScore}/10)</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={r.convertedToCdi ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"}>
                      {r.convertedToCdi ? "Oui" : "Non"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(r.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
