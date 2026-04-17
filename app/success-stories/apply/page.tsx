"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { BackgroundPaths } from "@/frontend/components/ui/background-paths"
import { Footer } from "@/frontend/components/footer"
import { toast } from "@/frontend/components/ui/toast"
import { cn } from "@/frontend/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Building06Icon,
  UserIcon,
  Mail01Icon,
  Globe02Icon,
  Briefcase01Icon,
  GraduateMaleIcon,
  Rocket01Icon,
  CheckmarkSquare01Icon,
} from "@hugeicons/core-free-icons"

const categories = [
  { value: "customer", label: "Client", description: "Entreprise souhaitant bénéficier des services Capgemini", icon: Briefcase01Icon, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
  { value: "marketing", label: "Marketing", description: "Partenariat marketing et co-branding", icon: Rocket01Icon, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
  { value: "supplier", label: "Fournisseur Technologique", description: "Éditeur de logiciels, intégrateur ou fournisseur cloud", icon: Globe02Icon, color: "text-[#0070AD] dark:text-[#12ABDB]", bg: "bg-blue-50 dark:bg-[#0070AD]/10 border-blue-200 dark:border-[#0070AD]/30" },
  { value: "university", label: "Universitaire", description: "École, université ou institut de formation", icon: GraduateMaleIcon, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
]

// Steps visible depends on category
const getSteps = (cat: string) => {
  const base = [
    { id: "type", title: "Type", icon: Briefcase01Icon },
    { id: "company", title: "Entreprise", icon: Building06Icon },
    { id: "contact", title: "Contact", icon: UserIcon },
    { id: "partnership", title: "Partenariat", icon: Rocket01Icon },
  ]
  if (cat === "university" || cat === "supplier") {
    base.push({ id: "specific", title: cat === "university" ? "Université" : "Technologie", icon: cat === "university" ? GraduateMaleIcon : Globe02Icon })
  }
  return base
}

const contentVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export default function PartnershipApplyPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)
  const [scrolled, setScrolled] = useState(false)
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
    institutionType: "",
    numStudents: "",
    specialties: "",
    numInternsPerYear: "",
    numApprenticesPerYear: "",
    numHiresPerYear: "",
    vendorType: "",
    technologies: "",
    certificationsHeld: "",
    certificationLevel: "",
    partnershipModel: "",
  })

  const steps = getSteps(category)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Auto-advance when category selected
  const handleCategorySelect = (val: string) => {
    setCategory(val)
    setTimeout(() => setStep(1), 400)
  }

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const isStepValid = () => {
    switch (step) {
      case 0: return !!category
      case 1: return !!form.companyName
      case 2: return !!form.contactFirstName && !!form.contactLastName && !!form.contactEmail
      default: return true
    }
  }

  const isLastStep = step === steps.length - 1

  const handleSubmit = async () => {
    if (!category || !form.companyName || !form.contactFirstName || !form.contactLastName || !form.contactEmail) {
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

  // ─── Success screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#001A3A]">
        <BackgroundPaths className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-10 max-w-lg mx-auto text-center"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Demande envoyée !</h2>
            <p className="text-white/70 mb-8">
              Merci pour votre intérêt pour Capgemini Tunisie. Notre équipe examinera votre demande et vous contactera par email dans les plus brefs délais.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/success-stories">
                <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
                  Success Stories
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-[#0070AD] hover:bg-[#005a8e] text-white rounded-full">
                  Accueil
                </Button>
              </Link>
            </div>
          </motion.div>
        </BackgroundPaths>
      </div>
    )
  }

  // ─── Main page ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-[#001A3A]">

      {/* Navbar — glassmorphic pill */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 dark:bg-[#001A3A]/90 backdrop-blur-md border-b border-[#0070AD]/10 dark:border-white/10 py-3 shadow-sm"
            : "bg-transparent py-5"
        )}
        ref={(el) => {
          if (el) {
            const onScroll = () => setScrolled(window.scrollY > 20)
            window.addEventListener("scroll", onScroll)
          }
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>
          <div className={cn(
            "hidden md:flex items-center space-x-1 rounded-full backdrop-blur-xl p-1 transition-all duration-300",
            scrolled
              ? "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
              : "bg-white/10 border border-white/20"
          )}>
            {([
              { label: "Home", href: "/" },
              { label: "Why Capgemini", href: "/#why-capgemini", anchor: true },
              { label: "Success Stories", href: "/success-stories" },
              { label: "Solutions", href: "/solutions" },
            ] as { label: string; href: string; anchor?: boolean }[]).map((link) =>
              link.anchor ? (
                <a key={link.href} href={link.href} className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  scrolled
                    ? "text-[#001A3A]/75 dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10"
                    : "text-white/90 hover:bg-white/15"
                )}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  scrolled
                    ? "text-[#001A3A]/75 dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10"
                    : "text-white/90 hover:bg-white/15"
                )}>
                  {link.label}
                </Link>
              )
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="ghost" size="icon" />
            <Button asChild size="sm" className="bg-[#0070AD] hover:bg-[#005a8e] text-white font-semibold rounded-full px-5 shadow-md shadow-[#0070AD]/20">
              <Link href="/auth/sign-in">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — BackgroundPaths avec titre */}
      <BackgroundPaths className="w-full">
        <div className="max-w-3xl mx-auto px-4 text-center pt-36 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[#12ABDB] text-sm px-4 py-1.5 mb-6"
          >
            🤝 Rejoignez l&apos;écosystème Capgemini Tunisie
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4"
          >
            Devenir Partenaire
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-white/70 leading-relaxed max-w-xl mx-auto"
          >
            Remplissez le formulaire ci-dessous pour soumettre votre demande de partenariat avec Capgemini Tunisie.
          </motion.p>
        </div>
      </BackgroundPaths>

      {/* Form zone */}
      <div className="relative z-10 px-4 pb-24 mt-12">
        <div className="max-w-2xl mx-auto">

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
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    i < step ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    i < step
                      ? "bg-[#0070AD] border-[#0070AD] text-white"
                      : i === step
                        ? "bg-white dark:bg-[#001A3A] border-[#0070AD] text-[#0070AD]"
                        : "bg-white/50 dark:bg-white/5 border-[#0070AD]/20 text-[#001A3A]/30 dark:text-white/30"
                  )}>
                    {i < step
                      ? <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4" />
                      : <HugeiconsIcon icon={s.icon} className="w-4 h-4" />
                    }
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:block",
                    i === step ? "text-[#0070AD]" : "text-[#001A3A]/40 dark:text-white/40"
                  )}>{s.title}</span>
                </button>
              ))}
            </div>
            <div className="w-full bg-[#0070AD]/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#0070AD] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: steps.length > 1 ? `${(step / (steps.length - 1)) * 100}%` : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-xs text-center text-[#001A3A]/50 dark:text-white/40 mt-2">
              Étape {step + 1} sur {steps.length} — {steps[step].title}
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl border border-[#0070AD]/10 dark:border-white/10 bg-white dark:bg-[#001A3A]/80 shadow-xl shadow-[#0070AD]/5 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* ── Étape 1 : Type de partenariat ─────────────────── */}
                {step === 0 && (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#0070AD]/10 flex items-center justify-center">
                        <HugeiconsIcon icon={Briefcase01Icon} className="w-5 h-5 text-[#0070AD]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#001A3A] dark:text-white">Type de partenariat</h2>
                        <p className="text-sm text-[#001A3A]/55 dark:text-white/55">Sélectionnez votre profil pour commencer</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                      {categories.map((cat) => (
                        <motion.button
                          key={cat.value}
                          type="button"
                          onClick={() => handleCategorySelect(cat.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            "p-5 rounded-2xl border-2 text-left transition-all duration-200",
                            category === cat.value
                              ? `${cat.bg} ring-2 ring-offset-1 ring-[#0070AD]/30 dark:ring-offset-[#001A3A]`
                              : "border-[#0070AD]/10 dark:border-white/10 hover:border-[#0070AD]/30 dark:hover:border-white/20 bg-white dark:bg-white/3"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", cat.bg)}>
                            <HugeiconsIcon icon={cat.icon} className={cn("w-5 h-5", cat.color)} />
                          </div>
                          <div className={cn("font-semibold text-sm mb-1", cat.color)}>{cat.label}</div>
                          <div className="text-xs text-[#001A3A]/55 dark:text-white/55 leading-relaxed">{cat.description}</div>
                          {category === cat.value && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mt-2 flex items-center gap-1 text-xs font-medium text-[#0070AD] dark:text-[#12ABDB]"
                            >
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                              Sélectionné
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    {category && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm text-[#0070AD] dark:text-[#12ABDB] mt-5"
                      >
                        Passage à l&apos;étape suivante…
                      </motion.p>
                    )}
                  </div>
                )}

                {/* ── Étape 2 : Informations entreprise ──────────────── */}
                {step === 1 && (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#0070AD]/10 flex items-center justify-center">
                        <HugeiconsIcon icon={Building06Icon} className="w-5 h-5 text-[#0070AD]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#001A3A] dark:text-white">Informations entreprise</h2>
                        <p className="text-sm text-[#001A3A]/55 dark:text-white/55">Renseignez les informations de votre organisation</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Nom de l&apos;entreprise *</Label>
                        <Input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Ex: ESPRIT, Sofrecom…" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Raison sociale</Label>
                        <Input name="legalName" value={form.legalName} onChange={handleChange} placeholder="Raison sociale" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Site web</Label>
                        <Input name="website" value={form.website} onChange={handleChange} placeholder="https://…" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Pays</Label>
                        <Input name="country" value={form.country} onChange={handleChange} placeholder="Ex: Tunisie" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Adresse</Label>
                        <Input name="address" value={form.address} onChange={handleChange} placeholder="Adresse complète" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Nombre d&apos;employés</Label>
                        <Input name="numEmployees" type="number" value={form.numEmployees} onChange={handleChange} placeholder="Ex: 500" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">CA annuel (TND)</Label>
                        <Input name="annualRevenue" value={form.annualRevenue} onChange={handleChange} placeholder="Ex: 5000000" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Description</Label>
                        <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrivez brièvement votre organisation et son activité…" rows={3} className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Étape 3 : Contact principal ─────────────────────── */}
                {step === 2 && (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#0070AD]/10 flex items-center justify-center">
                        <HugeiconsIcon icon={UserIcon} className="w-5 h-5 text-[#0070AD]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#001A3A] dark:text-white">Contact principal</h2>
                        <p className="text-sm text-[#001A3A]/55 dark:text-white/55">La personne qui pilote ce partenariat</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Prénom *</Label>
                        <Input name="contactFirstName" value={form.contactFirstName} onChange={handleChange} placeholder="Prénom" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Nom *</Label>
                        <Input name="contactLastName" value={form.contactLastName} onChange={handleChange} placeholder="Nom" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Email *</Label>
                        <Input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="email@entreprise.com" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Téléphone</Label>
                        <Input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+216 …" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Fonction / Rôle</Label>
                        <Input name="contactRole" value={form.contactRole} onChange={handleChange} placeholder="Ex: Directeur des partenariats" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Étape 4 : Partenariat ───────────────────────────── */}
                {step === 3 && (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#0070AD]/10 flex items-center justify-center">
                        <HugeiconsIcon icon={Rocket01Icon} className="w-5 h-5 text-[#0070AD]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#001A3A] dark:text-white">Partenariat</h2>
                        <p className="text-sm text-[#001A3A]/55 dark:text-white/55">Vos attentes vis-à-vis du partenariat</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Sous-catégorie</Label>
                        <Input name="partnerSubcategory" value={form.partnerSubcategory} onChange={handleChange} placeholder="Ex: Cloud, ERP, Formation…" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Niveau souhaité</Label>
                        <select name="partnershipLevel" value={form.partnershipLevel} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070AD]/20 focus:border-[#0070AD]">
                          <option value="Standard">Standard</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Motivations et objectifs</Label>
                        <Textarea name="motivations" value={form.motivations} onChange={handleChange} placeholder="Décrivez vos motivations, objectifs et attentes de ce partenariat…" rows={5} className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Étape 5 (conditionnelle) : Université ───────────── */}
                {step === 4 && category === "university" && (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <HugeiconsIcon icon={GraduateMaleIcon} className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#001A3A] dark:text-white">Informations universitaires</h2>
                        <p className="text-sm text-[#001A3A]/55 dark:text-white/55">Détails spécifiques à votre institution</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Type d&apos;institution</Label>
                        <select name="institutionType" value={form.institutionType} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070AD]/20">
                          <option value="">Sélectionner…</option>
                          <option value="universite">Université</option>
                          <option value="ecole_ingenieur">École d&apos;ingénieurs</option>
                          <option value="ecole_commerce">École de commerce</option>
                          <option value="institut">Institut de formation</option>
                          <option value="centre_recherche">Centre de recherche</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Nombre d&apos;étudiants</Label>
                        <Input name="numStudents" type="number" value={form.numStudents} onChange={handleChange} placeholder="Ex: 5000" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Spécialités (séparées par des virgules)</Label>
                        <Input name="specialties" value={form.specialties} onChange={handleChange} placeholder="Ex: Informatique, IA, Cybersécurité" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Stagiaires / an</Label>
                        <Input name="numInternsPerYear" type="number" value={form.numInternsPerYear} onChange={handleChange} placeholder="Ex: 200" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Alternants / an</Label>
                        <Input name="numApprenticesPerYear" type="number" value={form.numApprenticesPerYear} onChange={handleChange} placeholder="Ex: 50" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Recrutements / an</Label>
                        <Input name="numHiresPerYear" type="number" value={form.numHiresPerYear} onChange={handleChange} placeholder="Ex: 30" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Étape 5 (conditionnelle) : Fournisseur ──────────── */}
                {step === 4 && category === "supplier" && (
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#0070AD]/10 flex items-center justify-center">
                        <HugeiconsIcon icon={Globe02Icon} className="w-5 h-5 text-[#0070AD]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#001A3A] dark:text-white">Informations technologiques</h2>
                        <p className="text-sm text-[#001A3A]/55 dark:text-white/55">Détails sur votre offre technologique</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Type de fournisseur</Label>
                        <select name="vendorType" value={form.vendorType} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070AD]/20">
                          <option value="">Sélectionner…</option>
                          <option value="editeur">Éditeur de logiciels</option>
                          <option value="cloud_provider">Fournisseur Cloud</option>
                          <option value="integrateur">Intégrateur</option>
                          <option value="conseil">Cabinet de conseil tech</option>
                          <option value="startup">Startup technologique</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Modèle de partenariat</Label>
                        <select name="partnershipModel" value={form.partnershipModel} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070AD]/20">
                          <option value="">Sélectionner…</option>
                          <option value="reseller">Revendeur</option>
                          <option value="integration">Intégration</option>
                          <option value="co_development">Co-développement</option>
                          <option value="consulting">Consulting</option>
                          <option value="ofs">OFS (Offshore)</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Technologies (séparées par des virgules)</Label>
                        <Input name="technologies" value={form.technologies} onChange={handleChange} placeholder="Ex: AWS, Azure, SAP, Salesforce" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Nombre de certifications</Label>
                        <Input name="certificationsHeld" type="number" value={form.certificationsHeld} onChange={handleChange} placeholder="Ex: 15" className="focus:ring-[#0070AD]/20 focus:border-[#0070AD]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#001A3A] dark:text-white">Niveau de certification</Label>
                        <select name="certificationLevel" value={form.certificationLevel} onChange={handleChange} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070AD]/20">
                          <option value="">Sélectionner…</option>
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                          <option value="platinum">Platinum</option>
                          <option value="premier">Premier</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer actions */}
            <div className="px-8 py-5 border-t border-[#0070AD]/10 dark:border-white/10 flex items-center justify-between">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={step === 0 ? undefined : prev}
                  disabled={step === 0}
                  className="text-[#001A3A]/60 dark:text-white/60 hover:text-[#001A3A] dark:hover:text-white rounded-full"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-1.5" />
                  Retour
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {isLastStep ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !isStepValid()}
                    className="bg-[#0070AD] hover:bg-[#005a8e] text-white font-semibold rounded-full px-8 shadow-md shadow-[#0070AD]/20"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Envoi…
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-2" />
                        Soumettre ma demande
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={next}
                    disabled={!isStepValid()}
                    className="bg-[#0070AD] hover:bg-[#005a8e] text-white font-semibold rounded-full px-8 shadow-md shadow-[#0070AD]/20"
                  >
                    Suivant
                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
