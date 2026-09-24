import { Worker, type Job } from 'bullmq'
import { QUEUE_NAMES } from '@llmbench/config'
import { EmbeddingsClient } from '@llmbench/ai'
import { logger } from '../lib/logger'
import { db } from '../lib/db'

type EmbeddingJobData = {
  documentId: string
  datasetId: string
}

export async function startEmbeddingsWorker() {
  const worker = new Worker<EmbeddingJobData>(
    QUEUE_NAMES.EMBEDDINGS,
    async (job: Job<EmbeddingJobData>) => {
      const { documentId } = job.data
      const doc = await db.document.findUnique({ where: { id: documentId } })
      if (!doc) return

      await db.document.update({ where: { id: documentId }, data: { status: 'PROCESSING' } })

      try {
        const client = new EmbeddingsClient({ provider: 'openai', apiKey: process.env.OPENAI_API_KEY || '' })
        // Split document into chunks (simple by paragraph)
        const chunks = (doc.content as string || '').split('\n\n').filter(c => c.trim().length > 0)

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          const embedding = await client.embed(chunk)
          await db.embedding.create({
            data: {
              documentId,
              content: chunk,
              embedding: JSON.stringify(embedding.values),
              chunkIndex: i,
              tokenCount: chunk.split(' ').length,
              model: 'text-embedding-3-small',
            },
          })
          await job.updateProgress(Math.round(((i + 1) / chunks.length) * 100))
        }

        await db.document.update({ where: { id: documentId }, data: { status: 'READY', chunkCount: chunks.length } })
        logger.info(`Embeddings created for document ${documentId}: ${chunks.length} chunks`)
      } catch (err) {
        await db.document.update({ where: { id: documentId }, data: { status: 'FAILED', error: String(err) } })
        throw err
      }
    },
    { connection: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }, concurrency: 3 }
  )

  worker.on('failed', (job, err) => logger.error(`Embeddings job ${job?.id} failed:`, err))
  logger.info('Embeddings worker started')
  return worker
}
