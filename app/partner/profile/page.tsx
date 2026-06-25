"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkSquare01Icon, UserIcon, LockPasswordIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Spinner } from "@/components/ui/spinner"
import { SparklesText } from "@/components/ui/sparkles-text"
import { formatPartnerCategory, formatPartnerStatus, formatPartnershipLevel } from "@/lib/format"

interface PartnerProfile {
  id: number
  name: string
  legalName: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  logoUrl: string | null
  description: string | null
  numEmployees: number | null
  categories: string | null
  partnerSubcategory: string | null
  partnershipLevel: string | null
  partnershipStatus: string | null
  partnershipStartDate: string | null
  country: string | null
  satisfactionScore: number | null
  annualBudgetTnd: number | null
}

export default function PartnerProfilePage() {
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [form, setForm] = useState({
    name: "",
    legalName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    logoUrl: "",
    description: "",
    numEmployees: "",
  })

  // University-specific fields
  const [uniForm, setUniForm] = useState({
    institutionType: "",
    numStudents: "",
    specialties: "",
    numInternsPerYear: "",
    numApprenticesPerYear: "",
    numHiresPerYear: "",
    annualSponsorshipBudget: "",
    numEventsPerYear: "",
    hasFrameworkAgreement: false,
    notes: "",
  })

  // Supplier/technology-specific fields
  const [techForm, setTechForm] = useState({
    vendorType: "",
    technologies: "",
    certificationsHeld: "",
    certificationLevel: "",
    partnershipModel: "",
    commissionRate: "",
    discountRate: "",
    numProjectsPerYear: "",
    numLicensesSold: "",
    comarketingBudgetAnnual: "",
    hasMasterAgreement: false,
    hasDedicatedSupport: false,
    supportSlaHours: "",
    notes: "",
  })

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.partner) {
          setPartner(d.partner)
          setForm({
            name: d.partner.name || "",
            legalName: d.partner.legalName || "",
            email: d.partner.email || "",
            phone: d.partner.phone || "",
            website: d.partner.website || "",
            address: d.partner.address || "",
            logoUrl: d.partner.logoUrl || "",
            description: d.partner.description || "",
            numEmployees: d.partner.numEmployees?.toString() || "",
          })
          if (d.subtypeData && d.partner.categories === "university") {
            const s = d.subtypeData
            setUniForm({
              institutionType: s.institutionType || "",
              numStudents: s.numStudents?.toString() || "",
              specialties: s.specialties?.join(", ") || "",
              numInternsPerYear: s.numInternsPerYear?.toString() || "",
              numApprenticesPerYear: s.numApprenticesPerYear?.toString() || "",
              numHiresPerYear: s.numHiresPerYear?.toString() || "",
              annualSponsorshipBudget: s.annualSponsorshipBudget?.toString() || "",
              numEventsPerYear: s.numEventsPerYear?.toString() || "",
              hasFrameworkAgreement: s.hasFrameworkAgreement || false,
              notes: s.notes || "",
            })
          }
          if (d.subtypeData && d.partner.categories === "supplier") {
            const s = d.subtypeData
            setTechForm({
              vendorType: s.vendorType || "",
              technologies: s.technologies?.join(", ") || "",
              certificationsHeld: s.certificationsHeld?.toString() || "",
              certificationLevel: s.certificationLevel || "",
              partnershipModel: s.partnershipModel || "",
              commissionRate: s.commissionRate || "",
              discountRate: s.discountRate || "",
              numProjectsPerYear: s.numProjectsPerYear?.toString() || "",
              numLicensesSold: s.numLicensesSold?.toString() || "",
              comarketingBudgetAnnual: s.comarketingBudgetAnnual?.toString() || "",
              hasMasterAgreement: s.hasMasterAgreement || false,
              hasDedicatedSupport: s.hasDedicatedSupport || false,
              supportSlaHours: s.supportSlaHours?.toString() || "",
              notes: s.notes || "",
            })
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleUniChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value
    setUniForm((f) => ({ ...f, [target.name]: value }))
  }

  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value
    setTechForm((f) => ({ ...f, [target.name]: value }))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Tous les champs sont requis")
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Mot de passe modifié avec succès")
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        toast.error(data.error || "Erreur lors du changement de mot de passe")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Le nom est requis")
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = { ...form }

      if (partner?.categories === "university") {
        payload.universityData = {
          ...uniForm,
          specialties: uniForm.specialties ? uniForm.specialties.split(",").map((s) => s.trim()).filter(Boolean) : null,
          numStudents: uniForm.numStudents || null,
          numInternsPerYear: uniForm.numInternsPerYear || null,
          numApprenticesPerYear: uniForm.numApprenticesPerYear || null,
          numHiresPerYear: uniForm.numHiresPerYear || null,
          annualSponsorshipBudget: uniForm.annualSponsorshipBudget || null,
          numEventsPerYear: uniForm.numEventsPerYear || null,
        }
      } else if (partner?.categories === "supplier") {
        payload.technologyData = {
          ...techForm,
          technologies: techForm.technologies ? techForm.technologies.split(",").map((s) => s.trim()).filter(Boolean) : null,
          certificationsHeld: techForm.certificationsHeld || null,
          numProjectsPerYear: techForm.numProjectsPerYear || null,
          numLicensesSold: techForm.numLicensesSold || null,
          comarketingBudgetAnnual: techForm.comarketingBudgetAnnual || null,
          supportSlaHours: techForm.supportSlaHours || null,
        }
      }

      const res = await fetch("/api/partner/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setPartner(data.partner)
        toast.success("Profil mis à jour avec succès")
      } else {
        const data = await res.json()
        toast.error(data.error || "Erreur lors de la mise à jour")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (!partner) {
    return <div className="text-muted-foreground">Impossible de charger votre profil.</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-primary" />
              </div>
              <div>
                <SparklesText text="Mon Profil" className="text-xl" />
                <p className="text-sm text-muted-foreground">
                  {formatPartnerCategory(partner.categories)} •{" "}
                  {partner.partnershipLevel ? formatPartnershipLevel(partner.partnershipLevel) : "Standard"} •{" "}
                  {formatPartnerStatus(partner.partnershipStatus)}
                </p>
              </div>
            </div>
            <Button
              type="submit"
              form="profile-form"
              disabled={saving}
              className="bg-[#0070AD] hover:bg-[#005a8a] text-white font-medium shadow-sm"
            >
              {saving ? (
                "Enregistrement..."
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>

          {/* Read-only info */}
          <div className="px-6 pt-4 pb-2">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
              <span>
                <strong>Catégorie :</strong> {formatPartnerCategory(partner.categories)}
              </span>
              <span>
                <strong>Niveau :</strong> {partner.partnershipLevel ? formatPartnershipLevel(partner.partnershipLevel) : "Standard"}
              </span>
              <span>
                <strong>Statut :</strong> {formatPartnerStatus(partner.partnershipStatus)}
              </span>
              {partner.partnershipStartDate && (
                <span>
                  <strong>Début :</strong>{" "}
                  {new Date(partner.partnershipStartDate).toLocaleDateString("fr-FR")}
                </span>
              )}
              {partner.satisfactionScore !== null && (
                <span>
                  <strong>Satisfaction :</strong> {partner.satisfactionScore}/100
                </span>
              )}
              {partner.annualBudgetTnd !== null && (
                <span>
                  <strong>Budget :</strong> {partner.annualBudgetTnd.toLocaleString()} TND
                </span>
              )}
            </div>
          </div>

          {/* Editable form */}
          <form id="profile-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Nom de l&apos;organisation *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalName" className="text-sm font-semibold text-foreground">
                  Raison sociale
                </Label>
                <Input
                  id="legalName"
                  name="legalName"
                  value={form.legalName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold text-foreground">
                  Site web
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numEmployees" className="text-sm font-semibold text-foreground">
                  Nombre d&apos;employés
                </Label>
                <Input
                  id="numEmployees"
                  name="numEmployees"
                  type="number"
                  value={form.numEmployees}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-sm font-semibold text-foreground">
                  URL du logo
                </Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={form.logoUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-sm font-semibold text-foreground">
                  Adresse
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Décrivez votre organisation..."
                />
              </div>
            </div>

            {/* University-specific fields */}
            {partner.categories === "university" && (
              <div className="border-t border-border pt-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Informations universitaires</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institutionType" className="text-sm font-semibold text-foreground">Type d&apos;institution</Label>
                    <Input id="institutionType" name="institutionType" value={uniForm.institutionType} onChange={handleUniChange} placeholder="Université, École d'ingénieur..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numStudents" className="text-sm font-semibold text-foreground">Nombre d&apos;étudiants</Label>
                    <Input id="numStudents" name="numStudents" type="number" value={uniForm.numStudents} onChange={handleUniChange} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="specialties" className="text-sm font-semibold text-foreground">Spécialités (séparées par virgule)</Label>
                    <Input id="specialties" name="specialties" value={uniForm.specialties} onChange={handleUniChange} placeholder="Informatique, Data Science, IA..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numInternsPerYear" className="text-sm font-semibold text-foreground">Stagiaires / an</Label>
                    <Input id="numInternsPerYear" name="numInternsPerYear" type="number" value={uniForm.numInternsPerYear} onChange={handleUniChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numApprenticesPerYear" className="text-sm font-semibold text-foreground">Alternants / an</Label>
                    <Input id="numApprenticesPerYear" name="numApprenticesPerYear" type="number" value={uniForm.numApprenticesPerYear} onChange={handleUniChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numHiresPerYear" className="text-sm font-semibold text-foreground">Embauches / an</Label>
                    <Input id="numHiresPerYear" name="numHiresPerYear" type="number" value={uniForm.numHiresPerYear} onChange={handleUniChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualSponsorshipBudget" className="text-sm font-semibold text-foreground">Budget sponsoring annuel (TND)</Label>
                    <Input id="annualSponsorshipBudget" name="annualSponsorshipBudget" type="number" value={uniForm.annualSponsorshipBudget} onChange={handleUniChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numEventsPerYear" className="text-sm font-semibold text-foreground">Événements / an</Label>
                    <Input id="numEventsPerYear" name="numEventsPerYear" type="number" value={uniForm.numEventsPerYear} onChange={handleUniChange} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="hasFrameworkAgreement" name="hasFrameworkAgreement" checked={uniForm.hasFrameworkAgreement} onChange={handleUniChange} className="h-4 w-4 rounded border-input" />
                    <Label htmlFor="hasFrameworkAgreement" className="text-sm font-semibold text-foreground">Convention cadre signée</Label>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="uni-notes" className="text-sm font-semibold text-foreground">Notes universitaires</Label>
                    <Textarea id="uni-notes" name="notes" value={uniForm.notes} onChange={handleUniChange} rows={3} placeholder="Remarques spécifiques à l'établissement..." />
                  </div>
                </div>
              </div>
            )}

            {/* Supplier/technology-specific fields */}
            {partner.categories === "supplier" && (
              <div className="border-t border-border pt-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Informations fournisseur technologique</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorType" className="text-sm font-semibold text-foreground">Type de fournisseur</Label>
                    <Input id="vendorType" name="vendorType" value={techForm.vendorType} onChange={handleTechChange} placeholder="Cloud, ERP, CRM, Sécurité..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificationLevel" className="text-sm font-semibold text-foreground">Niveau de certification</Label>
                    <Input id="certificationLevel" name="certificationLevel" value={techForm.certificationLevel} onChange={handleTechChange} placeholder="Gold, Platinum, Premier..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="technologies" className="text-sm font-semibold text-foreground">Technologies (séparées par virgule)</Label>
                    <Input id="technologies" name="technologies" value={techForm.technologies} onChange={handleTechChange} placeholder="Azure, AWS, SAP, Salesforce..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificationsHeld" className="text-sm font-semibold text-foreground">Nombre de certifications</Label>
                    <Input id="certificationsHeld" name="certificationsHeld" type="number" value={techForm.certificationsHeld} onChange={handleTechChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnershipModel" className="text-sm font-semibold text-foreground">Modèle de partenariat</Label>
                    <Input id="partnershipModel" name="partnershipModel" value={techForm.partnershipModel} onChange={handleTechChange} placeholder="Revendeur, Intégrateur..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate" className="text-sm font-semibold text-foreground">Taux de commission (%)</Label>
                    <Input id="commissionRate" name="commissionRate" type="number" step="0.1" value={techForm.commissionRate} onChange={handleTechChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountRate" className="text-sm font-semibold text-foreground">Taux de remise (%)</Label>
                    <Input id="discountRate" name="discountRate" type="number" step="0.1" value={techForm.discountRate} onChange={handleTechChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numProjectsPerYear" className="text-sm font-semibold text-foreground">Projets / an</Label>
                    <Input id="numProjectsPerYear" name="numProjectsPerYear" type="number" value={techForm.numProjectsPerYear} onChange={handleTechChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numLicensesSold" className="text-sm font-semibold text-foreground">Licences vendues</Label>
                    <Input id="numLicensesSold" name="numLicensesSold" type="number" value={techForm.numLicensesSold} onChange={handleTechChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comarketingBudgetAnnual" className="text-sm font-semibold text-foreground">Budget co-marketing annuel (TND)</Label>
                    <Input id="comarketingBudgetAnnual" name="comarketingBudgetAnnual" type="number" value={techForm.comarketingBudgetAnnual} onChange={handleTechChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportSlaHours" className="text-sm font-semibold text-foreground">SLA support (heures)</Label>
                    <Input id="supportSlaHours" name="supportSlaHours" type="number" value={techForm.supportSlaHours} onChange={handleTechChange} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="hasMasterAgreement" name="hasMasterAgreement" checked={techForm.hasMasterAgreement} onChange={handleTechChange} className="h-4 w-4 rounded border-input" />
                    <Label htmlFor="hasMasterAgreement" className="text-sm font-semibold text-foreground">Accord-cadre signé</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="hasDedicatedSupport" name="hasDedicatedSupport" checked={techForm.hasDedicatedSupport} onChange={handleTechChange} className="h-4 w-4 rounded border-input" />
                    <Label htmlFor="hasDedicatedSupport" className="text-sm font-semibold text-foreground">Support dédié</Label>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="tech-notes" className="text-sm font-semibold text-foreground">Notes fournisseur</Label>
                    <Textarea id="tech-notes" name="notes" value={techForm.notes} onChange={handleTechChange} rows={3} placeholder="Remarques spécifiques au partenariat technologique..." />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
          <div className="flex items-center gap-3 p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <HugeiconsIcon icon={LockPasswordIcon} className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Modifier le mot de passe</h2>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold text-foreground">
                  Mot de passe actuel *
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
                  Nouveau mot de passe *
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                  Confirmer le mot de passe *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={changingPassword} className="bg-[#0070AD] hover:bg-[#005a8a] text-white font-medium shadow-sm">
                {changingPassword ? (
                  "Modification..."
                ) : (
                  <>
                    <HugeiconsIcon icon={LockPasswordIcon} className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
