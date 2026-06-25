"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ThreadList } from "./thread-list"
import type { ThreadListItem } from "./types"

interface ThreadDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
}

export function ThreadDrawer({ open, onOpenChange, onNewThread, ...listProps }: ThreadDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-[300px] flex-col gap-0 p-0">
        <SheetHeader className="flex-row items-center justify-between gap-2 space-y-0 px-3 py-3 text-left">
          <SheetTitle className="text-sm font-semibold">Conversations</SheetTitle>
          <button
            type="button"
            onClick={onNewThread}
            className="mr-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
            Nouvelle
          </button>
        </SheetHeader>

        <ThreadList {...listProps} />
      </SheetContent>
    </Sheet>
  )
}
