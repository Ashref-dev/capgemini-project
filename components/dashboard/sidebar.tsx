"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { CapgeminiLogo, CapgeminiLogoSmall } from "@/components/icons"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  UserGroupIcon,
  ContactBookIcon,
  AnalyticsUpIcon,
  AiChat02Icon,
  Calendar03Icon,
  Briefcase01Icon,
  UserAdd01Icon,
  UserIcon,
  MortarboardIcon,
  ArrowLeft01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"

interface NavItem {
  label: string
  href: string
  icon: typeof UserGroupIcon
  roles?: string[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { label: "Tableau de bord", href: "/dashboard", icon: Home01Icon },
      { label: "Partenaires", href: "/dashboard/partners", icon: UserGroupIcon },
      { label: "Contacts", href: "/dashboard/contacts", icon: ContactBookIcon },
      { label: "Projets", href: "/dashboard/projects", icon: Briefcase01Icon },
      {
        label: "Demandes",
        href: "/dashboard/partnership-requests",
        icon: UserAdd01Icon,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    label: "Analyses",
    items: [
      { label: "Dashboard BI", href: "/dashboard/bi", icon: AnalyticsUpIcon },
    ],
  },
  {
    label: "IA & Outils",
    items: [
      { label: "AI Agent", href: "/dashboard/agent", icon: AiChat02Icon },
    ],
  },
  {
    label: "Ressources Humaines",
    items: [
      { label: "Employés", href: "/dashboard/hr/employees", icon: UserGroupIcon, roles: ["rh", "admin"] },
      { label: "Recrutements", href: "/dashboard/hr/recruitments", icon: MortarboardIcon, roles: ["rh", "admin"] },
      { label: "Événements", href: "/dashboard/hr/events", icon: Calendar03Icon, roles: ["rh", "admin", "manager"] },
    ],
  },
  {
    label: "Compte",
    items: [
      { label: "Mon Profil", href: "/dashboard/profile", icon: UserIcon },
    ],
  },
]

function getVisibleGroups(userRole?: string): NavGroup[] {
  const filterItems = (items: NavItem[]) =>
    items.filter((item) => !item.roles || item.roles.includes(userRole || ""))
  return navGroups
    .map((g) => ({ ...g, items: filterItems(g.items) }))
    .filter((g) => g.items.length > 0)
}

function isItemActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(href + "/")
}

function SidebarLogo({ open }: { open: boolean }) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent min-h-[64px]">
      <Link href="/dashboard" className="shrink-0">
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap flex flex-col gap-0.5"
            >
              <CapgeminiLogo size="sm" />
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-primary/70">Capgemini Tunisie</span>
            </motion.div>
          ) : (
            <motion.div
              key="small"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <CapgeminiLogoSmall size="md" />
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </div>
  )
}

interface SidebarNavProps {
  groups: NavGroup[]
  pathname: string
  open: boolean
  idPrefix: string
  onNavigate?: () => void
}

function SidebarNav({ groups, pathname, open, idPrefix, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <AnimatePresence initial={false}>
            {open && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
              >
                {group.label}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = isItemActive(item.href, pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={!open ? item.label : undefined}
                  className={cn(
                    "relative flex h-10 items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    open ? "px-3" : "justify-center px-0",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {/* Limelight vertical effect */}
                  {isActive && (
                    <>
                      <motion.span
                        layoutId={`${idPrefix}-limelight-bar`}
                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-primary"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        style={{ boxShadow: "8px 0 20px color-mix(in srgb, var(--primary) 50%, transparent)" }}
                      />
                      <motion.span
                        layoutId={`${idPrefix}-limelight-cone`}
                        className="absolute left-[3px] top-0 bottom-0 w-24 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        style={{ clipPath: "polygon(0 5%, 100% 25%, 100% 75%, 0 95%)" }}
                      />
                    </>
                  )}
                  <HugeiconsIcon icon={item.icon} className="w-4 h-4 shrink-0" />
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

interface DashboardSidebarProps {
  userRole?: string
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  const visibleGroups = getVisibleGroups(userRole)

  return (
    <aside
      className={cn(
        "relative hidden md:flex shrink-0 border-r border-border bg-card flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16"
      )}
    >
      <SidebarLogo open={open} />

      <SidebarNav groups={visibleGroups} pathname={pathname} open={open} idPrefix="sidebar" />

      {/* Toggle collapse */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center border-t border-border hover:bg-muted transition-colors min-h-[48px] w-full"
        aria-label={open ? "Réduire le menu" : "Agrandir le menu"}
      >
        <div className={cn("grid place-content-center shrink-0", open ? "w-16" : "w-16")}>
          <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-sm text-muted-foreground font-medium"
            >
              Réduire
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </aside>
  )
}

export function DashboardMobileSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const visibleGroups = getVisibleGroups(userRole)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Ouvrir le menu"
      >
        <HugeiconsIcon icon={Menu01Icon} className="w-5 h-5" />
      </button>
      <SheetContent side="left" className="w-72 max-w-[85vw] p-0 flex flex-col gap-0">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <SidebarLogo open />
        <SidebarNav
          groups={visibleGroups}
          pathname={pathname}
          open
          idPrefix="sidebar-mobile"
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
