"use client"

import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  ContactBookIcon,
  AnalyticsUpIcon,
  Calendar03Icon,
  Discount01Icon,
  ClockIcon,
  UserAdd01Icon,
  UserIcon,
  MortarboardIcon,
} from "@hugeicons/core-free-icons"
import { NavCircularGallery, NavGalleryItem } from "@/components/ui/nav-circular-gallery"
import { DailyBriefing } from "@/components/dashboard/daily-briefing"

interface SectionDef {
  title: string
  description: string
  href: string
  icon: typeof UserGroupIcon
  color: string
  bgColor: string
  roles?: string[]
}

const sections: SectionDef[] = [
  {
    title: "Partenaires",
    description: "Consulter et gérer l'ensemble des partenaires Capgemini.",
    href: "/dashboard/partners",
    icon: UserGroupIcon,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Contacts",
    description: "Accéder aux contacts associés aux partenariats.",
    href: "/dashboard/contacts",
    icon: ContactBookIcon,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    title: "Offres",
    description: "Gérer les offres et propositions commerciales.",
    href: "/dashboard/offers",
    icon: Discount01Icon,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    title: "Historique Statuts",
    description: "Suivre l'historique des changements de statut des partenaires.",
    href: "/dashboard/status-history",
    icon: ClockIcon,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "Dashboard BI",
    description: "Analyses, indicateurs de performance et rapports statistiques.",
    href: "/dashboard/bi",
    icon: AnalyticsUpIcon,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
  },
  {
    title: "Demandes Partenariat",
    description: "Gérer les demandes d'entrée en partenariat.",
    href: "/dashboard/partnership-requests",
    icon: UserAdd01Icon,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
    roles: ["admin", "manager"],
  },
  {
    title: "Employés",
    description: "Consulter et gérer le référentiel des employés.",
    href: "/dashboard/hr/employees",
    icon: UserGroupIcon,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    roles: ["rh", "admin"],
  },
  {
    title: "Recrutements",
    description: "Suivre les processus de recrutement en cours.",
    href: "/dashboard/hr/recruitments",
    icon: MortarboardIcon,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    roles: ["rh", "admin"],
  },
  {
    title: "Événements RH",
    description: "Planifier et suivre les événements liés aux ressources humaines.",
    href: "/dashboard/hr/events",
    icon: Calendar03Icon,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    roles: ["rh", "admin", "manager"],
  },
  {
    title: "Mon Profil",
    description: "Consulter et modifier vos informations personnelles.",
    href: "/dashboard/profile",
    icon: UserIcon,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-900/20",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const visibleSections = sections.filter(
    (s) => !s.roles || s.roles.includes(user.role || "")
  )

  const galleryItems: NavGalleryItem[] = visibleSections.map((s) => ({
    id: s.href,
    label: s.title,
    description: s.description,
    href: s.href,
    icon: <HugeiconsIcon icon={s.icon} className={`w-8 h-8 ${s.color}`} />,
    color: s.color,
    bgColor: s.bgColor,
  }))

  const greeting =
    new Date().getHours() < 12
      ? "Bonjour"
      : new Date().getHours() < 18
        ? "Bon après-midi"
        : "Bonsoir"

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 p-8 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,112,173,0.12),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(18,171,219,0.08),transparent_36%)]" />
        <div className="relative flex flex-col gap-4">
          <p className="text-base font-bold uppercase tracking-[0.15em] text-primary">{greeting}</p>
          <h1
            className="max-w-3xl text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl bg-clip-text bg-[linear-gradient(135deg,#0070AD_0%,#12ABDB_100%)]"
          >
            {user.name || "Khaled Maatoug"}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Tableau de bord de gestion des partenariats — Capgemini Tunisie
          </p>
          <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold capitalize text-primary">
            {user.role || "Admin"}
          </span>
        </div>
      </div>

      <DailyBriefing />

      {/* ── Circular navigation gallery ── */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4"
        >
          Accès rapide
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <NavCircularGallery items={galleryItems} radius={480} autoRotateSpeed={0.028} />
        </motion.div>
      </div>
    </div>
  )
}
