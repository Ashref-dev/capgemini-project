"use client";

import { ToastToaster } from "@/components/ui/toast";

/**
 * Re-export du Toaster Sonner personnalisé pour compatibilité.
 * Utiliser ce composant dans le layout racine.
 */
export function Toaster() {
  return <ToastToaster />;
}
