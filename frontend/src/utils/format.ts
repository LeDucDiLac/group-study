export function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function minutesToReadable(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!hours) return `${mins} phút`
  return `${hours} giờ ${mins} phút`
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}
