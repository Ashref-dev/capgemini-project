"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { UserMenu } from "@/components/auth/user-menu";
import { Spinner } from "@/components/ui/spinner";
import { CapgeminiLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <header 
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 border-b border-transparent",
          scrolled 
            ? "bg-white/70 dark:bg-black/70 backdrop-blur-md py-3 shadow-sm border-border/10" 
            : "bg-transparent py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <CapgeminiLogo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 border-l border-border/50 pl-6 text-sm font-medium">
              <span className="text-foreground/80 cursor-default">Dashboard</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle variant="ghost" size="icon" />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <UserProfile />
      </main>
    </div>
  );
}
