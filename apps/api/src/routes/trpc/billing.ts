import { router, workspaceProcedure } from '../../router'
import { z } from 'zod'

export const billingRouter = router({
  getSubscription: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.db.subscription.findFirst({
      where: { workspaceId: ctx.workspaceId },
      include: { invoices: { orderBy: { createdAt: 'desc' }, take: 5 } },
    })
  }),

  getQuota: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.db.quota.findUnique({ where: { workspaceId: ctx.workspaceId } })
  }),

  createCheckoutSession: workspaceProcedure
    .input(z.object({ plan: z.enum(['PRO', 'TEAM', 'ENTERPRISE']), successUrl: z.string().url(), cancelUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      // Stripe checkout integration
      return { url: `https://checkout.stripe.com/pay/example` }
    }),
})
