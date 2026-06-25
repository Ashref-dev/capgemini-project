import type { FlexibleSchema, Tool, ToolExecuteFunction } from "ai"

import { withTimeout } from "../utils"

export const DEFAULT_TOOL_TIMEOUT_MS = 15_000
export const HEAVY_TOOL_TIMEOUT_MS = 20_000
export type ToolTimeoutError = { error: "L'outil a mis trop de temps à répondre. Veuillez réessayer." }
export const TOOL_TIMEOUT_ERROR: ToolTimeoutError = { error: "L'outil a mis trop de temps à répondre. Veuillez réessayer." }

export type TimeoutWrappedTool<INPUT, OUTPUT> = {
  description?: string
  inputSchema: FlexibleSchema<INPUT>
  execute: ToolExecuteFunction<INPUT, OUTPUT | ToolTimeoutError>
}

function isAsyncIterable<OUTPUT>(value: unknown): value is AsyncIterable<OUTPUT> {
  return typeof value === "object" && value !== null && Symbol.asyncIterator in value
}

export function withToolTimeout<INPUT, OUTPUT>(
  toolName: string,
  sourceTool: Tool<INPUT, OUTPUT>,
  timeoutMs = DEFAULT_TOOL_TIMEOUT_MS
): TimeoutWrappedTool<INPUT, OUTPUT> {
  const execute: ToolExecuteFunction<INPUT, OUTPUT | ToolTimeoutError> = async (input, options) => {
    try {
      const sourceExecute = sourceTool.execute

      if (!sourceExecute) {
        return TOOL_TIMEOUT_ERROR
      }

      const resultPromise = Promise.resolve(sourceExecute(input, options)).then((result) => {
        if (isAsyncIterable<OUTPUT>(result)) {
          throw new Error(`${toolName} returned an unsupported streamed result`)
        }

        return result
      })

      return await withTimeout(resultPromise, timeoutMs, toolName)
    } catch {
      return TOOL_TIMEOUT_ERROR
    }
  }

  return {
    description: sourceTool.description,
    inputSchema: sourceTool.inputSchema,
    execute,
  }
}
