export type LLMParameters = {
  temperature?: number
  topP?: number
  maxTokens?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stop?: string[]
  seed?: number
  responseFormat?: 'text' | 'json_object' | 'json_schema'
}

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | LLMContentPart[]
  toolCallId?: string
  toolCalls?: LLMToolCall[]
}

export type LLMContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }

export type LLMToolCall = {
  id: string; type: 'function'
  function: { name: string; arguments: string }
}

export type LLMResponse = {
  id: string; model: string; choices: LLMChoice[]; usage: LLMUsage; created: number
}

export type LLMChoice = {
  index: number; message: LLMMessage
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
}

export type LLMUsage = {
  promptTokens: number; completionTokens: number; totalTokens: number
  promptCost?: number; completionCost?: number; totalCost?: number
}

export type StreamChunk = {
  id: string; delta: string; done: boolean; usage?: LLMUsage; error?: string
}

export type AIProviderName =
  | 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'cohere'
  | 'groq' | 'openrouter' | 'huggingface' | 'together' | 'ollama'
