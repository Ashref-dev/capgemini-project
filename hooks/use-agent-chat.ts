"use client"

import * as React from "react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useChat } from "@ai-sdk/react"

import { toast } from "@/components/ui/toast"
import type {
  ThreadListItem,
  ThreadMessageRecord,
  ThreadRecord,
} from "@/components/agent/types"

const PINNED_STORAGE_PREFIX = "intelliconnect:agent:pinned:"
const CHAT_INSTANCE_ID = "intelliconnect-agent"

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

export type AgentChatState = {
  messages: UIMessage[]
  threads: ThreadListItem[]
  activeThreadId: number | null
  input: string
  pinnedIds: number[]
  isThreadsLoading: boolean
  isThreadLoading: boolean
  threadsError: string | null
  threadError: string | null
  deletingThreadId: number | null
  renamingThreadId: number | null
  autoCreating: boolean
  pendingUserText: string | null
  isStreaming: boolean
  isBusy: boolean
}

export type AgentChatActions = {
  setInput: (value: string) => void
  fetchThreads: () => Promise<ThreadListItem[]>
  loadThread: (threadId: number) => Promise<void>
  startNewThread: () => void
  submitPrompt: (prompt: string) => Promise<void>
  deleteThread: (threadId: number) => Promise<void>
  renameThread: (threadId: number, title: string) => Promise<void>
  togglePin: (threadId: number) => void
  stop: () => void
  regenerate: () => void
  retryThreads: () => Promise<void>
}

export type UseAgentChat = AgentChatState &
  AgentChatActions & {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
  }

export function useAgentChat(
  userKey: string | number | null,
  initialThreadId?: number | null,
): UseAgentChat {
  const [input, setInput] = React.useState("")
  const [threads, setThreads] = React.useState<ThreadListItem[]>([])
  const [activeThreadId, setActiveThreadId] = React.useState<number | null>(null)
  const [pinnedIds, setPinnedIds] = React.useState<number[]>([])
  const [isThreadsLoading, setIsThreadsLoading] = React.useState(true)
  const [isThreadLoading, setIsThreadLoading] = React.useState(false)
  const [threadsError, setThreadsError] = React.useState<string | null>(null)
  const [threadError, setThreadError] = React.useState<string | null>(null)
  const [deletingThreadId, setDeletingThreadId] = React.useState<number | null>(null)
  const [renamingThreadId, setRenamingThreadId] = React.useState<number | null>(null)
  const [autoCreating, setAutoCreating] = React.useState(false)
  const [pendingUserText, setPendingUserText] = React.useState<string | null>(null)

  const loadedThreadRef = React.useRef<number | null>(null)
  const draftsRef = React.useRef<Map<number | "new", string>>(new Map())
  const setMessagesRef = React.useRef<
    (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void
  >(() => {})
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, setMessages, status, stop, regenerate } = useChat({
    id: CHAT_INSTANCE_ID,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (error) => toast.error("Erreur agent", { description: error.message }),
  })

  React.useEffect(() => {
    setMessagesRef.current = setMessages
  }, [setMessages])

  const isStreaming = status === "submitted" || status === "streaming"
  const isBusy = isStreaming || autoCreating

  // Pinned threads persisted client-side (no schema change required).
  const storageKey = React.useMemo(
    () => (userKey != null ? `${PINNED_STORAGE_PREFIX}${userKey}` : null),
    [userKey],
  )

  React.useEffect(() => {
    if (!storageKey) return
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) {
        setPinnedIds(parsed.filter((value): value is number => typeof value === "number"))
      }
    } catch {
      // Ignore malformed local storage; pins are non-critical.
    }
  }, [storageKey])

  const persistPins = React.useCallback(
    (next: number[]) => {
      if (!storageKey) return
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // Storage may be unavailable (private mode); ignore.
      }
    },
    [storageKey],
  )

  const togglePin = React.useCallback(
    (threadId: number) => {
      setPinnedIds((prev) => {
        const next = prev.includes(threadId)
          ? prev.filter((id) => id !== threadId)
          : [...prev, threadId]
        persistPins(next)
        return next
      })
    },
    [persistPins],
  )

  const fetchThreads = React.useCallback(async () => {
    try {
      const res = await fetch("/api/chat/threads", { credentials: "include" })
      const data = await readJson<{ threads: ThreadListItem[] }>(res)
      setThreads(data.threads)
      setThreadsError(null)
      return data.threads
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger les conversations."
      setThreadsError(msg)
      return []
    }
  }, [])

  const loadThread = React.useCallback(
    async (threadId: number) => {
      // Preserve the current draft before switching away.
      const currentKey: number | "new" = activeThreadId ?? "new"
      draftsRef.current.set(currentKey, input)

      setIsThreadLoading(true)
      setThreadError(null)
      try {
        const res = await fetch(`/api/chat/threads/${threadId}`, { credentials: "include" })
        const data = await readJson<{ thread: ThreadRecord; messages: ThreadMessageRecord[] }>(res)
        setActiveThreadId(data.thread.id)
        setMessagesRef.current(data.messages.map(toUIMessage))
        loadedThreadRef.current = data.thread.id
        setInput(draftsRef.current.get(data.thread.id) ?? "")
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Impossible de charger la conversation."
        setThreadError(msg)
        toast.error("Chargement impossible", { description: msg })
      } finally {
        setIsThreadLoading(false)
      }
    },
    [activeThreadId, input],
  )

  const startNewThread = React.useCallback(() => {
    const currentKey: number | "new" = activeThreadId ?? "new"
    draftsRef.current.set(currentKey, input)
    setActiveThreadId(null)
    setMessagesRef.current([])
    loadedThreadRef.current = null
    setThreadError(null)
    setInput(draftsRef.current.get("new") ?? "")
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [activeThreadId, input])

  React.useEffect(() => {
    let mounted = true
    void (async () => {
      setIsThreadsLoading(true)
      const next = await fetchThreads()
      if (!mounted) return
      if (next.length > 0) {
        const requested =
          initialThreadId != null && next.some((thread) => thread.id === initialThreadId)
            ? initialThreadId
            : (next[0]?.id ?? null)
        if (requested !== null && loadedThreadRef.current !== requested) {
          await loadThread(requested)
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
    // Run once on mount; loadThread/fetchThreads are stable enough for this bootstrap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    const current = url.searchParams.get("thread")
    if (activeThreadId == null) {
      if (current === null) return
      url.searchParams.delete("thread")
    } else {
      if (current === String(activeThreadId)) return
      url.searchParams.set("thread", String(activeThreadId))
    }
    window.history.replaceState(window.history.state, "", url)
  }, [activeThreadId])

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
      draftsRef.current.delete(threadId ?? "new")
      draftsRef.current.delete("new")
      setInput("")

      if (!threadId) {
        setPendingUserText(text)
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
          setPendingUserText(null)
          return
        }
        setAutoCreating(false)
      }

      setPendingUserText(null)
      await sendMessage({ text }).catch(() => undefined)
    },
    [activeThreadId, fetchThreads, isBusy, sendMessage],
  )

  const deleteThread = React.useCallback(
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
        if (pinnedIds.includes(threadId)) {
          togglePin(threadId)
        }
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
    [activeThreadId, fetchThreads, loadThread, pinnedIds, togglePin],
  )

  const renameThread = React.useCallback(
    async (threadId: number, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return
      const previous = threads
      // Optimistic update.
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, title: trimmed } : t)))
      setRenamingThreadId(threadId)
      try {
        const res = await fetch(`/api/chat/threads/${threadId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed }),
        })
        await readJson<{ thread: ThreadRecord }>(res)
        toast.success("Conversation renommée")
      } catch (e) {
        // Rollback optimistic change.
        setThreads(previous)
        const msg = e instanceof Error ? e.message : "Renommage impossible."
        toast.error("Erreur", { description: msg })
      } finally {
        setRenamingThreadId(null)
      }
    },
    [threads],
  )

  return {
    messages,
    threads,
    activeThreadId,
    input,
    pinnedIds,
    isThreadsLoading,
    isThreadLoading,
    threadsError,
    threadError,
    deletingThreadId,
    renamingThreadId,
    autoCreating,
    pendingUserText,
    isStreaming,
    isBusy,
    setInput,
    fetchThreads,
    loadThread,
    startNewThread,
    submitPrompt,
    deleteThread,
    renameThread,
    togglePin,
    stop,
    regenerate,
    retryThreads: async () => {
      setIsThreadsLoading(true)
      await fetchThreads()
      setIsThreadsLoading(false)
    },
    textareaRef,
  }
}
