import { Worker, type Job } from 'bullmq'
import { QUEUE_NAMES } from '@llmbench/config'
import { logger } from '../lib/logger'
import { db } from '../lib/db'

type RunJobData = {
  runId: string
  workspaceId: string
  modelIds: string[]
  testCases: { input: string; systemPrompt?: string; expectedOutput?: string }[]
  parameters: Record<string, unknown>
}

export async function startRunsWorker() {
  const worker = new Worker<RunJobData>(
    QUEUE_NAMES.RUNS,
    async (job: Job<RunJobData>) => {
      const { runId, workspaceId, modelIds, testCases, parameters } = job.data
      logger.info(`Processing run ${runId}`, { models: modelIds.length, cases: testCases.length })

      await db.run.update({ where: { id: runId }, data: { status: 'RUNNING', startedAt: new Date() } })

      const models = await db.model.findMany({ where: { id: { in: modelIds } }, include: { provider: true } })
      let completed = 0, failed = 0, totalCost = 0, totalTokens = 0
      const latencies: number[] = []

      for (const model of models) {
        for (const tc of testCases) {
          const runItem = await db.runItem.create({
            data: { runId, modelId: model.id, status: 'RUNNING', input: tc.input, systemPrompt: tc.systemPrompt },
          })
          const startMs = Date.now()
          try {
            // AI call would go here via @llmbench/ai
            const output = `[Mock response from ${model.name}]`
            const latencyMs = Date.now() - startMs
            const cost = 0.001
            await db.runItem.update({
              where: { id: runItem.id },
              data: { status: 'COMPLETED', output, latencyMs, costUsd: cost, totalTokens: 100, inputTokens: 50, outputTokens: 50 },
            })
            completed++; totalCost += cost; totalTokens += 100; latencies.push(latencyMs)
          } catch (err) {
            await db.runItem.update({ where: { id: runItem.id }, data: { status: 'FAILED', error: String(err) } })
            failed++
          }
          await db.run.update({ where: { id: runId }, data: { completedItems: completed + failed, totalCost, totalTokens } })
          await job.updateProgress(Math.round(((completed + failed) / (models.length * testCases.length)) * 100))
        }
      }

      const avgLatencyMs = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null
      await db.run.update({
        where: { id: runId },
        data: { status: failed === 0 ? 'COMPLETED' : completed > 0 ? 'PARTIAL' : 'FAILED', completedItems: completed, failedItems: failed, totalCost, totalTokens, avgLatencyMs, completedAt: new Date() },
      })
      logger.info(`Run ${runId} done: ${completed} ok, ${failed} failed`)
    },
    { connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }, concurrency: 5 }
  )
  worker.on('failed', (job, err) => logger.error(`Job ${job?.id} failed:`, err))
  logger.info('Runs worker started')
  return worker
}
