import type { UIMessage } from "ai"

export const RICH_TOOL_NAMES: ReadonlySet<string> = new Set([
  "createBarChart",
  "createLineChart",
  "createPieChart",
  "createTable",
  "generateReport",
  "executeCode",
  "runCode",
  "createCodeResult",
  "declareMethodology",
  "createPlan",
  "askClarification",
])

export type ToolMessagePart = UIMessage["parts"][number]

export type ToolSegment =
  | { readonly kind: "passthrough"; readonly part: ToolMessagePart }
  | { readonly kind: "tool-run"; readonly parts: readonly ToolMessagePart[]; readonly collapsible: boolean }

function hasToolState(part: ToolMessagePart): part is ToolMessagePart & { readonly state: string } {
  return "state" in part && typeof part.state === "string"
}

export function getToolNameFromPart(part: ToolMessagePart): string | null {
  if (!hasToolState(part)) {
    return null
  }

  if (part.type === "dynamic-tool") {
    return part.toolName
  }

  if (part.type.startsWith("tool-")) {
    return part.type.slice(5)
  }

  return null
}

export function groupToolParts(parts: ReadonlyArray<ToolMessagePart>): ToolSegment[] {
  const segments: ToolSegment[] = []
  let currentRun: ToolMessagePart[] = []

  const flushCurrentRun = () => {
    if (currentRun.length === 0) {
      return
    }

    segments.push({
      kind: "tool-run",
      parts: currentRun,
      collapsible: currentRun.length >= 3,
    })
    currentRun = []
  }

  for (const part of parts) {
    const toolName = getToolNameFromPart(part)
    const isGenericTool = toolName !== null && !RICH_TOOL_NAMES.has(toolName)

    if (isGenericTool) {
      currentRun.push(part)
      continue
    }

    flushCurrentRun()
    segments.push({ kind: "passthrough", part })
  }

  flushCurrentRun()

  return segments
}
