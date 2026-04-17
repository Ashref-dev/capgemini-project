"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/frontend/components/ui/button"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { BackgroundPaths } from "@/frontend/components/ui/background-paths"
import { GlowCard } from "@/frontend/components/ui/glow-card"
import { Footer } from "@/frontend/components/footer"
import { cn } from "@/frontend/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Calendar03Icon,
  UserGroupIcon,
  ChartLineData03Icon,
  MoneyBag02Icon,
  StarIcon,
  LocationIcon,
  CheckmarkCircle02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"

interface SuccessEvent {
  id: number
  eventName: string
  eventType: string | null
  eventDate: string | null
  eventLocation: string | null
  numParticipants: number | null
  eventBudget: string | null
  satisfactionScore: string | null
  eventStatus: string | null
  eventRevenue: string | null
  roiEvent: string | null
  notes: string | null
  partnerName: string
  partnerCategory: string
  partnerCountry: string | null
}

interface SuccessProject {
  id: number
  projectName: string
  projectDescription: string | null
  clientName: string | null
  projectType: string | null
  technologiesUsed: string[] | null
  startDate: string | null
  endDate: string | null
  durationMonths: number | null
  projectValue: string | null
  deliveryStatus: string | null
  clientSatisfactionScore: string | null
  projectStatus: string | null
  isReferenceProject: boolean | null
  notes: string | null
  partnerName: string
  partnerCategory: string
}

interface Stats {
  totalEvents: number
  totalParticipants: number
  avgEventSatisfaction: number | null
  totalEventRevenue: number
  totalProjects: number
  completedProjects: number
  avgProjectSatisfaction: number | null
  totalProjectValue: number
  totalActivePartners: number
  partnerCategories: number
  partnerCountries: number
}

const categoryLabels: Record<string, string> = {
  customer: "Client",
  marketing: "Marketing",
  supplier: "Fournisseur",
  university: "Universitaire",
}

const categoryColors: Record<string, string> = {
  customer: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  marketing: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  supplier: "bg-blue-50 text-[#0070AD] dark:bg-blue-900/20 dark:text-blue-400",
  university: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
}

function formatCurrency(val: string | number | null) {
  if (!val) return "—"
  const n = typeof val === "string" ? parseFloat(val) : val
  if (isNaN(n)) return "—"
  return new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(n)
}

function SatisfactionBadge({ score }: { score: string | number | null }) {
  if (!score) return <span className="text-[#001A3A]/40 dark:text-white/40 text-xs">—</span>
  const n = typeof score === "string" ? parseFloat(score) : score
  const color = n >= 4 ? "text-emerald-600 dark:text-emerald-400" : n >= 3 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
  return (
    <span className={cn("font-semibold text-xs", color)}>
      {n.toFixed(1)}/5 <HugeiconsIcon icon={StarIcon} className="w-3 h-3 inline-block" />
    </span>
  )
}

// Letter-by-letter animated word
function AnimatedWord({
  word,
  delay = 0,
  className,
}: {
  word: string
  delay?: number
  className?: string
}) {
  return (
    <span className="inline-block">
      {word.split("").map((letter, i) => (
        <motion.span
          key={i}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: delay + i * 0.03,
            type: "spring",
            stiffness: 150,
            damping: 25,
          }}
          className={cn("inline-block", className)}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  )
}

export default function SuccessStoriesPage() {
  const [data, setData] = useState<{ events: SuccessEvent[]; projects: SuccessProject[]; stats: Stats } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"events" | "projects">("events")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    fetch("/api/success-stories")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filteredEvents = data?.events.filter(
    (e) => categoryFilter === "all" || e.partnerCategory === categoryFilter,
  ) || []
  const filteredProjects = data?.projects.filter(
    (p) => categoryFilter === "all" || p.partnerCategory === categoryFilter,
  ) || []

  const statsRow = [
    {
      icon: UserGroupIcon,
      value: data?.stats.totalActivePartners ?? 138,
      label: "Partenaires actifs",
    },
    {
      icon: Calendar03Icon,
      value: data?.stats.totalEvents ?? 39,
      label: "Événements réalisés",
    },
    {
      icon: CheckmarkCircle02Icon,
      value: data?.stats.completedProjects ?? 0,
      label: "Projets livrés",
    },
    {
      icon: ChartLineData03Icon,
      value: data?.stats.totalParticipants
        ? data.stats.totalParticipants.toLocaleString("fr")
        : "6 140",
      label: "Participants total",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#001A3A]">

      {/* ─── Navbar — glassmorphic pill (identique à Home) ──────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#001A3A]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-sm"
            : "bg-transparent py-5",
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Left — logo */}
          <Link href="/" className="flex items-center gap-2">
            <CapgeminiLogo size="md" />
          </Link>

          {/* Center — pill nav */}
          <div className="hidden md:flex items-center space-x-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 p-1">
            {([
              { label: "Home", href: "/" },
              { label: "Why Capgemini", href: "/#why-capgemini", anchor: true },
              { label: "Success Stories", href: "/success-stories", active: true },
              { label: "Solutions", href: "/solutions" },
            ] as { label: string; href: string; anchor?: boolean; active?: boolean }[]).map((link) =>
              link.anchor ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:text-white"
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
                      : "text-white/90 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle variant="ghost" size="icon" />
            <Link href="/success-stories/apply">
              <Button className="hidden sm:flex items-center gap-2 bg-[#0070AD] hover:bg-[#005a8e] text-white font-semibold rounded-full px-5 shadow-md shadow-[#0070AD]/20 transition-all hover:scale-105">
                <HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4" />
                Devenir Partenaire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero (BackgroundPaths) ──────────────────────────────────── */}
      <BackgroundPaths className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 text-center pt-28 pb-16">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[#12ABDB] text-sm px-4 py-1.5 mb-8"
          >
            🚀 Nos réalisations avec nos partenaires
          </motion.div>

          {/* Title — letter-by-letter spring animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-0 tracking-tighter leading-tight">
              <AnimatedWord
                word="Success"
                delay={0}
                className="text-white"
              />
              <span className="inline-block w-4 md:w-6" aria-hidden="true" />
              <AnimatedWord
                word="Stories"
                delay={0.12}
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070AD] to-[#12ABDB]"
              />
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto mt-8"
          >
            Découvrez les événements et projets réalisés par Capgemini Tunisie avec ses
            partenaires à travers toutes les catégories.
          </motion.p>
        </div>
      </BackgroundPaths>

      {/* ─── Stats Row ──────────────────────────────────────────────── */}
      <section className="py-10 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {statsRow.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
          <GlowCard customSize glowColor="blue" className="w-full text-center">
            <div className="flex flex-col items-center">
              <HugeiconsIcon
                icon={stat.icon}
                className="w-6 h-6 text-[#0070AD] dark:text-[#12ABDB] mx-auto mb-3"
              />
              <div className="text-3xl font-bold text-[#0070AD] dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-[#001A3A]/60 dark:text-white/50 mt-1">
                {stat.label}
              </div>
            </div>
          </GlowCard>
          </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Tabs + Filters + Cards ──────────────────────────────────── */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Tabs & category pill filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            {/* Tab toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("events")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === "events"
                    ? "bg-[#0070AD] text-white shadow-lg shadow-[#0070AD]/20"
                    : "border border-[#0070AD]/30 text-[#001A3A] dark:text-white hover:border-[#0070AD]/60",
                )}
              >
                <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Événements ({filteredEvents.length})
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === "projects"
                    ? "bg-[#0070AD] text-white shadow-lg shadow-[#0070AD]/20"
                    : "border border-[#0070AD]/30 text-[#001A3A] dark:text-white hover:border-[#0070AD]/60",
                )}
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Projets ({filteredProjects.length})
              </button>
            </div>

            {/* Category pill filters */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { key: "all", label: "Toutes" },
                { key: "customer", label: "Client" },
                { key: "marketing", label: "Marketing" },
                { key: "supplier", label: "Fournisseur" },
                { key: "university", label: "Universitaire" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    categoryFilter === cat.key
                      ? "bg-white dark:bg-white/10 border border-[#0070AD] text-[#0070AD] dark:text-white shadow-sm"
                      : "text-[#001A3A]/60 dark:text-white/40 hover:text-[#0070AD] dark:hover:text-white/70",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-[#0070AD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[#001A3A]/50 dark:text-white/50">Chargement des données...</p>
            </div>
          ) : (
            <>
              {/* ── Events grid ── */}
              {activeTab === "events" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {filteredEvents.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-[#001A3A]/40 dark:text-white/40">
                      Aucun événement trouvé pour cette catégorie.
                    </div>
                  ) : (
                    filteredEvents.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.04 }}
                      >
                        <GlowCard customSize glowColor="blue" className="w-full h-full group">
                          <div className="flex flex-col h-full">
                          {/* Top row: title + badge */}
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <h3 className="font-semibold text-[#001A3A] dark:text-white group-hover:text-[#0070AD] dark:group-hover:text-[#12ABDB] transition-colors line-clamp-1 flex-1 min-w-0">
                              {event.eventName}
                            </h3>
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0",
                                categoryColors[event.partnerCategory] || "bg-gray-100 text-gray-600",
                              )}
                            >
                              {categoryLabels[event.partnerCategory] || event.partnerCategory}
                            </span>
                          </div>

                          {/* Partner name */}
                          <p className="text-sm text-[#001A3A]/50 dark:text-white/40">
                            {event.partnerName}
                          </p>

                          {/* Divider */}
                          <div className="border-t border-[#0070AD]/10 my-3" />

                          {/* Meta 2×2 grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {event.eventDate && (
                              <div className="flex items-center gap-1.5 text-sm text-[#001A3A]/70 dark:text-white/60">
                                <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] shrink-0" />
                                <span className="truncate">
                                  {new Date(event.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              </div>
                            )}
                            {event.eventLocation && (
                              <div className="flex items-center gap-1.5 text-sm text-[#001A3A]/70 dark:text-white/60">
                                <HugeiconsIcon icon={LocationIcon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] shrink-0" />
                                <span className="truncate">{event.eventLocation}</span>
                              </div>
                            )}
                            {event.numParticipants && (
                              <div className="flex items-center gap-1.5 text-sm text-[#001A3A]/70 dark:text-white/60">
                                <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] shrink-0" />
                                {event.numParticipants} participants
                              </div>
                            )}
                            {event.eventBudget && (
                              <div className="flex items-center gap-1.5 text-sm text-[#001A3A]/70 dark:text-white/60">
                                <HugeiconsIcon icon={MoneyBag02Icon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] shrink-0" />
                                {formatCurrency(event.eventBudget)}
                              </div>
                            )}
                          </div>

                          {/* Footer: satisfaction + status */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#0070AD]/10">
                            <SatisfactionBadge score={event.satisfactionScore} />
                            {event.eventStatus && (
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-medium",
                                  event.eventStatus === "termine"
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : event.eventStatus === "en_cours"
                                    ? "bg-blue-50 text-[#0070AD] dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                                )}
                              >
                                {event.eventStatus === "termine"
                                  ? "Terminé"
                                  : event.eventStatus === "en_cours"
                                  ? "En cours"
                                  : event.eventStatus}
                              </span>
                            )}
                            {event.roiEvent && (
                              <span className="text-xs font-semibold text-[#0070AD] dark:text-[#12ABDB]">
                                ROI {parseFloat(event.roiEvent).toFixed(0)}%
                              </span>
                            )}
                          </div>

                          {event.notes && (
                            <p className="text-xs text-[#001A3A]/40 dark:text-white/40 mt-3 line-clamp-2 italic">
                              {event.notes}
                            </p>
                          )}
                          </div>
                        </GlowCard>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {/* ── Projects grid ── */}
              {activeTab === "projects" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-[#001A3A]/40 dark:text-white/40">
                      Aucun projet trouvé pour cette catégorie.
                    </div>
                  ) : (
                    filteredProjects.map((project, i) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.04 }}
                      >
                        <GlowCard customSize glowColor="blue" className="w-full h-full group">
                          <div className="flex flex-col h-full">
                          {/* Top row: title + category badge */}
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-[#001A3A] dark:text-white group-hover:text-[#0070AD] dark:group-hover:text-[#12ABDB] transition-colors line-clamp-1">
                                  {project.projectName}
                                </h3>
                                {project.isReferenceProject && (
                                  <span className="text-[10px] bg-[#0070AD]/10 text-[#0070AD] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                    Projet référence
                                  </span>
                                )}
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0",
                                categoryColors[project.partnerCategory] || "bg-gray-100 text-gray-600",
                              )}
                            >
                              {categoryLabels[project.partnerCategory] || project.partnerCategory}
                            </span>
                          </div>

                          {/* Partner name */}
                          <p className="text-sm text-[#001A3A]/50 dark:text-white/40">
                            {project.partnerName}
                            {project.clientName ? ` — ${project.clientName}` : ""}
                          </p>

                          {/* Divider */}
                          <div className="border-t border-[#0070AD]/10 my-3" />

                          {project.projectDescription && (
                            <p className="text-sm text-[#001A3A]/60 dark:text-white/50 mb-3 line-clamp-2">
                              {project.projectDescription}
                            </p>
                          )}

                          {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {project.technologiesUsed.slice(0, 4).map((tech) => (
                                <span
                                  key={tech}
                                  className="text-[10px] bg-[#0070AD]/5 text-[#0070AD] dark:text-[#12ABDB] px-2 py-0.5 rounded-full border border-[#0070AD]/15"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologiesUsed.length > 4 && (
                                <span className="text-[10px] text-[#001A3A]/40 dark:text-white/40">
                                  +{project.technologiesUsed.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Meta 2×2 grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {project.startDate && (
                              <div className="flex items-center gap-1.5 text-sm text-[#001A3A]/70 dark:text-white/60">
                                <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] shrink-0" />
                                <span className="truncate">
                                  {new Date(project.startDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                </span>
                              </div>
                            )}
                            {project.durationMonths && (
                              <div className="flex items-center gap-1.5 text-sm text-[#001A3A]/70 dark:text-white/60">
                                <HugeiconsIcon icon={ChartLineData03Icon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] shrink-0" />
                                {project.durationMonths} mois
                              </div>
                            )}
                            {project.projectValue && (
                              <div className="flex items-center gap-1.5 text-sm text-[#001A3A]/70 dark:text-white/60">
                                <HugeiconsIcon icon={MoneyBag02Icon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] shrink-0" />
                                {formatCurrency(project.projectValue)}
                              </div>
                            )}
                            {project.clientSatisfactionScore && (
                              <div className="flex items-center gap-1.5">
                                <HugeiconsIcon icon={StarIcon} className="w-4 h-4 text-[#0070AD] dark:text-[#12ABDB] shrink-0" />
                                <SatisfactionBadge score={project.clientSatisfactionScore} />
                              </div>
                            )}
                          </div>

                          {/* Footer: delivery status */}
                          {project.deliveryStatus && (
                            <div className="mt-3 pt-3 border-t border-[#0070AD]/10">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-medium",
                                  project.deliveryStatus === "a_temps"
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : project.deliveryStatus === "en_avance"
                                    ? "bg-blue-50 text-[#0070AD] dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                                )}
                              >
                                {project.deliveryStatus === "a_temps"
                                  ? "À temps"
                                  : project.deliveryStatus === "en_avance"
                                  ? "En avance"
                                  : "En retard"}
                              </span>
                            </div>
                          )}

                          {project.notes && (
                            <p className="text-xs text-[#001A3A]/40 dark:text-white/40 mt-3 line-clamp-2 italic">
                              {project.notes}
                            </p>
                          )}
                          </div>
                        </GlowCard>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* ─── CTA ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-br from-[#0070AD]/5 via-[#12ABDB]/5 to-purple-50/30 dark:from-white/5 dark:via-white/3 dark:to-white/0 rounded-3xl border border-[#0070AD]/15 dark:border-white/10 p-10 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-[#001A3A] dark:text-white mb-3">
                Rejoignez notre réseau de partenaires
              </h2>
              <p className="text-[#001A3A]/60 dark:text-white/50 mb-6">
                Vous souhaitez collaborer avec Capgemini Tunisie ? Soumettez votre demande de
                partenariat et notre équipe l&apos;examinera dans les plus brefs délais.
              </p>
              <Link href="/success-stories/apply">
                <Button
                  size="lg"
                  className="bg-[#0070AD] hover:bg-[#005a8e] text-white font-semibold shadow-lg shadow-[#0070AD]/20 hover:scale-105 transition-all rounded-full px-8"
                >
                  <HugeiconsIcon icon={UserAdd01Icon} className="w-5 h-5 mr-2" />
                  Devenir Partenaire
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
