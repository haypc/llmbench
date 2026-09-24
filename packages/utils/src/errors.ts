export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` (${id})` : ''} not found`, 'NOT_FOUND', 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 'UNAUTHORIZED', 401) }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 'FORBIDDEN', 403) }
}

export class ConflictError extends AppError {
  constructor(resource: string) { super(`${resource} already exists`, 'CONFLICT', 409) }
}

export class RateLimitError extends AppError {
  constructor() { super('Rate limit exceeded', 'RATE_LIMIT', 429) }
}

export class QuotaExceededError extends AppError {
  constructor(resource: string) { super(`Quota exceeded for ${resource}`, 'QUOTA_EXCEEDED', 402) }
}

export class ValidationError extends AppError {
  constructor(details: unknown) { super('Validation failed', 'VALIDATION_ERROR', 422, details) }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}
