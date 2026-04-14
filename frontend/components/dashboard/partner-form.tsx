"use client"

import { useState } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { toast } from "@/frontend/components/ui/toast"

const CATEGORIES = [
  { value: "customer", label: "Client" },
  { value: "marketing", label: "Marketing" },
  { value: "supplier", label: "Fournisseur" },
  { value: "university", label: "Université" },
]

const LEVELS = [
  { value: "Standard", label: "Standard" },
  { value: "Stratégique", label: "Stratégique" },
  { value: "Exclusif", label: "Exclusif" },
  { value: "actif", label: "Actif" },
]

const STATUSES = [
  { value: "prospect", label: "Prospect" },
  { value: "en_negociation", label: "En négociation" },
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
  { value: "termine", label: "Terminé" },
]

interface PartnerFormProps {
  initialData?: Record<string, string | number | null>
  isEdit?: boolean
}

export function PartnerForm({ initialData, isEdit }: PartnerFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Normalize legacy category values
  const normalizeCategory = (cat?: string | null) => {
    if (!cat) return "customer"
    if (cat.toLowerCase() === "technology") return "supplier"
    return cat
  }

  const [form, setForm] = useState({
    name: initialData?.name?.toString() || "",
    legalName: initialData?.legalName?.toString() || "",
    categories: normalizeCategory(initialData?.categories?.toString()),
    partnerSubcategory: initialData?.partnerSubcategory?.toString() || "",
    partnershipLevel: initialData?.partnershipLevel?.toString() || "Standard",
    partnershipStatus: initialData?.partnershipStatus?.toString() || "actif",
    country: initialData?.country?.toString() || "Tunisie",
    website: initialData?.website?.toString() || "",
    email: initialData?.email?.toString() || "",
    phone: initialData?.phone?.toString() || "",
    address: initialData?.address?.toString() || "",
    description: initialData?.description?.toString() || "",
    taxId: initialData?.taxId?.toString() || "",
    logoUrl: initialData?.logoUrl?.toString() || "",
    annualBudgetTnd: initialData?.annualBudgetTnd?.toString() || "",
    numEmployees: initialData?.numEmployees?.toString() || "",
    satisfactionScore: initialData?.satisfactionScore?.toString() || "",
    annualRevenueGenerated: initialData?.annualRevenueGenerated?.toString() || "",
    partnershipStartDate: initialData?.partnershipStartDate?.toString() || "",
    contractEndDate: initialData?.contractEndDate?.toString() || "",
  })

  // University-specific fields
  const [uniFields, setUniFields] = useState({
    institutionType: "",
    numStudents: "",
    specialties: "",
    numInternsPerYear: "",
    numApprenticesPerYear: "",
    numHiresPerYear: "",
    annualSponsorshipBudget: "",
    numEventsPerYear: "",
  })

  // Supplier/technology-specific fields
  const [techFields, setTechFields] = useState({
    vendorType: "",
    technologies: "",
    certificationsHeld: "",
    certificationLevel: "",
    partnershipModel: "",
  })

  const isAdmin = user?.role === "admin" || user?.role === "manager"
  if (!isAdmin) {
    return <div className="text-center py-12 text-muted-foreground">Accès refusé</div>
  }

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast.error("Erreur", { description: "Le nom est requis" })
      return
    }

    setLoading(true)
    try {
      const url = "/api/partners/manage"
      const method = isEdit ? "PUT" : "POST"
      const payload: Record<string, unknown> = isEdit ? { ...form, id: initialData?.id } : { ...form }

      // Add category-specific data
      if (form.categories === "university") {
        payload.universityData = {
          ...uniFields,
          specialties: uniFields.specialties ? uniFields.specialties.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        }
      } else if (form.categories === "supplier") {
        payload.technologyData = {
          ...techFields,
          technologies: techFields.technologies ? techFields.technologies.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(isEdit ? "Partenaire modifié" : "Partenaire créé", {
          description: `${form.name} a été ${isEdit ? "mis à jour" : "ajouté"} avec succès`,
        })
        router.push("/dashboard/partners")
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEdit ? "Modifier le partenaire" : "Nouveau partenaire"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit ? "Modifier les informations du partenaire" : "Remplissez les informations du nouveau partenaire"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="space-y-4 p-4 border border-border rounded-lg">
          <h2 className="font-semibold text-sm text-foreground">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nom *</Label>
              <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Nom légal</Label>
              <Input value={form.legalName} onChange={(e) => handleChange("legalName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <select value={form.categories} onChange={(e) => handleChange("categories", e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Sous-catégorie</Label>
              <Input value={form.partnerSubcategory} onChange={(e) => handleChange("partnerSubcategory", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Niveau de partenariat</Label>
              <select value={form.partnershipLevel} onChange={(e) => handleChange("partnershipLevel", e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                {LEVELS.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <select value={form.partnershipStatus} onChange={(e) => handleChange("partnershipStatus", e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Identifiant fiscal</Label>
              <Input value={form.taxId} onChange={(e) => handleChange("taxId", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Pays</Label>
              <Input value={form.country} onChange={(e) => handleChange("country", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4 p-4 border border-border rounded-lg">
          <h2 className="font-semibold text-sm text-foreground">Coordonnées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Site web</Label>
              <Input value={form.website} onChange={(e) => handleChange("website", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <Input value={form.logoUrl} onChange={(e) => handleChange("logoUrl", e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className="space-y-4 p-4 border border-border rounded-lg">
          <h2 className="font-semibold text-sm text-foreground">Détails partenariat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Budget annuel (TND)</Label>
              <Input type="number" value={form.annualBudgetTnd} onChange={(e) => handleChange("annualBudgetTnd", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Revenu annuel généré (TND)</Label>
              <Input type="number" value={form.annualRevenueGenerated} onChange={(e) => handleChange("annualRevenueGenerated", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nombre d&apos;employés</Label>
              <Input type="number" value={form.numEmployees} onChange={(e) => handleChange("numEmployees", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Score satisfaction (/100)</Label>
              <Input type="number" min="0" max="100" value={form.satisfactionScore} onChange={(e) => handleChange("satisfactionScore", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date début partenariat</Label>
              <Input type="date" value={form.partnershipStartDate} onChange={(e) => handleChange("partnershipStartDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date fin contrat</Label>
              <Input type="date" value={form.contractEndDate} onChange={(e) => handleChange("contractEndDate", e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
            </div>
          </div>
        </div>

        {/* University-specific fields */}
        {form.categories === "university" && (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-blue-50/30 dark:bg-blue-950/10">
            <h2 className="font-semibold text-sm text-foreground">Informations Université</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type d&apos;institution</Label>
                <Input placeholder="Ex: Université publique, École d'ingénieurs..." value={uniFields.institutionType} onChange={(e) => setUniFields((p) => ({ ...p, institutionType: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nombre d&apos;étudiants</Label>
                <Input type="number" value={uniFields.numStudents} onChange={(e) => setUniFields((p) => ({ ...p, numStudents: e.target.value }))} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Spécialités (séparées par des virgules)</Label>
                <Input placeholder="Ex: Informatique, Cybersécurité, Data Science" value={uniFields.specialties} onChange={(e) => setUniFields((p) => ({ ...p, specialties: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Stagiaires / an</Label>
                <Input type="number" value={uniFields.numInternsPerYear} onChange={(e) => setUniFields((p) => ({ ...p, numInternsPerYear: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Alternants / an</Label>
                <Input type="number" value={uniFields.numApprenticesPerYear} onChange={(e) => setUniFields((p) => ({ ...p, numApprenticesPerYear: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Embauches / an</Label>
                <Input type="number" value={uniFields.numHiresPerYear} onChange={(e) => setUniFields((p) => ({ ...p, numHiresPerYear: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Budget sponsoring annuel (TND)</Label>
                <Input type="number" value={uniFields.annualSponsorshipBudget} onChange={(e) => setUniFields((p) => ({ ...p, annualSponsorshipBudget: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Événements / an</Label>
                <Input type="number" value={uniFields.numEventsPerYear} onChange={(e) => setUniFields((p) => ({ ...p, numEventsPerYear: e.target.value }))} />
              </div>
            </div>
          </div>
        )}

        {/* Supplier/Technology-specific fields */}
        {form.categories === "supplier" && (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-emerald-50/30 dark:bg-emerald-950/10">
            <h2 className="font-semibold text-sm text-foreground">Informations Fournisseur / Technologie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type de fournisseur</Label>
                <Input placeholder="Ex: Éditeur logiciel, Cloud provider..." value={techFields.vendorType} onChange={(e) => setTechFields((p) => ({ ...p, vendorType: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Modèle de partenariat</Label>
                <Input placeholder="Ex: Reseller, Alliance, OEM..." value={techFields.partnershipModel} onChange={(e) => setTechFields((p) => ({ ...p, partnershipModel: e.target.value }))} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Technologies (séparées par des virgules)</Label>
                <Input placeholder="Ex: AWS, Azure, SAP, ServiceNow" value={techFields.technologies} onChange={(e) => setTechFields((p) => ({ ...p, technologies: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Certifications détenues</Label>
                <Input placeholder="Ex: Gold Partner, Premier Consulting" value={techFields.certificationsHeld} onChange={(e) => setTechFields((p) => ({ ...p, certificationsHeld: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Niveau de certification</Label>
                <Input placeholder="Ex: Gold, Silver, Platinum" value={techFields.certificationLevel} onChange={(e) => setTechFields((p) => ({ ...p, certificationLevel: e.target.value }))} />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/partners")}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le partenaire"}
          </Button>
        </div>
      </form>
    </div>
  )
}
