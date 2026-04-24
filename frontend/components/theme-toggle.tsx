"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SunIcon,
  MoonIcon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { cn } from "@/frontend/lib/utils";

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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("flex h-7 w-[84px]", className)} />;
  }

  return (
    <motion.div
      key="theme-toggle-mounted"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-md border bg-muted/80",
        className
      )}
      role="radiogroup"
      aria-label="Choisir le thème"
    >
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          aria-label={`Thème ${option.label}`}
          onClick={() => setTheme(option.value)}
          className={cn(
            "relative flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors",
            theme === option.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {theme === option.value && (
            <motion.div
              layoutId="theme-option"
              transition={{ type: "spring", bounce: 0.1, duration: 0.75 }}
              className="absolute inset-0 rounded-md border border-muted-foreground/50"
            />
          )}
          <HugeiconsIcon icon={option.icon} className="size-3.5" />
        </button>
      ))}
    </motion.div>
  );
}
