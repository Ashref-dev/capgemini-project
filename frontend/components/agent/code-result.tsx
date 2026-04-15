"use client"

interface CodeResultProps {
  code: string
  result?: string
  language?: string
}

export function CodeResult({ code, result, language = "javascript" }: CodeResultProps) {
  return (
    <div className="w-full max-w-4xl space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Code Execution</h3>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {language}
        </span>
      </div>

      <pre className="overflow-x-auto rounded-lg bg-muted px-4 py-3 text-sm text-foreground">
        <code className="font-mono">{code}</code>
      </pre>

      {result ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Output
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
            <code className="font-mono">{result}</code>
          </pre>
        </div>
      ) : null}
    </div>
  )
}
