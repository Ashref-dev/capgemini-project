"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/frontend/components/ui/button"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { Footer } from "@/frontend/components/footer"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
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
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <a href="/#why-capgemini" className="text-muted-foreground hover:text-primary transition-colors">Why Capgemini</a>
            <Link href="/success-stories" className="text-muted-foreground hover:text-primary transition-colors">Success Stories</Link>
            <Link href="/solutions" className="text-primary font-semibold">Solutions</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="ghost" size="icon" />
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/auth/sign-in">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-primary/5 via-blue-50/50 to-indigo-50/50 dark:from-primary/10 dark:via-blue-950/30 dark:to-indigo-950/20 border-b border-border">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20"
          >
            Nos domaines d&apos;expertise partenaires
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground leading-tight"
          >
            Solutions de partenariat
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              adaptées à votre activité
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Découvrez comment Capgemini Tunisie structure ses collaborations selon votre domaine d&apos;expertise.
            Chaque modèle de partenariat est conçu pour générer de la valeur des deux côtés.
          </motion.p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-8 hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={solution.icon} className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">{solution.category}</span>
                  <h3 className="text-lg font-bold text-foreground mt-1">{solution.title}</h3>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                {solution.description}
              </p>

              <ul className="space-y-2 mb-6">
                {solution.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Profil idéal : <span className="font-medium text-primary">{solution.partnerType}</span>
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Vous vous reconnaissez dans l&apos;un de ces profils ?
          </h2>
          <p className="text-lg text-blue-100 leading-relaxed">
            Soumettez une demande de partenariat. Notre équipe commerciale vous contactera pour analyser votre dossier et vous proposer le cadre de collaboration le plus adapté.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-white/90 font-bold px-10">
              <Link href="/success-stories/apply">
                Soumettre une demande
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-10">
              <Link href="/success-stories">Voir les success stories</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
