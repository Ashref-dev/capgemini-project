"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Delete02Icon,
  MessageEdit01Icon,
  Search01Icon,
  Tick02Icon,
  Loading03Icon,
  AiChat02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/frontend/lib/utils"

export type ThreadListItem = {
  id: number
  title: string | null
  createdAt: string | Date
  updatedAt: string | Date
  messageCount: number
}

interface AgentSidebarProps {
  threads: ThreadListItem[]
  activeThreadId: number | null
  isLoading: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSelectThread: (id: number) => void
  onNewThread: () => void
  onDeleteThread: (id: number) => Promise<void> | void
  deletingThreadId: number | null
}

function getThreadTitle(t: ThreadListItem): string {
  const title = t.title?.trim()
  if (title && title.length > 0 && title !== "Nouvelle conversation") return title
  return "Conversation sans titre"
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function bucketKey(d: Date, now: Date): string {
  const today = startOfDay(now)
  const target = startOfDay(d)
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000)
  if (diffDays <= 0) return "Aujourd'hui"
  if (diffDays === 1) return "Hier"
  if (diffDays <= 7) return "7 derniers jours"
  if (diffDays <= 30) return "30 derniers jours"
  if (target.getFullYear() === today.getFullYear()) return "Cette année"
  return String(target.getFullYear())
}

const BUCKET_ORDER = ["Aujourd'hui", "Hier", "7 derniers jours", "30 derniers jours", "Cette année"]

function timeOfDay(d: Date): string {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export function AgentSidebar({
  threads,
  activeThreadId,
  isLoading,
  isCollapsed,
  onToggleCollapse,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  deletingThreadId,
}: AgentSidebarProps) {
  const [search, setSearch] = React.useState("")
  const [confirmId, setConfirmId] = React.useState<number | null>(null)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((t) => getThreadTitle(t).toLowerCase().includes(q))
  }, [threads, search])

  const grouped = React.useMemo(() => {
    const now = new Date()
    const map = new Map<string, ThreadListItem[]>()
    for (const t of filtered) {
      const updated = t.updatedAt instanceof Date ? t.updatedAt : new Date(t.updatedAt)
      if (Number.isNaN(updated.getTime())) continue
      const key = bucketKey(updated, now)
      const arr = map.get(key)
      if (arr) arr.push(t)
      else map.set(key, [t])
    }

    const ordered: { label: string; items: ThreadListItem[] }[] = []
    for (const label of BUCKET_ORDER) {
      const items = map.get(label)
      if (items?.length) ordered.push({ label, items })
    }
    for (const [label, items] of map.entries()) {
      if (!BUCKET_ORDER.includes(label) && items.length > 0) {
        ordered.push({ label, items })
      }
    }
    return ordered
  }, [filtered])

  if (isCollapsed) {
    return (
      <motion.aside
        initial={false}
        animate={{ width: 48 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        className="hidden flex-col items-center gap-1.5 border-r border-border/60 bg-card/40 py-2 lg:flex"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Étendre l'historique"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onNewThread}
          aria-label="Nouvelle conversation"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
        </button>
        <div className="my-0.5 h-px w-5 bg-border/60" />
        <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto">
          {filtered.slice(0, 12).map((t) => {
            const active = t.id === activeThreadId
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectThread(t.id)}
                aria-label={getThreadTitle(t)}
                title={getThreadTitle(t)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  active
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <HugeiconsIcon icon={MessageEdit01Icon} className="h-3 w-3" />
              </button>
            )
          })}
        </div>
      </motion.aside>
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: 248 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className="hidden flex-col border-r border-border/60 bg-card/40 lg:flex"
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-2.5 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-blue-500/10 ring-1 ring-primary/20">
          <HugeiconsIcon icon={AiChat02Icon} className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Historique
          </p>
          <p className="truncate text-[10px] text-muted-foreground/70">
            {threads.length} conversation{threads.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Réduire l'historique"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-1.5 px-2.5 py-2">
        <button
          type="button"
          onClick={onNewThread}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-blue-700"
        >
          <HugeiconsIcon icon={Add01Icon} className="h-3 w-3" />
          Nouvelle conversation
        </button>

        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-7 w-full rounded-md border border-input bg-transparent pl-7 pr-2 text-xs outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40 dark:bg-input/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        {isLoading ? (
          <div className="flex items-center gap-2 px-3 py-4 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Loading03Icon} className="h-3.5 w-3.5 animate-spin" />
            Chargement…
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-8 text-center">
            <HugeiconsIcon icon={MessageEdit01Icon} className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs font-medium text-foreground">
              {search ? "Aucun résultat" : "Aucune conversation"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {search ? "Essayez un autre terme." : "Tapez un message pour démarrer."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {grouped.map((group) => (
              <div key={group.label} className="space-y-0.5">
                <p className="px-1.5 pt-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  <AnimatePresence initial={false}>
                    {group.items.map((t) => {
                      const active = t.id === activeThreadId
                      const isDeleting = deletingThreadId === t.id
                      const showConfirm = confirmId === t.id
                      const updated = t.updatedAt instanceof Date ? t.updatedAt : new Date(t.updatedAt)
                      return (
                        <motion.li
                          key={t.id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div
                            className={cn(
                              "group relative flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors",
                              active
                                ? "bg-primary/10 ring-1 ring-primary/25"
                                : "hover:bg-muted/60",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => onSelectThread(t.id)}
                              className="flex min-w-0 flex-1 cursor-pointer items-start gap-1.5 text-left outline-none"
                            >
                              <span
                                className={cn(
                                  "mt-1 inline-block h-1 w-1 shrink-0 rounded-full",
                                  active ? "bg-primary" : "bg-muted-foreground/30",
                                )}
                              />
                              <span className="min-w-0 flex-1">
                                <span
                                  className={cn(
                                    "block truncate text-xs leading-tight",
                                    active ? "font-semibold text-foreground" : "text-foreground/90",
                                  )}
                                >
                                  {getThreadTitle(t)}
                                </span>
                                <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                                  {timeOfDay(updated)} · {t.messageCount} msg{t.messageCount > 1 ? "s" : ""}
                                </span>
                              </span>
                            </button>

                            {!showConfirm ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setConfirmId(t.id)
                                }}
                                aria-label="Supprimer la conversation"
                                disabled={isDeleting}
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all",
                                  "hover:bg-destructive/10 hover:text-destructive",
                                  "group-hover:opacity-100",
                                  active && "opacity-60",
                                )}
                              >
                                {isDeleting ? (
                                  <HugeiconsIcon icon={Loading03Icon} className="h-3 w-3 animate-spin" />
                                ) : (
                                  <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" />
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    setConfirmId(null)
                                    await onDeleteThread(t.id)
                                  }}
                                  aria-label="Confirmer la suppression"
                                  className="flex h-6 w-6 items-center justify-center rounded-md bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
                                >
                                  <HugeiconsIcon icon={Tick02Icon} className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setConfirmId(null)
                                  }}
                                  aria-label="Annuler"
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                  <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  )
}

interface AgentMobileSidebarProps extends Omit<AgentSidebarProps, "isCollapsed" | "onToggleCollapse"> {
  open: boolean
  onClose: () => void
}

export function AgentMobileSidebar(props: AgentMobileSidebarProps) {
  const { open, onClose, ...rest } = props
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-label="Fermer l'historique"
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-card shadow-2xl lg:hidden"
          >
            <AgentSidebar
              {...rest}
              isCollapsed={false}
              onToggleCollapse={onClose}
              onSelectThread={(id) => {
                rest.onSelectThread(id)
                onClose()
              }}
              onNewThread={() => {
                rest.onNewThread()
                onClose()
              }}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
