export function formatDate(date: Date | string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date))
}

export function formatDateTime(date: Date | string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

export function formatRelative(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime()
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return rtf.format(-Math.floor(diff / 60000), 'minute')
  if (diff < 86400000) return rtf.format(-Math.floor(diff / 3600000), 'hour')
  if (diff < 604800000) return rtf.format(-Math.floor(diff / 86400000), 'day')
  return formatDate(date)
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
