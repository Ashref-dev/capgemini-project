"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { AnimatedBackground } from "@/frontend/components/ui/animated-background"
import { toast } from "@/frontend/components/ui/toast"
import { cn } from "@/frontend/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Building06Icon,
  UserIcon,
  Mail01Icon,
  Globe02Icon,
  Briefcase01Icon,
  GraduateMaleIcon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons"

const categories = [
  { value: "customer", label: "Client", description: "Entreprise souhaitant bénéficier des services Capgemini", icon: Briefcase01Icon },
  { value: "marketing", label: "Marketing", description: "Partenariat marketing et co-branding", icon: Rocket01Icon },
  { value: "supplier", label: "Fournisseur Technologique", description: "Éditeur de logiciels, intégrateur ou fournisseur cloud", icon: Globe02Icon },
  { value: "university", label: "Universitaire", description: "École, université ou institut de formation", icon: GraduateMaleIcon },
]

export default function PartnershipApplyPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [category, setCategory] = useState("")
  const [form, setForm] = useState({
    companyName: "",
    legalName: "",
    contactFirstName: "",
    contactLastName: "",
    contactEmail: "",
    contactPhone: "",
    contactRole: "",
    website: "",
    description: "",
    country: "",
    address: "",
    numEmployees: "",
    annualRevenue: "",
    partnerSubcategory: "",
    partnershipLevel: "Standard",
    motivations: "",
    // University specific
    institutionType: "",
    numStudents: "",
    specialties: "",
    numInternsPerYear: "",
    numApprenticesPerYear: "",
    numHiresPerYear: "",
    // Technology specific
    vendorType: "",
    technologies: "",
    certificationsHeld: "",
    certificationLevel: "",
    partnershipModel: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) {
      toast.warning("Veuillez sélectionner une catégorie de partenariat")
      return
    }
    if (!form.companyName || !form.contactFirstName || !form.contactLastName || !form.contactEmail) {
      toast.warning("Veuillez remplir tous les champs obligatoires")
      return
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        companyName: form.companyName,
        legalName: form.legalName || undefined,
        contactFirstName: form.contactFirstName,
        contactLastName: form.contactLastName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone || undefined,
        contactRole: form.contactRole || undefined,
        website: form.website || undefined,
        description: form.description || undefined,
        country: form.country || undefined,
        address: form.address || undefined,
        numEmployees: form.numEmployees ? parseInt(form.numEmployees) : undefined,
        annualRevenue: form.annualRevenue || undefined,
        category,
        partnerSubcategory: form.partnerSubcategory || undefined,
        partnershipLevel: form.partnershipLevel,
        motivations: form.motivations || undefined,
      }

      if (category === "university") {
        body.universityData = {
          institutionType: form.institutionType || undefined,
          numStudents: form.numStudents ? parseInt(form.numStudents) : undefined,
          specialties: form.specialties ? form.specialties.split(",").map((s) => s.trim()) : undefined,
          numInternsPerYear: form.numInternsPerYear ? parseInt(form.numInternsPerYear) : undefined,
          numApprenticesPerYear: form.numApprenticesPerYear ? parseInt(form.numApprenticesPerYear) : undefined,
          numHiresPerYear: form.numHiresPerYear ? parseInt(form.numHiresPerYear) : undefined,
        }
      }

      if (category === "supplier") {
        body.technologyData = {
          vendorType: form.vendorType || undefined,
          technologies: form.technologies ? form.technologies.split(",").map((s) => s.trim()) : undefined,
          certificationsHeld: form.certificationsHeld ? parseInt(form.certificationsHeld) : undefined,
          certificationLevel: form.certificationLevel || undefined,
          partnershipModel: form.partnershipModel || undefined,
        }
      }

      const res = await fetch("/api/partnership-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de l'envoi")
      }

      setSubmitted(true)
      toast.success("Demande envoyée avec succès !", {
        description: "Notre équipe examinera votre candidature dans les plus brefs délais.",
      })
    } catch (err: unknown) {
      toast.error("Erreur", {
        description: err instanceof Error ? err.message : "Impossible d'envoyer la demande",
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-transparent">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-white/10 p-10 max-w-lg mx-auto text-center"
          >
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Demande envoyée !</h2>
            <p className="text-muted-foreground mb-6">
              Merci pour votre intérêt pour Capgemini Tunisie. Notre équipe examinera votre demande et vous contactera par email dans les plus brefs délais.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/success-stories">
                <Button variant="outline" className="rounded-full">
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
                  Retour aux Success Stories
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  Accueil
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md py-3 border-b border-border/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="ghost" size="icon" />
            <Link href="/success-stories">
              <Button variant="ghost" className="text-foreground/80 hover:text-primary text-sm">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-1.5" />
                Success Stories
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Devenir Partenaire</h1>
              <p className="text-muted-foreground">Remplissez le formulaire ci-dessous pour soumettre votre demande de partenariat avec Capgemini Tunisie.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden">
              {/* Category Selection */}
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon icon={Briefcase01Icon} className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Type de partenariat *</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        category === cat.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30 hover:bg-accent/5"
                      )}
                    >
                      <HugeiconsIcon icon={cat.icon} className="w-5 h-5 text-primary mb-2" />
                      <div className="font-medium text-foreground text-sm">{cat.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Info */}
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon icon={Building06Icon} className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Informations entreprise</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Nom de l&apos;entreprise *</Label>
                    <Input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Ex: ESPRIT, Sofrecom..." required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Raison sociale</Label>
                    <Input name="legalName" value={form.legalName} onChange={handleChange} placeholder="Raison sociale" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Site web</Label>
                    <Input name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Pays</Label>
                    <Input name="country" value={form.country} onChange={handleChange} placeholder="Ex: Tunisie" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-foreground">Adresse</Label>
                    <Input name="address" value={form.address} onChange={handleChange} placeholder="Adresse complète" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Nombre d&apos;employés</Label>
                    <Input name="numEmployees" type="number" value={form.numEmployees} onChange={handleChange} placeholder="Ex: 500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Chiffre d&apos;affaires annuel (TND)</Label>
                    <Input name="annualRevenue" value={form.annualRevenue} onChange={handleChange} placeholder="Ex: 5000000" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-foreground">Description de l&apos;entreprise</Label>
                    <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrivez brièvement votre entreprise et son activité..." rows={3} />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Contact principal</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Prénom *</Label>
                    <Input name="contactFirstName" value={form.contactFirstName} onChange={handleChange} placeholder="Prénom" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Nom *</Label>
                    <Input name="contactLastName" value={form.contactLastName} onChange={handleChange} placeholder="Nom" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Email *</Label>
                    <Input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="email@entreprise.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Téléphone</Label>
                    <Input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+216 ..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-foreground">Fonction / Rôle</Label>
                    <Input name="contactRole" value={form.contactRole} onChange={handleChange} placeholder="Ex: Directeur des partenariats" />
                  </div>
                </div>
              </div>

              {/* University-specific fields */}
              {category === "university" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-6 border-b border-border/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <HugeiconsIcon icon={GraduateMaleIcon} className="w-4 h-4 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Informations universitaires</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Type d&apos;institution</Label>
                      <select name="institutionType" value={form.institutionType} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                        <option value="">Sélectionner...</option>
                        <option value="universite">Université</option>
                        <option value="ecole_ingenieur">École d&apos;ingénieurs</option>
                        <option value="ecole_commerce">École de commerce</option>
                        <option value="institut">Institut de formation</option>
                        <option value="centre_recherche">Centre de recherche</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Nombre d&apos;étudiants</Label>
                      <Input name="numStudents" type="number" value={form.numStudents} onChange={handleChange} placeholder="Ex: 5000" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-foreground">Spécialités (séparées par des virgules)</Label>
                      <Input name="specialties" value={form.specialties} onChange={handleChange} placeholder="Ex: Informatique, IA, Cybersécurité" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Stagiaires / an</Label>
                      <Input name="numInternsPerYear" type="number" value={form.numInternsPerYear} onChange={handleChange} placeholder="Ex: 200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Alternants / an</Label>
                      <Input name="numApprenticesPerYear" type="number" value={form.numApprenticesPerYear} onChange={handleChange} placeholder="Ex: 50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Recrutements / an</Label>
                      <Input name="numHiresPerYear" type="number" value={form.numHiresPerYear} onChange={handleChange} placeholder="Ex: 30" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Technology-specific fields */}
              {category === "supplier" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-6 border-b border-border/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <HugeiconsIcon icon={Globe02Icon} className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Informations technologiques</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Type de fournisseur</Label>
                      <select name="vendorType" value={form.vendorType} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                        <option value="">Sélectionner...</option>
                        <option value="editeur">Éditeur de logiciels</option>
                        <option value="cloud_provider">Fournisseur Cloud</option>
                        <option value="integrateur">Intégrateur</option>
                        <option value="conseil">Cabinet de conseil tech</option>
                        <option value="startup">Startup technologique</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Modèle de partenariat</Label>
                      <select name="partnershipModel" value={form.partnershipModel} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                        <option value="">Sélectionner...</option>
                        <option value="reseller">Revendeur</option>
                        <option value="integration">Intégration</option>
                        <option value="co_development">Co-développement</option>
                        <option value="consulting">Consulting</option>
                        <option value="ofs">OFS (Offshore)</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-foreground">Technologies (séparées par des virgules)</Label>
                      <Input name="technologies" value={form.technologies} onChange={handleChange} placeholder="Ex: AWS, Azure, SAP, Salesforce" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Nombre de certifications</Label>
                      <Input name="certificationsHeld" type="number" value={form.certificationsHeld} onChange={handleChange} placeholder="Ex: 15" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Niveau de certification</Label>
                      <select name="certificationLevel" value={form.certificationLevel} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                        <option value="">Sélectionner...</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                        <option value="premier">Premier</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Partnership Preferences */}
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon icon={Rocket01Icon} className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Partenariat</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Sous-catégorie</Label>
                    <Input name="partnerSubcategory" value={form.partnerSubcategory} onChange={handleChange} placeholder="Ex: Cloud, ERP, Formation..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Niveau de partenariat souhaité</Label>
                    <select name="partnershipLevel" value={form.partnershipLevel} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                      <option value="Standard">Standard</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-foreground">Motivations et objectifs</Label>
                    <Textarea
                      name="motivations"
                      value={form.motivations}
                      onChange={handleChange}
                      placeholder="Décrivez vos motivations, vos objectifs et ce que vous attendez de ce partenariat..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="p-6 flex items-center justify-between">
                <Link href="/success-stories">
                  <Button type="button" variant="ghost" className="text-muted-foreground">
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-1.5" />
                    Retour
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 px-8 rounded-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-2" />
                      Soumettre ma demande
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
