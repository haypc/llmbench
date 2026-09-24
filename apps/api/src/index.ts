import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './router'
import { createContext } from './context'
import { rateLimiter } from './middleware/rate-limiter'
import { errorHandler } from './middleware/error-handler'
import { authMiddleware } from './middleware/auth'
import { healthRouter } from './routes/health'
import { webhookRouter } from './routes/webhooks'
import { logger } from './lib/logger'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', credentials: true }))
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use('/api/', rateLimiter)
app.use('/health', healthRouter)
app.use('/api/webhooks', webhookRouter)
app.use('/trpc', authMiddleware, createExpressMiddleware({ router: appRouter, createContext }))
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`LLMBench API running on port ${PORT}`)
})

export { app }
