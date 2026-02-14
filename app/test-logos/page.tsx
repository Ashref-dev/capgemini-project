"use client";

import { CapgeminiLogo, CapgeminiLogoSmall } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function TestLogosPage() {
  return (
    <div className="min-h-screen p-8 transition-colors duration-200 bg-background">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-foreground hover:underline">
            ← Retour
          </Link>
          <ThemeToggle variant="outline" showLabel />
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground">
          Test des logos Capgemini
        </h1>

        {/* CapgeminiLogo - toutes les tailles */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">
            CapgeminiLogo (grande version)
          </h2>
          <div className="flex flex-wrap items-end gap-8 p-6 rounded-lg border border-border bg-card">
            <div className="text-center">
              <CapgeminiLogo size="sm" />
              <p className="text-xs text-muted-foreground mt-2">sm</p>
            </div>
            <div className="text-center">
              <CapgeminiLogo size="md" />
              <p className="text-xs text-muted-foreground mt-2">md</p>
            </div>
            <div className="text-center">
              <CapgeminiLogo size="lg" />
              <p className="text-xs text-muted-foreground mt-2">lg</p>
            </div>
            <div className="text-center">
              <CapgeminiLogo size="xl" />
              <p className="text-xs text-muted-foreground mt-2">xl</p>
            </div>
          </div>
        </section>

        {/* CapgeminiLogoSmall - toutes les tailles */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">
            CapgeminiLogoSmall (icône)
          </h2>
          <div className="flex flex-wrap items-end gap-8 p-6 rounded-lg border border-border bg-card">
            <div className="text-center">
              <CapgeminiLogoSmall size="sm" />
              <p className="text-xs text-muted-foreground mt-2">sm</p>
            </div>
            <div className="text-center">
              <CapgeminiLogoSmall size="md" />
              <p className="text-xs text-muted-foreground mt-2">md</p>
            </div>
            <div className="text-center">
              <CapgeminiLogoSmall size="lg" />
              <p className="text-xs text-muted-foreground mt-2">lg</p>
            </div>
            <div className="text-center">
              <CapgeminiLogoSmall size="xl" />
              <p className="text-xs text-muted-foreground mt-2">xl</p>
            </div>
          </div>
        </section>

        <p className="text-sm text-muted-foreground text-center">
          En mode clair : logo bleu • En mode sombre : logo blanc
        </p>
      </div>
    </div>
  );
}
