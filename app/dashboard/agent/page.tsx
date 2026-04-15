"use client"

import * as React from "react"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiChat02Icon, SentIcon } from "@hugeicons/core-free-icons"
import { motion } from "framer-motion"

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

export default function AgentPage() {
  const { user, loading } = useAuth()
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
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

  const submitPrompt = React.useCallback(
    async (prompt: string) => {
      const nextPrompt = prompt.trim()

      if (!nextPrompt || isLoading) {
        return
      }

      setInput("")
      await sendMessage({ text: nextPrompt })
    },
    [isLoading, sendMessage]
  )

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
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
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <div className="border-b border-border bg-card/70 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10">
            <HugeiconsIcon icon={AiChat02Icon} className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Partnership Analyst</h1>
            <p className="text-xs text-muted-foreground">Powered by IntelliConnect AI</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
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
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => (
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
        ))}

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
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white hover:bg-blue-700"
            aria-label="Send message"
          >
            <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
