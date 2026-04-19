"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/frontend/lib/utils"

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  asChild?: boolean
}

export const AddButton = React.forwardRef<HTMLButtonElement, AddButtonProps>(
  ({ label, className, onClick, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          // Layout
          "relative inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm",
          // Colors — adapts to dark/light
          "bg-[#0070AD] text-white",
          "dark:bg-[#0070AD] dark:text-white",
          // Hover
          "hover:bg-[#005a8e] dark:hover:bg-[#0082c8]",
          // Gradient shimmer overlay
          "overflow-hidden",
          // Disabled
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070AD] focus-visible:ring-offset-2",
          "transition-colors duration-200",
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {/* Shimmer */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ translateX: ["−100%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
        />

        {/* Plus icon */}
        <span className="relative flex items-center justify-center w-5 h-5 rounded-lg bg-white/20 font-bold text-base leading-none">
          +
        </span>

        <span className="relative">{label}</span>
      </motion.button>
    )
  }
)

AddButton.displayName = "AddButton"
