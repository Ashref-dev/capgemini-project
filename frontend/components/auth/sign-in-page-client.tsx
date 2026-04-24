"use client"

import { useState, useEffect } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/frontend/components/ui/button"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { ThemeToggle } from "@/frontend/components/theme-toggle"
import { Footer } from "@/frontend/components/footer"
import { SignInForm } from "@/frontend/components/auth/sign-in-form"
import { ShadowOverlay } from "@/frontend/components/ui/shadow-overlay"
import { cn } from "@/frontend/lib/utils"

export function SignInPageClient() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const shadowColor = isDark ? "rgba(0, 112, 173, 0.65)" : "rgba(18, 171, 219, 0.4)"
  const noiseOpacity = isDark ? 1 : 0.12

  // 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8])
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#001A3A]">

      {/* ── Navbar — glassmorphic pill identique à Home ───────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 dark:bg-[#001A3A]/90 backdrop-blur-md border-b border-[#0070AD]/10 dark:border-white/10 py-3 shadow-sm"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>

          {/* Pill nav */}
          <div className="hidden md:flex items-center space-x-1 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 p-1">
            {([
              { label: "Home", href: "/" },
              { label: "Why Capgemini", href: "/#why-capgemini", anchor: true },
              { label: "Success Stories", href: "/success-stories" },
              { label: "Solutions", href: "/solutions" },
            ] as { label: string; href: string; anchor?: boolean }[]).map((link) =>
              link.anchor ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#001A3A]/75 dark:text-white/90 transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#001A3A] dark:hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#001A3A]/75 dark:text-white/90 transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#001A3A] dark:hover:text-white"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="ghost" size="icon" />
            <Button
              asChild
              size="sm"
              className="bg-[#0070AD] hover:bg-[#005a8e] text-white font-semibold rounded-full px-5 shadow-md shadow-[#0070AD]/20"
            >
              <Link href="/auth/sign-in">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4 pt-28 pb-16 bg-white dark:bg-[#001A3A]">

        {/* Background — ShadowOverlay identique à Solutions */}
        <ShadowOverlay
          color={shadowColor}
          animation={{ scale: 100, speed: 90 }}
          noise={{ opacity: noiseOpacity, scale: 1.2 }}
          sizing="fill"
          className="absolute inset-0 w-full h-full z-0"
        />

        {/* ── 3D Card ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10"
          style={{ perspective: 1500 }}
        >
          <motion.div
            className="relative"
            style={{ rotateX, rotateY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative group">

              {/* Glow animé autour de la card */}
              <motion.div
                className="absolute -inset-[1px] rounded-2xl"
                animate={{
                  boxShadow: [
                    "0 0 12px 3px rgba(0,112,173,0.06)",
                    "0 0 24px 8px rgba(0,112,173,0.16)",
                    "0 0 12px 3px rgba(0,112,173,0.06)",
                  ],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />

              {/* Faisceaux lumineux sur le contour */}
              <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                {/* Haut → */}
                <motion.div
                  className="absolute top-0 left-0 h-[2px] w-[45%] bg-gradient-to-r from-transparent via-[#0070AD] to-transparent"
                  animate={{ left: ["-45%", "100%"], opacity: [0.3, 0.9, 0.3] }}
                  transition={{
                    left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
                  }}
                />
                {/* Droite ↓ */}
                <motion.div
                  className="absolute top-0 right-0 h-[45%] w-[2px] bg-gradient-to-b from-transparent via-[#0070AD] to-transparent"
                  animate={{ top: ["-45%", "100%"], opacity: [0.3, 0.9, 0.3] }}
                  transition={{
                    top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 },
                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
                  }}
                />
                {/* Bas ← */}
                <motion.div
                  className="absolute bottom-0 right-0 h-[2px] w-[45%] bg-gradient-to-r from-transparent via-[#12ABDB] to-transparent"
                  animate={{ right: ["-45%", "100%"], opacity: [0.3, 0.9, 0.3] }}
                  transition={{
                    right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 },
                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
                  }}
                />
                {/* Gauche ↑ */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[45%] w-[2px] bg-gradient-to-b from-transparent via-[#12ABDB] to-transparent"
                  animate={{ bottom: ["-45%", "100%"], opacity: [0.3, 0.9, 0.3] }}
                  transition={{
                    bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 },
                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
                  }}
                />

                {/* Points aux coins */}
                {(["top-0 left-0", "top-0 right-0", "bottom-0 right-0", "bottom-0 left-0"] as const).map((pos, i) => (
                  <motion.div
                    key={pos}
                    className={`absolute ${pos} h-[5px] w-[5px] rounded-full bg-[#0070AD]/60 blur-[1px]`}
                    animate={{ opacity: [0.2, 0.55, 0.2] }}
                    transition={{ duration: 2 + i * 0.2, repeat: Infinity, repeatType: "mirror", delay: i * 0.4 }}
                  />
                ))}
              </div>

              {/* ── Glass card ─────────────────────────────────── */}
              <div className="relative bg-white dark:bg-[#000e24]/65 backdrop-blur-xl rounded-2xl p-6 border border-[#0070AD]/10 dark:border-white/8 shadow-2xl shadow-[#0070AD]/8 overflow-hidden">

                {/* Motif de grille subtil */}
                <div
                  className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #0070AD 0.5px, transparent 0.5px), linear-gradient(45deg, #0070AD 0.5px, transparent 0.5px)`,
                    backgroundSize: "30px 30px",
                  }}
                />

                {/* Formulaire existant — logo Capgemini + tabs + champs */}
                <div className="relative">
                  <SignInForm />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
