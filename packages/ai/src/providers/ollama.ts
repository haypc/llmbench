import type { AIProvider, ProviderConfig } from '../types'
import type { LLMMessage, LLMParameters, LLMResponse, StreamChunk } from '@llmbench/types'

export class OllamaProvider implements AIProvider {
  name = 'ollama'
  private baseUrl: string
  constructor(config: ProviderConfig) { this.baseUrl = config.baseUrl ?? 'http://localhost:11434' }

  async chat(messages: LLMMessage[], params: LLMParameters = {}, model = 'llama3.2'): Promise<LLMResponse> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ model, messages: messages.map(m => ({ role: m.role, content: m.content })), stream: false }),
    })
    const data = await res.json()
    return { id: `ollama-${Date.now()}`, model: data.model, choices: [{ index: 0, message: { role: 'assistant', content: data.message.content }, finishReason: 'stop' }], usage: { promptTokens: data.prompt_eval_count ?? 0, completionTokens: data.eval_count ?? 0, totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0) }, created: Math.floor(Date.now() / 1000) }
  }

  async *stream(messages: LLMMessage[], params: LLMParameters = {}): AsyncGenerator<StreamChunk> {
    const result = await this.chat(messages, params)
    yield { id: result.id, delta: result.choices[0].message.content as string, done: true }
  }

  async embed(text: string, model = 'nomic-embed-text'): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embeddings`, { method: 'POST', body: JSON.stringify({ model, prompt: text }) })
    const data = await res.json()
    return data.embedding
  }

  async listModels(): Promise<string[]> {
    try { const res = await fetch(`${this.baseUrl}/api/tags`); const data = await res.json(); return data.models?.map((m: any) => m.name) ?? [] } catch { return [] }
  }

  async isAvailable(): Promise<boolean> {
    try { await fetch(`${this.baseUrl}/api/tags`); return true } catch { return false }
  }
}
