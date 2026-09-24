export type EmbeddingsConfig = {
  provider: string
  apiKey: string
  model?: string
}

export class EmbeddingsClient {
  private config: EmbeddingsConfig
  constructor(config: EmbeddingsConfig) { this.config = config }

  async embed(text: string): Promise<{ values: number[] }> {
    // OpenAI embeddings via fetch
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.config.apiKey}` },
      body: JSON.stringify({ model: this.config.model || 'text-embedding-3-small', input: text }),
    })
    const data = await res.json()
    return { values: data.data[0].embedding }
  }
}

export async function generateEmbedding(text: string, embedFn: (text: string) => Promise<number[]>): Promise<number[]> {
  return embedFn(text)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; magA += a[i] * a[i]; magB += b[i] * b[i] }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}
