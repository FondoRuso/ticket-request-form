const LOCALE = 'ru-RU'

export function formatMatchDate(dateStr: string, isConfirmed: boolean): string {
  const date = new Date(dateStr)

  if (!isConfirmed) {
    return date.toLocaleDateString(LOCALE, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return date.toLocaleDateString(LOCALE, {
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
