import { Worker, type Job } from 'bullmq'
import { QUEUE_NAMES } from '@llmbench/config'
import { logger } from '../lib/logger'

type EmailJobData = {
  to: string
  subject: string
  html: string
  from?: string
}

export async function startEmailsWorker() {
  const worker = new Worker<EmailJobData>(
    QUEUE_NAMES.EMAILS,
    async (job: Job<EmailJobData>) => {
      const { to, subject, html, from } = job.data
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: from || process.env.SMTP_FROM || 'noreply@llmbench.ai', to, subject, html }),
        })
        if (!response.ok) throw new Error(`Resend API error: ${response.status}`)
        logger.info(`Email sent to ${to}: ${subject}`)
      } catch (err) {
        logger.error(`Failed to send email to ${to}:`, err)
        throw err
      }
    },
    { connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }, concurrency: 10 }
  )

  worker.on('failed', (job, err) => logger.error(`Email job ${job?.id} failed:`, err))
  logger.info('Emails worker started')
  return worker
}
