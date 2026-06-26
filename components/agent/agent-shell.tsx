"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, PanelLeftOpenIcon } from "@hugeicons/core-free-icons"

import { useAgentChat } from "@/hooks/use-agent-chat"
import { AgentHeader } from "./agent-header"
import { Composer } from "./composer"
import { EmptyAgentState } from "./empty-agent-state"
import { MessageList } from "./message-list"
import { MessageListSkeleton } from "./agent-skeletons"
import { PlanHud } from "./plan-hud"
import { selectLatestPlan } from "./plan-selector"
import { ThreadDrawer } from "./thread-drawer"
import { ThreadPanel } from "./thread-panel"

interface AgentShellProps {
  userKey: string | number | null
  userName: string | null
  initialThreadId: number | null
}

const HISTORY_COLLAPSED_PREFIX = "intelliconnect:agent:history-collapsed:"
const RAIL_WIDTH = 52
const PANEL_WIDTH = 272

const historyCollapseListeners = new Set<() => void>()

function readHistoryCollapsed(storageKey: string): boolean {
  try {
    return window.localStorage.getItem(storageKey) === "1"
  } catch {
    return false
  }
}

function useHistoryCollapsed(
  userKey: string | number | null,
): readonly [boolean, (next: boolean) => void] {
  const storageKey = `${HISTORY_COLLAPSED_PREFIX}${userKey ?? "anon"}`

  const subscribe = React.useCallback((onStoreChange: () => void) => {
    historyCollapseListeners.add(onStoreChange)
    window.addEventListener("storage", onStoreChange)
    return () => {
      historyCollapseListeners.delete(onStoreChange)
      window.removeEventListener("storage", onStoreChange)
    }
  }, [])

  const getSnapshot = React.useCallback(() => readHistoryCollapsed(storageKey), [storageKey])
  const getServerSnapshot = React.useCallback(() => false, [])

  const collapsed = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0")
      } catch {
        // Storage may be unavailable (private mode); ignore.
      }
      for (const listener of historyCollapseListeners) listener()
    },
    [storageKey],
  )

  return [collapsed, setCollapsed] as const
}

export function AgentShell({ userKey, userName, initialThreadId }: AgentShellProps) {
  const chat = useAgentChat(userKey, initialThreadId)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const reduceMotion = useReducedMotion()
  const [historyCollapsed, setHistoryCollapsed] = useHistoryCollapsed(userKey)

  const activeThread = React.useMemo(
    () => chat.threads.find((thread) => thread.id === chat.activeThreadId) ?? null,
    [chat.threads, chat.activeThreadId],
  )

  const plan = React.useMemo(() => selectLatestPlan(chat.messages), [chat.messages])

  const handleSelect = React.useCallback(
    (id: number) => {
      setDrawerOpen(false)
      void chat.loadThread(id)
    },
    [chat],
  )

  const handleNewThread = React.useCallback(() => {
    setDrawerOpen(false)
    chat.startNewThread()
  }, [chat])

  const handleSubmit = React.useCallback(
    (value: string) => {
      void chat.submitPrompt(value)
    },
    [chat],
  )

  const showEmptyState =
    !chat.isThreadLoading && chat.messages.length === 0 && chat.pendingUserText === null

  const listProps = {
    threads: chat.threads,
    activeThreadId: chat.activeThreadId,
    pinnedIds: chat.pinnedIds,
    isLoading: chat.isThreadsLoading,
    error: chat.threadsError,
    deletingThreadId: chat.deletingThreadId,
    renamingThreadId: chat.renamingThreadId,
    onSelect: handleSelect,
    onRename: chat.renameThread,
    onTogglePin: chat.togglePin,
    onDelete: chat.deleteThread,
    onRetry: () => void chat.retryThreads(),
    onNewThread: handleNewThread,
  }

  return (
    <div className="-m-6 flex h-[calc(100dvh-4rem)] min-h-[480px] overflow-hidden bg-background">
      <motion.aside
        aria-label="Historique des conversations"
        className="relative hidden shrink-0 overflow-hidden border-r border-border bg-card lg:block"
        initial={false}
        animate={{ width: historyCollapsed ? RAIL_WIDTH : PANEL_WIDTH }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence initial={false}>
          {historyCollapsed ? (
            <motion.div
              key="rail"
              className="absolute inset-y-0 left-0 flex w-13 flex-col items-center gap-1.5 py-3"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setHistoryCollapsed(false)}
                aria-label="Afficher les conversations"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <HugeiconsIcon icon={PanelLeftOpenIcon} className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNewThread}
                aria-label="Nouvelle conversation"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="panel"
              className="absolute inset-y-0 left-0 flex h-full w-[272px] flex-col"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
            >
              <ThreadPanel
                {...listProps}
                onCollapse={() => setHistoryCollapsed(true)}
                className="h-full w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      <ThreadDrawer open={drawerOpen} onOpenChange={setDrawerOpen} {...listProps} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <AgentHeader
          activeThreadId={chat.activeThreadId}
          threadTitle={activeThread?.title ?? null}
          messageCount={chat.messages.length}
          onOpenDrawer={() => setDrawerOpen(true)}
          onNewThread={handleNewThread}
        />

        {plan ? (
          <div className="z-20 shrink-0 border-b border-border/60 bg-background/80 px-3 py-2">
            <PlanHud plan={plan} />
          </div>
        ) : null}

        {chat.isThreadLoading ? (
          <div className="flex-1 overflow-y-auto">
            <MessageListSkeleton />
          </div>
        ) : showEmptyState ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyAgentState userName={userName} />
          </div>
        ) : (
          <MessageList
            messages={chat.messages}
            isStreaming={chat.isStreaming}
            pendingUserText={chat.pendingUserText}
            threadError={chat.threadError}
            onRetry={chat.regenerate}
            onSuggestionClick={handleSubmit}
          />
        )}

        <Composer
          value={chat.input}
          onChange={chat.setInput}
          onSubmit={handleSubmit}
          onStop={chat.stop}
          isStreaming={chat.isStreaming}
          isBusy={chat.isBusy}
          disabled={chat.isThreadLoading}
          textareaRef={chat.textareaRef}
          showSuggestions={showEmptyState}
          onSuggestionSelect={handleSubmit}
        />
      </div>
    </div>
  )
}
