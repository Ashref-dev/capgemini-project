"use client"

import * as React from "react"

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

export function AgentShell({ userKey, userName, initialThreadId }: AgentShellProps) {
  const chat = useAgentChat(userKey, initialThreadId)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

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
      <ThreadPanel
        {...listProps}
        className="hidden w-[272px] shrink-0 border-r border-border lg:flex"
      />

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
          <div className="relative z-20 shrink-0 px-3 pt-3 md:pointer-events-none md:absolute md:left-3 md:top-[4.25rem] md:px-0 md:pt-0">
            <div className="md:pointer-events-auto">
              <PlanHud plan={plan} />
            </div>
          </div>
        ) : null}

        {chat.isThreadLoading ? (
          <div className="flex-1 overflow-y-auto">
            <MessageListSkeleton />
          </div>
        ) : showEmptyState ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyAgentState userName={userName} onSelect={handleSubmit} disabled={chat.isBusy} />
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
        />
      </div>
    </div>
  )
}
