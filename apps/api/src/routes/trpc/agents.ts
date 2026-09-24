import { router, workspaceProcedure } from '../../router'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const agentsRouter = router({
  list: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.db.agent.findMany({ where: { workspaceId: ctx.workspaceId, isActive: true }, orderBy: { updatedAt: 'desc' } })
  }),

  create: workspaceProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      model: z.string(),
      systemPrompt: z.string().optional(),
      tools: z.array(z.object({ name: z.string(), description: z.string(), parameters: z.record(z.unknown()) })).default([]),
      maxSteps: z.number().int().min(1).max(50).default(20),
      temperature: z.number().min(0).max(2).default(0.7),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.agent.create({ data: { ...input, workspaceId: ctx.workspaceId, tools: input.tools as any } })
    }),

  run: workspaceProcedure
    .input(z.object({ agentId: z.string(), input: z.string(), sessionId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.db.agent.findFirst({ where: { id: input.agentId, workspaceId: ctx.workspaceId } })
      if (!agent) throw new TRPCError({ code: 'NOT_FOUND' })
      const sessionId = input.sessionId || crypto.randomUUID()
      const trace = await ctx.db.agentTrace.create({
        data: { agentId: agent.id, sessionId, input: input.input, status: 'running' },
      })
      return { traceId: trace.id, sessionId }
    }),
})
