"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { SlashCommand } from "./types"

interface SlashCommandMenuProps {
  open: boolean
  commands: SlashCommand[]
  activeIndex: number
  onSelect: (command: SlashCommand) => void
  onHover: (index: number) => void
}

/**
 * Lightweight slash-command palette anchored above the composer. Keyboard
 * navigation (arrow keys / enter / escape) is owned by the composer; this
 * component is purely presentational and reports hover/click intent upward.
 */
export function SlashCommandMenu({
  open,
  commands,
  activeIndex,
  onSelect,
  onHover,
}: SlashCommandMenuProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open && commands.length > 0 ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.985 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-full left-0 z-30 mb-2 w-full max-w-sm overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
          role="listbox"
          aria-label="Commandes"
        >
          <p className="border-b border-border/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Commandes
          </p>
          <ul className="max-h-64 overflow-y-auto p-1">
            {commands.map((command, index) => {
              const active = index === activeIndex
              return (
                <li key={command.trigger}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => onHover(index)}
                    onMouseDown={(event) => {
                      // Prevent the textarea from losing focus before selection.
                      event.preventDefault()
                      onSelect(command)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                      active ? "bg-accent" : "hover:bg-muted/60",
                    )}
                  >
                    <code className="shrink-0 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs font-medium text-secondary-foreground">
                      {command.trigger}
                    </code>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-foreground">
                        {command.label}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {command.description}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
