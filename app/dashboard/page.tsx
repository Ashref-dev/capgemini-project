"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { Spinner } from "@/components/ui/spinner";
import { CapgeminiLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && isClient) {
      router.push("/auth/sign-in");
    }
  }, [loading, isAuthenticated, isClient, router]);

  // Loading state
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <CapgeminiLogo size="sm" />
              </Link>
              <ThemeToggle variant="ghost" size="icon-sm" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome to your account management center
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <UserProfile />
      </div>
    </div>
  );
}
