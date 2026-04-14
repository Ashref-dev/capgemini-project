"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/frontend/components/dashboard/sidebar"
import { UserMenu } from "@/frontend/components/auth/user-menu"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { Spinner } from "@/frontend/components/ui/spinner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    // Redirect partners to their portal
    if (!loading && isAuthenticated && user?.userType === "partner" && isClient) {
      router.push("/partner")
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

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar userRole={user.role} />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Connecté en tant que{" "}
              <span className="font-semibold text-foreground">{user.name}</span>
              {user.role && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full capitalize font-medium">
                  {user.role}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="ghost" size="icon" />
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
