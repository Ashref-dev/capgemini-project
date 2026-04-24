"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/frontend/components/ui/button"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { cn } from "@/frontend/lib/utils"
import { Footer } from "@/frontend/components/footer"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { ShadowOverlay } from "@/frontend/components/ui/shadow-overlay"
import { ContainerScroll } from "@/frontend/components/ui/container-scroll"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudIcon,
  ArtificialIntelligence01Icon,
  SecurityLockIcon,
  CodeIcon,
  ChartIncreaseIcon,
  TargetIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

const solutions = [
  {
    icon: CloudIcon,
    category: "Cloud & Infrastructure",
    title: "Migration & Cloud Native",
    description:
      "Accompagnez vos clients dans leur migration vers le cloud (AWS, Azure, Google Cloud) et la modernisation de leurs infrastructures avec des architectures natives cloud, containerisées et serverless.",
    benefits: ["Réduction des coûts d'infrastructure", "Scalabilité automatique", "Haute disponibilité multi-région"],
    partnerType: "Fournisseur technologique",
  },
  {
    icon: ArtificialIntelligence01Icon,
    category: "Data & Intelligence Artificielle",
    title: "Data Platform & IA",
    description:
      "Développez des plateformes de données, des pipelines analytiques, et des modèles d'IA/ML pour des cas d'usage métier concrets : prédiction, automatisation, NLP, vision par ordinateur.",
    benefits: ["Accès à des data engineers Capgemini", "Co-développement de modèles IA", "POC et MVP accélérés"],
    partnerType: "Fournisseur technologique / Université",
  },
  {
    icon: SecurityLockIcon,
    category: "Cybersécurité",
    title: "Security Operations & Compliance",
    description:
      "Proposez des solutions de sécurité intégrées : SOC as a Service, pentest, gestion des identités (IAM), conformité RGPD/ISO 27001, et protection des applications.",
    benefits: ["Certification partenaire Capgemini Cybersecurity", "Référencement dans notre catalogue", "Opportunités commerciales directes"],
    partnerType: "Fournisseur technologique",
  },
  {
    icon: CodeIcon,
    category: "Ingénierie Logicielle",
    title: "Développement & Intégration",
    description:
      "Collaborez sur des projets de développement applicatif, d'intégration d'ERP/CRM/API, ou de modernisation de systèmes legacy pour nos clients dans toute la région MENA.",
    benefits: ["Pipeline de projets qualifiés", "Support technique Capgemini", "Co-delivery sur projets clients"],
    partnerType: "Fournisseur technologique",
  },
  {
    icon: ChartIncreaseIcon,
    category: "Transformation & Conseil",
    title: "Change Management & Formation",
    description:
      "Proposez des programmes de formation, de coaching en gestion du changement, et d'accompagnement à la transformation digitale dans les organisations privées et publiques.",
    benefits: ["Accès aux entreprises clientes Capgemini", "Co-branding sur les formations", "Certification des modules partenaires"],
    partnerType: "Université / Consultant indépendant",
  },
  {
    icon: TargetIcon,
    category: "Recrutement & Talent",
    title: "Pipeline Étudiants & Alternance",
    description:
      "Établissez des programmes de stages, d'alternance et de recrutement avec Capgemini Tunisie pour alimenter notre vivier de talents tech tout en préparant vos étudiants au marché.",
    benefits: ["Accueil de 50+ stagiaires/an", "Projets de fin d'études réels", "Offres d'emploi en priorité"],
    partnerType: "Université",
  },
]

export default function SolutionsPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Avoid SSR/client mismatch: use a stable default until mounted
  const isDark = mounted && resolvedTheme === 'dark'
  const shadowColor = isDark ? 'rgba(0, 112, 173, 0.65)' : 'rgba(18, 171, 219, 0.4)'
  const noiseOpacity = isDark ? 1 : 0.12

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar — glassmorphic pill (identique à Home) */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 dark:bg-[#001A3A]/90 backdrop-blur-md border-b border-[#0070AD]/10 dark:border-white/10 py-3 shadow-sm"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>

          {/* Pill nav */}
          <div className="hidden md:flex items-center space-x-1 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 p-1">
            {([
              { label: "Home", href: "/" },
              { label: "Why Capgemini", href: "/#why-capgemini", anchor: true },
              { label: "Success Stories", href: "/success-stories" },
              { label: "Solutions", href: "/solutions", active: true },
            ] as { label: string; href: string; anchor?: boolean; active?: boolean }[]).map((link) =>
              link.anchor ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#001A3A]/75 dark:text-white/90 transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#001A3A] dark:hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all",
                    link.active
                      ? "bg-[#0070AD] text-white shadow-sm"
                      : "text-[#001A3A]/75 dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#001A3A] dark:hover:text-white"
                  )}
                >
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

      {/* Hero — 2 colonnes avec ShadowOverlay */}
      <section className="relative min-h-[85vh] w-full overflow-hidden flex items-center bg-white dark:bg-[#001A3A]">

        {/* ShadowOverlay — fond absolu */}
        <ShadowOverlay
          color={shadowColor}
          animation={{ scale: 100, speed: 90 }}
          noise={{ opacity: noiseOpacity, scale: 1.2 }}
          sizing="fill"
          className="absolute inset-0 w-full h-full z-0"
        />

        {/* Contenu au-dessus */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center pt-28 pb-20">

          {/* Colonne gauche — texte */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 border border-[#0070AD]/30 bg-[#0070AD]/5 text-[#0070AD] dark:border-[#12ABDB]/30 dark:bg-[#12ABDB]/10 dark:text-[#12ABDB] px-4 py-1.5 rounded-full text-sm font-medium"
            >
              Nos domaines d&apos;expertise partenaires
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#001A3A] dark:text-white leading-tight"
            >
              Solutions de partenariat
              <span className="block bg-gradient-to-r from-[#0070AD] to-[#12ABDB] bg-clip-text text-transparent">
                adaptées à votre activité
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-[#001A3A]/65 dark:text-white/60 leading-relaxed max-w-md mt-6"
            >
              Découvrez comment Capgemini Tunisie structure ses collaborations selon votre domaine d&apos;expertise.
              Chaque modèle de partenariat est conçu pour générer de la valeur des deux côtés.
            </motion.p>
          </div>

          {/* Colonne droite — vidéo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative h-[520px] w-full hidden lg:block rounded-2xl overflow-hidden shadow-2xl ring-2 ring-[#12ABDB]/20 dark:ring-[#0070AD]/30"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="rounded-2xl w-full h-full object-cover"
            >
              <source src="/video_partnership.mov" type="video/mp4" />
            </video>
          </motion.div>
        </div>
      </section>

      {/* Solutions — marquee horizontal infini */}
      <section className="py-20 bg-white dark:bg-[#001A3A] overflow-hidden">
        <div className="mb-10 text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-[#0070AD] dark:text-[#12ABDB] uppercase tracking-widest mb-2"
          >
            Nos domaines de collaboration
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07 }}
            className="text-3xl md:text-4xl font-bold text-[#001A3A] dark:text-white"
          >
            6 modèles de partenariat
          </motion.h2>
        </div>

        {/* Track */}
        <div className="marquee-container w-full">
          <div className="marquee-track flex gap-6 w-max py-4">
            {[...solutions, ...solutions].map((solution, index) => (
              <article
                key={index}
                className="flex-shrink-0 w-[340px] flex flex-col rounded-2xl border border-[#0070AD]/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 transition-all hover:shadow-lg hover:border-[#0070AD]/40 dark:hover:border-white/20 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#0070AD]/10 dark:bg-[#12ABDB]/10 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={solution.icon} className="w-6 h-6 text-[#0070AD] dark:text-[#12ABDB]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0070AD] dark:text-[#12ABDB] uppercase tracking-widest">{solution.category}</span>
                    <h3 className="text-lg font-bold text-[#001A3A] dark:text-white mt-1">{solution.title}</h3>
                  </div>
                </div>

                <p className="text-[#001A3A]/60 dark:text-white/70 text-sm leading-relaxed mb-6 flex-grow">
                  {solution.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {solution.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#001A3A]/80 dark:text-white/80">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] mt-0.5 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-[#0070AD]/10 dark:border-white/10">
                  <span className="text-xs text-[#001A3A]/50 dark:text-white/50">
                    Profil idéal : <span className="font-medium text-[#0070AD] dark:text-[#12ABDB]">{solution.partnerType}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ContainerScroll — Profils partenaires ──────────────── */}
      <section className="bg-white dark:bg-[#001A3A]">
        <ContainerScroll
          titleComponent={
            <div className="space-y-4 pb-4">
              <p className="text-sm font-semibold text-[#0070AD] dark:text-[#12ABDB] uppercase tracking-widest">
                Rejoignez l&apos;écosystème Capgemini
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-[#001A3A] dark:text-white leading-tight">
                Vous vous reconnaissez
                <br />
                dans l&apos;un de ces profils&nbsp;?
              </h2>
            </div>
          }
        >
          {/* Contenu de la carte scrollable */}
          <div className="h-full w-full flex flex-col items-center justify-center gap-8 px-6 md:px-12 text-center">
            <p className="text-lg text-[#001A3A]/70 dark:text-white/70 leading-relaxed max-w-xl">
              Soumettez une demande de partenariat. Notre équipe commerciale vous contactera
              pour analyser votre dossier et vous proposer le cadre de collaboration le plus adapté.
            </p>

            {/* Grille de profils */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
              {[
                { label: "Fournisseur technologique", color: "bg-[#0070AD]/10 dark:bg-[#0070AD]/20 text-[#0070AD] dark:text-[#12ABDB]" },
                { label: "Université / École", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" },
                { label: "Consultant indépendant", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" },
                { label: "Startup / ISV", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
              ].map((p) => (
                <div
                  key={p.label}
                  className={`rounded-xl px-3 py-3 text-xs font-semibold ${p.color} border border-current/10`}
                >
                  {p.label}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button asChild size="lg" className="bg-[#0070AD] hover:bg-[#005a8e] text-white font-bold px-10 rounded-full">
                <Link href="/success-stories/apply">
                  Soumettre une demande
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-[#0070AD]/30 dark:border-white/20 text-[#001A3A] dark:text-white hover:bg-[#0070AD]/5 dark:hover:bg-white/10 px-10 rounded-full">
                <Link href="/success-stories">Voir les success stories</Link>
              </Button>
            </div>
          </div>
        </ContainerScroll>
      </section>

      <Footer />
    </div>
  )
}
