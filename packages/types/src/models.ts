export type PlanTier = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | 'BILLING'
export type RunType = 'MANUAL' | 'SCHEDULED' | 'API' | 'WEBHOOK' | 'CI'
export type RunStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PARTIAL'
export type RunItemStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'SKIPPED'

export type User = {
  id: string; email: string; name?: string | null; displayName?: string | null
  avatarUrl?: string | null; role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'; createdAt: Date
}

export type Workspace = {
  id: string; name: string; slug: string; description?: string | null
  logoUrl?: string | null; plan: PlanTier; createdAt: Date
}

export type Model = {
  id: string; providerId: string; name: string; displayName: string
  contextLength: number; maxOutputTokens: number
  inputPricePer1k: number; outputPricePer1k: number
  capabilities: string[]; isActive: boolean
}

export type Prompt = {
  id: string; workspaceId: string; userId: string; name: string
  description?: string | null; content: string; systemPrompt?: string | null
  variables: PromptVariable[]; tags: string[]; isPublic: boolean
  version: number; createdAt: Date; updatedAt: Date
}

export type PromptVariable = {
  name: string; description?: string; default?: string; required?: boolean
}

export type TestCase = {
  id: string; testSuiteId: string; name: string; input: string
  systemPrompt?: string | null; expectedOutput?: string | null
  criteria: EvalCriterion[]; weight: number; order: number
}

export type Run = {
  id: string; workspaceId: string; testSuiteId?: string | null; userId: string
  name?: string | null; type: RunType; status: RunStatus; models: string[]
  totalItems: number; completedItems: number; failedItems: number
  totalCost: number; totalTokens: number; avgLatencyMs?: number | null
  avgScore?: number | null; startedAt?: Date | null; completedAt?: Date | null; createdAt: Date
}

export type EvalCriterion = {
  name: string; description: string; weight: number; threshold?: number
  type: 'score' | 'binary' | 'classification'
}
