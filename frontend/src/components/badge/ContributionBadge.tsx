import { Badge, Icon, ProgressBar } from '@/components/ui'
import type { BadgeStats } from '@/types/domain'
import { BADGE_LABELS, BADGE_STYLES, getNextBadgeProgress } from '@/utils/badges'
import { cn } from '@/utils/format'

export function ContributionBadge({ stats, compact = false, anonymous = false }: { stats: BadgeStats; compact?: boolean; anonymous?: boolean }) {
  if (anonymous) return <Badge tone="neutral">Uy tín được ẩn</Badge>

  return (
    <span className={cn('inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap', BADGE_STYLES[stats.level])}>
      <Icon name="shield" size={14} className="shrink-0" />
      <span className="min-w-0 truncate">{BADGE_LABELS[stats.level]}</span>
      {!compact && <span className="font-semibold opacity-75">{stats.answerCount} trả lời / {stats.answerLikeCount} like</span>}
    </span>
  )
}

export function BadgeProgressCard({ stats }: { stats: BadgeStats }) {
  const progress = getNextBadgeProgress(stats)

  return (
    <div className="rounded-md border border-border bg-surface-low p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary-container">Huy hiệu đóng góp</p>
          <div className="mt-2">
            <ContributionBadge stats={stats} />
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-extrabold text-primary-container">{stats.answerCount}</p>
          <p className="text-xs text-ink-muted">câu trả lời</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-extrabold text-primary-container">{stats.answerLikeCount}</p>
          <p className="text-xs text-ink-muted">like câu trả lời</p>
        </div>
      </div>
      <ProgressBar value={progress.percent} className="mt-4" />
      <p className="mt-2 text-xs font-medium text-ink-muted">{progress.label}</p>
    </div>
  )
}
