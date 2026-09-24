import type { AIProvider, ProviderConfig } from '../types'
import type { LLMMessage, LLMParameters, LLMResponse, StreamChunk } from '@llmbench/types'

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  protected apiKey: string
  protected baseUrl: string
  private timeout: number
  private maxRetries: number

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl ?? 'https://api.openai.com/v1'
    this.timeout = config.timeout ?? 30000
    this.maxRetries = config.maxRetries ?? 3
  }

  protected get headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` }
  }

  async chat(messages: LLMMessage[], params: LLMParameters = {}): Promise<LLMResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: params.temperature ?? 1,
        max_tokens: params.maxTokens,
        top_p: params.topP,
      }),
    })
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return {
      id: data.id, model: data.model,
      choices: data.choices.map((c: any) => ({ index: c.index, message: { role: c.message.role, content: c.message.content }, finishReason: c.finish_reason })),
      usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens },
      created: data.created,
    }
  }

  async *stream(messages: LLMMessage[], params: LLMParameters = {}): AsyncGenerator<StreamChunk> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST', headers: this.headers,
      body: JSON.stringify({ model: 'gpt-4o', messages: messages.map(m => ({ role: m.role, content: m.content })), stream: true }),
    })
    if (!res.body) throw new Error('No stream body')
    const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
    while (true) {
      const { done, value } = await reader.read(); if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n'); buffer = lines.pop() ?? ''
      for (const line of lines) {
        const data = line.replace(/^data: /, '').trim()
        if (!data || data === '[DONE]') continue
        try { const c = JSON.parse(data); yield { id: c.id, delta: c.choices?.[0]?.delta?.content ?? '', done: c.choices?.[0]?.finish_reason === 'stop' } } catch {}
      }
    }
  }

  async embed(text: string, model = 'text-embedding-3-small'): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/embeddings`, { method: 'POST', headers: this.headers, body: JSON.stringify({ model, input: text }) })
    const data = await res.json()
    return data.data[0].embedding
  }

  async listModels(): Promise<string[]> { return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o1-mini'] }
  async isAvailable(): Promise<boolean> { return Boolean(this.apiKey) }
}
