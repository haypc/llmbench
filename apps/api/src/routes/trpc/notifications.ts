import { router, protectedProcedure } from '../../router'
import { z } from 'zod'

export const notificationsRouter = router({
  list: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.notification.findMany({
        where: { userId: ctx.userId, ...(input.unreadOnly ? { isRead: false } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    }),

  markRead: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.updateMany({
        where: { userId: ctx.userId, ...(input.ids ? { id: { in: input.ids } } : {}) },
        data: { isRead: true },
      })
      return { success: true }
    }),
})
