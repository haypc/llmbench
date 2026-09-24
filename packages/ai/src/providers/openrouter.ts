import type { ProviderConfig } from '../types'
import { OpenAIProvider } from './openai'

export class OpenRouterProvider extends OpenAIProvider {
  name = 'openrouter'
  constructor(config: ProviderConfig) {
    super({ ...config, baseUrl: config.baseUrl ?? 'https://openrouter.ai/api/v1' })
  }
  async listModels(): Promise<string[]> {
    return ['openai/gpt-4o', 'anthropic/claude-3-5-sonnet', 'google/gemini-pro-1.5', 'meta-llama/llama-3.1-405b-instruct', 'mistralai/mistral-large']
  }
}
