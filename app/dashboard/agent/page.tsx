"use client"

import * as React from "react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useChat } from "@ai-sdk/react"
import {
  Add01Icon,
  AiChat02Icon,
  ClockIcon,
  Delete02Icon,
  Menu01Icon,
  MessageEdit01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "framer-motion"

import { ChatMessage } from "@/frontend/components/agent/chat-message"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { useAuth } from "@/frontend/hooks/use-auth"
import { cn } from "@/frontend/lib/utils"

const suggestions = [
  "Show me a breakdown of partners by category",
  "Who are the top 10 partners by revenue?",
  "Predict which partners are at risk of churning",
  "Score partner BIAT for compatibility",
  "Recommend partners for recruiting Cloud engineers",
]

type ThreadListItem = {
  id: number
  title: string | null
  createdAt: string | Date
  updatedAt: string | Date
  messageCount: number
}

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
  if (!isRecord(value) || typeof value.type !== "string") {
    return false
  }

  if (value.type === "text") {
    return typeof value.text === "string"
  }

  return true
}

function getMessageParts(message: ThreadMessageRecord): UIMessage["parts"] {
  const storedParts = Array.isArray(message.parts)
    ? message.parts.filter(isUIMessagePart)
    : []

  const hasTextPart = storedParts.some((part) => part.type === "text")

  if (hasTextPart || !message.content) {
    return storedParts
  }

  return [{ type: "text", text: message.content }, ...storedParts]
}

function toUIMessage(message: ThreadMessageRecord): UIMessage {
  return {
    id: String(message.id),
    role: message.role as UIMessage["role"],
    parts: getMessageParts(message),
  }
}

function getThreadLabel(title: string | null) {
  const normalizedTitle = title?.trim()
  return normalizedTitle && normalizedTitle.length > 0 ? normalizedTitle : "Nouvelle conversation"
}

function getRelativeDateLabel(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue"
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDiff = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return "À l'instant"
  }

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`
  }

  if (diffHours < 24 && dayDiff === 0) {
    return `Il y a ${diffHours} h`
  }

  if (dayDiff === 1) {
    return "Hier"
  }

  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    day: "numeric",
  }).format(date)
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | T
    | { error?: string }
    | null

  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Une erreur est survenue."

    throw new Error(errorMessage)
  }

  if (payload === null) {
    throw new Error("Réponse serveur invalide")
  }

  return payload as T
}

export default function AgentPage() {
  const { user, loading } = useAuth()
  const [input, setInput] = React.useState("")
  const [threads, setThreads] = React.useState<ThreadListItem[]>([])
  const [activeThreadId, setActiveThreadId] = React.useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isThreadsLoading, setIsThreadsLoading] = React.useState(true)
  const [isThreadLoading, setIsThreadLoading] = React.useState(false)
  const [isCreatingThread, setIsCreatingThread] = React.useState(false)
  const [deletingThreadId, setDeletingThreadId] = React.useState<number | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const loadedThreadRef = React.useRef<number | null>(null)

  const { messages, sendMessage, setMessages, status } = useChat({
    id: activeThreadId ? String(activeThreadId) : "new-chat",
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (error) => {
      toast.error("Agent Error", { description: error.message })
    },
  })

  const isLoading = status === "submitted" || status === "streaming"

  React.useEffect(() => {
    if (messages.length === 0 && status === "ready") {
      return
    }

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status])

  const fetchThreads = React.useCallback(async () => {
    try {
      const response = await fetch("/api/chat/threads", {
        method: "GET",
        credentials: "include",
      })

      const data = await readJsonResponse<{ threads: ThreadListItem[] }>(response)
      setThreads(data.threads)
      return data.threads
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger les conversations."
      toast.error("Chargement impossible", { description: message })
      return []
    }
  }, [])

  const loadThread = React.useCallback(
    async (threadId: number) => {
      setIsThreadLoading(true)

      try {
        const response = await fetch(`/api/chat/threads/${threadId}`, {
          method: "GET",
          credentials: "include",
        })

        const data = await readJsonResponse<{
          thread: ThreadRecord
          messages: ThreadMessageRecord[]
        }>(response)

        setActiveThreadId(data.thread.id)
        setMessages(data.messages.map(toUIMessage))
        loadedThreadRef.current = data.thread.id
        setIsSidebarOpen(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Impossible de charger la conversation."
        toast.error("Chargement impossible", { description: message })
      } finally {
        setIsThreadLoading(false)
      }
    },
    [setMessages]
  )

  const createNewThread = React.useCallback(async () => {
    if (isCreatingThread) {
      return
    }

    setIsCreatingThread(true)

    try {
      const response = await fetch("/api/chat/threads", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Nouvelle conversation" }),
      })

      const data = await readJsonResponse<{ thread: ThreadRecord }>(response)

      setActiveThreadId(data.thread.id)
      setMessages([])
      loadedThreadRef.current = data.thread.id
      setInput("")
      setIsSidebarOpen(false)

      await fetchThreads()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de créer une conversation."
      toast.error("Création impossible", { description: message })
    } finally {
      setIsCreatingThread(false)
    }
  }, [fetchThreads, isCreatingThread, setMessages])

  React.useEffect(() => {
    let isMounted = true

    void (async () => {
      setIsThreadsLoading(true)
      const nextThreads = await fetchThreads()

      if (!isMounted) {
        return
      }

      if (nextThreads.length > 0) {
        const firstThreadId = nextThreads[0]?.id ?? null

        if (firstThreadId !== null && loadedThreadRef.current !== firstThreadId) {
          await loadThread(firstThreadId)
        }
      } else {
        setActiveThreadId(null)
        setMessages([])
        loadedThreadRef.current = null
      }

      if (isMounted) {
        setIsThreadsLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [fetchThreads, loadThread, setMessages])

  React.useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      void fetchThreads()
    }
  }, [fetchThreads, messages.length, status])

  const submitPrompt = React.useCallback(
    async (prompt: string) => {
      const nextPrompt = prompt.trim()

      if (!nextPrompt || isLoading) {
        return
      }

      if (!activeThreadId) {
        toast.warning("Conversation requise", {
          description: "Créez ou chargez une conversation avant d'envoyer un message.",
        })
        return
      }

      setInput("")
      await sendMessage({ text: nextPrompt })
    },
    [activeThreadId, isLoading, sendMessage]
  )

  const handleSubmit = React.useCallback(
    async (event: { preventDefault: () => void }) => {
      event.preventDefault()
      await submitPrompt(input)
    },
    [input, submitPrompt]
  )

  const handleSuggestionClick = React.useCallback(
    async (suggestion: string) => {
      await submitPrompt(suggestion)
    },
    [submitPrompt]
  )

  const handleDeleteThread = React.useCallback(
    async (threadId: number) => {
      const thread = threads.find((item) => item.id === threadId)
      if (!thread) {
        return
      }

      const confirmed = window.confirm(
        `Supprimer la conversation \"${getThreadLabel(thread.title)}\" ? Cette action est irréversible.`
      )

      if (!confirmed) {
        return
      }

      setDeletingThreadId(threadId)

      try {
        const response = await fetch("/api/chat/threads", {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ threadId }),
        })

        await readJsonResponse<{ success: boolean }>(response)
        const nextThreads = await fetchThreads()

        if (activeThreadId === threadId) {
          const nextThreadId = nextThreads[0]?.id ?? null

          if (nextThreadId) {
            await loadThread(nextThreadId)
          } else {
            setActiveThreadId(null)
            setMessages([])
            loadedThreadRef.current = null
          }
        }

        toast.success("Conversation supprimée", {
          description: "Le fil de discussion a été retiré de votre historique.",
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Impossible de supprimer la conversation."
        toast.error("Suppression impossible", { description: message })
      } finally {
        setDeletingThreadId(null)
      }
    },
    [activeThreadId, fetchThreads, loadThread, setMessages, threads]
  )

  const sidebarContent = (
    <>
      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent p-4">
        <Button
          type="button"
          onClick={() => void createNewThread()}
          disabled={isCreatingThread}
          className="w-full justify-start gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          {isCreatingThread ? <Spinner size="sm" /> : <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />}
          Nouvelle conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {isThreadsLoading ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-4 text-sm text-muted-foreground">
              <Spinner size="sm" />
              Chargement des conversations...
            </div>
          ) : null}

          {!isThreadsLoading && threads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/70 px-4 py-6 text-center">
              <HugeiconsIcon icon={MessageEdit01Icon} className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">Aucune conversation enregistrée</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Démarrez un nouveau chat pour créer votre premier historique.
              </p>
            </div>
          ) : null}

          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId
            const isDeleting = deletingThreadId === thread.id

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => void loadThread(thread.id)}
                className={cn(
                  "group flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                  isActive
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-card/60 hover:bg-muted/60"
                )}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                  <HugeiconsIcon icon={MessageEdit01Icon} className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                      {getThreadLabel(thread.title)}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 cursor-pointer text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation()
                        void handleDeleteThread(thread.id)
                      }}
                      disabled={isDeleting}
                      aria-label="Supprimer la conversation"
                    >
                      {isDeleting ? <Spinner size="sm" /> : <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <HugeiconsIcon icon={ClockIcon} className="h-3.5 w-3.5" />
                      {getRelativeDateLabel(thread.updatedAt)}
                    </span>
                    <span>{thread.messageCount} message{thread.messageCount > 1 ? "s" : ""}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-[calc(100vh-5.5rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <motion.aside
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="hidden w-72 flex-col border-r border-border bg-card/50 lg:flex"
      >
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {isSidebarOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fermer l'historique des conversations"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card shadow-xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <div className="border-b border-border bg-card/70 px-4 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Ouvrir l'historique des conversations"
              >
                <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10">
                <HugeiconsIcon icon={AiChat02Icon} className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">AI Partnership Analyst</h1>
                <p className="text-xs text-muted-foreground">Powered by IntelliConnect AI</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="hidden cursor-pointer items-center gap-2 sm:inline-flex lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <HugeiconsIcon icon={MessageEdit01Icon} className="h-4 w-4" />
              Historique
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {isThreadLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Spinner />
              <p className="text-sm text-muted-foreground">Chargement de la conversation...</p>
            </div>
          ) : null}

          {!isThreadLoading && messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <HugeiconsIcon icon={AiChat02Icon} className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h2 className="mb-2 text-lg font-medium text-muted-foreground">IntelliConnect AI Agent</h2>
              <p className="mb-6 max-w-md text-sm text-muted-foreground/70">
                Ask me anything about your partnership data. I can analyze partners,
                predict churn, score applications, and create visualizations.
              </p>
              <div className="flex max-w-2xl flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void handleSuggestionClick(suggestion)}
                    className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    disabled={isLoading || isThreadLoading || !activeThreadId}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!isThreadLoading
            ? messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={cn(
                    message.role === "user" ? "flex justify-end" : "flex justify-start"
                  )}
                >
                  <ChatMessage message={message} />
                </motion.div>
              ))
            : null}

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner size="sm" />
              <span className="text-sm">Analyzing...</span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border bg-card/70 p-4 backdrop-blur-sm">
          <form onSubmit={(event) => void handleSubmit(event)} className="flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about partners, analytics, predictions..."
              className="flex-1"
              disabled={isLoading || isThreadLoading || !activeThreadId}
            />
            <Button
              type="submit"
              disabled={isLoading || isThreadLoading || !input.trim() || !activeThreadId}
              className="bg-blue-600 text-white hover:bg-blue-700"
              aria-label="Send message"
            >
              <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
