"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SunIcon,
  MoonIcon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { icon: ComputerIcon, value: "system",  label: "Système" },
  { icon: SunIcon,     value: "light",   label: "Clair"   },
  { icon: MoonIcon,    value: "dark",    label: "Sombre"  },
] as const;

export type ThemeValue = "light" | "dark" | "system";

// Props kept for backward compat — all existing usages pass variant/size but they are no longer needed
export interface ThemeToggleProps {
  className?: string;
  variant?: string;
  size?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("h-9 w-[6.75rem]", className)} />;
  }

  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 32 };

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center gap-0.5 rounded-md border border-border bg-muted p-0.5",
        className
      )}
      role="radiogroup"
      aria-label="Choisir le thème"
    >
      {THEME_OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Thème ${option.label}`}
            onClick={() => setTheme(option.value)}
            className={cn(
              "relative flex size-8 cursor-pointer items-center justify-center rounded-[5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-active-pill"
                transition={pillTransition}
                className="absolute inset-0 rounded-[5px] bg-card shadow-sm ring-1 ring-border"
              />
            )}
            <HugeiconsIcon
              icon={option.icon}
              size={16}
              strokeWidth={2.2}
              className="relative z-10"
            />
          </button>
        );
      })}
    </div>
  );
}
