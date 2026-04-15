"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/frontend/lib/utils"
import { CapgeminiLogoSmall } from "@/frontend/components/icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  ContactBookIcon,
  AnalyticsUpIcon,
  AiChat02Icon,
  Calendar03Icon,
  Discount01Icon,
  ClockIcon,
  UserAdd01Icon,
  UserIcon,
  MortarboardIcon,
} from "@hugeicons/core-free-icons"

interface NavItem {
  label: string
  href: string
  icon: typeof UserGroupIcon
  roles?: string[] // empty = all roles
}

const navItems: NavItem[] = [
  {
    label: "Partenaires",
    href: "/dashboard/partners",
    icon: UserGroupIcon,
  },
  {
    label: "Contacts",
    href: "/dashboard/contacts",
    icon: ContactBookIcon,
  },
  {
    label: "Offres",
    href: "/dashboard/offers",
    icon: Discount01Icon,
  },
  {
    label: "Historique statuts",
    href: "/dashboard/status-history",
    icon: ClockIcon,
  },
  {
    label: "Dashboard BI",
    href: "/dashboard/bi",
    icon: AnalyticsUpIcon,
  },
  {
    label: "AI Agent",
    href: "/dashboard/agent",
    icon: AiChat02Icon,
  },
  {
    label: "Demandes partenariat",
    href: "/dashboard/partnership-requests",
    icon: UserAdd01Icon,
    roles: ["admin", "manager"],
  },
  {
    label: "RH — Employés",
    href: "/dashboard/hr/employees",
    icon: UserGroupIcon,
    roles: ["rh", "admin"],
  },
  {
    label: "RH — Recrutements",
    href: "/dashboard/hr/recruitments",
    icon: MortarboardIcon,
    roles: ["rh", "admin"],
  },
  {
    label: "RH — Événements",
    href: "/dashboard/hr/events",
    icon: Calendar03Icon,
    roles: ["rh", "admin", "manager"],
  },
  {
    label: "Mon Profil",
    href: "/dashboard/profile",
    icon: UserIcon,
  },
]

interface DashboardSidebarProps {
  userRole?: string
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole || "")
  )

  return (
    <aside className="w-60 border-r border-border bg-card/50 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <Link href="/dashboard" className="flex items-center gap-3">
          <CapgeminiLogoSmall size="lg" />
          <div>
            <span className="font-bold text-sm text-foreground block leading-tight">IntelliConnect</span>
            <span className="text-[10px] text-muted-foreground">Gestion Partenariats</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <HugeiconsIcon icon={item.icon} className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Capgemini © 2026
        </div>
      </div>
    </aside>
  )
}
