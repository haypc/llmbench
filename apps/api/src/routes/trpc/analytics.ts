import { router, workspaceProcedure } from '../../router'
import { z } from 'zod'

export const analyticsRouter = router({
  getRunMetrics: workspaceProcedure
    .input(z.object({ runId: z.string() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.runItem.findMany({
        where: { runId: input.runId, status: 'COMPLETED' },
        include: { model: { include: { provider: true } } },
      })
      const byModel = items.reduce((acc, item) => {
        const key = item.modelId
        if (!acc[key]) acc[key] = { model: item.model, items: [] }
        acc[key].items.push(item)
        return acc
      }, {} as Record<string, { model: any; items: typeof items }>)
      return Object.values(byModel).map(({ model, items }) => ({
        model,
        count: items.length,
        avgLatencyMs: items.reduce((s, i) => s + (i.latencyMs || 0), 0) / items.length,
        avgCost: items.reduce((s, i) => s + i.costUsd, 0) / items.length,
        totalCost: items.reduce((s, i) => s + i.costUsd, 0),
        totalTokens: items.reduce((s, i) => s + i.totalTokens, 0),
      }))
    }),

  getProviderStats: workspaceProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const since = new Date(Date.now() - input.days * 86400000)
      return ctx.db.runItem.groupBy({
        by: ['modelId'],
        where: { run: { workspaceId: ctx.workspaceId, createdAt: { gte: since } }, status: 'COMPLETED' },
        _sum: { costUsd: true, totalTokens: true },
        _avg: { latencyMs: true },
        _count: { id: true },
      })
    }),
})
