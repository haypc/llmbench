import type { LLMMessage, LLMParameters, LLMResponse, StreamChunk } from '@llmbench/types'

export interface AIProvider {
  name: string
  chat(messages: LLMMessage[], params?: LLMParameters): Promise<LLMResponse>
  stream(messages: LLMMessage[], params?: LLMParameters): AsyncGenerator<StreamChunk>
  embed(text: string, model?: string): Promise<number[]>
  listModels(): Promise<string[]>
  isAvailable(): Promise<boolean>
}

export type ProviderConfig = {
  apiKey: string
  baseUrl?: string
  organization?: string
  timeout?: number
  maxRetries?: number
}
