import { useState } from 'react'
import { Badge, Button, Icon, Modal, ProgressBar } from '@/components/ui'
import { RANK_LABELS, RANK_STYLES, getRankTier, getRankProgress } from '@/utils/badges'
import { cn } from '@/utils/format'

const rankBenefitItems = [
  {
    rank: 1,
    title: 'Tập sự',
    benefits: [
      'Được phép tạo chủ đề.',
      'Bài nộp cần phê duyệt.',
      'Được phép xem bài nộp của người khác sau khi nộp.',
      'Được phép like/dislike.',
    ],
  },
  {
    rank: 2,
    title: 'Tân binh',
    benefits: ['Được phép comment.'],
  },
  {
    rank: 3,
    title: 'Sinh viên chính thức',
    benefits: ['Bài nộp không cần phê duyệt.'],
  },
  {
    rank: 4,
    title: 'Sinh viên kỳ cựu',
    benefits: ['Mỗi ngày 1 lần xem bài nộp của người khác mà không cần hoàn thành chủ đề.'],
  },
  {
    rank: 5,
    title: 'Tinh anh',
    benefits: [],
  },
  {
    rank: 6,
    title: 'Học giả',
    benefits: ['Xem bài nộp của người khác mà không cần hoàn thành chủ đề.'],
  },
  {
    rank: 7,
    title: 'Đại học giả',
    benefits: [],
  },
  {
    rank: 8,
    title: 'Lão sư',
    benefits: ['Đăng bài mà không cần phê duyệt.'],
  },
  {
    rank: 9,
    title: 'Đại lão sư',
    benefits: [],
  },
  {
    rank: 10,
    title: 'Thách đấu',
    benefits: [],
  },
]

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
  const [open, setOpen] = useState(false)
  const progress = getRankProgress(rank)

  return (
    <>
      <div className="rounded-md border border-border bg-surface-low p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-primary-container">Cấp bậc đóng góp</p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-[11px] font-bold text-ink-muted transition hover:border-secondary-container hover:text-secondary-container"
              aria-label="Xem mô tả lợi ích theo danh hiệu"
              title="Xem mô tả lợi ích"
            >
              i
            </button>
          </div>
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

      <Modal open={open} title="Lợi ích theo danh hiệu" onClose={() => setOpen(false)} className="max-w-6xl">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-ink-muted">
            Nội dung dưới đây được trích từ tài liệu nghiệp vụ <span className="font-semibold text-ink">01_nghiep-vu.md</span>.
          </p>

          <div className="grid gap-2 grid-cols-5">
            {rankBenefitItems.map((item) => {
              const isCurrent = item.rank === getRankTier(rank) + 1
              return (
                <div
                  key={item.rank}
                  className={cn(
                    'rounded-md border p-2',
                    isCurrent ? 'border-secondary-container bg-secondary-fixed/20' : 'border-border bg-surface-low',
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="text-xs font-bold text-primary-container">{item.title}</p>
                      {isCurrent && <p className="mt-0.5 text-xs font-semibold text-secondary-container">Đang ở bậc hiện tại</p>}
                    </div>
                    <span className="rounded-full border border-border bg-white px-1 py-0.5 text-[10px] font-semibold text-ink-muted whitespace-nowrap">
                      Bậc {item.rank}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-0.5 text-xs leading-4 text-ink-muted">
                    {item.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-secondary-container" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
