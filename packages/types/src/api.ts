import type { LLMParameters } from './ai'

export type PaginatedResponse<T> = {
  data: T[]; total: number; page: number; pageSize: number
  hasMore: boolean; nextCursor?: string
}

export type ApiError = { code: string; message: string; details?: unknown; requestId?: string }

export type CreateRunRequest = {
  testSuiteId?: string; name?: string; modelIds: string[]
  parameters?: LLMParameters
  inputs?: { input: string; systemPrompt?: string; expectedOutput?: string }[]
}
