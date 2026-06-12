"use client"

import React, { useState, useRef, useLayoutEffect, cloneElement } from "react"
import { cn } from "@/lib/utils"

// --- Types ---

export type LimelightNavItem = {
  id: string | number
  icon: React.ReactElement<{ className?: string }>
  label?: string
  onClick?: () => void
}

type LimelightNavProps = {
  items: LimelightNavItem[]
  activeIndex?: number
  defaultActiveIndex?: number
  onTabChange?: (index: number) => void
  className?: string
  limelightClassName?: string
  iconContainerClassName?: string
  iconClassName?: string
}

/**
 * Navigation bar horizontale avec effet "limelight" sur l'élément actif.
 * Utilisé pour les menus de navigation employee et partenaire.
 */
export const LimelightNav = ({
  items,
  activeIndex: controlledActiveIndex,
  defaultActiveIndex = 0,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
}: LimelightNavProps) => {
  const [internalActive, setInternalActive] = useState(defaultActiveIndex)
  const [isReady, setIsReady] = useState(false)
  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const limelightRef = useRef<HTMLDivElement | null>(null)

  const activeIndex = controlledActiveIndex ?? internalActive

  useLayoutEffect(() => {
    if (items.length === 0) return
    const limelight = limelightRef.current
    const activeItem = navItemRefs.current[activeIndex]
    if (limelight && activeItem) {
      const newLeft =
        activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2
      limelight.style.left = `${newLeft}px`
      if (!isReady) {
        setTimeout(() => setIsReady(true), 50)
      }
    }
  }, [activeIndex, isReady, items])

  if (items.length === 0) return null

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setInternalActive(index)
    onTabChange?.(index)
    itemOnClick?.()
  }

  return (
    <nav
      className={cn(
        "relative inline-flex items-center h-16 rounded-xl bg-card text-foreground border border-border px-2",
        className
      )}
    >
      {items.map(({ id, icon, label, onClick }, index) => (
        <button
          key={id}
          ref={(el) => { navItemRefs.current[index] = el }}
          className={cn(
            "relative z-20 flex h-full cursor-pointer items-center justify-center p-5 focus-visible:outline-none",
            iconContainerClassName
          )}
          onClick={() => handleItemClick(index, onClick)}
          aria-label={label}
          type="button"
        >
          {cloneElement(icon, {
            className: cn(
              "w-5 h-5 transition-all duration-200 ease-in-out",
              activeIndex === index ? "opacity-100" : "opacity-35",
              icon.props.className,
              iconClassName
            ),
          })}
        </button>
      ))}

      {/* Limelight indicator */}
      <div
        ref={limelightRef}
        className={cn(
          "absolute top-0 z-10 w-10 h-[4px] rounded-full bg-primary",
          isReady ? "transition-[left] duration-300 ease-in-out" : "",
          limelightClassName
        )}
        style={{
          left: "-999px",
          boxShadow: "0 20px 40px color-mix(in srgb, var(--primary) 60%, transparent)",
        }}
      >
        {/* Gradient cone downward */}
        <div
          className="absolute top-[4px] w-[160%] h-12 bg-gradient-to-b from-primary/25 to-transparent pointer-events-none"
          style={{
            left: "-30%",
            clipPath: "polygon(5% 100%, 25% 0, 75% 0, 95% 100%)",
          }}
        />
      </div>
    </nav>
  )
}
