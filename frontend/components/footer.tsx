"use client"

import Link from "next/link"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Linkedin01Icon, GlobalIcon } from "@hugeicons/core-free-icons"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden w-full py-16 border-t
      bg-white dark:bg-[#001A3A]
      border-[#0070AD]/20 dark:border-[#12ABDB]/20"
    >
      {/* Subtle radial glow — visible uniquement en dark mode */}
      <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(18,171,219,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">

          {/* Colonne 1 — Logo & description */}
          <div className="space-y-6">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <CapgeminiLogo size="lg" />
            </Link>
            <p className="text-[#003566]/70 dark:text-[#12ABDB]/70 max-w-xs text-sm leading-relaxed">
              Plateforme de gestion des partenaires — Capgemini Tunisie
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link href="https://linkedin.com/company/capgemini" target="_blank"
                className="p-2 rounded-lg bg-[#0070AD]/10 hover:bg-[#0070AD]/20 dark:bg-white/10 dark:hover:bg-white/20 transition-all text-[#0070AD] dark:text-white">
                <HugeiconsIcon icon={Linkedin01Icon} className="w-5 h-5" />
              </Link>
              <Link href="https://capgemini.com" target="_blank"
                className="p-2 rounded-lg bg-[#0070AD]/10 hover:bg-[#0070AD]/20 dark:bg-white/10 dark:hover:bg-white/20 transition-all text-[#0070AD] dark:text-white">
                <HugeiconsIcon icon={GlobalIcon} className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Colonne 2 — Navigation */}
          <div className="space-y-6">
            <h4 className="text-[#001A3A] dark:text-white font-semibold text-lg">Navigation</h4>
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-[#003566]/70 dark:text-white/60 hover:text-[#0070AD] dark:hover:text-white transition-colors text-sm">Home</Link>
              <a href="#why-capgemini" className="text-[#003566]/70 dark:text-white/60 hover:text-[#0070AD] dark:hover:text-white transition-colors text-sm">Why Capgemini</a>
              <Link href="/success-stories" className="text-[#003566]/70 dark:text-white/60 hover:text-[#0070AD] dark:hover:text-white transition-colors text-sm">Success Stories</Link>
              <Link href="/solutions" className="text-[#003566]/70 dark:text-white/60 hover:text-[#0070AD] dark:hover:text-white transition-colors text-sm">Solutions</Link>
            </nav>
          </div>

          {/* Colonne 3 — Contact */}
          <div className="space-y-6">
            <h4 className="text-[#001A3A] dark:text-white font-semibold text-lg">Contact</h4>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-[#0070AD] dark:text-[#12ABDB]/80 uppercase tracking-wider font-bold">Adresse</span>
                <p className="text-sm text-[#003566]/70 dark:text-white/60">Parc Technologique El Ghazala (Tunis)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-[#0070AD] dark:text-[#12ABDB]/80 uppercase tracking-wider font-bold">Email</span>
                <p className="text-sm text-[#003566]/70 dark:text-white/60 font-medium">partenaires@capgemini.com</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-[#0070AD] dark:text-[#12ABDB]/80 uppercase tracking-wider font-bold">Téléphone</span>
                <p className="text-sm text-[#003566]/70 dark:text-white/60">+216 52 587 587 / +216 52 549 549</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-[#0070AD]/15 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#003566]/50 dark:text-white/40">
          <span>© {currentYear} Capgemini Tunisie. Tous droits réservés.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#0070AD] dark:hover:text-white transition-colors">Politique de confidentialité</Link>
            <span className="opacity-40">·</span>
            <Link href="/terms" className="hover:text-[#0070AD] dark:hover:text-white transition-colors">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
