const OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings"
const OPENROUTER_EMBED_MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free"
export const OPENROUTER_DIMENSIONS = 2048
const MAX_BATCH_SIZE = 64

type OpenRouterEmbeddingResponse = {
  object: string
  model: string
  data: Array<{
    object: "embedding"
    index: number
    embedding: number[]
  }>
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export class EmbeddingError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: string,
  ) {
    super(message)
    this.name = "EmbeddingError"
  }
}

async function callOpenRouter(inputs: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENROUTER_KEY
  if (!apiKey) {
    throw new EmbeddingError("OPENROUTER_KEY missing — set it in .env to use embeddings")
  }

  const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://capgemini-intelliconnect.app",
      "X-OpenRouter-Title": "IntelliConnect",
    },
    body: JSON.stringify({
      model: OPENROUTER_EMBED_MODEL,
      input: inputs,
      encoding_format: "float",
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "<unable to read body>")
    throw new EmbeddingError(
      `OpenRouter embeddings failed: ${response.status} ${response.statusText}`,
      response.status,
      body,
    )
  }

  const json = (await response.json()) as OpenRouterEmbeddingResponse

  if (!json.data || json.data.length !== inputs.length) {
    throw new EmbeddingError(
      `OpenRouter embeddings: expected ${inputs.length} results, got ${json.data?.length ?? 0}`,
    )
  }

  return [...json.data].sort((a, b) => a.index - b.index).map((d) => d.embedding)
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const results: number[][] = []
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const embeddings = await callOpenRouter(texts.slice(i, i + MAX_BATCH_SIZE))
    results.push(...embeddings)
  }
  return results
}

export async function embedQuery(query: string): Promise<number[]> {
  if (!query || typeof query !== "string") {
    throw new EmbeddingError("embedQuery: query must be a non-empty string")
  }

  const result = await callOpenRouter([query])
  const embedding = result[0]
  if (!embedding || embedding.length === 0) {
    throw new EmbeddingError("embedQuery: empty embedding returned from OpenRouter")
  }
  return embedding
}
