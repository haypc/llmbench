import { Router } from 'express'
import { logger } from '../lib/logger'

export const webhookRouter = Router()
webhookRouter.post('/stripe', async (req, res) => {
  try {
    logger.info('Stripe webhook received')
    res.json({ received: true })
  } catch (err) {
    res.status(400).json({ error: 'Webhook error' })
  }
})
