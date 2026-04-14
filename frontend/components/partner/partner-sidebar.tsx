"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/frontend/lib/utils"
import { CapgeminiLogoSmall } from "@/frontend/components/icons"
import { useAuth } from "@/frontend/hooks/use-auth"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  Discount01Icon,
  Calendar03Icon,
  UserIcon,
  AnalyticsUpIcon,
  ContactBookIcon,
  MortarboardIcon,
  Folder01Icon,
  FileAttachmentIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

const commonNavItems = [
  { label: "Tableau de bord", href: "/partner", icon: Home01Icon },
  { label: "Mes Offres", href: "/partner/offers", icon: Discount01Icon },
  { label: "Mes Événements", href: "/partner/events", icon: Calendar03Icon },
  { label: "Mes Documents", href: "/partner/documents", icon: FileAttachmentIcon },
  { label: "Notifications", href: "/partner/notifications", icon: Mail01Icon },
  { label: "Mon Profil", href: "/partner/profile", icon: UserIcon },
  { label: "Statistiques", href: "/partner/stats", icon: AnalyticsUpIcon },
  { label: "Mes Contacts", href: "/partner/contacts", icon: ContactBookIcon },
]

const universityNavItems = [
  { label: "Recrutements", href: "/partner/recruitments", icon: MortarboardIcon },
]

const supplierNavItems = [
  { label: "Projets", href: "/partner/projects", icon: Folder01Icon },
]

export function PartnerSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const categoryItems =
    user?.category === "university"
      ? universityNavItems
      : user?.category === "supplier"
        ? supplierNavItems
        : []

  const navItems = [...commonNavItems, ...categoryItems]

  return (
    <aside className="w-60 border-r border-border bg-card/50 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <Link href="/partner" className="flex items-center gap-3">
          <CapgeminiLogoSmall size="lg" />
          <div>
            <span className="font-bold text-sm text-foreground block leading-tight">IntelliConnect</span>
            <span className="text-[10px] text-muted-foreground">Espace Partenaire</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/partner" && pathname.startsWith(item.href))
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

      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Capgemini © 2026
        </div>
      </div>
    </aside>
  )
}
