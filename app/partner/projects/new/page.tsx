"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    projectName: "",
    projectDescription: "",
    clientName: "",
    projectType: "",
    technologiesUsed: "",
    startDate: "",
    endDate: "",
    durationMonths: "",
    projectValue: "",
    licenseCost: "",
    servicesCost: "",
    commissionEarned: "",
    deliveryStatus: "",
    delayDays: "",
    budgetVariancePercentage: "",
    clientSatisfactionScore: "",
    numConsultantsCapgemini: "",
    numConsultantsVendor: "",
    projectStatus: "en_cours",
    isReferenceProject: false,
    caseStudyUrl: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value
    setForm((f) => ({ ...f, [target.name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectName.trim() || !form.startDate) {
      toast.error("Le nom du projet et la date de début sont requis")
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        technologiesUsed: form.technologiesUsed
          ? form.technologiesUsed.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        projectValue: form.projectValue || null,
        licenseCost: form.licenseCost || null,
        servicesCost: form.servicesCost || null,
        commissionEarned: form.commissionEarned || null,
        durationMonths: form.durationMonths || null,
        delayDays: form.delayDays || null,
        budgetVariancePercentage: form.budgetVariancePercentage || null,
        clientSatisfactionScore: form.clientSatisfactionScore || null,
        numConsultantsCapgemini: form.numConsultantsCapgemini || null,
        numConsultantsVendor: form.numConsultantsVendor || null,
      }

      const res = await fetch("/api/partner/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Projet créé avec succès")
        router.push("/partner/projects")
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
                <HugeiconsIcon icon={Folder01Icon} className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Nouveau Projet</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/partner/projects")}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="project-form"
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
          <form id="project-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Project info */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Informations du projet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="projectName" className="text-sm font-semibold text-foreground">Nom du projet *</Label>
                  <Input id="projectName" name="projectName" value={form.projectName} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="projectDescription" className="text-sm font-semibold text-foreground">Description</Label>
                  <Textarea id="projectDescription" name="projectDescription" value={form.projectDescription} onChange={handleChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-sm font-semibold text-foreground">Client</Label>
                  <Input id="clientName" name="clientName" value={form.clientName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectType" className="text-sm font-semibold text-foreground">Type de projet</Label>
                  <Input id="projectType" name="projectType" value={form.projectType} onChange={handleChange} placeholder="Intégration, Migration, Cloud..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="technologiesUsed" className="text-sm font-semibold text-foreground">Technologies utilisées (séparées par virgule)</Label>
                  <Input id="technologiesUsed" name="technologiesUsed" value={form.technologiesUsed} onChange={handleChange} placeholder="Azure, SAP, Salesforce..." />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Planning</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-foreground">Date de début *</Label>
                  <Input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-foreground">Date de fin</Label>
                  <Input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMonths" className="text-sm font-semibold text-foreground">Durée (mois)</Label>
                  <Input id="durationMonths" name="durationMonths" type="number" value={form.durationMonths} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectStatus" className="text-sm font-semibold text-foreground">Statut du projet</Label>
                  <select id="projectStatus" name="projectStatus" value={form.projectStatus} onChange={handleChange} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryStatus" className="text-sm font-semibold text-foreground">Livraison</Label>
                  <select id="deliveryStatus" name="deliveryStatus" value={form.deliveryStatus} onChange={handleChange} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Non défini</option>
                    <option value="en_avance">En avance</option>
                    <option value="a_temps">À temps</option>
                    <option value="en_retard">En retard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delayDays" className="text-sm font-semibold text-foreground">Retard (jours)</Label>
                  <Input id="delayDays" name="delayDays" type="number" value={form.delayDays} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Budget et coûts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectValue" className="text-sm font-semibold text-foreground">Valeur du projet (TND)</Label>
                  <Input id="projectValue" name="projectValue" type="number" value={form.projectValue} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseCost" className="text-sm font-semibold text-foreground">Coût licences (TND)</Label>
                  <Input id="licenseCost" name="licenseCost" type="number" value={form.licenseCost} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicesCost" className="text-sm font-semibold text-foreground">Coût services (TND)</Label>
                  <Input id="servicesCost" name="servicesCost" type="number" value={form.servicesCost} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionEarned" className="text-sm font-semibold text-foreground">Commission gagnée (TND)</Label>
                  <Input id="commissionEarned" name="commissionEarned" type="number" value={form.commissionEarned} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetVariancePercentage" className="text-sm font-semibold text-foreground">Variance budget (%)</Label>
                  <Input id="budgetVariancePercentage" name="budgetVariancePercentage" type="number" step="0.1" value={form.budgetVariancePercentage} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Team & satisfaction */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Équipe et satisfaction</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numConsultantsCapgemini" className="text-sm font-semibold text-foreground">Consultants Capgemini</Label>
                  <Input id="numConsultantsCapgemini" name="numConsultantsCapgemini" type="number" value={form.numConsultantsCapgemini} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numConsultantsVendor" className="text-sm font-semibold text-foreground">Consultants Vendor</Label>
                  <Input id="numConsultantsVendor" name="numConsultantsVendor" type="number" value={form.numConsultantsVendor} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSatisfactionScore" className="text-sm font-semibold text-foreground">Satisfaction client (0-100)</Label>
                  <Input id="clientSatisfactionScore" name="clientSatisfactionScore" type="number" min="0" max="100" value={form.clientSatisfactionScore} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Reference */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Référencement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isReferenceProject" name="isReferenceProject" checked={form.isReferenceProject} onChange={handleChange} className="h-4 w-4 rounded border-input" />
                  <Label htmlFor="isReferenceProject" className="text-sm font-semibold text-foreground">Projet de référence</Label>
                </div>
                {form.isReferenceProject && (
                  <div className="space-y-2">
                    <Label htmlFor="caseStudyUrl" className="text-sm font-semibold text-foreground">URL Business case</Label>
                    <Input id="caseStudyUrl" name="caseStudyUrl" value={form.caseStudyUrl} onChange={handleChange} placeholder="https://..." />
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes</Label>
              <Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Remarques ou commentaires..." />
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
