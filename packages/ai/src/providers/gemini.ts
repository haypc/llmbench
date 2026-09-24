import type { AIProvider, ProviderConfig } from '../types'
import type { LLMMessage, LLMParameters, LLMResponse, StreamChunk } from '@llmbench/types'

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta'
  constructor(config: ProviderConfig) { this.apiKey = config.apiKey }

  async chat(messages: LLMMessage[], params: LLMParameters = {}): Promise<LLMResponse> {
    const model = 'gemini-1.5-pro-latest'
    const contents = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content as string }] }))
    const system = messages.find(m => m.role === 'system')?.content
    const res = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction: system ? { parts: [{ text: system }] } : undefined, generationConfig: { temperature: params.temperature, maxOutputTokens: params.maxTokens } }),
    })
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return { id: `gemini-${Date.now()}`, model, choices: [{ index: 0, message: { role: 'assistant', content: text }, finishReason: 'stop' }], usage: { promptTokens: data.usageMetadata?.promptTokenCount ?? 0, completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0, totalTokens: data.usageMetadata?.totalTokenCount ?? 0 }, created: Math.floor(Date.now() / 1000) }
  }

  async *stream(messages: LLMMessage[], params: LLMParameters = {}): AsyncGenerator<StreamChunk> {
    const result = await this.chat(messages, params)
    yield { id: result.id, delta: result.choices[0].message.content as string, done: true }
  }

  async embed(text: string, model = 'text-embedding-004'): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/models/${model}:embedContent?key=${this.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: { parts: [{ text }] } }) })
    const data = await res.json()
    return data.embedding.values
  }

  async listModels(): Promise<string[]> { return ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro'] }
  async isAvailable(): Promise<boolean> { return Boolean(this.apiKey) }
}
