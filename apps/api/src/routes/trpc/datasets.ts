import { router, workspaceProcedure } from '../../router'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const datasetsRouter = router({
  list: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.db.dataset.findMany({
      where: { workspaceId: ctx.workspaceId },
      include: { _count: { select: { documents: true } } },
      orderBy: { updatedAt: 'desc' },
    })
  }),

  create: workspaceProcedure
    .input(z.object({ name: z.string(), description: z.string().optional(), type: z.enum(['DOCUMENT', 'QUESTION_ANSWER', 'CONVERSATION', 'EVAL']).default('DOCUMENT') }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dataset.create({ data: { ...input, workspaceId: ctx.workspaceId } })
    }),

  uploadDocument: workspaceProcedure
    .input(z.object({ datasetId: z.string(), name: z.string(), mimeType: z.string(), sizeBytes: z.number(), s3Key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dataset = await ctx.db.dataset.findFirst({ where: { id: input.datasetId, workspaceId: ctx.workspaceId } })
      if (!dataset) throw new TRPCError({ code: 'NOT_FOUND' })
      return ctx.db.document.create({
        data: { ...input, sizeBytes: BigInt(input.sizeBytes), status: 'PENDING' },
      })
    }),
})
