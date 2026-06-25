"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { AgentShell } from "@/components/agent/agent-shell"
import { useAuth } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"

function parseThreadId(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function AgentPageContent() {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const initialThreadId = parseThreadId(searchParams.get("thread"))

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-7rem)] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) return null

  return (
    <AgentShell
      userKey={user.id}
      userName={user.name ?? null}
      initialThreadId={initialThreadId}
    />
  )
}

export default function AgentPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-[calc(100dvh-7rem)] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <AgentPageContent />
    </React.Suspense>
  )
}
