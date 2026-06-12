"use client"

import * as React from "react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useChat } from "@ai-sdk/react"
import {
  AiChat02Icon,
  Menu01Icon,
  SentIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "framer-motion"

import { ChatMessage } from "@/components/agent/chat-message"
import { AgentSidebar, AgentMobileSidebar, type ThreadListItem } from "@/components/agent/agent-sidebar"
import { AgentEmptyState } from "@/components/agent/agent-empty-state"
import { AgentThinking } from "@/components/agent/agent-thinking"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

type ThreadMessageRecord = {
  id: number
  role: string
  content: string | null
  parts: unknown
  createdAt: string | Date
}

type ThreadRecord = {
  id: number
  title: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isUIMessagePart(value: unknown): value is UIMessage["parts"][number] {
  if (!isRecord(value) || typeof value.type !== "string") return false
  if (value.type === "text") return typeof value.text === "string"
  return true
}

function getMessageParts(message: ThreadMessageRecord): UIMessage["parts"] {
  const storedParts = Array.isArray(message.parts) ? message.parts.filter(isUIMessagePart) : []
  const hasTextPart = storedParts.some((part) => part.type === "text")
  if (hasTextPart || !message.content) return storedParts
  return [{ type: "text", text: message.content }, ...storedParts]
}

function toUIMessage(message: ThreadMessageRecord): UIMessage {
  return {
    id: String(message.id),
    role: message.role as UIMessage["role"],
    parts: getMessageParts(message),
  }
}

function deriveTitle(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ")
  if (trimmed.length === 0) return "Nouvelle conversation"
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null
  if (!response.ok) {
    const msg =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Une erreur est survenue."
    throw new Error(msg)
  }
  if (payload === null) throw new Error("Réponse serveur invalide")
  return payload as T
}

export default function AgentPage() {
  const { user, loading } = useAuth()
  const [input, setInput] = React.useState("")
  const [threads, setThreads] = React.useState<ThreadListItem[]>([])
  const [activeThreadId, setActiveThreadId] = React.useState<number | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isThreadsLoading, setIsThreadsLoading] = React.useState(true)
  const [isThreadLoading, setIsThreadLoading] = React.useState(false)
  const [deletingThreadId, setDeletingThreadId] = React.useState<number | null>(null)
  const [autoCreating, setAutoCreating] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const loadedThreadRef = React.useRef<number | null>(null)
  const setMessagesRef = React.useRef<(messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void>(() => {})
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, setMessages, status } = useChat({
    id: activeThreadId ? String(activeThreadId) : "new-chat",
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (error) => toast.error("Erreur agent", { description: error.message }),
  })

  React.useEffect(() => {
    setMessagesRef.current = setMessages
  }, [setMessages])

  const isStreaming = status === "submitted" || status === "streaming"
  const isBusy = isStreaming || autoCreating

  React.useEffect(() => {
    if (scrollRef.current && (messages.length > 0 || isStreaming)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  const fetchThreads = React.useCallback(async () => {
    try {
      const res = await fetch("/api/chat/threads", { credentials: "include" })
      const data = await readJson<{ threads: ThreadListItem[] }>(res)
      setThreads(data.threads)
      return data.threads
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger les conversations."
      toast.error("Chargement impossible", { description: msg })
      return []
    }
  }, [])

  const loadThread = React.useCallback(async (threadId: number) => {
    setIsThreadLoading(true)
    try {
      const res = await fetch(`/api/chat/threads/${threadId}`, { credentials: "include" })
      const data = await readJson<{ thread: ThreadRecord; messages: ThreadMessageRecord[] }>(res)
      setActiveThreadId(data.thread.id)
      setMessagesRef.current(data.messages.map(toUIMessage))
      loadedThreadRef.current = data.thread.id
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger la conversation."
      toast.error("Chargement impossible", { description: msg })
    } finally {
      setIsThreadLoading(false)
    }
  }, [])

  const startNewThread = React.useCallback(() => {
    setActiveThreadId(null)
    setMessagesRef.current([])
    loadedThreadRef.current = null
    setInput("")
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [])

  React.useEffect(() => {
    let mounted = true
    void (async () => {
      setIsThreadsLoading(true)
      const next = await fetchThreads()
      if (!mounted) return
      if (next.length > 0) {
        const firstId = next[0]?.id ?? null
        if (firstId !== null && loadedThreadRef.current !== firstId) {
          await loadThread(firstId)
        }
      } else {
        setActiveThreadId(null)
        setMessagesRef.current([])
        loadedThreadRef.current = null
      }
      if (mounted) setIsThreadsLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [fetchThreads, loadThread])

  React.useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      void fetchThreads()
    }
  }, [fetchThreads, messages.length, status])

  const submitPrompt = React.useCallback(
    async (prompt: string) => {
      const text = prompt.trim()
      if (!text || isBusy) return

      let threadId = activeThreadId

      if (!threadId) {
        setAutoCreating(true)
        try {
          const res = await fetch("/api/chat/threads", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: deriveTitle(text) }),
          })
          const data = await readJson<{ thread: ThreadRecord }>(res)
          threadId = data.thread.id
          setActiveThreadId(threadId)
          loadedThreadRef.current = threadId
          await fetchThreads()
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Impossible de démarrer la conversation."
          toast.error("Erreur", { description: msg })
          setAutoCreating(false)
          return
        }
        setAutoCreating(false)
      }

      setInput("")
      await sendMessage({ text })
    },
    [activeThreadId, fetchThreads, isBusy, sendMessage],
  )

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      await submitPrompt(input)
    },
    [input, submitPrompt],
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        void submitPrompt(input)
      }
    },
    [input, submitPrompt],
  )

  const handleDeleteThread = React.useCallback(
    async (threadId: number) => {
      setDeletingThreadId(threadId)
      try {
        const res = await fetch("/api/chat/threads", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId }),
        })
        await readJson<{ success: boolean }>(res)
        const next = await fetchThreads()
        if (activeThreadId === threadId) {
          const fallback = next[0]?.id ?? null
          if (fallback) {
            await loadThread(fallback)
          } else {
            setActiveThreadId(null)
            setMessagesRef.current([])
            loadedThreadRef.current = null
          }
        }
        toast.success("Conversation supprimée")
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Suppression impossible."
        toast.error("Erreur", { description: msg })
      } finally {
        setDeletingThreadId(null)
      }
    },
    [activeThreadId, fetchThreads, loadThread],
  )

  const onSuggestionClick = React.useCallback(
    (text: string) => {
      void submitPrompt(text)
    },
    [submitPrompt],
  )

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5.5rem)] items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (!user) return null

  const userName = user.name ?? null
  const showEmptyState = !isThreadLoading && messages.length === 0

  return (
    <div className="flex h-[calc(100vh-5.5rem)] overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
      <AgentSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        isLoading={isThreadsLoading}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((v) => !v)}
        onSelectThread={(id) => void loadThread(id)}
        onNewThread={startNewThread}
        onDeleteThread={handleDeleteThread}
        deletingThreadId={deletingThreadId}
      />

      <AgentMobileSidebar
        open={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        isLoading={isThreadsLoading}
        onSelectThread={(id) => void loadThread(id)}
        onNewThread={startNewThread}
        onDeleteThread={handleDeleteThread}
        deletingThreadId={deletingThreadId}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex items-center justify-between gap-2 border-b border-border/60 bg-card/60 px-3 py-2 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Ouvrir l'historique"
            >
              <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4" />
            </Button>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-blue-500/10 ring-1 ring-primary/20">
              <HugeiconsIcon icon={AiChat02Icon} className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-semibold text-foreground sm:text-sm">
                IntelliConnect AI
              </h1>
              <p className="truncate text-[10px] text-muted-foreground">
                {activeThreadId
                  ? `#${activeThreadId} · ${messages.length} message${messages.length > 1 ? "s" : ""}`
                  : "Prêt à analyser vos données"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={startNewThread}
            className="h-7 gap-1.5 px-2 text-xs"
            aria-label="Nouvelle conversation"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nouvelle</span>
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {isThreadLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Spinner />
              <p className="text-sm text-muted-foreground">Chargement…</p>
            </div>
          ) : showEmptyState ? (
            <AgentEmptyState userName={userName} onSelect={onSuggestionClick} disabled={isBusy} />
          ) : (
            <div className="mx-auto max-w-4xl space-y-3 px-3 py-4 sm:px-5">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <ChatMessage
                    message={message}
                    isStreaming={isStreaming && message.role === "assistant"}
                    onSuggestionClick={(text) => void submitPrompt(text)}
                  />
                </motion.div>
              ))}

              <AnimatePresence>
                {(autoCreating || (isStreaming && messages[messages.length - 1]?.role === "user")) && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <AgentThinking />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 bg-card/60 px-3 py-2 backdrop-blur-sm sm:px-4">
          <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto flex max-w-4xl items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeThreadId
                    ? "Continuez… (Entrée pour envoyer · Maj+Entrée pour saut de ligne)"
                    : "Posez une question…"
                }
                rows={1}
                disabled={isBusy || isThreadLoading}
                className={cn(
                  "w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-all",
                  "focus:border-ring focus:ring-2 focus:ring-ring/40",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  "max-h-40 min-h-[40px]",
                )}
                style={{
                  height: "auto",
                  minHeight: 40,
                }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = "auto"
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={isBusy || isThreadLoading || !input.trim()}
              className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 p-0 text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
              aria-label="Envoyer"
            >
              {isStreaming ? (
                <Spinner size="sm" />
              ) : (
                <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="mx-auto mt-1.5 max-w-4xl text-center text-[10px] text-muted-foreground/50">
            Données réelles uniquement · zéro hallucination
          </p>
        </div>
      </div>
    </div>
  )
}
