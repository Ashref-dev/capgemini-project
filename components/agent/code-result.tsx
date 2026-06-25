"use client"

interface CodeResultProps {
  code: string
  result?: string
  language?: string
  error?: string
}

export function CodeResult({ code, result, language = "javascript", error }: CodeResultProps) {
  const trimmedCode = code.trim()
  const hasCode = trimmedCode.length > 0

  return (
    <div className="w-full max-w-4xl space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Exécution du code</h3>
        <span className="rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {language}
        </span>
      </div>

      {hasCode ? (
        <pre className="overflow-x-auto rounded-lg bg-muted px-4 py-3 text-sm text-foreground">
          <code className="font-mono">{code}</code>
        </pre>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          Aucun code à afficher.
        </div>
      )}

      {error ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
            Erreur
          </p>
          <pre className="overflow-x-auto rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <code className="font-mono">{error}</code>
          </pre>
        </div>
      ) : result ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Résultat
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
            <code className="font-mono">{result}</code>
          </pre>
        </div>
      ) : null}
    </div>
  )
}
