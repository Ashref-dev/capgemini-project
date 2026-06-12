"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  CheckmarkSquare01Icon,
  Building06Icon,
  Globe02Icon,
  Briefcase01Icon,
  GraduateMaleIcon,
  Rocket01Icon,
  UserIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

const CATEGORY_OPTIONS = [
  {
    value: "customer",
    label: "Client",
    description: "Entreprise cliente bénéficiant des services Capgemini",
    icon: Briefcase01Icon,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  },
  {
    value: "marketing",
    label: "Marketing",
    description: "Partenariat marketing et co-branding",
    icon: Rocket01Icon,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  },
  {
    value: "supplier",
    label: "Fournisseur Technologique",
    description: "Éditeur de logiciels, intégrateur ou fournisseur cloud",
    icon: Globe02Icon,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/25",
  },
  {
    value: "university",
    label: "Universitaire",
    description: "École, université ou institut de formation",
    icon: GraduateMaleIcon,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
  },
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

const getSteps = (cat: string) => {
  const base = [
    { id: "type", title: "Catégorie", icon: Briefcase01Icon },
    { id: "general", title: "Général", icon: Building06Icon },
    { id: "contact", title: "Contact", icon: Mail01Icon },
    { id: "partnership", title: "Partenariat", icon: Rocket01Icon },
  ]
  if (cat === "university") base.push({ id: "specific", title: "Université", icon: GraduateMaleIcon })
  if (cat === "supplier") base.push({ id: "specific", title: "Technologie", icon: Globe02Icon })
  return base
}

const contentVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

interface PartnerFormProps {
  initialData?: Record<string, string | number | null>
  isEdit?: boolean
}

export function PartnerForm({ initialData, isEdit }: PartnerFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
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

  const handleSubmit = async () => {
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

  const steps = getSteps(form.categories)
  const isLastStep = step === steps.length - 1
  const prev = () => setStep((s) => Math.max(s - 1, 0))
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))

  const handleCategorySelect = (val: string) => {
    handleChange("categories", val)
    setTimeout(() => setStep(1), 350)
  }

  const isStepValid = () => {
    if (step === 0) return !!form.categories
    if (step === 1) return !!form.name
    return true
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          {isEdit ? "Modifier le partenaire" : "Nouveau partenaire"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {isEdit
            ? "Modifiez les informations du partenaire étape par étape"
            : "Remplissez les informations du nouveau partenaire étape par étape"}
        </p>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn("flex flex-col items-center gap-1 transition-all", i < step ? "cursor-pointer" : "cursor-default")}
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                i < step
                  ? "bg-primary border-primary text-primary-foreground"
                  : i === step
                    ? "bg-background border-primary text-primary"
                    : "bg-background/50 border-border text-muted-foreground"
              )}>
                {i < step
                  ? <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4" />
                  : <HugeiconsIcon icon={s.icon} className="w-4 h-4" />}
              </div>
              <span className={cn(
                "text-xs font-medium hidden sm:block",
                i === step ? "text-primary" : "text-muted-foreground"
              )}>{s.title}</span>
            </button>
          ))}
        </div>
        <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: steps.length > 1 ? `${(step / (steps.length - 1)) * 100}%` : "0%" }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Étape {step + 1} sur {steps.length} — {steps[step].title}
        </p>
      </motion.div>

      {/* Wizard panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="overflow-hidden border-y border-border bg-background"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="min-h-[520px]"
          >
            {/* ── Étape 0 : Catégorie ──────────────────────── */}
            {step === 0 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={Briefcase01Icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Type de partenariat</h2>
                    <p className="text-sm text-muted-foreground">Sélectionnez la catégorie du partenaire</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <motion.button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat.value)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "flex min-h-28 items-start gap-4 rounded-xl border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        form.categories === cat.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/35"
                      )}
                    >
                      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border", form.categories === cat.value ? "border-primary/25 bg-background" : cat.bg)}>
                        <HugeiconsIcon icon={cat.icon} className={cn("w-5 h-5", cat.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold text-sm text-foreground">{cat.label}</div>
                          {form.categories === cat.value && (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0 text-primary" />
                          )}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{cat.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Étape 1 : Informations générales ────────────── */}
            {step === 1 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={Building06Icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Informations générales</h2>
                    <p className="text-sm text-muted-foreground">Identité et statut du partenaire</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nom *</Label>
                    <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Nom du partenaire" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nom légal</Label>
                    <Input value={form.legalName} onChange={(e) => handleChange("legalName", e.target.value)} placeholder="Raison sociale" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Sous-catégorie</Label>
                    <Input value={form.partnerSubcategory} onChange={(e) => handleChange("partnerSubcategory", e.target.value)} placeholder="Ex: Cloud, ERP, Formation…" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Identifiant fiscal</Label>
                    <Input value={form.taxId} onChange={(e) => handleChange("taxId", e.target.value)} placeholder="N° fiscal ou SIRET" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Pays</Label>
                    <Input value={form.country} onChange={(e) => handleChange("country", e.target.value)} placeholder="Ex: Tunisie" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Étape 2 : Coordonnées ──────────────────────── */}
            {step === 2 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon icon={Mail01Icon} className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Coordonnées</h2>
                    <p className="text-sm text-muted-foreground">Moyens de contact et présence en ligne</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="contact@entreprise.com" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Téléphone</Label>
                    <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+216 …" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Site web</Label>
                    <Input value={form.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://…" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Logo URL</Label>
                    <Input value={form.logoUrl} onChange={(e) => handleChange("logoUrl", e.target.value)} placeholder="https://logo.png" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold">Adresse</Label>
                    <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Adresse complète" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Étape 3 : Détails partenariat ─────────────── */}
            {step === 3 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon icon={Rocket01Icon} className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Détails partenariat</h2>
                    <p className="text-sm text-muted-foreground">Niveau, statut, budget et dates</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Niveau de partenariat</Label>
                    <select value={form.partnershipLevel} onChange={(e) => handleChange("partnershipLevel", e.target.value)} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring">
                      {LEVELS.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Statut</Label>
                    <select value={form.partnershipStatus} onChange={(e) => handleChange("partnershipStatus", e.target.value)} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring">
                      {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Budget annuel (TND)</Label>
                    <Input type="number" value={form.annualBudgetTnd} onChange={(e) => handleChange("annualBudgetTnd", e.target.value)} placeholder="Ex: 50000" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Revenu annuel généré (TND)</Label>
                    <Input type="number" value={form.annualRevenueGenerated} onChange={(e) => handleChange("annualRevenueGenerated", e.target.value)} placeholder="Ex: 120000" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nombre d&apos;employés</Label>
                    <Input type="number" value={form.numEmployees} onChange={(e) => handleChange("numEmployees", e.target.value)} placeholder="Ex: 500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Score satisfaction (/100)</Label>
                    <Input type="number" min="0" max="100" value={form.satisfactionScore} onChange={(e) => handleChange("satisfactionScore", e.target.value)} placeholder="Ex: 85" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Date début partenariat</Label>
                    <Input type="date" value={form.partnershipStartDate} onChange={(e) => handleChange("partnershipStartDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Date fin contrat</Label>
                    <Input type="date" value={form.contractEndDate} onChange={(e) => handleChange("contractEndDate", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} placeholder="Décrivez brièvement ce partenariat…" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Étape 4 : Université ──────────────────────── */}
            {step === 4 && form.categories === "university" && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <HugeiconsIcon icon={GraduateMaleIcon} className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Informations universitaires</h2>
                    <p className="text-sm text-muted-foreground">Détails spécifiques à l&apos;institution</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Type d&apos;institution</Label>
                    <Input placeholder="Ex: Université publique, École d'ingénieurs…" value={uniFields.institutionType} onChange={(e) => setUniFields((p) => ({ ...p, institutionType: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nombre d&apos;étudiants</Label>
                    <Input type="number" value={uniFields.numStudents} onChange={(e) => setUniFields((p) => ({ ...p, numStudents: e.target.value }))} placeholder="Ex: 5000" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold">Spécialités (séparées par des virgules)</Label>
                    <Input placeholder="Ex: Informatique, Cybersécurité, Data Science" value={uniFields.specialties} onChange={(e) => setUniFields((p) => ({ ...p, specialties: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Stagiaires / an</Label>
                    <Input type="number" value={uniFields.numInternsPerYear} onChange={(e) => setUniFields((p) => ({ ...p, numInternsPerYear: e.target.value }))} placeholder="Ex: 200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Alternants / an</Label>
                    <Input type="number" value={uniFields.numApprenticesPerYear} onChange={(e) => setUniFields((p) => ({ ...p, numApprenticesPerYear: e.target.value }))} placeholder="Ex: 50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Embauches / an</Label>
                    <Input type="number" value={uniFields.numHiresPerYear} onChange={(e) => setUniFields((p) => ({ ...p, numHiresPerYear: e.target.value }))} placeholder="Ex: 30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Budget sponsoring annuel (TND)</Label>
                    <Input type="number" value={uniFields.annualSponsorshipBudget} onChange={(e) => setUniFields((p) => ({ ...p, annualSponsorshipBudget: e.target.value }))} placeholder="Ex: 15000" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Événements / an</Label>
                    <Input type="number" value={uniFields.numEventsPerYear} onChange={(e) => setUniFields((p) => ({ ...p, numEventsPerYear: e.target.value }))} placeholder="Ex: 5" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Étape 4 : Fournisseur technologique ─────────── */}
            {step === 4 && form.categories === "supplier" && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon icon={Globe02Icon} className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Informations technologiques</h2>
                    <p className="text-sm text-muted-foreground">Détails sur l&apos;offre technologique</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Type de fournisseur</Label>
                    <Input placeholder="Ex: Éditeur logiciel, Cloud provider…" value={techFields.vendorType} onChange={(e) => setTechFields((p) => ({ ...p, vendorType: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Modèle de partenariat</Label>
                    <Input placeholder="Ex: Reseller, Alliance, OEM…" value={techFields.partnershipModel} onChange={(e) => setTechFields((p) => ({ ...p, partnershipModel: e.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold">Technologies (séparées par des virgules)</Label>
                    <Input placeholder="Ex: AWS, Azure, SAP, ServiceNow" value={techFields.technologies} onChange={(e) => setTechFields((p) => ({ ...p, technologies: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Certifications détenues</Label>
                    <Input placeholder="Ex: Gold Partner, Premier Consulting" value={techFields.certificationsHeld} onChange={(e) => setTechFields((p) => ({ ...p, certificationsHeld: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Niveau de certification</Label>
                    <Input placeholder="Ex: Gold, Silver, Platinum" value={techFields.certificationLevel} onChange={(e) => setTechFields((p) => ({ ...p, certificationLevel: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border px-6 py-5 sm:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 0 ? () => router.push("/dashboard/partners") : prev}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
            {step === 0 ? "Annuler" : "Précédent"}
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="h-10 cursor-pointer px-5"
            >
              <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4" />
              {loading ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le partenaire"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={next}
              disabled={!isStepValid()}
              className="h-10 cursor-pointer px-5"
            >
              Suivant
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
