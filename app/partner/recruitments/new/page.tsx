"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MortarboardIcon, CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

export default function NewRecruitmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    studentFirstName: "",
    studentLastName: "",
    studentEmail: "",
    studentPhone: "",
    recruitmentType: "",
    contractDurationMonths: "",
    startDate: "",
    endDate: "",
    degreeLevel: "",
    specialization: "",
    skills: "",
    assignedProject: "",
    assignedTeam: "",
    managerName: "",
    managerEmail: "",
    performanceScore: "",
    satisfactionScore: "",
    convertedToCdi: false,
    cdiStartDate: "",
    cdiSalaryRange: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value
    setForm((f) => ({ ...f, [target.name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.startDate) {
      toast.error("La date de début est requise")
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : null,
        contractDurationMonths: form.contractDurationMonths || null,
        performanceScore: form.performanceScore || null,
        satisfactionScore: form.satisfactionScore || null,
      }

      const res = await fetch("/api/partner/recruitments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Recrutement ajouté avec succès")
        router.push("/partner/recruitments")
      } else {
        const data = await res.json()
        toast.error(data.error || "Erreur lors de la création")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <HugeiconsIcon icon={MortarboardIcon} className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Nouveau Recrutement</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/partner/recruitments")}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="recruitment-form"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? (
                  "Enregistrement..."
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Form */}
          <form id="recruitment-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Student info */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Informations de l&apos;étudiant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentFirstName" className="text-sm font-semibold text-foreground">Prénom</Label>
                  <Input id="studentFirstName" name="studentFirstName" value={form.studentFirstName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentLastName" className="text-sm font-semibold text-foreground">Nom</Label>
                  <Input id="studentLastName" name="studentLastName" value={form.studentLastName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentEmail" className="text-sm font-semibold text-foreground">Email</Label>
                  <Input id="studentEmail" name="studentEmail" type="email" value={form.studentEmail} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentPhone" className="text-sm font-semibold text-foreground">Téléphone</Label>
                  <Input id="studentPhone" name="studentPhone" value={form.studentPhone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degreeLevel" className="text-sm font-semibold text-foreground">Niveau diplôme</Label>
                  <Input id="degreeLevel" name="degreeLevel" value={form.degreeLevel} onChange={handleChange} placeholder="Bac+5, Master, Ingénieur..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-sm font-semibold text-foreground">Spécialisation</Label>
                  <Input id="specialization" name="specialization" value={form.specialization} onChange={handleChange} placeholder="Informatique, Data, IA..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="skills" className="text-sm font-semibold text-foreground">Compétences (séparées par virgule)</Label>
                  <Input id="skills" name="skills" value={form.skills} onChange={handleChange} placeholder="Java, Python, React, SQL..." />
                </div>
              </div>
            </div>

            {/* Contract info */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Détails du contrat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recruitmentType" className="text-sm font-semibold text-foreground">Type de recrutement</Label>
                  <select
                    id="recruitmentType"
                    name="recruitmentType"
                    value={form.recruitmentType}
                    onChange={handleChange}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="stage">Stage</option>
                    <option value="alternance">Alternance</option>
                    <option value="vie">VIE</option>
                    <option value="cdi_jeune_diplome">CDI Jeune Diplômé</option>
                    <option value="contrat_pro">Contrat Pro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractDurationMonths" className="text-sm font-semibold text-foreground">Durée (mois)</Label>
                  <Input id="contractDurationMonths" name="contractDurationMonths" type="number" value={form.contractDurationMonths} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-foreground">Date de début *</Label>
                  <Input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-foreground">Date de fin</Label>
                  <Input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Affectation Capgemini</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedProject" className="text-sm font-semibold text-foreground">Projet assigné</Label>
                  <Input id="assignedProject" name="assignedProject" value={form.assignedProject} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTeam" className="text-sm font-semibold text-foreground">Équipe assignée</Label>
                  <Input id="assignedTeam" name="assignedTeam" value={form.assignedTeam} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerName" className="text-sm font-semibold text-foreground">Nom du manager</Label>
                  <Input id="managerName" name="managerName" value={form.managerName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerEmail" className="text-sm font-semibold text-foreground">Email du manager</Label>
                  <Input id="managerEmail" name="managerEmail" type="email" value={form.managerEmail} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Scores */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Évaluation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="performanceScore" className="text-sm font-semibold text-foreground">Score de performance (1-5)</Label>
                  <Input id="performanceScore" name="performanceScore" type="number" min="1" max="5" value={form.performanceScore} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="satisfactionScore" className="text-sm font-semibold text-foreground">Score de satisfaction (0-100)</Label>
                  <Input id="satisfactionScore" name="satisfactionScore" type="number" min="0" max="100" value={form.satisfactionScore} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* CDI conversion */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Conversion CDI</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="convertedToCdi"
                    name="convertedToCdi"
                    checked={form.convertedToCdi}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="convertedToCdi" className="text-sm font-semibold text-foreground">Converti en CDI</Label>
                </div>
                {form.convertedToCdi && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cdiStartDate" className="text-sm font-semibold text-foreground">Date début CDI</Label>
                      <Input id="cdiStartDate" name="cdiStartDate" type="date" value={form.cdiStartDate} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cdiSalaryRange" className="text-sm font-semibold text-foreground">Fourchette salariale</Label>
                      <Input id="cdiSalaryRange" name="cdiSalaryRange" value={form.cdiSalaryRange} onChange={handleChange} placeholder="30k-40k TND" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Remarques ou commentaires..."
              />
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
