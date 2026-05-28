import { ActionLink, Badge, Card, Icon } from '@/components/ui'
import type { Topic } from '@/types/domain'
import { cn } from '@/utils/format'

const statusConfig = {
  open: { label: 'Đang mở', tone: 'success' as const, action: 'Vào học / Nộp bài' },
  closed: { label: 'Đã đóng', tone: 'neutral' as const, action: 'Xem kết quả' },
  pending: { label: 'Chờ duyệt', tone: 'warning' as const, action: 'Xem trạng thái' },
  rejected: { label: 'Bị từ chối', tone: 'danger' as const, action: 'Xem lý do' },
}

export function TopicStatusBadge({ status }: { status: Topic['status'] }) {
  const config = statusConfig[status]
  return <Badge tone={config.tone}>{config.label}</Badge>
}

function timeTone(topic: Topic) {
  if (isTopicExpired(topic)) return 'text-error'
  if (topic.status === 'closed') return 'text-ink-subtle'
  if (topic.status === 'pending') return 'text-amber-900'
  if (topic.status === 'rejected') return 'text-error'
  if (topic.windowLabel.includes('18 giờ')) return 'text-amber-900'
  return 'text-emerald-dark'
}

function isTopicExpired(topic: Topic) {
  return topic.status === 'open' && Boolean(topic.closesAt) && new Date(topic.closesAt as string).getTime() <= Date.now()
}

export function TopicCard({ topic, publicMode = false }: { topic: Topic; publicMode?: boolean }) {
  const isOpen = topic.status === 'open'
  const expired = isTopicExpired(topic)
  const hasSubmitted = !publicMode && (topic.userSubmissionStatus === 'submitted' || topic.userSubmissionStatus === 'locked')
  const config = statusConfig[topic.status]
  const actionTo = hasSubmitted ? `/topics/${topic.id}/my-submission` : `/topics/${topic.id}`
  const actionLabel = hasSubmitted ? 'Xem bài đã nộp' : expired ? 'Xem chi tiết' : config.action

  return (
    <Card
      className={cn(
        'group flex h-full min-h-[282px] flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover',
        isOpen ? 'border-secondary-fixed-dim' : 'border-border-subtle',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {expired ? <Badge tone="neutral">Đã hết hạn</Badge> : <TopicStatusBadge status={topic.status} />}
        </div>
        {hasSubmitted ? (
          <Badge tone="success" className="shrink-0">
            <Icon name="check" size={13} />
            Đã nộp bài
          </Badge>
        ) : (
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap', timeTone(topic))}>
            <Icon name="clock" size={13} />
            {topic.windowLabel}
          </span>
        )}
      </div>

      <h3 className="mt-4 line-clamp-2 min-h-[54px] text-[20px] font-extrabold leading-snug text-primary-container">
        {topic.title}
      </h3>
      <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-ink-muted">{topic.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="info">{topic.category}</Badge>
        {topic.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} className="border border-border-subtle bg-white text-ink-muted">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-4 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="file" size={15} />
            {topic.submissionCount} bài nộp
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="heart" size={15} />
            {topic.likeCount} lượt thích
          </span>
        </div>
        <ActionLink to={publicMode ? '/login' : actionTo} variant={isOpen && !hasSubmitted && !expired ? 'primary' : 'secondary'}>
          {publicMode ? 'Đăng nhập để tham gia' : actionLabel}
        </ActionLink>
      </div>
    </Card>
  )
}

export function ResourceList({ resources }: { resources: Topic['resources'] }) {
  if (!resources.length) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface-low p-4 text-sm font-medium text-ink-muted">
        Chủ đề này chưa có tài liệu đính kèm.
      </div>
    )
  }
  return (
    <div className="grid gap-2">
      {resources.map((file) => (
        <div
          key={file.id}
          className="flex min-h-[44px] items-center gap-2 rounded-md border border-border-subtle bg-white px-2.5 py-2 transition hover:border-secondary-fixed-dim hover:bg-surface-low"
        >
          <div className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
              <Icon name="file" size={16} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate" title={file.name}>{file.name}</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge tone="neutral" className="px-2 py-0.5 text-[10px]">
              {file.type === 'image' ? 'IMG' : file.type.toUpperCase()}
            </Badge>
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-ink-muted transition hover:border-secondary-container hover:bg-secondary-fixed hover:text-secondary-container"
              aria-label={`Xem ${file.name}`}
            >
              <Icon name="eye" size={15} />
            </a>
            <a
              href={file.url}
              download={file.name}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-ink-muted transition hover:border-secondary-container hover:bg-secondary-fixed hover:text-secondary-container"
              aria-label={`Tải xuống ${file.name}`}
            >
              <Icon name="download" size={15} />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
