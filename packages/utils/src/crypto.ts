import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export function generateApiKey(prefix = 'lb'): { key: string; hash: string; keyPrefix: string } {
  const random = randomBytes(32).toString('base64url')
  const key = `${prefix}_${random}`
  const hash = hashApiKey(key)
  const keyPrefix = key.slice(0, prefix.length + 8)
  return { key, hash, keyPrefix }
}

export function encrypt(text: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey.slice(0, 32).padEnd(32, '0'), 'utf-8')
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(encryptedText: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey.slice(0, 32).padEnd(32, '0'), 'utf-8')
  const [ivHex, encryptedHex] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

export function isAppError(err: unknown): err is { message: string; code: string; statusCode: number } {
  return typeof err === 'object' && err !== null && 'code' in err && 'statusCode' in err
}
