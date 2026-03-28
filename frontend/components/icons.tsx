"use client";

import * as React from "react";
import { cn } from "@/frontend/lib/utils";

/** URLs officiels des logos Capgemini */
const CAPGEMINI_LOGO_BLUE =
  "https://www.capgemini.com/wp-content/themes/capgemini2025/assets/images/capgeminiBlue.svg";
const CAPGEMINI_LOGO_WHITE =
  "https://www.capgemini.com/wp-content/themes/capgemini2025/assets/images/capgeminiWhite.svg";

/** Couleurs officielles Capgemini */
export const CAPGEMINI_COLORS = {
  blue: "#0070AD",
  blueLight: "#00A3E0",
} as const;

/** Size variants for logo components */
export type LogoSize = "sm" | "md" | "lg" | "xl";

/** Shared size dimensions (width, height) */
const SIZE_MAP = {
  sm: { small: { w: 24, h: 24 }, big: { w: 120, h: 32 } },
  md: { small: { w: 32, h: 32 }, big: { w: 160, h: 42 } },
  lg: { small: { w: 40, h: 40 }, big: { w: 200, h: 52 } },
  xl: { small: { w: 48, h: 48 }, big: { w: 240, h: 64 } },
} as const;

export interface CapgeminiLogoProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Size variant */
  size?: LogoSize;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CapgeminiLogo — Logo officiel Capgemini (version complète)
 *
 * Utilise les vrais logos depuis capgemini.com :
 * - Logo bleu (#0070AD) en mode clair
 * - Logo blanc en mode sombre
 *
 * @example
 * ```tsx
 * <CapgeminiLogo size="lg" className="mx-auto" />
 * ```
 */
export function CapgeminiLogo({
  size = "lg",
  className,
  ...props
}: CapgeminiLogoProps) {
  const { w, h } = SIZE_MAP[size].big;

  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      aria-label="Capgemini"
      {...props}
    >
      <img
        src={CAPGEMINI_LOGO_BLUE}
        alt="Capgemini"
        width={w}
        height={h}
        className="block dark:hidden h-auto object-contain"
        style={{ width: w, height: h }}
      />
      <img
        src={CAPGEMINI_LOGO_WHITE}
        alt="Capgemini"
        width={w}
        height={h}
        className="hidden dark:block h-auto object-contain"
        style={{ width: w, height: h }}
      />
    </span>
  );
}

export interface CapgeminiLogoSmallProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Size variant */
  size?: LogoSize;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CapgeminiLogoSmall — Icône Capgemini (version compacte)
 *
 * Symbole uniquement, pour favicons, navbar, etc.
 * Bleu en mode clair, blanc en mode sombre.
 *
 * @example
 * ```tsx
 * <CapgeminiLogoSmall size="md" />
 * ```
 */
export function CapgeminiLogoSmall({
  size = "md",
  className,
  ...props
}: CapgeminiLogoSmallProps) {
  const { w, h } = SIZE_MAP[size].small;

  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      aria-label="Capgemini"
      {...props}
    >
      <img
        src={CAPGEMINI_LOGO_BLUE}
        alt="Capgemini"
        width={w}
        height={h}
        className="block dark:hidden h-auto object-contain object-left"
        style={{ width: w, height: h }}
      />
      <img
        src={CAPGEMINI_LOGO_WHITE}
        alt="Capgemini"
        width={w}
        height={h}
        className="hidden dark:block h-auto object-contain object-left"
        style={{ width: w, height: h }}
      />
    </span>
  );
}
