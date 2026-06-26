"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, PanelLeftCloseIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { ThreadList } from "./thread-list"
import type { ThreadListItem } from "./types"

interface ThreadPanelProps {
  threads: ThreadListItem[]
  activeThreadId: number | null
  pinnedIds: number[]
  isLoading: boolean
  error: string | null
  deletingThreadId: number | null
  renamingThreadId: number | null
  onSelect: (id: number) => void
  onRename: (id: number, title: string) => void
  onTogglePin: (id: number) => void
  onDelete: (id: number) => void
  onRetry: () => void
  onNewThread: () => void
  onCollapse?: () => void
  className?: string
}

export function ThreadPanel({ className, onNewThread, onCollapse, ...listProps }: ThreadPanelProps) {
  return (
    <div className={cn("flex min-h-0 flex-col bg-card", className)}>
      <div className="flex items-center gap-2 px-3 py-3">
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Réduire les conversations"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <HugeiconsIcon icon={PanelLeftCloseIcon} className="h-4 w-4" />
          </button>
        ) : null}
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">Conversations</h2>
        <button
          type="button"
          onClick={onNewThread}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
          Nouvelle
        </button>
      </div>

      <ThreadList {...listProps} />
    </div>
  )
}
