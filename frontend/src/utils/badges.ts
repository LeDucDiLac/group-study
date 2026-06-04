export const RANK_LABELS: Record<number, string> = {
  0: 'Tập sự',
  1: 'Tân binh',
  2: 'Sinh viên chính thức',
  3: 'Sinh viên kỳ cựu',
  4: 'Tinh anh',
  5: 'Học giả',
  6: 'Đại học giả',
  7: 'Lão sư',
  8: 'Đại lão sư',
  9: 'Thách đấu',
}

export const RANK_STYLES: Record<number, string> = {
  0: 'bg-surface-low text-ink-muted border-border',
  1: 'bg-surface-low text-ink-muted border-border',
  2: 'bg-surface-low text-ink-muted border-border',
  3: 'bg-info-fixed text-info-dark border-info-fixed-dim',
  4: 'bg-info-fixed text-info-dark border-info-fixed-dim',
  5: 'bg-emerald-container text-emerald-dark border-emerald-glow',
  6: 'bg-emerald-container text-emerald-dark border-emerald-glow',
  7: 'bg-secondary-fixed text-secondary-container border-secondary-fixed-dim',
  8: 'bg-secondary-fixed text-secondary-container border-secondary-fixed-dim',
  9: 'bg-amber-light text-amber-900 border-amber-400',
}

export function getRankTier(rank: number): number {
  return Math.min(Math.floor(rank / 100), 9)
}

export function getRankProgress(rank: number) {
  if (rank < 900) {
    const percent = rank % 100
    const nextRankTier = getRankTier(rank) + 1
    const remaining = 100 - percent
    return {
      percent,
      label: `Cần thêm ${remaining} điểm để đạt ${RANK_LABELS[nextRankTier]}`,
      remaining,
    }
  } else {
    const percent = Math.min(100, rank - 900)
    const remaining = Math.max(0, 1000 - rank)
    return {
      percent,
      label: remaining > 0 ? `Cần thêm ${remaining} điểm để đạt cấp cao nhất` : 'Bạn đã đạt cấp cao nhất',
      remaining,
    }
  }
}
