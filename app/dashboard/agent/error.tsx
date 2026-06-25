"use client"

import * as React from "react"
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type AgentErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

function getFriendlyMessage(error: Error): string {
  if (error.message.includes("Maximum update depth exceeded")) {
    return "L'assistant a rencontré une boucle de rendu interne. Il a été mis en pause pour vous permettre de réessayer sans risque."
  }
  return "L'assistant IA a rencontré un problème inattendu. Vous pouvez recharger la page ou revenir au tableau de bord et réessayer."
}

export default function AgentError({ error, reset }: AgentErrorProps) {
  React.useEffect(() => {
    console.error("Agent route error:", error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Assistant IA en pause</AlertTitle>
          <AlertDescription>{getFriendlyMessage(error)}</AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={reset}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Réessayer
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
