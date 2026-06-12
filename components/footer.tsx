"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, GlobalIcon, Linkedin01Icon } from "@hugeicons/core-free-icons"

import { CapgeminiLogo } from "@/components/icons"

const footerLinks = [
  { label: "Accueil", href: "/" },
  { label: "Pourquoi Capgemini", href: "/#why-capgemini" },
  { label: "Réussites", href: "/success-stories" },
  { label: "Solutions", href: "/solutions" },
  { label: "Devenir partenaire", href: "/success-stories/apply" },
  { label: "Se connecter", href: "/auth/sign-in" },
] as const

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-background py-16">
      <div className="relative container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">

          {/* Colonne 1 — Logo & description */}
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Retour à l'accueil Capgemini"
            >
              <CapgeminiLogo size="lg" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Plateforme de gestion des partenaires — Capgemini Tunisie
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="https://linkedin.com/company/capgemini"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn Capgemini"
                className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <HugeiconsIcon icon={Linkedin01Icon} className="w-5 h-5" />
              </Link>
              <Link
                href="https://capgemini.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Site officiel Capgemini"
                className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <HugeiconsIcon icon={GlobalIcon} className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Colonne 2 — Navigation */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Navigation</h4>
            <nav className="flex flex-col space-y-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex w-fit items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {link.label}
                  {(link.href === "/success-stories/apply" || link.href === "/auth/sign-in") && (
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Colonne 3 — Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Contact</h4>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Adresse</span>
                <p className="text-sm text-muted-foreground">Parc Technologique El Ghazala (Tunis)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Email</span>
                <p className="text-sm font-medium text-muted-foreground">partenaires@capgemini.com</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Téléphone</span>
                <p className="text-sm text-muted-foreground">+216 52 587 587 / +216 52 549 549</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {currentYear} Capgemini Tunisie. Tous droits réservés.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-primary">Politique de confidentialité</Link>
            <span className="opacity-40">·</span>
            <Link href="/terms" className="transition-colors hover:text-primary">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
