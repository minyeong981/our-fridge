export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function isExpired(expiredAt: string | null): boolean {
  if (!expiredAt) return false
  return new Date(expiredAt) < new Date()
}

export function isExpiringSoon(expiredAt: string | null, days = 3): boolean {
  if (!expiredAt) return false
  const diff = new Date(expiredAt).getTime() - Date.now()
  return diff > 0 && diff < days * 24 * 60 * 60 * 1000
}
