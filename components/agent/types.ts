export type ThreadListItem = {
  id: number
  title: string | null
  createdAt: string | Date
  updatedAt: string | Date
  messageCount: number
}

export type ThreadMessageRecord = {
  id: number
  role: string
  content: string | null
  parts: unknown
  createdAt: string | Date
}

export type ThreadRecord = {
  id: number
  title: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export type ThreadFilter = "all" | "pinned" | "today" | "reports" | "rag" | "scoring"

export type AgentChatStatus = "ready" | "submitted" | "streaming" | "error"

export type PromptStarter = {
  id: string
  command: string
  label: string
  description: string
  prompt: string
}

export type SlashCommand = {
  trigger: string
  label: string
  description: string
  template: string
}
