"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Attribut pour le thème sur l'élément HTML */
  attribute?: "class" | "data-theme";
  /** Valeur par défaut (système = détection préférence OS) */
  defaultTheme?: "light" | "dark" | "system";
  /** Désactiver les transitions pour éviter le flash */
  enableSystem?: boolean;
  /** Clé localStorage pour persister le thème */
  storageKey?: string;
  /** Forcer un thème (pas de préférence utilisateur) */
  forcedTheme?: "light" | "dark";
}

/**
 * ThemeProvider — Wrapper next-themes pour l'App Router
 *
 * - Détection de la préférence système (prefers-color-scheme)
 * - Persistance dans localStorage
 * - Évite le flash au chargement (suppressHydrationWarning sur html)
 */
export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "capgemini-theme",
  forcedTheme = undefined,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      storageKey={storageKey}
      forcedTheme={forcedTheme}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
