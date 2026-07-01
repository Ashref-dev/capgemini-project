"use client";

import "sonner/dist/styles.css";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
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
      offset={24}
      mobileOffset={16}
      style={
        {
          "--width": "min(420px, calc(100vw - 32px))",
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 rounded-xl border p-4 pr-10 shadow-xl backdrop-blur-md",
            "border-border bg-card text-card-foreground",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full",
            "data-[state=open]:slide-in-from-bottom-full data-[state=open]:sm:slide-in-from-bottom-0"
          ),
          icon: "shrink-0 mt-0.5",
          content: "flex-1 min-w-0 flex flex-col gap-1",
          title: cn(
            "text-sm font-semibold leading-snug break-words",
            "text-foreground",
            "group-data-[type=success]:text-green-900 dark:group-data-[type=success]:text-green-100",
            "group-data-[type=error]:text-red-900 dark:group-data-[type=error]:text-red-100",
            "group-data-[type=warning]:text-amber-900 dark:group-data-[type=warning]:text-amber-100",
            "group-data-[type=info]:text-blue-900 dark:group-data-[type=info]:text-blue-100"
          ),
          description: cn(
            "text-sm font-medium leading-snug break-words",
            "text-foreground!",
            "group-data-[type=success]:text-green-800 dark:group-data-[type=success]:text-green-100",
            "group-data-[type=error]:text-red-800 dark:group-data-[type=error]:text-red-100",
            "group-data-[type=warning]:text-amber-800 dark:group-data-[type=warning]:text-amber-100",
            "group-data-[type=info]:text-blue-800 dark:group-data-[type=info]:text-blue-100"
          ),
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
            "!absolute !right-2 !top-2 !left-auto !translate-x-0 !translate-y-0 !size-6 !rounded-md !border-0 !bg-transparent",
            "!text-muted-foreground/70 hover:!text-foreground hover:!bg-foreground/5 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          ),
          success: cn(
            "border-green-500/40 bg-green-50 text-green-900",
            "dark:border-green-400/30 dark:bg-green-950/90 dark:text-green-100"
          ),
          error: cn(
            "border-red-500/40 bg-red-50 text-red-900",
            "dark:border-red-400/30 dark:bg-red-950/90 dark:text-red-100"
          ),
          warning: cn(
            "border-amber-500/40 bg-amber-50 text-amber-900",
            "dark:border-amber-400/30 dark:bg-amber-950/90 dark:text-amber-100"
          ),
          info: cn(
            "border-blue-500/40 bg-blue-50 text-blue-900",
            "dark:border-blue-400/30 dark:bg-blue-950/90 dark:text-blue-100"
          ),
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
