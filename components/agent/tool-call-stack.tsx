"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon, ArrowUp01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { ToolCallCard, type ToolCallStatus } from "@/components/agent/tool-call-card"
import { getToolNameFromPart, type ToolMessagePart } from "@/components/agent/tool-grouping"

interface ToolCallStackProps {
  /** Ordered tool parts of a single `tool-run` segment from `groupToolParts`. */
  parts: readonly ToolMessagePart[]
  /** Start expanded instead of collapsed (collapse only applies to runs of 3+). */
  defaultExpanded?: boolean
}

interface DerivedToolInfo {
  toolName: string
  status: ToolCallStatus
  input?: unknown
  output?: unknown
  errorText?: string
}

function readField(part: ToolMessagePart, key: string): unknown {
  return key in part ? (part as Record<string, unknown>)[key] : undefined
}

function statusFromState(state: string): ToolCallStatus {
  if (state === "output-available") return "success"
  if (state === "output-error" || state === "output-denied") return "error"
  return "pending"
}

function deriveToolInfo(part: ToolMessagePart): DerivedToolInfo | null {
  const toolName = getToolNameFromPart(part)
  if (toolName === null) return null

  const rawState = readField(part, "state")
  if (typeof rawState !== "string") return null

  const status = statusFromState(rawState)
  const input = readField(part, "input")
  const output = readField(part, "output")
  const errorTextRaw = readField(part, "errorText")
  const errorText = typeof errorTextRaw === "string" ? errorTextRaw : undefined

  return {
    toolName,
    status,
    input,
    output: status === "success" ? output : undefined,
    errorText: status === "error" ? errorText ?? "Échec de l'exécution de l'outil." : undefined,
  }
}

function ToolRow({ info, index }: { info: DerivedToolInfo; index: number }) {
  return (
    <ToolCallCard
      key={`${info.toolName}-${index}`}
      toolName={info.toolName}
      status={info.status}
      input={info.input}
      output={info.output}
      errorText={info.errorText}
      defaultOpen={info.status === "error"}
    />
  )
}

export function ToolCallStack({ parts, defaultExpanded = false }: ToolCallStackProps) {
  const infos = React.useMemo(() => {
    const result: DerivedToolInfo[] = []
    parts.forEach((part) => {
      const info = deriveToolInfo(part)
      if (info) result.push(info)
    })
    return result
  }, [parts])

  const [expanded, setExpanded] = React.useState(defaultExpanded)

  if (infos.length === 0) return null

  // Short runs: render every step as a quiet floating row, no collapsing.
  if (infos.length < 3) {
    return (
      <div className="space-y-0.5">
        {infos.map((info, index) => (
          <ToolRow key={`${info.toolName}-${index}`} info={info} index={index} />
        ))}
      </div>
    )
  }

  const first = infos[0]
  const last = infos[infos.length - 1]
  const middle = infos.slice(1, -1)
  const hiddenCount = middle.length

  return (
    <div className="space-y-0.5">
      <ToolRow info={first} index={0} />

      <AnimatePresence initial={false} mode="wait">
        {expanded ? (
          <motion.div
            key="middle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">
              {middle.map((info, index) => (
                <ToolRow key={`${info.toolName}-${index + 1}`} info={info} index={index + 1} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <StackToggle
              variant="expand"
              hiddenCount={hiddenCount}
              onClick={() => setExpanded(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ToolRow info={last} index={infos.length - 1} />

      {expanded && (
        <StackToggle variant="collapse" hiddenCount={hiddenCount} onClick={() => setExpanded(false)} />
      )}
    </div>
  )
}

interface StackToggleProps {
  variant: "expand" | "collapse"
  hiddenCount: number
  onClick: () => void
}

function StackToggle({ variant, hiddenCount, onClick }: StackToggleProps) {
  const isExpand = variant === "expand"

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        isExpand
          ? `Afficher les ${hiddenCount} étapes intermédiaires`
          : "Réduire les étapes intermédiaires"
      }
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-muted-foreground transition-colors",
        "hover:bg-muted/50 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      )}
    >
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        <HugeiconsIcon
          icon={isExpand ? MoreHorizontalIcon : ArrowUp01Icon}
          className="h-3.5 w-3.5"
          strokeWidth={2}
        />
      </span>
      <span className="text-xs font-medium">
        {isExpand ? `… ${hiddenCount} de plus` : "Réduire les étapes"}
      </span>
      <span className="ml-2 h-px flex-1 bg-border/60" aria-hidden="true" />
    </button>
  )
}
