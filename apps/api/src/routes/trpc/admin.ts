import { router, adminProcedure } from '../../router'
import { z } from 'zod'

export const adminRouter = router({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [users, workspaces, runs, models] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.workspace.count(),
      ctx.db.run.count(),
      ctx.db.model.count({ where: { isActive: true } }),
    ])
    return { users, workspaces, runs, models }
  }),

  listUsers: adminProcedure
    .input(z.object({ page: z.number().default(1), search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * 50
      return ctx.db.user.findMany({
        where: input.search ? { OR: [{ email: { contains: input.search } }, { name: { contains: input.search } }] } : {},
        skip, take: 50, orderBy: { createdAt: 'desc' },
      })
    }),
})
