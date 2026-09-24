import { z } from 'zod'

export const PLAN_LIMITS = {
  FREE: { maxRuns: 100, maxTokens: 1_000_000, maxUsers: 3, maxModels: 5, maxStorage: 1024 * 1024 * 1024, maxTestCases: 100 },
  PRO: { maxRuns: 1000, maxTokens: 10_000_000, maxUsers: 10, maxModels: 20, maxStorage: 10 * 1024 * 1024 * 1024, maxTestCases: 1000 },
  TEAM: { maxRuns: 10_000, maxTokens: 100_000_000, maxUsers: 50, maxModels: 100, maxStorage: 100 * 1024 * 1024 * 1024, maxTestCases: 10000 },
  ENTERPRISE: { maxRuns: Infinity, maxTokens: Infinity, maxUsers: Infinity, maxModels: Infinity, maxStorage: Infinity, maxTestCases: Infinity },
} as const

export const SUPPORTED_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1', 'o1-mini'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] },
  { id: 'gemini', name: 'Google Gemini', models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro'] },
  { id: 'mistral', name: 'Mistral AI', models: ['mistral-large-latest', 'mistral-medium', 'codestral-latest'] },
  { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
  { id: 'openrouter', name: 'OpenRouter', models: ['openai/gpt-4o', 'anthropic/claude-3-5-sonnet', 'google/gemini-pro-1.5'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3.2', 'mistral', 'codellama', 'phi3', 'gemma2'] },
] as const

export const EVAL_METRICS = [
  { id: 'relevance', name: 'Relevance', description: 'How relevant the response is to the input' },
  { id: 'accuracy', name: 'Accuracy', description: 'Factual correctness' },
  { id: 'coherence', name: 'Coherence', description: 'Logical flow and consistency' },
  { id: 'fluency', name: 'Fluency', description: 'Grammar and readability' },
  { id: 'safety', name: 'Safety', description: 'Free from harmful content' },
  { id: 'completeness', name: 'Completeness', description: 'Thoroughness of the response' },
  { id: 'instruction_following', name: 'Instruction Following', description: 'Adherence to instructions' },
  { id: 'hallucination_rate', name: 'Hallucination Rate', description: 'Rate of made-up information' },
] as const

export const QUEUE_NAMES = {
  RUNS: 'llmbench:runs',
  EVALS: 'llmbench:evals',
  WEBHOOKS: 'llmbench:webhooks',
  EMBEDDINGS: 'llmbench:embeddings',
  EMAILS: 'llmbench:emails',
  RED_TEAM: 'llmbench:red-team',
} as const

export const DEFAULT_LLM_PARAMS = {
  temperature: 1.0,
  topP: 1.0,
  maxTokens: 2048,
  frequencyPenalty: 0,
  presencePenalty: 0,
} as const

export const RED_TEAM_CATEGORIES = [
  { id: 'jailbreak', name: 'Jailbreak', description: 'Attempts to bypass safety guidelines', severity: 'high' },
  { id: 'injection', name: 'Prompt Injection', description: 'Malicious instruction injection', severity: 'high' },
  { id: 'pii', name: 'PII Extraction', description: 'Attempts to extract personal information', severity: 'critical' },
  { id: 'toxicity', name: 'Toxicity', description: 'Tests for harmful or offensive output', severity: 'critical' },
  { id: 'encoding', name: 'Encoding Bypass', description: 'Uses encoding to bypass filters', severity: 'medium' },
  { id: 'bias', name: 'Bias Testing', description: 'Tests for discriminatory behavior', severity: 'medium' },
] as const
