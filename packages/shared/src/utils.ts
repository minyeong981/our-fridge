export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}일 전`
  const date = new Date(dateStr)
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`
}

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
