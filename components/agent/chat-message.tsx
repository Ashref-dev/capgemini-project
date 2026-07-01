"use client"

import * as React from "react"
import Link from "next/link"
import type { UIMessage } from "ai"
import { Streamdown } from "streamdown"
import "streamdown/styles.css"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { BarChart } from "./bar-chart"
import { ClarificationPrompt } from "./clarification-prompt"
import { CodeResult } from "./code-result"
import { InteractiveTable } from "./interactive-table"
import { LineChart } from "./line-chart"
import { MethodologyHeader } from "./methodology-header"
import { PieChart } from "./pie-chart"
import { ReportPreview, type ReportChart } from "./report-preview"
import { ToolCallCard } from "./tool-call-card"
import { ToolCallStack } from "./tool-call-stack"
import { groupToolParts } from "./tool-grouping"
import {
  cn,
  isInternalDashboardHref,
  isNavigableHref,
  stripInlineDocumentCitations,
  stripNonNavigableLinks,
} from "@/lib/utils"

export { isInternalDashboardHref } from "@/lib/utils"

interface ChatMessageProps {
  message: UIMessage
  isStreaming?: boolean
  onSuggestionClick?: (text: string) => void
}

interface LegacyToolInvocation {
  toolName: string
  args?: unknown
  state?: string
  result?: unknown
}

interface LegacyToolPart {
  type: "tool-invocation"
  toolInvocation: LegacyToolInvocation
}

interface ToolPartInfo {
  toolName: string
  input?: unknown
  output?: unknown
  errorText?: string
  status: "pending" | "success" | "error"
}

function getToolInfoFromState(
  toolName: string,
  state: string,
  input: unknown,
  output: unknown,
  errorText?: unknown
): ToolPartInfo {
  if (state === "output-available") {
    return {
      toolName,
      input,
      output,
      status: "success",
    }
  }

  if (state === "output-error" || state === "output-denied") {
    return {
      toolName,
      input,
      errorText: typeof errorText === "string" ? errorText : "Échec de l'exécution de l'outil.",
      status: "error",
    }
  }

  return {
    toolName,
    input,
    status: "pending",
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isLegacyToolPart(part: unknown): part is LegacyToolPart {
  return (
    isRecord(part) &&
    part.type === "tool-invocation" &&
    isRecord(part.toolInvocation) &&
    typeof part.toolInvocation.toolName === "string"
  )
}

function getModernToolPartInfo(part: unknown): ToolPartInfo | null {
  if (!isRecord(part) || typeof part.type !== "string") {
    return null
  }

  if (part.type === "dynamic-tool") {
    const toolName = typeof part.toolName === "string" ? part.toolName : null

    if (!toolName || typeof part.state !== "string") {
      return null
    }

    return getToolInfoFromState(
      toolName,
      part.state,
      part.input,
      part.output,
      part.errorText
    )
  }

  if (!part.type.startsWith("tool-") || typeof part.state !== "string") {
    return null
  }

  return getToolInfoFromState(part.type.slice(5), part.state, part.input, part.output, part.errorText)
}

function getToolPartInfo(part: unknown): ToolPartInfo | null {
  if (isLegacyToolPart(part)) {
    const state = part.toolInvocation.state

    if (state === "result") {
      return {
        toolName: part.toolInvocation.toolName,
        input: part.toolInvocation.args,
        output: part.toolInvocation.result,
        status: "success",
      }
    }

    return {
      toolName: part.toolInvocation.toolName,
      input: part.toolInvocation.args,
      status: "pending",
    }
  }

  return getModernToolPartInfo(part)
}

function isBarChartPayload(value: unknown): value is React.ComponentProps<typeof BarChart> {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    Array.isArray(value.data)
  )
}

function isLineChartPayload(value: unknown): value is React.ComponentProps<typeof LineChart> {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    Array.isArray(value.data)
  )
}

function isPieChartPayload(value: unknown): value is React.ComponentProps<typeof PieChart> {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    Array.isArray(value.data)
  )
}

function isInteractiveTablePayload(
  value: unknown
): value is React.ComponentProps<typeof InteractiveTable> {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    Array.isArray(value.columns) &&
    Array.isArray(value.data)
  )
}

function isCodeResultPayload(value: unknown): value is React.ComponentProps<typeof CodeResult> {
  return isRecord(value) && typeof value.code === "string"
}

function isReportPreviewPayload(value: unknown): value is React.ComponentProps<typeof ReportPreview> {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.markdown === "string" &&
    typeof value.topic === "string" &&
    typeof value.generatedAt === "string"
  )
}

function stringifyJson(value: unknown) {
  if (value === undefined) {
    return "undefined"
  }

  try {
    const serialized = JSON.stringify(value, null, 2)
    return serialized ?? "undefined"
  } catch {
    return String(value)
  }
}

function hashString(value: string | undefined) {
  const normalizedValue = typeof value === "string" ? value : String(value ?? "undefined")
  let hash = 0

  for (let index = 0; index < normalizedValue.length; index += 1) {
    hash = (hash * 31 + normalizedValue.charCodeAt(index)) >>> 0
  }

  return hash.toString(36)
}

function getPartKey(part: unknown, messageId: string, fallback: string) {
  const serializedPart = stringifyJson(part)

  if (isRecord(part)) {
    if (typeof part.type === "string" && part.type === "text" && typeof part.text === "string") {
      return `${messageId}-text-${hashString(`${part.text}:${part.state ?? "done"}`)}`
    }

    const toolInfo = getToolPartInfo(part)

    if (toolInfo) {
      return `${messageId}-tool-${toolInfo.toolName}-${hashString(
        stringifyJson(toolInfo.input ?? toolInfo.output)
      )}`
    }
  }

  return `${messageId}-${fallback}-${hashString(serializedPart)}`
}

function renderToolResult(
  toolName: string,
  payload: unknown,
  onSuggestionClick?: (text: string) => void,
  reportCharts?: ReportChart[]
) {
  switch (toolName) {
    case "createBarChart":
      return isBarChartPayload(payload) ? <BarChart {...payload} /> : null
    case "createLineChart":
      return isLineChartPayload(payload) ? <LineChart {...payload} /> : null
    case "createPieChart":
      return isPieChartPayload(payload) ? <PieChart {...payload} /> : null
    case "createTable":
      return isInteractiveTablePayload(payload) ? <InteractiveTable {...payload} /> : null
    case "generateReport":
      return isReportPreviewPayload(payload) ? <ReportPreview {...payload} charts={reportCharts} /> : null
    case "executeCode":
    case "runCode":
    case "createCodeResult":
      return isCodeResultPayload(payload) ? <CodeResult {...payload} /> : null
    case "declareMethodology":
      return isMethodologyPayload(payload) ? <MethodologyHeader {...payload} /> : null
    case "createPlan":
      // Plan rendering is owned by the floating PlanHud overlay; suppress the
      // inline duplicate so the HUD is the single canonical plan surface.
      return null
    case "askClarification":
      // Owned by the pinned clarification bar above the composer (single
      // canonical surface), so suppress the inline duplicate.
      return null
    default:
      return null
  }
}

function isMethodologyPayload(value: unknown): value is React.ComponentProps<typeof MethodologyHeader> {
  return (
    isRecord(value) &&
    Array.isArray(value.methodologies) &&
    value.methodologies.every((m) => typeof m === "string")
  )
}

function isClarificationPayload(value: unknown): value is React.ComponentProps<typeof ClarificationPrompt> {
  return isRecord(value) && typeof value.question === "string"
}

const linkClassName = "text-primary underline underline-offset-4 hover:text-primary/80"

const markdownComponents = {
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("leading-6 [&:not(:first-child)]:mt-2", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("ml-4 list-disc space-y-1", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("ml-4 list-decimal space-y-1", className)} {...props} />
  ),
  a: ({ className, href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!isNavigableHref(href)) {
      return <span className={cn("font-medium text-muted-foreground", className)}>{children}</span>
    }

    if (isInternalDashboardHref(href)) {
      return (
        <Link href={href} className={cn(linkClassName, className)}>
          {children}
        </Link>
      )
    }

    return (
      <a
        className={cn(linkClassName, className)}
        href={href}
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  },
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]", className)} {...props} />
  ),
  pre: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    let text = ""
    React.Children.forEach(children, (child) => {
      if (typeof child === "string") {
        text += child
      } else if (React.isValidElement(child)) {
        const p = child.props as { children?: React.ReactNode }
        if (typeof p.children === "string") {
          text += p.children
        } else {
          React.Children.forEach(p.children, (gc) => {
            if (typeof gc === "string") text += gc
          })
        }
      }
    })

    const trimmed = text.trim()
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>
        const action = typeof parsed.action === "string" ? parsed.action : ""
        const title = typeof parsed.title === "string" ? parsed.title : "Graphique"
        const description = typeof parsed.description === "string" ? parsed.description : undefined

        if ((action === "create_bar_chart" || action === "createBarChart") && Array.isArray(parsed.data)) {
          return <BarChart title={title} data={parsed.data as React.ComponentProps<typeof BarChart>["data"]} description={description} />
        }
        if ((action === "create_line_chart" || action === "createLineChart") && Array.isArray(parsed.data)) {
          return <LineChart title={title} data={parsed.data as React.ComponentProps<typeof LineChart>["data"]} description={description} />
        }
        if ((action === "create_pie_chart" || action === "createPieChart") && Array.isArray(parsed.data)) {
          return <PieChart title={title} data={parsed.data as React.ComponentProps<typeof PieChart>["data"]} description={description} />
        }
        if ((action === "create_table" || action === "createTable") && Array.isArray(parsed.data) && Array.isArray(parsed.columns)) {
          return <InteractiveTable title={title} columns={parsed.columns as React.ComponentProps<typeof InteractiveTable>["columns"]} data={parsed.data as React.ComponentProps<typeof InteractiveTable>["data"]} description={description} />
        }
      } catch {}
    }

    return <pre className={cn("overflow-x-auto rounded-lg bg-muted p-3 text-xs", className)}>{children}</pre>
  },
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className={cn("border-l-2 border-border pl-3 italic text-muted-foreground", className)} {...props} />
  ),
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn("mt-3 text-base font-semibold", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("mt-3 text-sm font-semibold", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("mt-2.5 text-sm font-semibold", className)} {...props} />
  ),
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(() => {
    void navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      },
      () => setCopied(false),
    )
  }, [text])

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copié" : "Copier la réponse"}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="h-3.5 w-3.5" />
      {copied ? "Copié" : "Copier"}
    </button>
  )
}

export function ChatMessage({ message, isStreaming, onSuggestionClick }: ChatMessageProps) {
  const isUser = message.role === "user"

  const textContent = React.useMemo(
    () =>
      message.parts
        .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
        .map((part) => part.text)
        .join("\n\n")
        .trim(),
    [message.parts],
  )

  // Hooks must run unconditionally: compute segments before the user-branch
  // early return so the hook order is stable across renders.
  const segments = React.useMemo(() => groupToolParts(message.parts), [message.parts])

  const reportCharts = React.useMemo<ReportChart[]>(() => {
    const collected: ReportChart[] = []
    for (const part of message.parts) {
      const info = getToolPartInfo(part)
      if (!info || info.status !== "success") continue
      const payload = info.output ?? info.input
      if (info.toolName === "createBarChart" && isBarChartPayload(payload)) {
        collected.push({ kind: "bar", payload })
      } else if (info.toolName === "createLineChart" && isLineChartPayload(payload)) {
        collected.push({ kind: "line", payload })
      } else if (info.toolName === "createPieChart" && isPieChartPayload(payload)) {
        collected.push({ kind: "pie", payload })
      }
    }
    return collected
  }, [message.parts])

  if (isUser) {
    return (
      <div className="ml-auto max-w-[85%] sm:max-w-[78%]">
        <div className="rounded-lg bg-primary px-3.5 py-2 text-sm text-primary-foreground shadow-sm">
          {message.parts.map((part) =>
            part.type === "text" ? (
              <p
                key={getPartKey(part, message.id, String(part.type))}
                className="whitespace-pre-wrap leading-6"
              >
                {part.text}
              </p>
            ) : null,
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="group w-full space-y-2.5">
      {segments.map((segment, segmentIndex) => {
        if (segment.kind === "tool-run") {
          const firstPart = segment.parts[0]
          const runKey = `${segmentIndex}-${getPartKey(firstPart, message.id, `tool-run-${segmentIndex}`)}`

          return <ToolCallStack key={runKey} parts={segment.parts} />
        }

        const part = segment.part
        const partKey = `${segmentIndex}-${getPartKey(part, message.id, String(part.type))}`

        if (part.type === "text") {
          return (
            <div key={partKey} className="text-sm leading-6 text-foreground">
              <Streamdown
                components={markdownComponents}
                animated={Boolean(isStreaming)}
                linkSafety={{ enabled: false }}
              >
                {stripInlineDocumentCitations(stripNonNavigableLinks(part.text))}
              </Streamdown>
            </div>
          )
        }

        const toolInfo = getToolPartInfo(part)

        if (!toolInfo) {
          return null
        }

        if (toolInfo.toolName === "createPlan") {
          return null
        }

        if (toolInfo.status === "success") {
          const renderedTool = renderToolResult(
            toolInfo.toolName,
            toolInfo.output ?? toolInfo.input,
            onSuggestionClick,
            reportCharts,
          )

          if (renderedTool) {
            return React.cloneElement(renderedTool, { key: partKey })
          }
        }

        return (
          <ToolCallCard
            key={partKey}
            toolName={toolInfo.toolName}
            status={toolInfo.status}
            input={toolInfo.input}
            output={toolInfo.output}
            errorText={toolInfo.errorText}
            defaultOpen={toolInfo.status === "error"}
          />
        )
      })}

      {!isStreaming && textContent.length > 0 ? (
        <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <CopyButton text={textContent} />
        </div>
      ) : null}
    </div>
  )
}
