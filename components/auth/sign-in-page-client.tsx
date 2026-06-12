"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics01Icon,
  ArrowRight02Icon,
  Building06Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { CapgeminiLogo } from "@/components/icons"
import { SignInForm } from "@/components/auth/sign-in-form"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV_ITEMS = [
  { label: "Accueil", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Succès clients", href: "/success-stories" },
] as const

const PRODUCT_POINTS = [
  {
    icon: Building06Icon,
    label: "Partenariats",
    value: "Suivi centralisé des partenaires, contacts, offres et documents.",
  },
  {
    icon: Analytics01Icon,
    label: "Pilotage",
    value: "Tableaux de bord et indicateurs pour décider rapidement.",
  },
  {
    icon: Shield01Icon,
    label: "Accès sécurisé",
    value: "Portail séparé pour les équipes Capgemini et les partenaires.",
  },
] as const

export function SignInPageClient() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Retour à l'accueil"
          >
            <CapgeminiLogo size="md" />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border bg-muted/40 p-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden rounded-full px-4 sm:inline-flex">
              <Link href="/success-stories/apply">
                Devenir partenaire
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/45 via-background to-background" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl grid-cols-1 items-start gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,520px)] lg:items-center lg:px-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="order-2 hidden lg:block"
          >
            <div className="max-w-xl">
              <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                IntelliConnect
              </p>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
                Un espace de travail clair pour gérer chaque partenariat.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                Connectez-vous pour retrouver vos tableaux de bord, actions prioritaires,
                documents et échanges partenaires dans une interface rapide et lisible.
              </p>

              <div className="mt-8 grid gap-3">
                {PRODUCT_POINTS.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * index, duration: 0.35, ease: "easeOut" }}
                    className="flex gap-4 rounded-xl border border-border bg-card/80 p-4 shadow-sm transition-colors hover:border-primary/30"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <HugeiconsIcon icon={item.icon} className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">{item.label}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="order-1 w-full lg:order-2"
          >
            <div className="mx-auto w-full max-w-[560px] rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7 lg:p-8">
              <SignInForm />
            </div>
            <p className="mx-auto mt-4 max-w-[560px] text-center text-xs leading-5 text-muted-foreground">
              Accès réservé aux collaborateurs Capgemini et aux partenaires autorisés.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
