"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/frontend/lib/utils"
import { CapgeminiLogo } from "@/frontend/components/icons"
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
  FileAttachmentIcon,
  Mail01Icon,
  Folder01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"

interface NavGroup {
  label: string
  items: { label: string; href: string; icon: typeof Home01Icon }[]
}

const commonGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { label: "Tableau de bord", href: "/partner", icon: Home01Icon },
      { label: "Mes Offres", href: "/partner/offers", icon: Discount01Icon },
      { label: "Mes Événements", href: "/partner/events", icon: Calendar03Icon },
      { label: "Mes Documents", href: "/partner/documents", icon: FileAttachmentIcon },
      { label: "Mes Contacts", href: "/partner/contacts", icon: ContactBookIcon },
    ],
  },
  {
    label: "Compte",
    items: [
      { label: "Notifications", href: "/partner/notifications", icon: Mail01Icon },
      { label: "Statistiques", href: "/partner/stats", icon: AnalyticsUpIcon },
      { label: "Mon Profil", href: "/partner/profile", icon: UserIcon },
    ],
  },
]

const universityGroup: NavGroup = {
  label: "Partenariat",
  items: [{ label: "Recrutements", href: "/partner/recruitments", icon: MortarboardIcon }],
}

const supplierGroup: NavGroup = {
  label: "Partenariat",
  items: [{ label: "Projets", href: "/partner/projects", icon: Folder01Icon }],
}

export function PartnerSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [open, setOpen] = useState(true)

  const extraGroup =
    user?.category === "university"
      ? universityGroup
      : user?.category === "supplier"
        ? supplierGroup
        : null

  const groups = extraGroup
    ? [commonGroups[0], extraGroup, commonGroups[1]]
    : commonGroups

  return (
    <aside
      className={cn(
        "relative shrink-0 border-r border-border bg-card flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent min-h-[64px]">
        <Link href="/partner" className="shrink-0">
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
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm shadow-primary/30"
              >
                <span className="text-white font-bold text-xs">IC</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
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
                const isActive =
                  item.href === "/partner"
                    ? pathname === "/partner"
                    : pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!open ? item.label : undefined}
                    className={cn(
                      "relative flex h-10 items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
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
                          layoutId="partner-limelight-bar"
                          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-primary"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                          style={{ boxShadow: "8px 0 20px color-mix(in srgb, var(--primary) 50%, transparent)" }}
                        />
                        <motion.span
                          layoutId="partner-limelight-cone"
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

      {/* Toggle collapse */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center border-t border-border hover:bg-muted transition-colors min-h-[48px] w-full"
        aria-label={open ? "Réduire le menu" : "Agrandir le menu"}
      >
        <div className="grid place-content-center w-16 shrink-0">
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
