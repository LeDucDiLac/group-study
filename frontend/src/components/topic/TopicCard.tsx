import { useState } from 'react'
import { ActionLink, Avatar, Badge, Card, Icon } from '@/components/ui'
import type { Topic } from '@/types/domain'
import { cn } from '@/utils/format'
import { apiRequest } from '@/services/api'
import { bookmarkService } from '@/services/bookmarks'
import { getRankTier, RANK_LABELS } from '@/utils/badges'
import { useAsync } from '@/utils/hooks'

// Utility: determine text color based on topic status and window
function timeTone(topic: Topic) {
  if (isTopicExpired(topic)) return 'text-error'
  if (topic.status === 'Chưa duyệt') return 'text-amber-900'
  if (topic.status === 'Bị từ chối') return 'text-error'
  if (topic.status === 'Đã hoàn thành') return 'text-success'
  if (topic.status === 'Đang mở') return 'text-emerald-dark'
  return 'text-emerald-dark'
}

// Utility: check if an open topic has passed its closing time
function isTopicExpired(topic: Topic) {
  return false
}


const statusConfig = {
  'Đang mở': { label: 'Đang mở', tone: 'success' as const, action: 'Vào học / Nộp bài' },
  'Chưa duyệt': { label: 'Chưa duyệt', tone: 'warning' as const, action: 'Xem trạng thái' },
  'Bị từ chối': { label: 'Bị từ chối', tone: 'danger' as const, action: 'Xem lý do' },
  'Đã hoàn thành': { label: 'Đã hoàn thành', tone: 'success' as const, action: 'Xem kết quả' },
}

export function TopicStatusBadge({ status }: { status: Topic['status'] }) {
  const config = statusConfig[status]
  return <Badge tone={config.tone}>{config.label}</Badge>
}


export function TopicCard({ topic, publicMode = false }: { topic: Topic; publicMode?: boolean }) {
  const isOpen = topic.status === 'Đang mở'
  const expired = isTopicExpired(topic)
  const hasSubmitted = !publicMode && (topic.mySubmission !== null)
  const hasParticipated = !publicMode && !hasSubmitted && topic.participationStartTime !== null
  const config = statusConfig[topic.status]

  const creator = typeof topic.createdBy === 'object' && topic.createdBy
    ? (topic.createdBy as { _id?: string; id?: string; displayName: string; rank?: number })
    : null
  const creatorName = creator?.displayName || 'Người học'
  const creatorId = creator?._id || creator?.id || (typeof topic.createdBy === 'string' ? topic.createdBy : undefined)
  const rank = creator?.rank ?? 0
  const rankTier = getRankTier(rank)
  const roleLabel = RANK_LABELS[rankTier] || 'Tập sự'
  const roleTone = rankTier >= 9 ? 'warning' : rankTier >= 7 ? 'brand' : rankTier >= 5 ? 'success' : rankTier >= 3 ? 'info' : 'neutral'

  const actionTo = hasSubmitted
    ? `/topics/${topic._id}/peer`
    : hasParticipated
      ? `/topics/${topic._id}/learn`
      : `/topics/${topic._id}`

  const actionLabel = hasSubmitted
    ? 'Xem chi tiết'
    : hasParticipated
      ? 'Tiếp tục học'
      : isOpen && !expired
        ? 'Bắt đầu học'
        : 'Xem chi tiết'

  // primary (đỏ): topic đang mở và chưa nộp (kể cả đang học dở)
  // secondary (trắng): đã nộp, hết hạn, hoàn thành
  const actionVariant: 'primary' | 'secondary' = isOpen && !expired && !hasSubmitted
    ? 'primary'
    : 'secondary'

  // liked: 1 = đã thích, -1 = đã không thích, 0 = chưa phản ứng
  const [reaction, setReaction] = useState<1 | -1 | 0>(topic.liked as 1 | -1 | 0)
  const [likeCount, setLikeCount] = useState(topic.likeCount)
  const [dislikeCount, setDislikeCount] = useState(topic.dislikeCount)
  const [pending, setPending] = useState(false)

  // bookmark
  const { data: bookmarks, setData: setBookmarks } = useAsync(() => bookmarkService.getBookmarks(), [])
  const [bookmarkPending, setBookmarkPending] = useState(false)
  const saved = bookmarkService.isBookmarked(bookmarks, topic._id)

  async function handleToggleBookmark(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (publicMode || bookmarkPending) return
    setBookmarkPending(true)
    try {
      const result = await bookmarkService.toggleBookmark(topic._id, bookmarks)
      if (result.saved && result.item) {
        setBookmarks((prev) => [...prev, result.item!])
      } else {
        const updated = await bookmarkService.getBookmarks()
        setBookmarks(updated)
      }
    } finally {
      setBookmarkPending(false)
    }
  }

  async function handleReact(action: 'like' | 'dislike') {
    if (publicMode || pending) return
    const isCancelling = (action === 'like' && reaction === 1) || (action === 'dislike' && reaction === -1)
    const prevReaction = reaction
    const prevLike = likeCount
    const prevDislike = dislikeCount

    // Optimistic update
    if (isCancelling) {
      setReaction(0)
      if (action === 'like') setLikeCount((c) => c - 1)
      else setDislikeCount((c) => c - 1)
    } else {
      if (action === 'like') {
        setReaction(1)
        setLikeCount((c) => c + 1)
        if (prevReaction === -1) setDislikeCount((c) => c - 1)
      } else {
        setReaction(-1)
        setDislikeCount((c) => c + 1)
        if (prevReaction === 1) setLikeCount((c) => c - 1)
      }
    }

    try {
      setPending(true)
      const endpoint = isCancelling ? '/api/reactions/cancel' : `/api/reactions/${action}`
      await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ id: topic._id }),
        errorHandle: false,
      })
    } catch {
      // Rollback on failure
      setReaction(prevReaction)
      setLikeCount(prevLike)
      setDislikeCount(prevDislike)
    } finally {
      setPending(false)
    }
  }

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
        <div className="flex items-center gap-2 shrink-0">
          {!publicMode && (
            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={bookmarkPending}
              aria-pressed={saved}
              aria-label={saved ? 'Bỏ lưu chủ đề này' : 'Lưu chủ đề này'}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold transition',
                'hover:bg-surface-low cursor-pointer disabled:cursor-not-allowed',
                saved ? 'text-secondary-container' : 'text-ink-subtle hover:text-secondary-container',
              )}
            >
              <Icon name={saved ? 'liked' : 'heart'} size={13} />
              {saved ? 'Đã lưu' : 'Lưu'}
            </button>
          )}
          {hasSubmitted ? (
            <Badge tone="success" className="shrink-0">
              <Icon name="check" size={13} />
              Đã nộp bài
            </Badge>
          ) : (
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap', timeTone(topic))}>
              <Icon name="clock" size={13} />
            </span>
          )}
        </div>
      </div>

      {/* Publisher Info */}
      <div className="mt-3.5 flex items-center gap-2">
        <Avatar name={creatorName} userId={creatorId} size="sm" />
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-primary-container truncate">{creatorName}</span>
          <Badge tone={roleTone} className="px-1.5 py-0.5 text-[10px]">{roleLabel}</Badge>
        </div>
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-[54px] text-[20px] font-extrabold leading-snug text-primary-container">
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="file" size={15} />
            {topic.submissionCount} bài nộp
          </span>
          <button
            type="button"
            disabled={publicMode || pending}
            onClick={() => handleReact('like')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition',
              publicMode ? 'cursor-default' : 'hover:bg-surface-low cursor-pointer',
              reaction === 1 ? 'text-error' : 'text-ink-subtle',
            )}
            aria-label="Thích"
            aria-pressed={reaction === 1}
          >
            <Icon name={reaction === 1 ? 'liked' : 'heart'} size={15} />
            {likeCount} thích
          </button>
          <button
            type="button"
            disabled={publicMode || pending}
            onClick={() => handleReact('dislike')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition',
              publicMode ? 'cursor-default' : 'hover:bg-surface-low cursor-pointer',
              reaction === -1 ? 'text-ink' : 'text-ink-subtle',
            )}
            aria-label="Không thích"
            aria-pressed={reaction === -1}
          >
            <Icon name={reaction === -1 ? 'disliked' : 'brokenHeart'} size={15} />
            {dislikeCount} không thích
          </button>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="users" size={15} />
            {topic.participationCount} tham gia
          </span>
        </div>
        <ActionLink to={publicMode ? '/login' : actionTo} variant={publicMode ? 'primary' : actionVariant}>
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
  const baseUrl = import.meta.env.VITE_API_URL;
  return (
    <div className="grid gap-2">
      {resources.map((file) => (
        <div
          key={file.id}
          className="flex min-h-[44px] items-center gap-2 rounded-md border border-border-subtle bg-white px-2.5 py-2 transition hover:border-secondary-fixed-dim hover:bg-surface-low"
          onClick={() => file.type === 'link' ? window.open(file.url, '_blank') : window.open(`${baseUrl}${file.url}`)}
        >
          <div className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
              <Icon name="file" size={16} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate" title={file.label}>{file.label}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
