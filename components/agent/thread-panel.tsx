"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

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
  className?: string
}

export function ThreadPanel({ className, onNewThread, ...listProps }: ThreadPanelProps) {
  return (
    <div className={cn("flex min-h-0 flex-col bg-card", className)}>
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
        <button
          type="button"
          onClick={onNewThread}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
          Nouvelle
        </button>
      </div>

      <ThreadList {...listProps} />
    </div>
  )
}
