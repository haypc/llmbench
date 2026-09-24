import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'
import { promptsRouter } from './routes/trpc/prompts'
import { runsRouter } from './routes/trpc/runs'
import { modelsRouter } from './routes/trpc/models'
import { evalsRouter } from './routes/trpc/evals'
import { workspacesRouter } from './routes/trpc/workspaces'
import { datasetsRouter } from './routes/trpc/datasets'
import { agentsRouter } from './routes/trpc/agents'
import { testSuitesRouter } from './routes/trpc/test-suites'
import { dashboardRouter } from './routes/trpc/dashboard'
import { analyticsRouter } from './routes/trpc/analytics'
import { usersRouter } from './routes/trpc/users'
import { billingRouter } from './routes/trpc/billing'
import { adminRouter } from './routes/trpc/admin'
import { notificationsRouter } from './routes/trpc/notifications'

const t = initTRPC.context<Context>().create({ transformer: superjson })
export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, userId: ctx.userId, user: ctx.user! } })
})

export const workspaceProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.workspaceId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Workspace ID required' })
  return next({ ctx: { ...ctx, workspaceId: ctx.workspaceId } })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!['SUPER_ADMIN', 'ADMIN'].includes(ctx.user?.role || '')) throw new TRPCError({ code: 'FORBIDDEN' })
  return next()
})

export const appRouter = router({
  prompts: promptsRouter,
  runs: runsRouter,
  models: modelsRouter,
  evals: evalsRouter,
  workspaces: workspacesRouter,
  datasets: datasetsRouter,
  agents: agentsRouter,
  testSuites: testSuitesRouter,
  dashboard: dashboardRouter,
  analytics: analyticsRouter,
  users: usersRouter,
  billing: billingRouter,
  admin: adminRouter,
  notifications: notificationsRouter,
})

export type AppRouter = typeof appRouter
