import type { BadgeLevel, BadgeStats } from '@/types/domain'

export const BADGE_LABELS: Record<BadgeLevel, string> = {
  newcomer: 'Tân Binh Tri Thức',
  helper: 'Trợ Thủ Tri Thức',
  mentor: 'Dẫn Lối Tri Thức',
  expert: 'Bậc Thầy Cộng Đồng',
}

export const BADGE_STYLES: Record<BadgeLevel, string> = {
  newcomer: 'bg-surface-low text-ink-muted border-border',
  helper: 'bg-info-fixed text-info-dark border-info-fixed-dim',
  mentor: 'bg-emerald-container text-emerald-dark border-emerald-glow',
  expert: 'bg-secondary-fixed text-secondary-container border-secondary-fixed-dim',
}

const thresholds: Array<{ level: BadgeLevel; answers: number; likes: number }> = [
  { level: 'newcomer', answers: 0, likes: 0 },
  { level: 'helper', answers: 5, likes: 10 },
  { level: 'mentor', answers: 20, likes: 50 },
  { level: 'expert', answers: 50, likes: 150 },
]

export function calculateBadgeLevel(answerCount: number, answerLikeCount: number): BadgeLevel {
  return thresholds.reduce<BadgeLevel>((current, threshold) => {
    if (answerCount >= threshold.answers && answerLikeCount >= threshold.likes) return threshold.level
    return current
  }, 'newcomer')
}

export function getNextBadgeProgress(stats: BadgeStats) {
  const currentIndex = thresholds.findIndex((item) => item.level === stats.level)
  const next = thresholds[currentIndex + 1]

  if (!next) {
    return {
      label: 'Bạn đã đạt cấp cao nhất',
      percent: 100,
      remainingAnswers: 0,
      remainingLikes: 0,
    }
  }

  const answerProgress = Math.min(1, stats.answerCount / next.answers)
  const likeProgress = Math.min(1, stats.answerLikeCount / next.likes)
  const percent = Math.round(((answerProgress + likeProgress) / 2) * 100)
  const remainingAnswers = Math.max(0, next.answers - stats.answerCount)
  const remainingLikes = Math.max(0, next.likes - stats.answerLikeCount)

  return {
    label: `Cần thêm ${remainingAnswers} câu trả lời và ${remainingLikes} like để đạt ${BADGE_LABELS[next.level]}`,
    percent,
    remainingAnswers,
    remainingLikes,
  }
}
