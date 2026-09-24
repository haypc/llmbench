import type { Request, Response } from 'express'
import { db } from './lib/db'

export type Context = {
  req: Request
  res: Response
  userId: string | null
  workspaceId: string | null
  user: { id: string; email: string; role: string } | null
  db: typeof db
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  return {
    req, res,
    userId: (req as any).userId || null,
    workspaceId: req.headers['x-workspace-id'] as string || null,
    user: (req as any).user || null,
    db,
  }
}
