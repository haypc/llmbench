import { router, protectedProcedure } from '../../router'
import { z } from 'zod'

export const usersRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true, email: true, name: true, displayName: true, avatarUrl: true, role: true, createdAt: true, timezone: true, locale: true, theme: true },
    })
  }),

  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().optional(), displayName: z.string().optional(), timezone: z.string().optional(), locale: z.string().optional(), theme: z.enum(['light', 'dark', 'system']).optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({ where: { id: ctx.userId }, data: input })
    }),

  getApiKeys: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.apiKey.findMany({ where: { userId: ctx.userId, isActive: true }, select: { id: true, name: true, keyPrefix: true, scopes: true, lastUsedAt: true, expiresAt: true, createdAt: true } })
  }),

  createApiKey: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100), scopes: z.array(z.string()).default(['read', 'write']) }))
    .mutation(async ({ ctx, input }) => {
      const key = `lb_${crypto.randomUUID().replace(/-/g, '')}`
      return { key }
    }),
})
