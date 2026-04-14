"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/frontend/components/ui/button"
import { Card } from "@/frontend/components/ui/card"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { AnimatedBackground } from "@/frontend/components/ui/animated-background"
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
  Rocket01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  ArrowLeft01Icon,
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
  customer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  marketing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  supplier: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  university: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

function formatCurrency(val: string | number | null) {
  if (!val) return "—"
  const n = typeof val === "string" ? parseFloat(val) : val
  if (isNaN(n)) return "—"
  return new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(n)
}

function SatisfactionBadge({ score }: { score: string | number | null }) {
  if (!score) return <span className="text-muted-foreground text-xs">—</span>
  const n = typeof score === "string" ? parseFloat(score) : score
  const color = n >= 4 ? "text-emerald-600 dark:text-emerald-400" : n >= 3 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
  return (
    <span className={cn("font-semibold", color)}>
      {n.toFixed(1)}/5 <HugeiconsIcon icon={StarIcon} className="w-3 h-3 inline-block" />
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

  const filteredEvents = data?.events.filter((e) => categoryFilter === "all" || e.partnerCategory === categoryFilter) || []
  const filteredProjects = data?.projects.filter((p) => categoryFilter === "all" || p.partnerCategory === categoryFilter) || []

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      <AnimatedBackground />

      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          scrolled ? "bg-white/70 dark:bg-black/70 backdrop-blur-md py-3 shadow-sm border-border/10" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm">Home</Link>
            <Link href="/why-capgemini" className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm">Why Capgemini</Link>
            <Link href="/success-stories" className="text-primary font-semibold text-sm">Success Stories</Link>
            <Link href="/solutions" className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm">Solutions</Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="ghost" size="icon" />
            <Link href="/auth/sign-in">
              <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-foreground/80 hover:text-primary">
                Log in
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/success-stories/apply">
              <Button className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all hover:scale-105">
                <HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4" />
                Devenir Partenaire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary/10">
              <HugeiconsIcon icon={Rocket01Icon} className="w-4 h-4" />
              Nos réalisations avec nos partenaires
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
              Success{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-primary">
                Stories
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Découvrez les événements et projets réalisés par Capgemini Tunisie avec ses partenaires à travers toutes les catégories.
            </p>
          </motion.div>

          {/* Stats */}
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
            >
              {[
                { label: "Partenaires actifs", value: data.stats.totalActivePartners, icon: UserGroupIcon },
                { label: "Événements réalisés", value: data.stats.totalEvents, icon: Calendar03Icon },
                { label: "Projets livrés", value: data.stats.completedProjects, icon: CheckmarkCircle02Icon },
                { label: "Participants total", value: data.stats.totalParticipants.toLocaleString("fr"), icon: ChartLineData03Icon },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10 p-5"
                >
                  <HugeiconsIcon icon={stat.icon} className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Filters + Tabs */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Tabs and category filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("events")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === "events"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-white/60 dark:bg-black/40 text-muted-foreground hover:text-foreground border border-border"
                )}
              >
                <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4 inline-block mr-1.5" />
                Événements ({filteredEvents.length})
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === "projects"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-white/60 dark:bg-black/40 text-muted-foreground hover:text-foreground border border-border"
                )}
              >
                <HugeiconsIcon icon={Rocket01Icon} className="w-4 h-4 inline-block mr-1.5" />
                Projets ({filteredProjects.length})
              </button>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {["all", "customer", "marketing", "supplier", "university"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    categoryFilter === cat
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-white/40 dark:bg-black/30 text-muted-foreground border-border hover:border-primary/20"
                  )}
                >
                  {cat === "all" ? "Toutes" : categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          ) : (
            <>
              {/* Events */}
              {activeTab === "events" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredEvents.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-muted-foreground">Aucun événement trouvé pour cette catégorie.</div>
                  ) : (
                    filteredEvents.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                      >
                        <Card className="p-5 bg-white/60 dark:bg-black/40 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:shadow-lg transition-all group">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {event.eventName}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{event.partnerName}</p>
                            </div>
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", categoryColors[event.partnerCategory] || "bg-gray-100 text-gray-600")}>
                              {categoryLabels[event.partnerCategory] || event.partnerCategory}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            {event.eventDate && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HugeiconsIcon icon={Calendar03Icon} className="w-3 h-3" />
                                {new Date(event.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                            )}
                            {event.eventLocation && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HugeiconsIcon icon={LocationIcon} className="w-3 h-3" />
                                <span className="truncate">{event.eventLocation}</span>
                              </div>
                            )}
                            {event.numParticipants && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
                                {event.numParticipants} participants
                              </div>
                            )}
                            {event.eventBudget && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HugeiconsIcon icon={MoneyBag02Icon} className="w-3 h-3" />
                                {formatCurrency(event.eventBudget)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center gap-3 text-xs">
                              <div>
                                <span className="text-muted-foreground">Satisfaction : </span>
                                <SatisfactionBadge score={event.satisfactionScore} />
                              </div>
                              {event.eventStatus && (
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-medium",
                                  event.eventStatus === "termine" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : event.eventStatus === "en_cours" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                )}>
                                  {event.eventStatus === "termine" ? "Terminé" : event.eventStatus === "en_cours" ? "En cours" : event.eventStatus}
                                </span>
                              )}
                            </div>
                            {event.roiEvent && (
                              <span className="text-xs font-medium text-primary">
                                ROI {parseFloat(event.roiEvent).toFixed(0)}%
                              </span>
                            )}
                          </div>

                          {event.notes && (
                            <p className="text-xs text-muted-foreground mt-3 line-clamp-2 italic">{event.notes}</p>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Projects */}
              {activeTab === "projects" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-muted-foreground">Aucun projet trouvé pour cette catégorie.</div>
                  ) : (
                    filteredProjects.map((project, i) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                      >
                        <Card className="p-5 bg-white/60 dark:bg-black/40 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:shadow-lg transition-all group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{project.projectName}</h3>
                                {project.isReferenceProject && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                    Projet référence
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {project.partnerName}{project.clientName ? ` — Client : ${project.clientName}` : ""}
                              </p>
                            </div>
                          </div>

                          {project.projectDescription && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.projectDescription}</p>
                          )}

                          {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {project.technologiesUsed.slice(0, 5).map((tech) => (
                                <span key={tech} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-full border border-primary/10">
                                  {tech}
                                </span>
                              ))}
                              {project.technologiesUsed.length > 5 && (
                                <span className="text-[10px] text-muted-foreground">+{project.technologiesUsed.length - 5}</span>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
                            {project.projectValue && (
                              <div className="text-muted-foreground">
                                <span className="block text-foreground font-medium">{formatCurrency(project.projectValue)}</span>
                                Valeur
                              </div>
                            )}
                            {project.durationMonths && (
                              <div className="text-muted-foreground">
                                <span className="block text-foreground font-medium">{project.durationMonths} mois</span>
                                Durée
                              </div>
                            )}
                            {project.clientSatisfactionScore && (
                              <div>
                                <SatisfactionBadge score={project.clientSatisfactionScore} />
                                <span className="block text-muted-foreground mt-0.5">Satisfaction</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                            {project.deliveryStatus && (
                              <span className={cn(
                                "px-2 py-0.5 rounded-full font-medium",
                                project.deliveryStatus === "a_temps" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : project.deliveryStatus === "en_avance" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                              )}>
                                {project.deliveryStatus === "a_temps" ? "À temps" : project.deliveryStatus === "en_avance" ? "En avance" : "En retard"}
                              </span>
                            )}
                            {project.startDate && (
                              <span className="text-muted-foreground">
                                {new Date(project.startDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                {project.endDate && ` → ${new Date(project.endDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`}
                              </span>
                            )}
                          </div>

                          {project.notes && (
                            <p className="text-xs text-muted-foreground mt-3 line-clamp-2 italic">{project.notes}</p>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20 text-center"
          >
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-white/10 p-10 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-3">Rejoignez notre réseau de partenaires</h2>
              <p className="text-muted-foreground mb-6">
                Vous souhaitez collaborer avec Capgemini Tunisie ? Soumettez votre demande de partenariat et notre équipe l&apos;examinera dans les plus brefs délais.
              </p>
              <Link href="/success-stories/apply">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all rounded-full px-8">
                  <HugeiconsIcon icon={UserAdd01Icon} className="w-5 h-5 mr-2" />
                  Devenir Partenaire
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
