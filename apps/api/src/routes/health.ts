import { Router } from 'express'
import { db } from '../lib/db'

export const healthRouter = Router()
healthRouter.get('/', async (req, res) => {
  try { await db.$queryRaw`SELECT 1`; res.json({ status: 'healthy' }) }
  catch { res.status(503).json({ status: 'unhealthy' }) }
})
healthRouter.get('/live', (req, res) => res.json({ status: 'alive' }))
