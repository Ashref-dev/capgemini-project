"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { useRouter } from "next/navigation"
import { PartnerSidebar } from "@/frontend/components/partner/partner-sidebar"
import { UserMenu } from "@/frontend/components/auth/user-menu"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { Spinner } from "@/frontend/components/ui/spinner"

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
    // Redirect employees to their dashboard
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

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Connecté en tant que{" "}
              <span className="font-semibold text-foreground">{user.name}</span>
              {user.category && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                  {categoryLabels[user.category] || user.category}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="ghost" size="icon" />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
