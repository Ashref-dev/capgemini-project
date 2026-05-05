"use client"

import * as React from "react"
import type { UIMessage } from "ai"
import { Streamdown } from "streamdown"
import "streamdown/styles.css"

import { AnalysisPlan } from "./analysis-plan"
import { BarChart } from "./bar-chart"
import { ClarificationPrompt } from "./clarification-prompt"
import { CodeResult } from "./code-result"
import { InteractiveTable } from "./interactive-table"
import { LineChart } from "./line-chart"
import { MethodologyHeader } from "./methodology-header"
import { PieChart } from "./pie-chart"
import { ReportPreview } from "./report-preview"
import { ToolCallCard } from "./tool-call-card"
import { cn } from "@/frontend/lib/utils"

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
      errorText: typeof errorText === "string" ? errorText : "Tool execution failed.",
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
  onSuggestionClick?: (text: string) => void
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
      return isReportPreviewPayload(payload) ? <ReportPreview {...payload} /> : null
    case "executeCode":
    case "runCode":
    case "createCodeResult":
      return isCodeResultPayload(payload) ? <CodeResult {...payload} /> : null
    case "declareMethodology":
      return isMethodologyPayload(payload) ? <MethodologyHeader {...payload} /> : null
    case "createPlan":
      return isPlanPayload(payload) ? <AnalysisPlan {...payload} /> : null
    case "askClarification":
      return isClarificationPayload(payload) ? (
        <ClarificationPrompt {...payload} onSelect={onSuggestionClick} />
      ) : null
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

function isPlanPayload(value: unknown): value is React.ComponentProps<typeof AnalysisPlan> {
  return (
    isRecord(value) &&
    typeof value.objective === "string" &&
    Array.isArray(value.steps) &&
    value.steps.every(
      (s) =>
        isRecord(s) &&
        typeof s.id === "string" &&
        typeof s.title === "string" &&
        typeof s.status === "string"
    )
  )
}

function isClarificationPayload(value: unknown): value is React.ComponentProps<typeof ClarificationPrompt> {
  return isRecord(value) && typeof value.question === "string"
}

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
  a: ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={cn("text-primary underline underline-offset-4 hover:text-primary/80", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]", className)} {...props} />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className={cn("overflow-x-auto rounded-lg bg-muted p-3 text-xs", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className={cn("border-l-2 border-primary/40 pl-3 italic text-muted-foreground", className)} {...props} />
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

export function ChatMessage({ message, isStreaming, onSuggestionClick }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("w-full", isUser ? "max-w-xl" : "max-w-4xl")}>
      <div
        className={cn(
          "space-y-2",
          isUser
            ? "rounded-xl bg-blue-600 px-3 py-2 text-sm text-white shadow-sm"
            : "space-y-2"
        )}
      >
        {message.parts.map((part) => {
          const partKey = getPartKey(part, message.id, String(part.type))

          if (part.type === "text") {
            return isUser ? (
              <p key={partKey} className="whitespace-pre-wrap leading-5">
                {part.text}
              </p>
            ) : (
              <div
                key={partKey}
                className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm"
              >
                <Streamdown
                  components={markdownComponents}
                  animated={Boolean(isStreaming)}
                >
                  {part.text}
                </Streamdown>
              </div>
            )
          }

          const toolInfo = getToolPartInfo(part)

          if (!toolInfo) {
            return null
          }

          if (toolInfo.status === "success") {
            const renderedTool = renderToolResult(
              toolInfo.toolName,
              toolInfo.output ?? toolInfo.input,
              onSuggestionClick
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
      </div>
    </div>
  )
}
