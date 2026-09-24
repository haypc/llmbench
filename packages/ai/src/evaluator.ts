type EvalInput = {
  input: string
  output: string
  expectedOutput?: string
  model?: string
  criteria?: string
  judgeProvider?: (messages: { role: string; content: string }[]) => Promise<string>
}

type EvalResult = {
  score: number
  reasoning: string
  criteriaScores: Record<string, number>
}

export async function evaluate(input: EvalInput): Promise<EvalResult> {
  // Basic heuristic evaluation
  const output = input.output
  const words = output.trim().split(/\s+/).length
  const score = Math.min(words / 50, 1)
  return { score, reasoning: `Response has ${words} words`, criteriaScores: { completeness: score, relevance: score } }
}

export class LLMEvaluator {
  async evaluate(args: { input: string; output: string; criteria: Record<string, unknown>; model: string }): Promise<EvalResult> {
    return evaluate(args)
  }
}
