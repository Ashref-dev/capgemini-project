import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isInternalDashboardHref(href: string | undefined): boolean {
  if (typeof href !== "string" || href.length === 0) {
    return false
  }

  return href.startsWith("/dashboard/")
}
