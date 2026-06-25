"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowReloadHorizontalIcon, InboxIcon, Search01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { ThreadListSkeleton } from "./agent-skeletons"
import { ThreadItem } from "./thread-item"
import type { ThreadFilter, ThreadListItem } from "./types"

interface ThreadListProps {
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
}

const FILTERS: { value: ThreadFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pinned", label: "Épinglées" },
  { value: "today", label: "Aujourd'hui" },
]

function startOfToday(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function groupLabel(updatedAt: string | Date, todayStart: number): string {
  const time = new Date(updatedAt).getTime()
  if (Number.isNaN(time)) return "Plus anciennes"
  if (time >= todayStart) return "Aujourd'hui"
  if (time >= todayStart - 86_400_000) return "Hier"
  if (time >= todayStart - 7 * 86_400_000) return "7 derniers jours"
  if (time >= todayStart - 30 * 86_400_000) return "30 derniers jours"
  return "Plus anciennes"
}

const GROUP_ORDER = ["Aujourd'hui", "Hier", "7 derniers jours", "30 derniers jours", "Plus anciennes"]

export function ThreadList({
  threads,
  activeThreadId,
  pinnedIds,
  isLoading,
  error,
  deletingThreadId,
  renamingThreadId,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
  onRetry,
}: ThreadListProps) {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<ThreadFilter>("all")
  const pinnedSet = React.useMemo(() => new Set(pinnedIds), [pinnedIds])
  const todayStart = React.useMemo(startOfToday, [])

  const visible = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return threads.filter((thread) => {
      const title = (thread.title ?? "Nouvelle conversation").toLowerCase()
      if (normalized && !title.includes(normalized)) return false
      if (filter === "pinned") return pinnedSet.has(thread.id)
      if (filter === "today") return new Date(thread.updatedAt).getTime() >= todayStart
      return true
    })
  }, [threads, query, filter, pinnedSet, todayStart])

  const sections = React.useMemo(() => {
    const pinned = visible.filter((thread) => pinnedSet.has(thread.id))
    const rest = visible.filter((thread) => !pinnedSet.has(thread.id))
    const buckets = new Map<string, ThreadListItem[]>()
    for (const thread of rest) {
      const key = groupLabel(thread.updatedAt, todayStart)
      const list = buckets.get(key) ?? []
      list.push(thread)
      buckets.set(key, list)
    }
    const ordered: { label: string; items: ThreadListItem[] }[] = []
    if (pinned.length > 0) ordered.push({ label: "Épinglées", items: pinned })
    for (const label of GROUP_ORDER) {
      const items = buckets.get(label)
      if (items && items.length > 0) ordered.push({ label, items })
    }
    return ordered
  }, [visible, pinnedSet, todayStart])

  const renderRow = (thread: ThreadListItem) => (
    <ThreadItem
      key={thread.id}
      thread={thread}
      isActive={thread.id === activeThreadId}
      isPinned={pinnedSet.has(thread.id)}
      isDeleting={deletingThreadId === thread.id}
      isRenaming={renamingThreadId === thread.id}
      onSelect={() => onSelect(thread.id)}
      onRename={(title) => onRename(thread.id, title)}
      onTogglePin={() => onTogglePin(thread.id)}
      onDelete={() => onDelete(thread.id)}
    />
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2 pb-2">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher une conversation"
            className="h-9 w-full rounded-lg border border-input bg-card pl-8 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="mt-2 flex items-center gap-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                filter === option.value
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
        {isLoading ? (
          <ThreadListSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <HugeiconsIcon icon={ArrowReloadHorizontalIcon} className="h-3.5 w-3.5" />
              Réessayer
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={InboxIcon} className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {query.trim() || filter !== "all"
                ? "Aucune conversation ne correspond."
                : "Aucune conversation pour l'instant."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.label} className="space-y-0.5">
                <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                  {section.label}
                </p>
                {section.items.map(renderRow)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
