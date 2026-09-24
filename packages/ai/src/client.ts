import type { AIProvider } from './types'
import type { LLMMessage, LLMParameters, LLMResponse, StreamChunk } from '@llmbench/types'

export class AIClient {
  private providers = new Map<string, AIProvider>()
  private fallback?: string

  registerProvider(name: string, provider: AIProvider) {
    this.providers.set(name, provider)
  }

  setFallback(providerName: string) {
    this.fallback = providerName
  }

  getProvider(name: string): AIProvider {
    const provider = this.providers.get(name)
    if (!provider) throw new Error(`Provider "${name}" not registered`)
    return provider
  }

  async chat(provider: string, messages: LLMMessage[], params?: LLMParameters): Promise<LLMResponse> {
    return this.getProvider(provider).chat(messages, params)
  }

  async *stream(provider: string, messages: LLMMessage[], params?: LLMParameters): AsyncGenerator<StreamChunk> {
    yield* this.getProvider(provider).stream(messages, params)
  }

  async embed(provider: string, text: string, model?: string): Promise<number[]> {
    return this.getProvider(provider).embed(text, model)
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}
