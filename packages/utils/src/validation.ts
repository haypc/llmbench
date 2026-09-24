import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(100)
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').min(2).max(50)

export const workspaceSchema = z.object({
  name: z.string().min(2).max(100),
  slug: slugSchema,
  description: z.string().max(500).optional(),
})

export const promptSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().min(1),
  systemPrompt: z.string().optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().optional(),
})

export const llmParamsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  maxTokens: z.number().int().min(1).max(200000).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stop: z.array(z.string()).max(4).optional(),
  seed: z.number().int().optional(),
})
