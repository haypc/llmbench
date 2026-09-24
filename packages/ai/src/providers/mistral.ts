import type { AIProvider, ProviderConfig } from '../types'
import type { LLMMessage, LLMParameters, LLMResponse, StreamChunk } from '@llmbench/types'

export class MistralProvider implements AIProvider {
  name = 'mistral'
  private apiKey: string
  private baseUrl = 'https://api.mistral.ai/v1'
  constructor(config: ProviderConfig) { this.apiKey = config.apiKey }
  private get headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` } }

  async chat(messages: LLMMessage[], params: LLMParameters = {}): Promise<LLMResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, { method: 'POST', headers: this.headers, body: JSON.stringify({ model: 'mistral-large-latest', messages: messages.map(m => ({ role: m.role, content: m.content })), temperature: params.temperature, max_tokens: params.maxTokens }) })
    const data = await res.json()
    return { id: data.id, model: data.model, choices: data.choices.map((c: any) => ({ index: c.index, message: { role: c.message.role, content: c.message.content }, finishReason: c.finish_reason })), usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens }, created: Math.floor(Date.now() / 1000) }
  }

  async *stream(messages: LLMMessage[], params: LLMParameters = {}): AsyncGenerator<StreamChunk> {
    const result = await this.chat(messages, params)
    yield { id: result.id, delta: result.choices[0].message.content as string, done: true }
  }

  async embed(text: string, model = 'mistral-embed'): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/embeddings`, { method: 'POST', headers: this.headers, body: JSON.stringify({ model, input: [text] }) })
    const data = await res.json()
    return data.data[0].embedding
  }

  async listModels(): Promise<string[]> { return ['mistral-large-latest', 'mistral-medium', 'mistral-small', 'codestral-latest'] }
  async isAvailable(): Promise<boolean> { return Boolean(this.apiKey) }
}
