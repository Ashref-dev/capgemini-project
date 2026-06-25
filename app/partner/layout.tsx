"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { PartnerSidebar, PartnerMobileSidebar } from "@/components/partner/partner-sidebar"
import { UserMenu } from "@/components/auth/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Notification03Icon, Mail01Icon, CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"
import VaporizeTextCycle from "@/components/ui/vapour-text"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// ─── Notification types ───────────────────────────────────────────────────────
interface Notif {
  id: number; type: string; title: string; message: string
  isRead: boolean; createdAt: string; sentBy: string | null
}

const notifTypeColors: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-500",
  system: "bg-slate-500/10 text-slate-500",
  meeting: "bg-violet-500/10 text-violet-500",
  document: "bg-emerald-500/10 text-emerald-500",
  status_change: "bg-amber-500/10 text-amber-500",
  general: "bg-cyan-500/10 text-cyan-500",
}
const notifTypeLabels: Record<string, string> = {
  email: "Email", system: "Système", meeting: "Réunion",
  document: "Document", status_change: "Statut", general: "Général",
}

function PartnerNotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      if (res.ok) setNotifs(data.notifications || [])
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const unread = notifs.filter(n => !n.isRead).length
  const recent = notifs.slice(0, 6)

  const markRead = async (id: number) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "PATCH" })
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await Promise.all(notifs.filter(n => !n.isRead).map(n => fetch(`/api/notifications?id=${n.id}`, { method: "PATCH" })))
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
          open && "bg-muted text-foreground"
        )}
        aria-label="Notifications"
      >
        <HugeiconsIcon icon={Notification03Icon} className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-0.5 shadow-sm">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-96 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5">{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-primary hover:underline font-medium">
                    Tout lire
                  </button>
                )}
                <Link href="/partner/notifications" onClick={() => setOpen(false)} className="text-[11px] text-muted-foreground hover:text-foreground">
                  Voir tout →
                </Link>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
              {recent.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <HugeiconsIcon icon={Mail01Icon} className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucune notification
                </div>
              ) : (
                recent.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer group",
                      !n.isRead && "bg-primary/3"
                    )}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md", notifTypeColors[n.type] || "bg-muted text-muted-foreground")}>
                            {notifTypeLabels[n.type] || n.type}
                          </span>
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className={cn("text-sm font-medium truncate", n.isRead ? "text-muted-foreground" : "text-foreground")}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          {n.sentBy && ` · ${n.sentBy}`}
                        </p>
                      </div>
                      {!n.isRead && (
                        <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated && isClient) {
      router.push("/auth/sign-in")
    }
    if (!loading && isAuthenticated && user?.userType === "employee" && isClient) {
      router.push("/dashboard")
    }
  }, [loading, isAuthenticated, isClient, router, user])

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.userType !== "partner") {
    return null
  }

  const categoryLabels: Record<string, string> = {
    customer: "Client",
    marketing: "Marketing",
    supplier: "Fournisseur",
    university: "Université",
  }

  return (
    <div className="min-h-screen flex bg-background">
      <PartnerSidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* ── Header ── */}
        <header className="h-16 border-b border-[#0070AD]/10 dark:border-white/10 bg-white/95 dark:bg-[#000e24]/95 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
          {/* Left: mobile menu + brand + app title */}
          <div className="flex items-center gap-3 min-w-0">
            <PartnerMobileSidebar />
            <div className="hidden md:flex items-center gap-1" style={{ height: 40, width: 380, maxWidth: "100%" }}>
              <VaporizeTextCycle
                texts={["IntelliConnect", "Espace Partenaire"]}
                font={{ fontFamily: "Inter, sans-serif", fontSize: "20px", fontWeight: 700 }}
                alignment="left"
                spread={3}
                density={5}
                animation={{ vaporizeDuration: 2, fadeInDuration: 0.8, waitDuration: 2 }}
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <PartnerNotificationBell />
            <UserMenu />
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-6">
          {children}
        </main>

        {/* ── Footer ── */}
        <Footer />
      </div>
    </div>
  )
}
