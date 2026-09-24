import { Worker, type Job } from 'bullmq'
import { QUEUE_NAMES } from '@llmbench/config'
import { RedTeamEngine } from '@llmbench/ai'
import { logger } from '../lib/logger'
import { db } from '../lib/db'

type RedTeamJobData = {
  sessionId: string
  modelId: string
  category: string
  maxAttacks: number
  workspaceId: string
}

export async function startRedTeamWorker() {
  const worker = new Worker<RedTeamJobData>(
    QUEUE_NAMES.RED_TEAM,
    async (job: Job<RedTeamJobData>) => {
      const { sessionId, modelId, category, maxAttacks, workspaceId } = job.data
      logger.info(`Red team session ${sessionId}: ${category} x${maxAttacks}`)

      const engine = new RedTeamEngine()
      const model = await db.model.findUnique({ where: { id: modelId }, include: { provider: true } })
      if (!model) throw new Error('Model not found')

      const attacks = engine.getAttacksByCategory(category, maxAttacks)
      let passed = 0, failed = 0

      for (const attack of attacks) {
        try {
          const result = await engine.runAttack(attack, model.provider.name, model.name)
          await db.redTeamResult.create({
            data: {
              sessionId,
              modelId,
              attackType: attack.type,
              attackPayload: attack.payload,
              modelResponse: result.response,
              passed: result.passed,
              severity: attack.severity,
            },
          })
          result.passed ? passed++ : failed++
        } catch (err) {
          logger.warn(`Attack failed: ${err}`)
        }
        await job.updateProgress(Math.round(((passed + failed) / attacks.length) * 100))
      }

      logger.info(`Red team ${sessionId} done: ${passed} passed, ${failed} vulnerabilities found`)
    },
    { connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }, concurrency: 2 }
  )

  worker.on('failed', (job, err) => logger.error(`Red team job ${job?.id} failed:`, err))
  logger.info('Red-team worker started')
  return worker
}
