"use client"

import * as React from "react"
import type { UIMessage } from "ai"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiChat02Icon } from "@hugeicons/core-free-icons"
import { Streamdown } from "streamdown"
import "streamdown/styles.css"

import { BarChart } from "./bar-chart"
import { CodeResult } from "./code-result"
import { InteractiveTable } from "./interactive-table"
import { LineChart } from "./line-chart"
import { PieChart } from "./pie-chart"
import { Spinner } from "@/frontend/components/ui/spinner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card"
import { cn } from "@/frontend/lib/utils"

interface ChatMessageProps {
  message: UIMessage
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

function stringifyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function hashString(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
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

function renderToolResult(toolName: string, payload: unknown) {
  switch (toolName) {
    case "createBarChart":
      return isBarChartPayload(payload) ? <BarChart {...payload} /> : null
    case "createLineChart":
      return isLineChartPayload(payload) ? <LineChart {...payload} /> : null
    case "createPieChart":
      return isPieChartPayload(payload) ? <PieChart {...payload} /> : null
    case "createTable":
      return isInteractiveTablePayload(payload) ? <InteractiveTable {...payload} /> : null
    case "executeCode":
    case "runCode":
    case "createCodeResult":
      return isCodeResultPayload(payload) ? <CodeResult {...payload} /> : null
    default:
      return null
  }
}

const markdownComponents = {
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-3", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("ml-5 list-disc space-y-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("ml-5 list-decimal space-y-2", className)} {...props} />
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
    <code className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]", className)} {...props} />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className={cn("overflow-x-auto rounded-xl bg-muted p-4", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className={cn("border-l-2 border-primary/40 pl-4 italic text-muted-foreground", className)} {...props} />
  ),
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("w-full", isUser ? "max-w-2xl" : "max-w-5xl")}>
      <div
        className={cn(
          "space-y-3",
          isUser
            ? "rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white shadow-sm"
            : "space-y-4"
        )}
      >
        {message.parts.map((part) => {
          const partKey = getPartKey(part, message.id, String(part.type))

          if (part.type === "text") {
            return isUser ? (
              <p key={partKey} className="whitespace-pre-wrap leading-6">
                {part.text}
              </p>
            ) : (
              <div
                key={partKey}
                className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm"
              >
                <Streamdown components={markdownComponents}>{part.text}</Streamdown>
              </div>
            )
          }

          const toolInfo = getToolPartInfo(part)

          if (!toolInfo) {
            return null
          }

          if (toolInfo.status === "pending") {
            return (
              <Card key={partKey} className="border-border/70 bg-card/95">
                <CardContent className="flex items-center gap-3 py-4">
                  <Spinner size="sm" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Running tool</p>
                    <p className="text-xs text-muted-foreground">{toolInfo.toolName}</p>
                  </div>
                </CardContent>
              </Card>
            )
          }

          if (toolInfo.status === "error") {
            return (
              <Card key={partKey} className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-sm">Tool failed: {toolInfo.toolName}</CardTitle>
                  <CardDescription>{toolInfo.errorText ?? "Tool execution failed."}</CardDescription>
                </CardHeader>
              </Card>
            )
          }

          const renderedTool = renderToolResult(
            toolInfo.toolName,
            toolInfo.output ?? toolInfo.input
          )

          if (renderedTool) {
            return React.cloneElement(renderedTool, { key: partKey })
          }

          return (
            <details
              key={partKey}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                  <HugeiconsIcon icon={AiChat02Icon} className="h-4 w-4" />
                </div>
                <span>Tool: {toolInfo.toolName}</span>
              </summary>
              <div className="border-t border-border bg-muted/20 px-4 py-3">
                <pre className="overflow-x-auto rounded-xl bg-background p-4 text-xs text-foreground">
                  <code>{stringifyJson(toolInfo.output ?? toolInfo.input)}</code>
                </pre>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
