"use client"

import * as React from "react"
import type { UIMessage } from "ai"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowReloadHorizontalIcon, Alert02Icon } from "@hugeicons/core-free-icons"

import { ChatMessage } from "./chat-message"
import { AgentThinking } from "./agent-thinking"
import { cn } from "@/lib/utils"

interface MessageListProps {
  messages: UIMessage[]
  isStreaming: boolean
  pendingUserText: string | null
  threadError: string | null
  onRetry: () => void
  onSuggestionClick: (text: string) => void
}

const BOTTOM_THRESHOLD = 96

function hasRenderableContent(message: UIMessage): boolean {
  return message.parts.some(
    (part) => (part.type === "text" && part.text.trim().length > 0) || part.type !== "text",
  )
}

export function MessageList({
  messages,
  isStreaming,
  pendingUserText,
  threadError,
  onRetry,
  onSuggestionClick,
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = React.useState(true)

  const lastMessage = messages.at(-1)
  const lastPart = lastMessage?.parts.at(-1)
  const isStreamingText = lastPart?.type === "text" && lastPart.text.trim().length > 0
  // Keep the "thinking" indicator alive between and after tool calls so the agent
  // never looks idle mid-run. Hide it only while text is the actively growing tail,
  // since that text already signals progress.
  const awaitingAssistant =
    pendingUserText !== null ||
    (isStreaming &&
      (!lastMessage || lastMessage.role === "user" || !hasRenderableContent(lastMessage) || !isStreamingText))

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior })
  }, [])

  const handleScroll = React.useCallback(() => {
    const node = scrollRef.current
    if (!node) return
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight
    setAtBottom(distance <= BOTTOM_THRESHOLD)
  }, [])

  React.useEffect(() => {
    if (atBottom) scrollToBottom(messages.length <= 1 ? "auto" : "smooth")
  }, [messages, pendingUserText, awaitingAssistant, atBottom, scrollToBottom])

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overscroll-contain scroll-smooth"
      >
        <div className="mx-auto flex w-full max-w-[840px] flex-col gap-6 px-4 py-6 sm:px-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={isStreaming && message.id === lastMessage?.id}
              onSuggestionClick={onSuggestionClick}
            />
          ))}

          {pendingUserText !== null ? (
            <div className="ml-auto max-w-[85%] sm:max-w-[78%]">
              <div className="rounded-lg bg-primary px-3.5 py-2 text-sm text-primary-foreground shadow-sm">
                <p className="whitespace-pre-wrap leading-6">{pendingUserText}</p>
              </div>
            </div>
          ) : null}

          {awaitingAssistant ? <AgentThinking className="px-0.5" /> : null}

          {threadError ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4" />
                {threadError}
              </div>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <HugeiconsIcon icon={ArrowReloadHorizontalIcon} className="h-3.5 w-3.5" />
                Réessayer
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToBottom("smooth")}
        aria-label="Aller au dernier message"
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-md transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          atBottom ? "pointer-events-none scale-95 opacity-0" : "scale-100 opacity-100",
        )}
      >
        <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />
      </button>
    </div>
  )
}
