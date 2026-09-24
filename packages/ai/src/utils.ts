export function calculateCost(inputTokens: number, outputTokens: number, inputPricePer1k: number, outputPricePer1k: number): number {
  return (inputTokens / 1000) * inputPricePer1k + (outputTokens / 1000) * outputPricePer1k
}

export function countTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function estimateCost(text: string, inputPricePer1k: number, outputPricePer1k: number, estimatedOutputTokens = 500): number {
  return calculateCost(countTokens(text), estimatedOutputTokens, inputPricePer1k, outputPricePer1k)
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return `$${(usd * 1000).toFixed(3)}m`
  if (usd < 1) return `$${usd.toFixed(4)}`
  return `$${usd.toFixed(2)}`
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
