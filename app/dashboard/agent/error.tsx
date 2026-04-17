"use client"

import * as React from "react"
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/frontend/components/ui/alert"
import { Button } from "@/frontend/components/ui/button"

type AgentErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

function getFriendlyMessage(error: Error) {
  if (error.message.includes("Maximum update depth exceeded")) {
    return "The AI panel hit an internal render loop. It has been paused so you can retry safely."
  }

  return "The AI agent hit an unexpected problem. You can retry the page or return to the dashboard and try again."
}

export default function AgentError({ error, reset }: AgentErrorProps) {
  React.useEffect(() => {
    console.error("Agent route error:", error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4">
        <Alert variant="destructive">
          <AlertTitle>AI Agent paused</AlertTitle>
          <AlertDescription>{getFriendlyMessage(error)}</AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={reset} className="bg-blue-600 text-white hover:bg-blue-700">
            Retry agent
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}