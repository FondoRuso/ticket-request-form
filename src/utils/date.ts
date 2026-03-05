const LOCALE = 'ru-RU'

export function getCetDate(): string {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (type: string) => parts.find(p => p.type === type)!.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function formatMatchDate(dateStr: string, isConfirmed: boolean): string {
  const date = new Date(dateStr)

  if (!isConfirmed) {
    return date.toLocaleDateString(LOCALE, {
      timeZone: 'Europe/Madrid',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return date.toLocaleDateString(LOCALE, {
    timeZone: 'Europe/Madrid',
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatBirthDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString(LOCALE)
}
