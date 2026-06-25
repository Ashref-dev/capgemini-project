"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  ContactBookIcon,
  AnalyticsUpIcon,
  Calendar03Icon,
  UserAdd01Icon,
  UserIcon,
  MortarboardIcon,
} from "@hugeicons/core-free-icons"
import { DailyBriefing } from "@/components/dashboard/daily-briefing"
import Link from "next/link"

interface SectionDef {
  title: string
  description: string
  href: string
  icon: typeof UserGroupIcon
  color: string
  bgColor: string
  roles?: string[]
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  manager: "Manager",
  commercial: "Commercial",
  analyst: "Analyste",
  rh: "Ressources Humaines",
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

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const shouldReduceMotion = useReducedMotion()

  if (!user) return null

  const visibleSections = sections.filter(
    (s) => !s.roles || s.roles.includes(user.role ?? "")
  )

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"

  const roleLabel = ROLE_LABELS[user.role ?? ""] ?? user.role ?? "Employé"

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Compact header ── */}
      <div className="flex flex-col gap-0.5 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {greeting},{" "}
            <span className="text-primary">
              {user.name?.split(" ")[0] ?? user.name ?? "—"}
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="capitalize">{roleLabel}</span>{" · "}Capgemini Tunisie — IntelliConnect
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <DailyBriefing />

      <ActivitySummary userRole={user.role ?? ""} />

      {/* ── Accès rapide ── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Accès rapide
        </h2>
        <motion.div
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate={shouldReduceMotion ? false : "visible"}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibleSections.map((section) => (
            <motion.div
              key={section.href}
              variants={shouldReduceMotion ? undefined : itemVariants}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -2, transition: { duration: 0.15 } }
              }
            >
              <Link
                href={section.href}
                className="group flex h-full items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <div
                  className={`shrink-0 rounded-lg p-2.5 ${section.bgColor}`}
                >
                  <HugeiconsIcon
                    icon={section.icon}
                    className={`h-5 w-5 ${section.color}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium leading-snug text-foreground">
                    {section.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function ActivitySummary({ userRole }: { userRole: string }) {
  const [pendingRequests, setPendingRequests] = useState<number | null>(null)
  const [negotiatingPartners, setNegotiatingPartners] = useState<number | null>(null)
  const [activeRecruitments, setActiveRecruitments] = useState<number | null>(null)

  const isAdminOrManager = userRole === "admin" || userRole === "manager"
  const canSeeRecruitments = userRole === "admin" || userRole === "rh"

  useEffect(() => {
    if (isAdminOrManager) {
      fetch("/api/admin/partnership-requests")
        .then(r => r.ok ? r.json() : null)
        .then(d => d?.counts?.pending != null && setPendingRequests(d.counts.pending as number))
        .catch(() => {})
    }
    fetch("/api/partners?status=en_negociation")
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.partners != null && setNegotiatingPartners((d.partners as unknown[]).length))
      .catch(() => {})
    if (canSeeRecruitments) {
      fetch("/api/hr/recruitments")
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.recruitments) {
            const active = (d.recruitments as Array<{ endDate: string | null }>).filter(r => !r.endDate || new Date(r.endDate) >= new Date()).length
            setActiveRecruitments(active)
          }
        })
        .catch(() => {})
    }
  }, [isAdminOrManager, canSeeRecruitments])

  type StatCard = { label: string; value: number | null; href: string; show: boolean }
  const cards: StatCard[] = [
    { label: "Demandes en attente", value: pendingRequests, href: "/dashboard/partnership-requests", show: isAdminOrManager },
    { label: "En négociation", value: negotiatingPartners, href: "/dashboard/partners?status=en_negociation", show: true },
    { label: "Recrutements actifs", value: activeRecruitments, href: "/dashboard/hr/recruitments", show: canSeeRecruitments },
  ].filter(c => c.show)

  if (cards.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">En cours</p>
      <div className="flex divide-x divide-border overflow-hidden rounded-xl border border-border">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-1 items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
          >
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <span className="ml-3 text-base font-semibold tabular-nums text-foreground">
              {card.value ?? "—"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
