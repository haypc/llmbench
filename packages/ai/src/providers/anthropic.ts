import type { AIProvider, ProviderConfig } from '../types'
import type { LLMMessage, LLMParameters, LLMResponse, StreamChunk } from '@llmbench/types'

export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  private apiKey: string
  private baseUrl: string

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl ?? 'https://api.anthropic.com'
  }

  private get headers() {
    return { 'Content-Type': 'application/json', 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01' }
  }

  async chat(messages: LLMMessage[], params: LLMParameters = {}): Promise<LLMResponse> {
    const system = messages.find(m => m.role === 'system')?.content as string | undefined
    const userMessages = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
    const res = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST', headers: this.headers,
      body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: params.maxTokens ?? 4096, temperature: params.temperature ?? 1, system, messages: userMessages }),
    })
    if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return {
      id: data.id, model: data.model,
      choices: [{ index: 0, message: { role: 'assistant', content: data.content[0].text }, finishReason: data.stop_reason }],
      usage: { promptTokens: data.usage.input_tokens, completionTokens: data.usage.output_tokens, totalTokens: data.usage.input_tokens + data.usage.output_tokens },
      created: Math.floor(Date.now() / 1000),
    }
  }

  async *stream(messages: LLMMessage[], params: LLMParameters = {}): AsyncGenerator<StreamChunk> {
    const result = await this.chat(messages, params)
    yield { id: result.id, delta: result.choices[0].message.content as string, done: true }
  }

  async embed(): Promise<number[]> { throw new Error('Anthropic does not support embeddings') }
  async listModels(): Promise<string[]> { return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] }
  async isAvailable(): Promise<boolean> { return Boolean(this.apiKey) }
}
