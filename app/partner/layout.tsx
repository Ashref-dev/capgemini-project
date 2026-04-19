"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { useRouter } from "next/navigation"
import { PartnerSidebar } from "@/frontend/components/partner/partner-sidebar"
import { UserMenu } from "@/frontend/components/auth/user-menu"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { Footer } from "@/frontend/components/footer"
import { Spinner } from "@/frontend/components/ui/spinner"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Notification03Icon } from "@hugeicons/core-free-icons"
import VaporizeTextCycle from "@/frontend/components/ui/vapour-text"

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
          {/* Left: brand + app title */}
          <div className="flex items-center gap-1" style={{ height: 40, width: 380 }}>
            <VaporizeTextCycle
              texts={["IntelliConnect", "Espace Partenaire"]}
              font={{ fontFamily: "Inter, sans-serif", fontSize: "20px", fontWeight: 700 }}
              alignment="left"
              spread={3}
              density={5}
              animation={{ vaporizeDuration: 2, fadeInDuration: 0.8, waitDuration: 2 }}
            />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/partner/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <HugeiconsIcon icon={Notification03Icon} className="w-4 h-4" />
            </Link>
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
