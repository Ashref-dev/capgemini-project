import { APICallError } from "ai"

import { OPENROUTER_MODEL_ID } from "./config"
import { getErrorMessage, isRecord } from "./utils"

export function getOpenRouterStatusCode(error: unknown): number | undefined {
  if (APICallError.isInstance(error)) {
    return error.statusCode
  }

  if (!isRecord(error)) {
    return undefined
  }

  const statusCode = error.statusCode ?? error.status
  return typeof statusCode === "number" ? statusCode : undefined
}

export function extractOpenRouterMessage(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()

    if (!trimmed) {
      return null
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown
      return extractOpenRouterMessage(parsed) ?? trimmed
    } catch {
      return trimmed
    }
  }

  if (!isRecord(value)) {
    return null
  }

  if (typeof value.message === "string" && value.message.trim()) {
    return value.message.trim()
  }

  if (typeof value.error === "string" && value.error.trim()) {
    return value.error.trim()
  }

  if (isRecord(value.error)) {
    const nestedError = value.error

    if (typeof nestedError.message === "string" && nestedError.message.trim()) {
      return nestedError.message.trim()
    }

    if (isRecord(nestedError.metadata) && typeof nestedError.metadata.raw === "string") {
      const rawMessage = extractOpenRouterMessage(nestedError.metadata.raw)
      if (rawMessage) {
        return rawMessage
      }
    }
  }

  if (typeof value.detail === "string" && value.detail.trim()) {
    return value.detail.trim()
  }

  if (typeof value.responseBody === "string" && value.responseBody.trim()) {
    return extractOpenRouterMessage(value.responseBody)
  }

  return null
}

export function describeOpenRouterFailure(statusCode: number | undefined) {
  if (statusCode === 401 || statusCode === 403) {
    return "OpenRouter authentication failed"
  }

  if (statusCode === 404) {
    return "OpenRouter could not find the selected model"
  }

  if (statusCode === 408) {
    return "OpenRouter timed out"
  }

  if (statusCode === 429) {
    return "OpenRouter rate limit reached"
  }

  if (statusCode != null && statusCode >= 500) {
    return "OpenRouter provider outage"
  }

  return "OpenRouter request failed"
}

export function formatOpenRouterError(error: unknown) {
  const statusCode = getOpenRouterStatusCode(error)
  const failureLabel = describeOpenRouterFailure(statusCode)
  const providerMessage =
    extractOpenRouterMessage(APICallError.isInstance(error) ? error.data : undefined) ??
    extractOpenRouterMessage(error) ??
    getErrorMessage(error)

  if (statusCode === 401 || statusCode === 403) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (${statusCode}). Check OPENROUTER_KEY and provider access. ${providerMessage}`
  }

  if (statusCode === 404) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (404). The model may be unavailable or the model ID may be wrong. ${providerMessage}`
  }

  if (statusCode === 408) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (408). The provider took too long to respond. Please retry. ${providerMessage}`
  }

  if (statusCode === 429) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (429). Please wait a moment and retry. ${providerMessage}`
  }

  if (statusCode != null && statusCode >= 500) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (${statusCode}). OpenRouter or the upstream provider is having trouble. Try again later. ${providerMessage}`
  }

  if (statusCode != null) {
    return `${failureLabel} for ${OPENROUTER_MODEL_ID} (${statusCode}). ${providerMessage}`
  }

  return `${failureLabel} for ${OPENROUTER_MODEL_ID}. ${providerMessage}`
}
