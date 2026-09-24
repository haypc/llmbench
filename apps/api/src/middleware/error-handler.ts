import type { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err.message, { stack: err.stack })
  res.status(500).json({ error: 'Internal server error' })
}
