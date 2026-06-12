"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BriefcaseBusinessIcon,
  Building05Icon,
  ChartBarLineIcon,
  CheckmarkCircle02Icon,
  CustomerSupportIcon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";

import { CapgeminiLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Pourquoi Capgemini", href: "/#why-capgemini" },
  { label: "Réussites", href: "/success-stories" },
  { label: "Solutions", href: "/solutions" },
] as const;

const metrics = [
  { value: "60 ans", label: "d'expertise mondiale" },
  { value: "340 000+", label: "collaborateurs dans le monde" },
  { value: "85%", label: "des 200 plus grandes entreprises accompagnées" },
  { value: "13x", label: "reconnu parmi les entreprises les plus éthiques" },
] as const;

const workflow = [
  {
    icon: Building05Icon,
    title: "Qualification",
    description: "Profil, maturité et objectifs de partenariat cadrés dès le départ.",
  },
  {
    icon: ChartBarLineIcon,
    title: "Priorisation",
    description: "Opportunités classées par potentiel, urgence et impact business.",
  },
  {
    icon: CustomerSupportIcon,
    title: "Suivi",
    description: "Échanges, documents et décisions visibles dans un espace partagé.",
  },
] as const;

export function EtherealBeamsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[72%] bg-[linear-gradient(180deg,hsl(var(--primary)/0.11),hsl(var(--background)))] dark:bg-[linear-gradient(180deg,hsl(var(--primary)/0.16),hsl(var(--background)))]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.45)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.45)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Retour à l'accueil Capgemini"
          className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <CapgeminiLogo size="md" />
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center rounded-xl border border-border/80 bg-background/78 p-1 shadow-sm shadow-primary/5 backdrop-blur md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="lg" className="hidden cursor-pointer sm:inline-flex">
            <Link href="/auth/sign-in">
              Se connecter
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left"
        >
          <Link
            href="/success-stories/apply"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <HugeiconsIcon icon={BriefcaseBusinessIcon} className="size-4" />
            Plateforme partenariats Capgemini Tunisie
          </Link>

          <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            Transformez chaque partenariat en opportunité mesurable.
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl lg:mx-0">
            Une expérience claire pour découvrir Capgemini, proposer une collaboration et suivre les prochaines étapes sans friction.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="h-12 cursor-pointer px-5 text-base">
              <Link href="/success-stories/apply">
                Devenir partenaire
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 cursor-pointer px-5 text-base"
            >
              <Link href="/auth/sign-in">Se connecter</Link>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.value}
                className="rounded-xl border border-border/80 bg-card/82 px-4 py-4 shadow-sm backdrop-blur"
              >
                <p className="text-xl font-semibold text-foreground sm:text-2xl">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-primary/10 sm:p-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Espace partenariat
                </p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">
                  Pipeline des collaborations
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HugeiconsIcon icon={Rocket01Icon} className="size-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {workflow.map((item, index) => (
                <div
                  key={item.title}
                  className={cn(
                    "rounded-xl border bg-background p-4 transition-colors hover:border-primary/35",
                    index === 1 ? "border-primary/30" : "border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <HugeiconsIcon icon={item.icon} className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <p className="text-sm leading-6 text-foreground">
                  Les demandes de partenariat démarrent depuis un formulaire guidé et restent reliées aux espaces de suivi.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
