import { Queue } from 'bullmq'
import { getRedis } from './redis'

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' }

export const runsQueue = new Queue('runs', { connection })
export const evalsQueue = new Queue('evals', { connection })
export const webhooksQueue = new Queue('webhooks', { connection })
export const embeddingsQueue = new Queue('embeddings', { connection })
export const emailsQueue = new Queue('emails', { connection })
export const redTeamQueue = new Queue('red-team', { connection })
