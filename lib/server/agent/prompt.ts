// LangSmith Hub prompt management was removed intentionally. To re-add it in the
// future, pull the prompt from LangSmith Hub here (via `langchain/hub` with
// LANGSMITH_API_KEY) and cache it, falling back to the local prompt on failure.
export async function loadSystemPrompt(localFallback: string): Promise<{ text: string; version: string }> {
  return { text: localFallback, version: "local" }
}
