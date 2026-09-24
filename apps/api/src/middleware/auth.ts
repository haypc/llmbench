import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'] as string
  if (!token) return next()
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    ;(req as any).userId = decoded.sub
    ;(req as any).user = decoded
  } catch {}
  next()
}
