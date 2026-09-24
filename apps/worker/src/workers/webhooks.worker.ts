import { Worker, type Job } from 'bullmq'
import { QUEUE_NAMES } from '@llmbench/config'
import { logger } from '../lib/logger'
import { db } from '../lib/db'

type WebhookJobData = {
  event: string
  payload: Record<string, unknown>
  workspaceId: string
  webhookId?: string
}

export async function startWebhooksWorker() {
  const worker = new Worker<WebhookJobData>(
    QUEUE_NAMES.WEBHOOKS,
    async (job: Job<WebhookJobData>) => {
      const { event, payload, workspaceId, webhookId } = job.data
      const webhooks = await db.webhook.findMany({
        where: {
          workspaceId,
          isActive: true,
          events: { has: event },
          ...(webhookId ? { id: webhookId } : {}),
        },
      })

      for (const webhook of webhooks) {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-LLMBench-Event': event, 'X-LLMBench-Signature': 'hmac-sha256' },
            body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
          })
          await db.webhookDelivery.create({
            data: { webhookId: webhook.id, event, statusCode: response.status, success: response.ok, payload: payload as any },
          })
          logger.info(`Webhook delivered to ${webhook.url}: ${response.status}`)
        } catch (err) {
          await db.webhookDelivery.create({
            data: { webhookId: webhook.id, event, statusCode: 0, success: false, error: String(err), payload: payload as any },
          })
          throw err
        }
      }
    },
    { connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }, concurrency: 20 }
  )

  worker.on('failed', (job, err) => logger.error(`Webhook job ${job?.id} failed:`, err))
  logger.info('Webhooks worker started')
  return worker
}
