export type MetricName =
  | 'accuracy' | 'relevance' | 'coherence' | 'fluency' | 'factuality'
  | 'hallucination_rate' | 'toxicity' | 'bias' | 'safety' | 'instruction_following'
  | 'completeness' | 'conciseness' | 'creativity' | 'sentiment' | 'latency' | 'cost'

export type MetricResult = {
  name: MetricName
  score: number
  explanation?: string
  confidence?: number
  raw?: unknown
}

export type EvalResult = {
  id: string; runItemId: string; type: 'AUTOMATIC' | 'LLM_JUDGE' | 'HUMAN'
  metrics: MetricResult[]; overallScore: number
  summary?: string; judgeModel?: string; createdAt: Date
}

export type ArenaMatch = {
  id: string; modelA: string; modelB: string; input: string
  outputA: string; outputB: string; winnerId?: string; isDraw?: boolean
  ratingDelta: { a: number; b: number }
}

export type EloRating = {
  modelId: string; rating: number; wins: number; losses: number; ties: number; category: string
}

export type RedTeamAttack = {
  id: string; name: string
  category: 'jailbreak' | 'injection' | 'pii' | 'toxicity' | 'bias' | 'encoding'
  description: string; template: string
  severity: 'low' | 'medium' | 'high' | 'critical'; tags: string[]
}

export type RedTeamResult = {
  attackId: string; modelId: string; input: string; output: string
  isSuccessful: boolean; severity?: string; explanation: string
}
