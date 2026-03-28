"use client";

import "sonner/dist/styles.css";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "@/frontend/lib/utils";
import type { ExternalToast, Action } from "sonner";

/**
 * Types pour les toasts - extension de Sonner ExternalToast
 */
export type ToastVariant = "default" | "success" | "error" | "warning" | "info";
export type ToastMessage = string | React.ReactNode;
export type ToastOptions = ExternalToast & {
  description?: ToastMessage;
  action?: Action | React.ReactNode;
  cancel?: Action | React.ReactNode;
};

/**
 * Composant Toaster personnalisé avec thème bleu et support dark mode.
 * Utilise les variables CSS du thème shadcn (--card, --primary, --border, etc.)
 */
function ToastToaster() {
  return (
    <SonnerToaster
      theme="system"
      position="bottom-center"
      expand={false}
      richColors={false}
      closeButton
      duration={4000}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-4 shadow-lg",
            "border-border bg-card text-card-foreground",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full",
            "data-[state=open]:slide-in-from-bottom-full data-[state=open]:sm:slide-in-from-bottom-0"
          ),
          title: "text-sm font-semibold",
          description: "text-sm opacity-90 mt-0.5",
          actionButton: cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
            "border-border bg-primary text-primary-foreground hover:bg-primary/90",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          ),
          cancelButton: cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
            "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          ),
          closeButton: cn(
            "absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-70",
            "transition-opacity hover:text-foreground hover:opacity-100",
            "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          ),
          success:
            "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-200",
          error:
            "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200",
          warning: cn(
            "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
            "dark:border-amber-500/20 dark:bg-amber-500/15"
          ),
          info:
            "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-200",
          default: "",
        },
      }}
      className="toaster group"
    />
  );
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    sonnerToast.success(message, options),
  error: (message: string, options?: ToastOptions) =>
    sonnerToast.error(message, options),
  warning: (message: string, options?: ToastOptions) =>
    sonnerToast.warning(message, options),
  info: (message: string, options?: ToastOptions) =>
    sonnerToast.info(message, options),
  loading: (message: string, options?: ToastOptions) =>
    sonnerToast.loading(message, options),
};

export { ToastToaster };
export type { Action, ExternalToast } from "sonner";
