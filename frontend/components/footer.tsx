"use client"

import Link from "next/link"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Linkedin01Icon, GlobalIcon } from "@hugeicons/core-free-icons"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full text-white py-16 border-t border-blue-800/40"
      style={{ background: "linear-gradient(135deg, #003566 0%, #005b9e 60%, #0070ad 100%)" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">

          {/* Colonne 1 — Logo & description */}
          <div className="space-y-6">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <CapgeminiLogo size="lg" />
            </Link>
            <p className="text-blue-100 max-w-xs text-sm leading-relaxed">
              Plateforme de gestion des partenaires — Capgemini Tunisie
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link href="https://linkedin.com/company/capgemini" target="_blank"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white">
                <HugeiconsIcon icon={Linkedin01Icon} className="w-5 h-5" />
              </Link>
              <Link href="https://capgemini.com" target="_blank"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white">
                <HugeiconsIcon icon={GlobalIcon} className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Colonne 2 — Navigation */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold text-lg">Navigation</h4>
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-blue-100 hover:text-white transition-colors text-sm">Home</Link>
              <a href="#why-capgemini" className="text-blue-100 hover:text-white transition-colors text-sm">Why Capgemini</a>
              <Link href="/success-stories" className="text-blue-100 hover:text-white transition-colors text-sm">Success Stories</Link>
              <Link href="/solutions" className="text-blue-100 hover:text-white transition-colors text-sm">Solutions</Link>
            </nav>
          </div>

          {/* Colonne 3 — Contact */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold text-lg">Contact</h4>
            <div className="space-y-4 text-blue-100">
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-blue-200/70 uppercase tracking-wider font-bold">Adresse</span>
                <p className="text-sm">Parc Technologique El Ghazala (Tunis)</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-blue-200/70 uppercase tracking-wider font-bold">Email</span>
                <p className="text-sm font-medium">partenaires@capgemini.com</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-blue-200/70 uppercase tracking-wider font-bold">Téléphone</span>
                <p className="text-sm">+216 52 587 587 / +216 52 549 549</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-200/70">
          <span>© {currentYear} Capgemini Tunisie. Tous droits réservés.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <span className="opacity-40">·</span>
            <Link href="/terms" className="hover:text-white transition-colors">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
