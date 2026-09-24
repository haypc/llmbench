import type { AIProvider, ProviderConfig } from '../types'
import type { LLMMessage, LLMParameters, LLMResponse, StreamChunk } from '@llmbench/types'

export class GroqProvider implements AIProvider {
  name = 'groq'
  private apiKey: string
  private baseUrl = 'https://api.groq.com/openai/v1'
  constructor(config: ProviderConfig) { this.apiKey = config.apiKey }
  private get headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` } }

  async chat(messages: LLMMessage[], params: LLMParameters = {}): Promise<LLMResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, { method: 'POST', headers: this.headers, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: messages.map(m => ({ role: m.role, content: m.content })), temperature: params.temperature, max_tokens: params.maxTokens }) })
    const data = await res.json()
    return { id: data.id, model: data.model, choices: data.choices.map((c: any) => ({ index: c.index, message: { role: c.message.role, content: c.message.content }, finishReason: c.finish_reason })), usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens }, created: data.created }
  }

  async *stream(messages: LLMMessage[], params: LLMParameters = {}): AsyncGenerator<StreamChunk> {
    const result = await this.chat(messages, params)
    yield { id: result.id, delta: result.choices[0].message.content as string, done: true }
  }

  async embed(): Promise<number[]> { throw new Error('Groq does not support embeddings') }
  async listModels(): Promise<string[]> { return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] }
  async isAvailable(): Promise<boolean> { return Boolean(this.apiKey) }
}
