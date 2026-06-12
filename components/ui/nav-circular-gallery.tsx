"use client"

import React, { useState, useEffect, useRef, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NavGalleryItem {
  id: string
  label: string
  description: string
  href: string
  icon: React.ReactNode
  color: string       // text-* class for icon
  bgColor: string     // bg-* class for icon container
}

interface NavCircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: NavGalleryItem[]
  radius?: number
  autoRotateSpeed?: number
}

// ─── Component ───────────────────────────────────────────────────────────────

export const NavCircularGallery = React.forwardRef<HTMLDivElement, NavCircularGalleryProps>(
  ({ items, className, radius = 480, autoRotateSpeed = 0.015, ...props }, ref) => {
    const [rotation, setRotation] = useState(0)
    const [isScrolling, setIsScrolling] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const animFrameRef = useRef<number | null>(null)

    // Scroll → rotation
    useEffect(() => {
      const el = containerRef.current?.closest("[data-gallery-scroll]") as HTMLElement | null
      const target = el ?? window

      const handleScroll = () => {
        setIsScrolling(true)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150)
      }

      target.addEventListener("scroll", handleScroll, { passive: true })
      return () => {
        target.removeEventListener("scroll", handleScroll)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      }
    }, [])

    // Auto-rotation when idle
    useEffect(() => {
      const rotate = () => {
        if (!isScrolling) setRotation(prev => prev + autoRotateSpeed)
        animFrameRef.current = requestAnimationFrame(rotate)
      }
      animFrameRef.current = requestAnimationFrame(rotate)
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      }
    }, [isScrolling, autoRotateSpeed])

    const anglePerItem = 360 / items.length

    return (
      <div
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        role="region"
        aria-label="Navigation circulaire"
        className={cn("relative w-full flex items-center justify-center overflow-hidden", className)}
        style={{ perspective: "1800px", height: 420 }}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem
            const totalRot = rotation % 360
            const relAngle = (itemAngle + totalRot + 360) % 360
            const norm = Math.abs(relAngle > 180 ? 360 - relAngle : relAngle)
            const opacity = Math.max(0.25, 1 - norm / 180)
            const isActive = activeIndex === i

            return (
              <a
                key={item.id}
                href={item.href}
                role="group"
                aria-label={item.label}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                className="absolute no-underline"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  width: 200,
                  height: 240,
                  marginLeft: -100,
                  marginTop: -120,
                  opacity,
                  transition: "opacity 0.3s linear",
                }}
              >
                <div
                  className={cn(
                    "relative w-full h-full rounded-2xl border border-border bg-card/80 dark:bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col items-center justify-center gap-4 p-6 cursor-pointer transition-all duration-300",
                    isActive
                      ? "scale-105 shadow-2xl border-primary/40 bg-card dark:bg-card/90"
                      : "hover:scale-102"
                  )}
                  style={isActive ? { boxShadow: "0 0 40px color-mix(in srgb, var(--primary) 25%, transparent)" } : {}}
                >
                  {/* Background gradient */}
                  <div className={cn("absolute inset-0 opacity-10", item.bgColor)} />

                  {/* Icon */}
                  <div className={cn("relative z-10 p-4 rounded-2xl", item.bgColor)}>
                    <span className={cn("block", item.color)}>
                      {item.icon}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="relative z-10 text-center">
                    <h3 className="font-bold text-sm text-foreground leading-tight">{item.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-snug line-clamp-2">{item.description}</p>
                  </div>

                  {/* Bottom accent line */}
                  <div className={cn("absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-60", item.bgColor)} />
                </div>
              </a>
            )
          })}
        </div>
      </div>
    )
  }
)

NavCircularGallery.displayName = "NavCircularGallery"
