"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, ArrowReloadHorizontalIcon } from "@hugeicons/core-free-icons"

interface AgentErrorStateProps {
  message: string
  onRetry: () => void
}

export function AgentErrorState({ message, onRetry }: AgentErrorStateProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 ring-1 ring-destructive/20">
        <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5 text-destructive" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">Un problème est survenu</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <HugeiconsIcon icon={ArrowReloadHorizontalIcon} className="h-4 w-4" />
        Réessayer
      </button>
    </div>
  )
}
