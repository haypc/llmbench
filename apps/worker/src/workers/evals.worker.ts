import { Worker, type Job } from 'bullmq'
import { QUEUE_NAMES } from '@llmbench/config'
import { LLMEvaluator } from '@llmbench/ai'
import { logger } from '../lib/logger'
import { db } from '../lib/db'

type EvalJobData = {
  evaluationId: string
  type: 'AUTOMATIC' | 'LLM_JUDGE' | 'HUMAN'
  judgeModel?: string
  workspaceId: string
}

export async function startEvalsWorker() {
  const worker = new Worker<EvalJobData>(
    QUEUE_NAMES.EVALS,
    async (job: Job<EvalJobData>) => {
      const { evaluationId, type, judgeModel } = job.data
      const evaluation = await db.evaluation.findUnique({
        where: { id: evaluationId },
        include: { runItem: { include: { model: true } } },
      })
      if (!evaluation) return

      await db.evaluation.update({ where: { id: evaluationId }, data: { status: 'running' } })

      try {
        const runItem = evaluation.runItem
        if (!runItem) throw new Error('Run item not found')

        let score = 0
        const details: Record<string, unknown> = {}

        if (type === 'AUTOMATIC') {
          // Basic automatic evaluation
          const output = runItem.output as string || ''
          score = output.length > 10 ? 0.7 : 0.3
          details.method = 'basic_length_check'
        } else if (type === 'LLM_JUDGE' && judgeModel) {
          // LLM-as-judge evaluation
          const evaluator = new LLMEvaluator()
          const result = await evaluator.evaluate({
            input: runItem.input as string,
            output: runItem.output as string || '',
            criteria: evaluation.rubric as any,
            model: judgeModel,
          })
          score = result.score
          details.reasoning = result.reasoning
          details.criteria_scores = result.criteriaScores
        }

        await db.evaluation.update({
          where: { id: evaluationId },
          data: { status: 'completed', score, details: details as any, completedAt: new Date() },
        })

        // Update run item score
        await db.runItem.update({
          where: { id: runItem.id },
          data: { score },
        })

        logger.info(`Evaluation ${evaluationId} completed: score=${score}`)
      } catch (err) {
        await db.evaluation.update({
          where: { id: evaluationId },
          data: { status: 'failed', error: err instanceof Error ? err.message : String(err) },
        })
        throw err
      }
    },
    { connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }, concurrency: 10 }
  )

  worker.on('failed', (job, err) => logger.error(`Eval job ${job?.id} failed:`, err))
  logger.info('Evals worker started')
  return worker
}
