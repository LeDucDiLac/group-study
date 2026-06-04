import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ActionLink,
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from '@/components/ui'
import { ResourceList, TopicCard, TopicStatusBadge } from '@/components/topic/TopicCard'
import { authService, topicFallback, topicService, uploadService } from '@/services/api'
import type { Topic, TopicStatus, ResourceFile } from '@/types/domain'
import { cn, formatDate } from '@/utils/format'
import { useAsync } from '@/utils/hooks'

export function TopicsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<TopicStatus | 'all'>('all')
  const [sort, setSort] = useState('newest')
  const { data: allTopics, loading } = useAsync(() => topicService.getTopics(), [])

  const stats = useMemo(
    () => ({
      total: allTopics.length,
      submissions: allTopics.reduce((sum, topic) => sum + topic.submissionCount, 0),
      likes: allTopics.reduce((sum, topic) => sum + topic.likeCount, 0),
      pending: allTopics.filter((topic) => topic.status === 'Chưa duyệt').length,
    }),
    [allTopics],
  )

  const topics = useMemo(() => {
    const q = query.toLowerCase().trim()
    const filtered = allTopics.filter((topic) => {
      const matchQuery =
        !q || [topic.title, topic.description, topic.category, ...topic.tags].join(' ').toLowerCase().includes(q)
      const matchCategory = category === 'all' || topic.category === category
      const matchStatus = status === 'all' || topic.status === status
      return matchQuery && matchCategory && matchStatus
    })

    return [...filtered].sort((a, b) => {
      if (sort === 'popular') return b.likeCount - a.likeCount
      if (sort === 'deadline') return a.windowHours - b.windowHours
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [allTopics, category, query, sort, status])

  const hasActiveFilter = Boolean(query.trim()) || category !== 'all' || status !== 'all' || sort !== 'newest'

  function resetFilters() {
    setQuery('')
    setCategory('all')
    setStatus('all')
    setSort('newest')
  }

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border-subtle bg-white px-5 py-5 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="brand">Chủ đề học tập</Badge>
            <h1 className="mt-3 text-[30px] font-extrabold leading-tight text-primary-container sm:text-[34px]">
              Danh sách chủ đề học tập
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted sm:text-base">
              Tìm chủ đề vừa đủ nhỏ, tự học trong thời gian giới hạn và mở khóa dạy chéo sau khi nộp bài.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
            <CompactStat label="Chủ đề" value={stats.total} />
            <CompactStat label="Bài nộp" value={stats.submissions} />
            <CompactStat label="Lượt thích" value={stats.likes} />
            <CompactStat label="Chưa duyệt" value={stats.pending} />
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(300px,1fr)_210px_190px_auto]">
          <label className="relative block">
            <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              aria-label="Tìm kiếm chủ đề"
              className="h-11 w-full rounded-md border border-border bg-surface-low pl-10 pr-3 text-sm outline-none transition focus:border-secondary-container focus:bg-white focus:ring-2 focus:ring-secondary-container/15"
              placeholder="Tìm chủ đề, ví dụ: Python"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <Select aria-label="Danh mục" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Tất cả danh mục</option>
            <option value="Toán học">Toán học</option>
            <option value="Lập trình">Lập trình</option>
            <option value="Marketing">Marketing</option>
            <option value="Kỹ năng học tập">Kỹ năng học tập</option>
          </Select>
          <Select aria-label="Sắp xếp" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="deadline">Sắp hết hạn</option>
          </Select>
          {hasActiveFilter && (
            <Button variant="ghost" onClick={resetFilters}>
              Xóa lọc
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <TopicSkeleton key={index} />
          ))}
        </div>
      ) : topics.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic._id} topic={topic} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Không tìm thấy chủ đề phù hợp"
          description="Thử đổi từ khóa hoặc xóa bộ lọc để xem thêm chủ đề."
          actionLabel="Tạo đề xuất mới"
          to="/topics/new"
        />
      )}
    </div>
  )
}

function CompactStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-low px-4 py-3">
      <p className="text-xl font-extrabold leading-none text-primary-container">{value}</p>
      <p className="mt-1 text-xs font-semibold text-ink-subtle">{label}</p>
    </div>
  )
}

function TopicSkeleton() {
  return (
    <Card className="min-h-[260px] p-5">
      <div className="flex justify-between">
        <div className="h-6 w-20 animate-pulse rounded-full bg-surface-container" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-surface-container" />
      </div>
      <div className="mt-5 h-6 w-4/5 animate-pulse rounded bg-surface-container" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-surface-low" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-surface-low" />
      <div className="mt-6 h-px bg-border-subtle" />
      <div className="mt-5 flex items-center justify-between">
        <div className="h-5 w-36 animate-pulse rounded bg-surface-low" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-surface-container" />
      </div>
    </Card>
  )
}

export function TopicDetailPage() {
  const { id = 't1' } = useParams()
  const navigate = useNavigate()
  const { data: topic } = useAsync(() => topicService.getTopicById(id), topicFallback(id), [id])
  const { data: currentUser } = useAsync(() => authService.getSessionUser(), null)
  const [participating, setParticipating] = useState(false)
  const mySubmission = topic.mySubmission

  // Kiểm tra user có phải chủ topic không
  const creatorId = typeof topic.createdBy === 'object' ? topic.createdBy._id : topic.createdBy
  const isOwner = !!currentUser && !!creatorId && currentUser.id === String(creatorId)

  const expired = topic.status === 'Đang mở' && Boolean(topic.closesAt) && new Date(topic.closesAt as string).getTime() <= Date.now()
  const disabled = topic.status !== 'Đang mở' || expired
  const statusCopy =
    expired
      ? 'Window học đã kết thúc. Bạn vẫn có thể xem thông tin chủ đề, nhưng không thể nộp bài mới.'
      : topic.status === 'Đã hoàn thành'
        ? 'Chủ đề đã đóng. Bạn vẫn có thể xem bài cộng đồng nhưng không thể bắt đầu học mới.'
        : topic.status === 'Bị từ chối'
          ? topic.rejectionReason ?? 'Đề xuất chưa đạt yêu cầu và cần chỉnh sửa trước khi gửi lại.'
          : 'Chủ đề đang chờ admin duyệt trước khi mở cho cộng đồng.'

  async function handleStartLearning() {
    if (disabled || participating) return
    setParticipating(true)
    let startedAt: number | null = null
    try {
      const result = await topicService.participate(id)
      startedAt = result.startedAt ? new Date(result.startedAt).getTime() : Date.now()
    } catch {
      // Đã tham gia trước đó — dùng participationStartTime từ topic nếu có
      startedAt = topic.participationStartTime
        ? new Date(topic.participationStartTime).getTime()
        : null
    } finally {
      setParticipating(false)
    }
    navigate(`/topics/${id}/learn`, {
      state: {
        participationStartTime: startedAt,
        windowHours: topic.windowHours,
      },
    })
  }

  if (topic.status === 'Chưa duyệt')
    return <TopicPendingDetail topic={topic} />


  if (topic.status === 'Bị từ chối') {
    return <TopicRejectedDetail topic={topic} />
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <div className="flex items-center gap-3">
          <TopicStatusBadge status={topic.status} />
          <Badge tone="info">{topic.category}</Badge>
        </div>
        <h1 className="mt-4 text-[38px] font-extrabold leading-tight text-primary-container">{topic.title}</h1>
        <p className="mt-4 text-lg text-ink-muted">{topic.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {topic.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <Card className="mt-6 p-6">
          <h2 className="text-xl font-extrabold text-primary-container">Tài liệu tham khảo</h2>
          <div className="mt-4">
            <ResourceList resources={topic.resources} />
          </div>
        </Card>

        {disabled && (
          <Card className="mt-6 border-amber bg-amber-light p-5">
            <p className="font-bold text-amber-900">Không thể bắt đầu học mới</p>
            <p className="mt-1 text-sm text-amber-900">{statusCopy}</p>
          </Card>
        )}
      </div>

      <aside className="space-y-4">
        <Card className="p-5">
          <p className="text-sm font-bold text-ink-muted">Window học</p>
          <p className="mt-2 text-2xl font-extrabold text-primary-container">{topic.windowHours} giờ</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-surface-low p-3">
              <p className="text-xl font-extrabold text-primary-container">{topic.submissionCount}</p>
              <p className="text-xs text-ink-muted">bài nộp</p>
            </div>
            <div className="rounded-md bg-surface-low p-3">
              <p className="text-xl font-extrabold text-primary-container">{topic.likeCount}</p>
              <p className="text-xs text-ink-muted">like</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {isOwner && topic.status === 'Đang mở' ? (
              <>
                <Badge tone="info">Bạn người tạo chủ đề này</Badge>
                <ActionLink to={`/topics/${topic._id}/peer`} variant="primary">
                  Vào dạy chéo
                </ActionLink>
              </>
            ) : null}
            {mySubmission ? (
              <>
                <Badge tone="success">Đã nộp bài</Badge>
                <ActionLink to={`/topics/${topic._id}/peer`}>Vào dạy chéo</ActionLink>
              </>
            ) : (
              <Button
                variant={disabled ? 'secondary' : 'primary'}
                disabled={disabled || participating}
                onClick={handleStartLearning}
                className="w-full"
              >
                {participating ? 'Đang xử lý...' : disabled ? 'Chưa thể học' : 'Bắt đầu học'}
              </Button>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-bold text-ink">Thông tin đề xuất</p>
          <p className="text-sm text-ink-muted">Ngày tạo: {formatDate(topic.createdAt)}</p>
        </Card>
      </aside>
    </div>
  )
}

function TopicPendingDetail({ topic }: { topic: Topic }) {
  return (
    <div className="mx-auto max-w-[1160px] pt-6">
      <TopicPendingHeader topic={topic} />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <TopicProposalInfoCard topic={topic} />
          <TopicPendingNotice topic={topic} />
        </div>
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <TopicStatusSidebar topic={topic} />
        </aside>
      </div>
    </div>
  )
}

function TopicPendingHeader({ topic }: { topic: Topic }) {
  return (
    <div className="rounded-md border border-border-subtle bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <TopicStatusBadge status={topic.status} />
        <Badge tone="info">{topic.category}</Badge>
      </div>
      <h1 className="mt-4 text-[34px] font-extrabold leading-tight text-primary-container sm:text-[38px]">{topic.title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-ink-muted">{topic.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {topic.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <div className="mt-5 rounded-md border border-amber bg-amber-light/55 px-4 py-4">
        <p className="text-sm font-extrabold text-amber-900">Đề xuất chưa duyệt</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">
          Đây là chủ đề bạn đã đề xuất. Chủ đề sẽ được mở cho cộng đồng học sau khi admin phê duyệt.
        </p>
      </div>
    </div>
  )
}

function TopicProposalInfoCard({ topic }: { topic: Topic }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-extrabold text-primary-container">Thông tin đề xuất</h2>
      <div className="mt-5 grid gap-5">
        <section>
          <h3 className="text-sm font-extrabold text-ink">Mục tiêu / mô tả chủ đề</h3>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{topic.description}</p>
        </section>
        <section>
          <h3 className="mb-2 text-sm font-extrabold text-ink">Tài liệu tham khảo</h3>
          <ResourceList resources={topic.resources} />
        </section>
        <section>
          <h3 className="text-sm font-extrabold text-ink">Lý do đề xuất</h3>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {topic.proposalReason ?? 'Chủ đề có phạm vi đủ nhỏ, phù hợp để người học tự học và giải thích lại bằng ngôn ngữ của mình.'}
          </p>
        </section>
      </div>
    </Card>
  )
}

function TopicPendingNotice({ topic }: { topic: Topic }) {
  return (
    <Card className="border-amber bg-amber-light/45 p-5">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-900 shadow-card">
          <Icon name="clock" size={18} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-amber-900">Chưa thể bắt đầu học</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Chủ đề này đang chờ admin duyệt trước khi mở cho cộng đồng. Sau khi được duyệt, bạn và những người học khác có thể bắt đầu học trong window đã thiết lập.
          </p>
          <div className="mt-4 grid gap-2 text-sm font-semibold text-amber-900 sm:grid-cols-3">
            <span>Trạng thái: Chưa duyệt</span>
            <span>Thời gian học: {topic.windowHours} giờ</span>
            <span>Có thể chỉnh sửa: Có</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

function TopicStatusSidebar({ topic }: { topic: Topic }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-extrabold text-primary-container">Trạng thái đề xuất</h2>
      <div className="mt-4">
        <Badge tone="warning" className="px-3 py-1.5 text-sm">Chưa duyệt</Badge>
      </div>
      <div className="mt-5">
        <p className="text-sm font-bold text-ink-muted">Window học</p>
        <p className="mt-2 text-2xl font-extrabold text-primary-container">{topic.windowHours} giờ</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-surface-low p-3">
          <p className="text-xl font-extrabold text-primary-container">{topic.submissionCount}</p>
          <p className="text-xs text-ink-muted">bài nộp</p>
        </div>
        <div className="rounded-md bg-surface-low p-3">
          <p className="text-xl font-extrabold text-primary-container">{topic.likeCount}</p>
          <p className="text-xs text-ink-muted">like</p>
        </div>
      </div>
      <div className="mt-5 rounded-md bg-surface-low px-3 py-2 text-center text-sm font-bold text-ink-muted">
        Đang chờ admin duyệt
      </div>
      <p className="mt-3 text-xs font-medium leading-5 text-ink-subtle">Bạn sẽ được thông báo khi trạng thái thay đổi.</p>

      <div className="mt-5 border-t border-border-subtle pt-5">
        <h3 className="text-sm font-extrabold text-primary-container">Thông tin đề xuất</h3>
        <div className="mt-4 grid gap-3 text-sm">
          <InfoLine label="Ngày tạo" value={formatDate(topic.createdAt)} />
          <InfoLine label="Mã đề xuất" value={topic._id.toUpperCase()} />
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <ActionLink to="/topics/new" variant="primary">Chỉnh sửa đề xuất</ActionLink>
        <ActionLink to="/topics">Quay lại danh sách</ActionLink>
      </div>
    </Card>
  )
}

function TopicRejectedDetail({ topic }: { topic: Topic }) {
  return (
    <div className="mx-auto max-w-[1160px]">
      <TopicRejectedHeader topic={topic} />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <RejectedProposalInfoCard topic={topic} />
          <RejectionReasonCard topic={topic} />
        </div>
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <TopicRejectedSidebar topic={topic} />
          <RejectedProposalMetaCard topic={topic} />
        </aside>
      </div>
    </div>
  )
}

function TopicRejectedHeader({ topic }: { topic: Topic }) {
  return (
    <div className="rounded-md border border-border-subtle bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <TopicStatusBadge status={topic.status} />
        <Badge tone="info">{topic.category}</Badge>
      </div>
      <h1 className="mt-4 text-[34px] font-extrabold leading-tight text-primary-container sm:text-[38px]">{topic.title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-ink-muted">{topic.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {topic.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <div className="mt-5 rounded-md border border-error-container bg-error-container/45 px-4 py-3">
        <p className="text-sm font-semibold leading-6 text-error">
          Đây là chủ đề bạn đã đề xuất, nhưng admin đã từ chối vì nội dung chưa phù hợp để mở cho cộng đồng học.
        </p>
      </div>
    </div>
  )
}

function RejectedProposalInfoCard({ topic }: { topic: Topic }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-extrabold text-primary-container">Thông tin đề xuất</h2>
      <div className="mt-5 grid gap-5">
        <section>
          <h3 className="text-sm font-extrabold text-ink">Mô tả chủ đề</h3>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{topic.description}</p>
        </section>
        <section>
          <h3 className="mb-2 text-sm font-extrabold text-ink">Tài liệu tham khảo</h3>
          <ResourceList resources={topic.resources} />
        </section>
        <section>
          <h3 className="text-sm font-extrabold text-ink">Lý do đề xuất</h3>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{topic.proposalReason ?? 'Chưa có lý do đề xuất được ghi nhận.'}</p>
        </section>
      </div>
    </Card>
  )
}

function RejectionReasonCard({ topic }: { topic: Topic }) {
  const reason = topic.rejectionReason?.trim()

  if (!reason) return null

  return (
    <Card className="border-error-container bg-error-container/25 p-5">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-error shadow-card">
          <Icon name="close" size={18} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-error">Lý do bị từ chối</h2>
          {reason && <p className="mt-2 text-sm font-semibold leading-6 text-error">{reason}</p>}
        </div>
      </div>
    </Card>
  )
}

function TopicRejectedSidebar({ topic }: { topic: Topic }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-extrabold text-primary-container">Trạng thái đề xuất</h2>
      <div className="mt-4">
        <Badge tone="danger" className="px-3 py-1.5 text-sm">Bị từ chối</Badge>
      </div>
      <div className="mt-5">
        <p className="text-sm font-bold text-ink-muted">Window học</p>
        <p className="mt-2 text-2xl font-extrabold text-primary-container">{topic.windowHours} giờ</p>
        <p className="mt-1 text-sm font-bold text-error">Đã từ chối</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-surface-low p-3">
          <p className="text-xl font-extrabold text-primary-container">{topic.submissionCount}</p>
          <p className="text-xs text-ink-muted">bài nộp</p>
        </div>
        <div className="rounded-md bg-surface-low p-3">
          <p className="text-xl font-extrabold text-primary-container">{topic.likeCount}</p>
          <p className="text-xs text-ink-muted">like</p>
        </div>
      </div>
      <div className="mt-5 rounded-md bg-error-container/45 px-3 py-2 text-center text-sm font-bold text-error">
        Không thể bắt đầu học
      </div>
      <p className="mt-3 text-xs font-medium leading-5 text-ink-subtle">Bạn có thể chỉnh sửa đề xuất và gửi lại nếu muốn.</p>
      <div className="mt-5 grid gap-2">
        <ActionLink to={`/topics/${topic._id}/edit`} variant="primary">Chỉnh sửa & gửi lại</ActionLink>
        <ActionLink to="/topics">Quay lại danh sách chủ đề</ActionLink>
      </div>
    </Card>
  )
}

function RejectedProposalMetaCard({ topic }: { topic: Topic }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-extrabold text-primary-container">Thông tin đề xuất</h2>
      <div className="mt-4 grid gap-3 text-sm">
        <InfoLine label="Ngày tạo" value={formatDate(topic.createdAt)} />
      </div>
    </Card>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-2 last:border-b-0 last:pb-0">
      <span className="font-semibold text-ink-muted">{label}</span>
      <span className="text-right font-bold text-ink">{value}</span>
    </div>
  )
}

export function CreateTopicPage() {
  const { id } = useParams()
  const { data: editingTopic, loading: editingTopicLoading } = useAsync<Topic | undefined>(
    () => (id ? topicService.getTopicById(id) : Promise.resolve(undefined)),
    undefined,
    [id],
  )
  const isResubmitting = editingTopic?.status === 'Bị từ chối'
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showRejected, setShowRejected] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [title, setTitle] = useState(editingTopic?.title ?? '')
  const [description, setDescription] = useState(editingTopic?.description ?? '')
  const [category, setCategory] = useState(editingTopic?.category ?? 'Lập trình')
  const [durationHours, setDurationHours] = useState(editingTopic ? String(editingTopic.windowHours) : '')
  const [tags, setTags] = useState(editingTopic?.tags ?? [])
  const [tagDraft, setTagDraft] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [uploadedResources, setUploadedResources] = useState<ResourceFile[]>([])
  const [reason, setReason] = useState(editingTopic?.proposalReason ?? '')

  useEffect(() => {
    if (!editingTopic) return
    setTitle(editingTopic.title)
    setDescription(editingTopic.description)
    setCategory(editingTopic.category || 'Lập trình')
    setDurationHours(String(editingTopic.windowHours || 48))
    setTags(editingTopic.tags ?? [])
    setLinkLabel('')
    setLinkUrl('')
    setUploadedResources(editingTopic.resources ?? [])
    setReason(editingTopic?.proposalReason ?? '')
  }, [editingTopic])

  const addLinkToResources = () => {
    const url = linkUrl.trim()
    if (!url) return null
    if (!/^https?:\/\/\S+$/i.test(url)) {
      return { error: 'URL tài liệu phải bắt đầu bằng http:// hoặc https://' }
    }
    const label = linkLabel.trim() || url
    return {
      id: `link-${Date.now()}`,
      label,
      type: 'link' as const,
      url,
    }
  }

  const handleAddLink = () => {
    const result = addLinkToResources()
    if (!result) return
    if ('error' in result) {
      const errMsg = result.error || 'URL tài liệu không hợp lệ.'
      setErrors((current) => ({ ...current, linkUrl: errMsg }))
      return
    }
    setUploadedResources((current) => [...current, result])
    setLinkLabel('')
    setLinkUrl('')
    setErrors((current) => ({ ...current, linkUrl: '', resources: '' }))
  }

  const handleLinkKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddLink()
    }
  }

  const checklist = [
    { label: 'Tên chủ đề', done: Boolean(title.trim()) },
    { label: 'Mô tả rõ ràng', done: Boolean(description.trim()) },
    { label: 'Tối đa 5 tags', done: tags.length > 0 && tags.length <= 5 },
    { label: 'Tài liệu hợp lệ', done: uploadedResources.length > 0 || (!!linkUrl.trim() && /^https?:\/\/\S+$/i.test(linkUrl.trim())) },
    { label: 'Thời lượng học', done: Number(durationHours) >= 24 && Number(durationHours) <= 168 },
  ]
  const completedCount = checklist.filter((item) => item.done).length

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const nextErrors: Record<string, string> = {}
    if (!title.trim()) nextErrors.title = 'Vui lòng nhập tên chủ đề.'
    if (!description.trim()) nextErrors.description = 'Vui lòng mô tả mục tiêu học của chủ đề.'
    if (tags.length > 5) nextErrors.tags = 'Tối đa 5 tags.'
    if (!durationHours || Number(durationHours) < 24 || Number(durationHours) > 168) nextErrors.duration = 'Thời lượng học phải từ 24 đến 168 giờ.'

    const finalResources = [...uploadedResources]
    if (linkUrl.trim()) {
      const result = addLinkToResources()
      if (result && 'error' in result) {
        nextErrors.linkUrl = result.error || 'URL tài liệu không hợp lệ.'
      } else if (result) {
        finalResources.push(result)
      }
    }

    if (finalResources.length === 0) {
      nextErrors.resources = 'Vui lòng thêm ít nhất một tài liệu tham khảo (file hoặc link).'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const resources = finalResources.map((r) => ({
      label: r.label,
      type: r.type === 'link' ? ('link' as const) : ('file' as const),
      url: r.url,
    }))

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      tags,
      resources,
      proposalReason: reason.trim(),
      windowHours: Number(durationHours),
    }
    setSubmitting(true)
    try {
      if (isResubmitting && editingTopic) {
        await topicService.updateTopic(editingTopic._id, payload)
      } else {
        await topicService.createTopic(payload)
      }
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const allowed = ['pdf', 'docx', 'md', 'txt', 'png', 'jpg', 'jpeg', 'webp']
    const picked = Array.from(files)
    const invalid = picked.find((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      return !allowed.includes(ext) || file.size > 20 * 1024 * 1024
    })
    if (invalid) {
      setErrors((current) => ({ ...current, resources: 'File cần thuộc PDF, PNG, JPG, WebP, DOCX, MD, TXT và tối đa 20MB.' }))
      return
    }
    setErrors((current) => ({ ...current, resources: '' }))
    try {
      const uploaded = await Promise.all(picked.map((f) => uploadService.uploadFile(f)))
      setUploadedResources((current) => [...current, ...uploaded].slice(0, 5))
    } catch (e) {
      setErrors((current) => ({ ...current, resources: (e as Error).message }))
    }
  }

  function addTag(value = tagDraft) {
    const nextTag = value.trim()
    if (!nextTag || tags.includes(nextTag) || tags.length >= 5) return
    setTags((current) => [...current, nextTag])
    setTagDraft('')
  }

  if (submitted) return <TopicPendingPage />
  if (id && editingTopicLoading) return <Card className="p-6 text-sm font-bold text-ink-muted">Đang tải dữ liệu đề xuất...</Card>
  if (id && !editingTopic) return <EmptyState title="Không tìm thấy đề xuất" description="Đề xuất này không tồn tại hoặc bạn không có quyền chỉnh sửa." />

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-6">
        <PageHeader
          eyebrow="Learner"
          title={isResubmitting ? 'Chỉnh sửa & gửi lại chủ đề' : 'Đề xuất chủ đề mới'}
          description={isResubmitting ? 'Cập nhật đề xuất theo phản hồi của admin, sau đó gửi lại vào hàng chờ duyệt.' : 'Gửi một chủ đề đủ nhỏ để cộng đồng có thể tự học, viết lại và dạy chéo trong thời gian giới hạn.'}
        />
        {isResubmitting && editingTopic && (editingTopic.rejectionReason) && (
          <div className="mt-5 rounded-md border border-error-container bg-error-container/25 p-4">
            <p className="text-sm font-extrabold text-error">Lý do bị từ chối</p>
            {editingTopic.rejectionReason && <p className="mt-2 text-sm font-semibold leading-6 text-error">{editingTopic.rejectionReason}</p>}
          </div>
        )}
        <form className="mt-6 grid gap-8" onSubmit={submit}>
          <FormSection title="Thông tin cơ bản">
            <label className="grid gap-1.5 text-sm font-semibold text-ink">
              Tên chủ đề
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={cn(
                  'h-11 rounded-md border border-border bg-surface-low px-3 text-sm font-normal outline-none transition focus:border-secondary-container focus:bg-white focus:ring-2 focus:ring-secondary-container/15',
                  errors.title && 'border-error',
                )}
                placeholder="Ví dụ: Cấu Trúc Dữ Liệu - Stack và Queue"
              />
              <FieldHint error={errors.title}>Bắt buộc. Nên cụ thể và rõ phạm vi.</FieldHint>
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-ink">
              Mô tả ngắn
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={cn(
                  'min-h-[112px] rounded-md border border-border bg-surface-low px-3 py-2.5 text-sm font-normal outline-none transition focus:border-secondary-container focus:bg-white focus:ring-2 focus:ring-secondary-container/15',
                  errors.description && 'border-error',
                )}
              />
              <FieldHint error={errors.description}>Nêu mục tiêu và kết quả cần viết lại.</FieldHint>
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select label="Danh mục" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>Lập trình</option>
                <option>Toán học</option>
                <option>Marketing</option>
                <option>Kỹ năng học tập</option>
              </Select>
              <label className="grid gap-1.5 text-sm font-semibold text-ink">
                Thời lượng học
                <div className="relative">
                  <input
                    type="number"
                    min={24}
                    max={168}
                    value={durationHours}
                    onChange={(event) => setDurationHours(event.target.value)}
                    className={cn(
                      'h-11 w-full rounded-md border border-border bg-surface-low px-3 pr-14 text-sm font-normal outline-none transition focus:border-secondary-container focus:bg-white focus:ring-2 focus:ring-secondary-container/15',
                      errors.duration && 'border-error',
                    )}
                    placeholder="48"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-subtle">
                    giờ
                  </span>
                </div>
                {errors.duration && <FieldHint error={errors.duration}>Thời lượng học không hợp lệ.</FieldHint>}
              </label>
            </div>
          </FormSection>

          <FormSection title="Phân loại và tài liệu">
            <label className="grid gap-1.5 text-sm font-semibold text-ink">
              Tags
              <div className="rounded-md border border-border bg-surface-low px-3 py-2 transition focus-within:border-secondary-container focus-within:bg-white focus-within:ring-2 focus-within:ring-secondary-container/15">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2.5 py-1 text-xs font-bold text-secondary-container">
                      {tag}
                      <button type="button" className="text-secondary-container/70 hover:text-secondary-container" onClick={() => setTags((current) => current.filter((item) => item !== tag))}>
                        x
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagDraft}
                    onChange={(event) => setTagDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ',') {
                        event.preventDefault()
                        addTag()
                      }
                    }}
                    className="h-7 min-w-[160px] flex-1 bg-transparent text-sm font-normal outline-none"
                    placeholder={tags.length >= 5 ? 'Đã đủ 5 tags' : 'Nhập tag rồi Enter'}
                    disabled={tags.length >= 5}
                  />
                </div>
              </div>
              <FieldHint error={errors.tags}>Tối đa 5 tags. Hiện tại: {tags.length}/5.</FieldHint>
            </label>

            <div className="grid gap-4">
              <div className="grid gap-3 rounded-md border border-border bg-surface-low p-4">
                <p className="text-sm font-bold text-ink">Thêm link tài liệu tham khảo</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-semibold text-ink-muted">
                    Nhãn tài liệu (không bắt buộc)
                    <input
                      value={linkLabel}
                      onChange={(event) => setLinkLabel(event.target.value)}
                      onKeyDown={handleLinkKeyDown}
                      className="h-10 rounded-md border border-border bg-white px-3 text-sm font-normal outline-none transition focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/15"
                      placeholder="Ví dụ: Trang chủ React"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold text-ink-muted">
                    URL tài liệu
                    <input
                      value={linkUrl}
                      onChange={(event) => setLinkUrl(event.target.value)}
                      onKeyDown={handleLinkKeyDown}
                      className={cn(
                        'h-10 rounded-md border border-border bg-white px-3 text-sm font-normal outline-none transition focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/15',
                        errors.linkUrl && 'border-error'
                      )}
                      placeholder="https://react.dev"
                    />
                  </label>
                </div>
                {errors.linkUrl && <span className="text-xs font-semibold text-error">{errors.linkUrl}</span>}
                <div className="flex justify-end">
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddLink}>
                    <Icon name="check" size={14} className="mr-1" /> Thêm link
                  </Button>
                </div>
              </div>

              <div className="grid gap-1.5 text-sm font-semibold text-ink">
                Tải lên tài liệu
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-surface-low px-4 py-3 transition hover:border-secondary-container hover:bg-secondary-fixed/35">
                  <input
                    type="file"
                    multiple
                    className="sr-only"
                    accept=".pdf,.docx,.md,.txt,.png,.jpg,.jpeg,.webp"
                    onChange={(event) => handleFiles(event.target.files)}
                  />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-secondary-container shadow-card">
                    <Icon name="upload" />
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-bold text-ink">Kéo thả file hoặc bấm để tải lên</span>
                    <span className="mt-0.5 block text-xs font-medium text-ink-subtle">PDF, PNG, JPG, WebP, DOCX, TXT, MD · tối đa 20MB.</span>
                  </span>
                </label>
              </div>

              {!!uploadedResources.length && (
                <div className="grid gap-2">
                  <p className="text-xs font-bold text-ink-muted">Danh sách tài liệu đã thêm:</p>
                  {uploadedResources.map((file, idx) => (
                    <div key={file.url || idx} className="flex items-center justify-between rounded-md border border-border-subtle bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-ink">
                        <Icon name={file.type === 'link' ? 'link' : 'file'} size={16} />
                        <span className="truncate">{file.label}</span>
                        <span className="text-xs font-normal text-ink-subtle">({file.type})</span>
                      </span>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-surface-low hover:text-error transition"
                        onClick={() => setUploadedResources(current => current.filter((_, i) => i !== idx))}
                        title="Xóa tài liệu"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FieldHint error={errors.resources}>Dùng link hoặc upload file tham khảo.</FieldHint>
            </div>
          </FormSection>

          <FormSection title="Lý do đề xuất">
            <Textarea label="Lý do đề xuất" value={reason} onChange={(event) => setReason(event.target.value)} />
            <p className="text-xs font-medium text-ink-subtle">
              Mẹo: ưu tiên chủ đề nhỏ, rõ mục tiêu và có tài liệu tham khảo cụ thể.
            </p>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="text-sm font-bold text-ink-muted hover:text-secondary-container" onClick={() => setShowRejected(true)}>
              Xem mẹo đề xuất tốt
            </button>
            <div className="flex flex-wrap justify-end gap-3">
              <ActionLink to="/topics">Hủy</ActionLink>
              <Button type="button" variant="secondary">Lưu nháp</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi đề xuất'}</Button>
            </div>
          </div>
        </form>
      </Card>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card className="border-border-subtle p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-primary-container">Xem trước chủ đề</h3>
              <p className="mt-1 text-xs font-medium text-ink-muted">Hiển thị trong danh sách.</p>
            </div>
            <Badge tone="warning">Chưa duyệt</Badge>
          </div>
          <div className="mt-4 rounded-md bg-surface-low p-4">
            <div className="flex items-center justify-between gap-2">
              <Badge tone="info">{category}</Badge>
              <span className="text-xs font-bold text-ink-subtle">{durationHours || 0} giờ</span>
            </div>
            <h4 className="mt-3 line-clamp-2 text-lg font-extrabold leading-snug text-primary-container">{title || 'Tên chủ đề'}</h4>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-muted">{description || 'Mô tả ngắn về mục tiêu học.'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.length ? tags.map((tag) => <Badge key={tag}>{tag}</Badge>) : (uploadedResources.length ? uploadedResources.map((res) => <Badge key={res.url}>{res.label}</Badge>) : <Badge>Chưa có tag</Badge>)}
            </div>
          </div>
        </Card>

        <Card className="border-border-subtle p-4 shadow-card">
          <h3 className="text-base font-extrabold text-primary-container">Kiểm tra hợp lệ</h3>
          <p className="mt-1 text-xs font-medium text-ink-muted">Hoàn thiện {completedCount}/{checklist.length} mục.</p>
          <div className="mt-4 space-y-2.5">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm font-semibold">
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', item.done ? 'bg-emerald text-white' : 'bg-surface-container text-ink-subtle')}>
                  <Icon name="check" size={12} />
                </span>
                <span className={item.done ? 'text-ink' : 'text-ink-muted'}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${(completedCount / checklist.length) * 100}%` }} />
          </div>
        </Card>

      </aside>

      <Modal open={showRejected} title="Mẹo đề xuất tốt" onClose={() => setShowRejected(false)}>
        <p className="text-sm leading-6 text-ink-muted">
          Ưu tiên chủ đề có phạm vi nhỏ, kết quả học rõ ràng, thời lượng phù hợp và có tài liệu tham khảo cụ thể để admin dễ duyệt.
        </p>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setShowRejected(false)}>Đã hiểu</Button>
        </div>
      </Modal>
    </div>
  )
}

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border-subtle pt-6 first:border-t-0 first:pt-0">
      <div>
        <h2 className="text-base font-extrabold text-primary-container">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

function FieldHint({ error, children }: { error?: string; children: ReactNode }) {
  if (error) return <span className="text-xs font-semibold text-error">{error}</span>
  return <span className="text-xs font-medium text-ink-subtle">{children}</span>
}

function formatLocalFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function inferTopicResourceType(name: string) {
  const lower = name.toLowerCase()
  if (/\.(png|jpg|jpeg|webp)$/.test(lower)) return 'image' as const
  if (lower.endsWith('.pdf')) return 'pdf' as const
  if (lower.endsWith('.docx')) return 'docx' as const
  if (lower.endsWith('.txt')) return 'txt' as const
  return 'markdown' as const
}

export function TopicPendingPage() {
  const { id = 't4' } = useParams()
  const topic = topicFallback(id)
  return (
    <div className="mx-auto max-w-4xl">
      <Card className="p-8">
        <Badge tone="warning">Chưa duyệt</Badge>
        <h1 className="mt-4 text-[34px] font-extrabold text-primary-container">{topic.title}</h1>
        <p className="mt-3 text-ink-muted">
          Admin đang kiểm tra phạm vi, tài liệu và window học. Bạn sẽ nhận thông báo khi đề xuất được duyệt hoặc cần chỉnh sửa.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {['Đã gửi đề xuất', 'Admin review', 'Mở cho cộng đồng'].map((step, index) => (
            <div key={step} className="rounded-md border border-border bg-surface-low p-4">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                  index === 0 ? 'bg-emerald text-white' : 'bg-white text-ink-muted',
                )}
              >
                {index + 1}
              </span>
              <p className="mt-3 font-bold text-ink">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <ActionLink to="/topics">Quay lại danh sách</ActionLink>
          <ActionLink to="/notifications" variant="primary">
            Xem thông báo
          </ActionLink>
        </div>
      </Card>
    </div>
  )
}

export function MyTopicsPage() {
  const { data: topics, loading } = useAsync(() => topicService.getMyTopics(), [])

  const statusOrder: Record<string, number> = {
    'Đang mở': 0,
    'Chưa duyệt': 1,
    'Đã hoàn thành': 2,
    'Bị từ chối': 3,
  }
  const sorted = [...topics].sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9))

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border-subtle bg-white px-5 py-5 shadow-card">
        <Badge tone="brand">Của tôi</Badge>
        <h1 className="mt-3 text-[30px] font-extrabold leading-tight text-primary-container sm:text-[34px]">
          Chủ đề tôi đã tạo
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted sm:text-base">
          Danh sách các chủ đề bạn đã đề xuất, đang mở hoặc đã hoàn thành.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map(i => (
            <Card key={i} className="h-24 animate-pulse bg-surface-low p-5">{' '}</Card>
          ))}
        </div>
      ) : sorted.length ? (
        <div className="grid gap-4">
          {sorted.map(topic => (
            <Card key={topic._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TopicStatusBadge status={topic.status} />
                  <Badge tone="info">{topic.category}</Badge>
                </div>
                <p className="mt-2 truncate text-base font-extrabold text-primary-container">{topic.title}</p>
                <p className="mt-1 line-clamp-1 text-sm text-ink-muted">{topic.description}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-ink-subtle">
                  <span>{topic.submissionCount} bài nộp</span>
                  <span>{topic.windowHours} giờ</span>
                  <span>{formatDate(topic.createdAt)}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {topic.status === 'Bị từ chối' && (
                  <ActionLink to={`/topics/${topic._id}/edit`} variant="primary">
                    Chỉnh sửa
                  </ActionLink>
                )}
                {topic.status === 'Chưa duyệt' && (
                  <ActionLink to={`/topics/${topic._id}/pending`}>
                    Xem trạng thái
                  </ActionLink>
                )}
                {(topic.status === 'Đang mở' || topic.status === 'Đã hoàn thành') && (
                  <ActionLink to={`/topics/${topic._id}`}>
                    Xem chủ đề
                  </ActionLink>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Bạn chưa tạo chủ đề nào"
          description="Hãy đề xuất chủ đề đầu tiên để cộng đồng cùng học."
          actionLabel="Tạo chủ đề"
          to="/topics/new"
        />
      )}
    </div>
  )
}
