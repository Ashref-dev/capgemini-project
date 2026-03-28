"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SunIcon,
  MoonIcon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/frontend/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { Button } from "@/frontend/components/ui/button";

export type ThemeValue = "light" | "dark" | "system";

export interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: "ghost" | "outline" | "secondary";
  /** Button size */
  size?: "default" | "sm" | "icon" | "icon-sm";
  /** Show label */
  showLabel?: boolean;
}

/**
 * ThemeToggle — Bouton de basculement thème clair/sombre/système
 *
 * Utilise next-themes pour :
 * - Détection de la préférence système (prefers-color-scheme)
 * - Persistance dans localStorage
 * - Transition fluide entre thèmes
 *
 * Compatible avec le thème Tailwind (--background, --foreground, etc.)
 * et la variante dark: de globals.css.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle variant="outline" showLabel />
 * ```
 */
export function ThemeToggle({
  className,
  variant = "ghost",
  size = "icon",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = React.useCallback(
    (value: ThemeValue) => {
      try {
        setTheme(value);
      } catch (error) {
        console.error("[ThemeToggle] Failed to set theme:", error);
      }
    },
    [setTheme]
  );

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("transition-opacity", className)}
        aria-label="Chargement du thème"
      >
        <span className="size-4 rounded-full bg-muted-foreground/20 animate-pulse" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const currentIcon = isDark ? MoonIcon : SunIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "transition-colors duration-200 ease-in-out",
            "hover:bg-muted/80",
            className
          )}
          aria-label={`Thème actuel : ${theme}. Cliquer pour changer`}
        >
          <HugeiconsIcon
            icon={currentIcon}
            className="size-4 transition-transform duration-200"
          />
          {showLabel && (
            <span className="ml-2 capitalize">
              {theme === "system"
                ? "Système"
                : theme === "dark"
                  ? "Sombre"
                  : "Clair"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => handleSelect("light")}
          className={cn(theme === "light" && "bg-accent")}
        >
          <HugeiconsIcon icon={SunIcon} className="size-4 mr-2" />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect("dark")}
          className={cn(theme === "dark" && "bg-accent")}
        >
          <HugeiconsIcon icon={MoonIcon} className="size-4 mr-2" />
          Sombre
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect("system")}
          className={cn(theme === "system" && "bg-accent")}
        >
          <HugeiconsIcon icon={ComputerIcon} className="size-4 mr-2" />
          Système
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
