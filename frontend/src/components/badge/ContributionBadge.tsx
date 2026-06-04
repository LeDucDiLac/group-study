import { Badge, Icon, ProgressBar } from '@/components/ui'
import { RANK_LABELS, RANK_STYLES, getRankTier, getRankProgress } from '@/utils/badges'
import { cn } from '@/utils/format'

export function ContributionBadge({ rank, compact = false, anonymous = false }: { rank: number; compact?: boolean; anonymous?: boolean }) {
  if (anonymous) return <Badge tone="neutral">Uy tín được ẩn</Badge>

  const tier = getRankTier(rank)
  return (
    <span className={cn('inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap', RANK_STYLES[tier])}>
      <Icon name="shield" size={14} className="shrink-0" />
      <span className="min-w-0 truncate">{RANK_LABELS[tier]}</span>
    </span>
  )
}

export function BadgeProgressCard({ rank }: { rank: number }) {
  const progress = getRankProgress(rank)

  return (
    <div className="rounded-md border border-border bg-surface-low p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary-container">Cấp bậc đóng góp</p>
          <div className="mt-2">
            <ContributionBadge rank={rank} />
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-extrabold text-primary-container">{rank}</p>
          <p className="text-xs text-ink-muted">điểm tích luỹ</p>
        </div>
      </div>
      <ProgressBar value={progress.percent} className="mt-4" />
      <p className="mt-2 text-xs font-medium text-ink-muted">{progress.label}</p>
    </div>
  )
}
