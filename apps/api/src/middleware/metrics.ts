import type { Request, Response, NextFunction } from 'express'

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  next()
}

export function metricsHandler(req: Request, res: Response) {
  res.set('Content-Type', 'text/plain')
  res.send('# LLMBench metrics\n')
}
