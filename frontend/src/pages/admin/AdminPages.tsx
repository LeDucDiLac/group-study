import { useState } from 'react'
import type { FormEvent, InputHTMLAttributes } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BadgeProgressCard, ContributionBadge } from '@/components/badge/ContributionBadge'
import { ResourceList, TopicStatusBadge } from '@/components/topic/TopicCard'
import { ActionLink, Avatar, Badge, Button, Card, EmptyState, Icon, Input, Modal, PageHeader, Select, StatCard, Textarea } from '@/components/ui'
import { adminService, authService, lookupService, topicService, userService } from '@/services/api'
import type { Submission, Topic, TopicStatus, User } from '@/types/domain'
import { cn, formatDate } from '@/utils/format'
import { useAsync } from '@/utils/hooks'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@timebox.edu.vn')
  const [password, setPassword] = useState('timeboxed')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await authService.login(email, password)
      if (user.role !== 'admin') {
        setError('Tài khoản này không có quyền quản trị.')
        setLoading(false)
        return
      }
      setLoading(false)
      navigate('/admin/dashboard')
    } catch {
      setError('Email hoặc mật khẩu chưa chính xác.')
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(135deg,#FFFDFB_0%,#FFF7F4_54%,#FCEDEA_100%)] px-5 py-10">
      <div className="pointer-events-none absolute right-[-120px] top-[-160px] h-[360px] w-[360px] rounded-full bg-secondary-fixed/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-140px] h-[360px] w-[420px] rounded-full bg-error-container/40 blur-3xl" />

      <div className="relative grid w-full max-w-[1120px] grid-cols-1 items-stretch gap-0 overflow-hidden rounded-2xl border border-secondary-fixed/80 bg-[radial-gradient(circle_at_18%_18%,rgba(220,58,52,0.08),transparent_32%),radial-gradient(circle_at_82%_76%,rgba(159,18,57,0.06),transparent_30%),linear-gradient(135deg,#FFFDFB_0%,#FFF6F2_50%,#FCEDEA_100%)] shadow-modal backdrop-blur-sm xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="pointer-events-none absolute left-10 top-10 hidden h-28 w-28 rounded-full border border-white/70 xl:block" />
        <div className="pointer-events-none absolute bottom-10 right-12 hidden h-20 w-20 rounded-full bg-white/45 blur-xl xl:block" />
        <div className="flex items-center p-7 sm:p-9 xl:p-12">
          <AdminBrandPanel />
        </div>
        <div className="flex items-center p-5 sm:p-8 xl:p-9">
        <AdminLoginCard
          email={email}
          error={error}
          loading={loading}
          password={password}
          remember={remember}
          onEmailChange={(value) => {
            setEmail(value)
            if (error) setError('')
          }}
          onPasswordChange={setPassword}
          onRememberChange={setRemember}
          onSubmit={submit}
        />
        </div>
      </div>
    </div>
  )
}

function AdminBrandPanel() {
  const features = ['Duyệt đề xuất chủ đề', 'Theo dõi bài nộp', 'Quản lý người dùng']

  return (
    <section className="relative max-w-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary-container text-white shadow-[0_18px_42px_rgba(207,58,50,0.24)]">
          <Icon name="shield" size={24} />
        </span>
        <div>
          <p className="text-base font-extrabold text-primary-container">TimeBoxed Admin</p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">Secure Portal</p>
        </div>
      </div>

      <div className="mt-8">
        <Badge tone="brand">TimeBoxed Admin</Badge>
        <h1 className="mt-4 text-[38px] font-extrabold leading-tight text-primary-container sm:text-[44px]">
          Bảng điều phối peer learning
        </h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-ink-muted sm:text-lg">
          Phê duyệt chủ đề, theo dõi hoạt động học tập và quản lý cộng đồng học viên.
        </p>
        <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-ink-subtle">
          Trung tâm kiểm soát nội dung và hoạt động học tập của TimeBoxed.
        </p>
      </div>

      <div className="mt-8 grid max-w-md gap-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 rounded-md bg-white/45 px-3 py-2.5 text-sm font-semibold text-ink-muted">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-secondary-container shadow-card">
              <Icon name="check" size={15} />
            </span>
            {feature}
          </div>
        ))}
      </div>
    </section>
  )
}

function AdminLoginCard({
  email,
  error,
  loading,
  password,
  remember,
  onEmailChange,
  onPasswordChange,
  onRememberChange,
  onSubmit,
}: {
  email: string
  error: string
  loading: boolean
  password: string
  remember: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRememberChange: (value: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Card className="w-full rounded-xl border-white/80 bg-white/92 p-7 shadow-[0_22px_58px_rgba(37,34,43,0.10)] backdrop-blur-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-white shadow-card">
          <Icon name="lock" size={20} />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Đăng nhập quản trị</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">Chỉ tài khoản có quyền Admin mới có thể truy cập.</p>
          <p className="mt-1 text-xs font-semibold text-ink-subtle">Quyền truy cập được giới hạn cho tài khoản quản trị.</p>
        </div>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        {error && <LoginErrorMessage message={error} />}
        <LoginInput
          id="admin-email"
          label="Email"
          icon="mail"
          type="email"
          value={email}
          error={error}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        <LoginInput
          id="admin-password"
          label="Mật khẩu"
          icon="lock"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => onRememberChange(event.target.checked)}
              className="h-4 w-4 rounded border-border text-secondary-container focus:ring-secondary-container"
            />
            Ghi nhớ phiên
          </label>
          <Link to="/forgot-password" className="text-sm font-bold text-secondary-container hover:text-secondary">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" size="lg" className="mt-1 w-full shadow-card" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập admin'}
        </Button>

        <div className="rounded-md bg-surface-low/70 px-3 py-2.5">
          <p className="text-xs font-semibold text-ink-subtle">Tài khoản demo: admin@timebox.edu.vn</p>
          <p className="mt-1 text-xs leading-5 text-ink-subtle">Mọi thao tác quản trị sẽ được ghi nhận trong hệ thống.</p>
        </div>

        <Link
          to="/topics"
          className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-bold text-ink-muted transition hover:bg-surface-low hover:text-ink focus-ring"
        >
          Quay lại trang học viên
        </Link>
      </form>
    </Card>
  )
}

function LoginInput({
  error,
  icon,
  id,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  icon: 'mail' | 'lock'
  id: string
  label: string
}) {
  const errorId = `${id}-error`
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink" htmlFor={id}>
      {label}
      <span className="relative block">
        <Icon name={icon} size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...props}
          className={`h-12 w-full rounded-md border bg-surface-low py-2.5 pl-11 pr-3 text-sm font-normal outline-none transition focus:bg-white focus:ring-2 ${
            error
              ? 'border-error-container text-error focus:border-error focus:ring-error/10'
              : 'border-border focus:border-secondary-container focus:ring-secondary-container/15'
          }`}
        />
      </span>
      {error && (
        <span id={errorId} className="text-xs font-semibold text-error">
          {error}
        </span>
      )}
    </label>
  )
}

function LoginErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-error-container bg-error-container/35 px-4 py-3 text-sm font-semibold text-error" role="alert">
      <Icon name="shield" size={18} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export function AdminDashboardPage() {
  const { data } = useAsync(() => adminService.getOverview(), { topics: [], users: [], submissions: [], comments: [] })
  const { topics, users, submissions } = data
  const pending = topics.filter((topic) => topic.status === 'pending')
  const activeTopics = topics.filter((topic) => topic.status === 'open')
  const rejected = topics.filter((topic) => topic.status === 'rejected')
  const closed = topics.filter((topic) => topic.status === 'closed')
  const totalCommentCount = submissions.reduce((sum, submission) => sum + submission.commentCount, 0)
  const highActivity = [...topics]
    .filter((topic) => topic.status === 'open')
    .sort((a, b) => b.likeCount + getTopicCommentCount(b, submissions) - (a.likeCount + getTopicCommentCount(a, submissions)))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Theo dõi dữ liệu đang xuất hiện ở phía người học: chủ đề, đề xuất, bài nộp và tương tác cộng đồng." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatLink label="Tổng chủ đề" value={topics.length} icon="book" to="/admin/topics" />
        <AdminStatLink label="Đang mở" value={activeTopics.length} icon="spark" to="/admin/topics?status=open" />
        <AdminStatLink label="Chờ duyệt" value={pending.length} icon="clock" to="/admin/topics/pending" />
        <AdminStatLink label="Bị từ chối" value={rejected.length} icon="close" to="/admin/topics?status=rejected" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Đã đóng" value={String(closed.length)} icon="lock" />
        <StatCard label="Người dùng" value={String(users.length)} icon="users" />
        <StatCard label="Bài nộp" value={String(submissions.length)} icon="file" />
        <StatCard label="Bình luận" value={String(totalCommentCount)} icon="message" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-primary-container">Đề xuất mới chờ duyệt</h2>
              <p className="mt-1 text-sm text-ink-muted">Đồng bộ với các chủ đề người học đang thấy ở trạng thái chờ duyệt.</p>
            </div>
            <ActionLink to="/admin/topics/pending">Xem tất cả</ActionLink>
          </div>
          {pending.length ? (
            <div className="mt-4 grid gap-3">
              {pending.map((topic) => <AdminTopicRow key={topic.id} topic={topic} actionTo={`/admin/topics/pending/${topic.id}`} actionLabel="Xem duyệt" />)}
            </div>
          ) : <EmptyState title="Không có chủ đề chờ duyệt" description="Tất cả đề xuất đã được xử lý." />}
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-primary-container">Chủ đề hoạt động cao</h2>
          <div className="mt-4 grid gap-3">
            {highActivity.map((topic) => (
              <Link key={topic.id} to={`/admin/topics/${topic.id}`} className="block rounded-md border border-border-subtle bg-surface-low p-3 transition hover:border-secondary-container hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-primary-container">{topic.title}</p>
                  <Icon name="arrowRight" className="text-ink-subtle" size={16} />
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  {topic.submissionCount} bài nộp · {topic.likeCount} like · {getTopicCommentCount(topic, submissions)} bình luận
                </p>
              </Link>
            ))}
            {!highActivity.length && <p className="text-sm text-ink-muted">Chưa có chủ đề đang mở.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function AdminPendingPage() {
  const { data: topics } = useAsync(() => adminService.getPendingTopics(), [])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')
  const visible = [...topics]
    .filter((topic) => {
      const proposerName = getTopicProposerName(topic)
      const matchQuery =
        !query ||
        [topic.title, topic.description, topic.proposalReason, proposerName].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchCategory = category === 'all' || topic.category === category
      const matchResource =
        resourceFilter === 'all' ||
        (resourceFilter === 'has' ? topic.resources.length > 0 : topic.resources.length === 0)
      return matchQuery && matchCategory && matchResource
    })
    .sort((a, b) => new Date(b.submittedAt ?? b.createdAt).getTime() - new Date(a.submittedAt ?? a.createdAt).getTime())

  return (
    <div className="space-y-6">
      <PageHeader title="Danh sách chờ duyệt" description="Kiểm tra đủ dữ liệu người học đã gửi: mô tả, tags, tài liệu, lý do đề xuất và thời lượng học." />
      <Card className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[minmax(280px,1fr)_190px_190px_auto]">
        <Input placeholder="Tìm theo chủ đề hoặc người đề xuất" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">Tất cả danh mục</option>
          <option value="Lập trình">Lập trình</option>
          <option value="Toán học">Toán học</option>
          <option value="Marketing">Marketing</option>
          <option value="Kỹ năng học tập">Kỹ năng học tập</option>
        </Select>
        <Select value={resourceFilter} onChange={(event) => setResourceFilter(event.target.value)}>
          <option value="all">Tất cả tài liệu</option>
          <option value="has">Có tài liệu</option>
          <option value="none">Chưa có tài liệu</option>
        </Select>
        <Button variant="secondary" onClick={() => { setQuery(''); setCategory('all'); setResourceFilter('all') }}>Xóa lọc</Button>
      </Card>

      <Card className="overflow-x-auto">
        <AdminTopicTable topics={visible} mode="pending" />
      </Card>
      {!visible.length && <EmptyState title="Tất cả đề xuất đã xử lý" description="Không còn chủ đề nào phù hợp với bộ lọc hiện tại." />}
    </div>
  )
}

export function AdminReviewPage() {
  const { id = 't4' } = useParams()
  const { data, setData } = useAsync(() => adminService.getTopicDetail(id), {
    topic: lookupService.getTopic(id),
    submissions: [],
    comments: [],
  })
  const { topic } = data
  const proposerName = getTopicProposerName(topic)
  const proposerEmail = getTopicProposerEmail(topic)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reviewState, setReviewState] = useState<TopicStatus>(topic.status)
  const [rejectReason, setRejectReason] = useState(topic.rejectionReason ?? '')
  const [revisionSuggestions, setRevisionSuggestions] = useState(
    topic.revisionSuggestions?.length
      ? topic.revisionSuggestions
      : ['Thu hẹp phạm vi chủ đề.', 'Bổ sung ít nhất một tài liệu tham khảo.'],
  )
  const [rejectErrors, setRejectErrors] = useState<{ reason?: string; suggestions?: string }>({})
  const [rejectLoading, setRejectLoading] = useState(false)
  const canApprove = Boolean(topic.title && topic.description && topic.category && topic.windowHours)

  async function approve() {
    if (!canApprove) return
    const approvedTopic = await topicService.approveTopic(topic.id)
    setData((current) => ({ ...current, topic: approvedTopic }))
    setReviewState('open')
  }

  async function reject() {
    const cleanedSuggestions = revisionSuggestions.map((item) => item.trim()).filter(Boolean)
    const nextErrors: { reason?: string; suggestions?: string } = {}
    if (!rejectReason.trim()) nextErrors.reason = 'Vui lòng nhập lý do từ chối.'
    if (!cleanedSuggestions.length) nextErrors.suggestions = 'Vui lòng nhập ít nhất một gợi ý chỉnh sửa.'
    setRejectErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      return
    }
    setRejectLoading(true)
    try {
      const rejectedTopic = await topicService.rejectTopic(topic.id, {
        rejectionReason: rejectReason.trim(),
        revisionSuggestions: cleanedSuggestions,
      })
      setData((current) => ({ ...current, topic: rejectedTopic }))
      setReviewState('rejected')
      setRejectOpen(false)
    } finally {
      setRejectLoading(false)
    }
  }

  function updateRevisionSuggestion(index: number, value: string) {
    setRevisionSuggestions((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))
    if (rejectErrors.suggestions) setRejectErrors((current) => ({ ...current, suggestions: undefined }))
  }

  function addRevisionSuggestion() {
    setRevisionSuggestions((current) => [...current, ''])
  }

  function removeRevisionSuggestion(index: number) {
    setRevisionSuggestions((current) => (current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : ['']))
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <TopicStatusBadge status={reviewState} />
            <Badge tone="info">{topic.category}</Badge>
          </div>
          <h1 className="mt-4 text-[34px] font-extrabold leading-tight text-primary-container">{topic.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-ink-muted">{topic.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {topic.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
        </Card>

        <ProposalReviewCard topic={topic} />
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        {reviewState === 'open' && <Card className="border-emerald bg-emerald-container p-4 text-sm font-bold text-emerald-dark">Đã phê duyệt. Người học sẽ thấy chủ đề ở trạng thái Đang mở.</Card>}
        {reviewState === 'rejected' && <Card className="border-error-container bg-error-container/35 p-4 text-sm font-bold text-error">Đã từ chối. Người đề xuất sẽ thấy đúng lý do từ chối ở màn chi tiết.</Card>}
        <Card className="p-5">
          <h2 className="text-lg font-extrabold text-primary-container">Thao tác duyệt</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Info label="Trạng thái" value={getStatusLabel(reviewState)} />
            <Info label="Người đề xuất" value={`${proposerName} · ${proposerEmail}`} />
            <Info label="Ngày gửi" value={formatDate(topic.submittedAt ?? topic.createdAt)} />
            <Info label="Thời lượng học" value={`${topic.windowHours} giờ`} />
          </div>
          <div className="mt-5 rounded-md bg-surface-low p-3 text-sm leading-6 text-ink-muted">
            Admin cần thấy đủ dữ liệu người học gửi trước khi duyệt: mô tả, điều kiện, tài liệu, tags và lý do đề xuất.
          </div>
          <div className="mt-5 grid gap-2">
            <Button onClick={approve} disabled={!canApprove || reviewState !== 'pending'}>Duyệt chủ đề</Button>
            <Button variant="danger" onClick={() => setRejectOpen(true)} disabled={reviewState !== 'pending'}>Từ chối</Button>
            <ActionLink to="/admin/topics/pending">Quay lại hàng chờ</ActionLink>
          </div>
        </Card>
      </aside>

      <Modal open={rejectOpen} title="Từ chối chủ đề" onClose={() => setRejectOpen(false)}>
        <Textarea
          label="Lý do từ chối chính"
          value={rejectReason}
          error={rejectErrors.reason}
          placeholder="Ví dụ: Mục tiêu học còn quá rộng, cần thu hẹp thành một khái niệm cụ thể hơn."
          onChange={(event) => {
            setRejectReason(event.target.value)
            if (rejectErrors.reason) setRejectErrors((current) => ({ ...current, reason: undefined }))
          }}
        />
        <div className="mt-5 grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-ink">Danh sách gợi ý chỉnh sửa</p>
              <p className="mt-1 text-xs font-medium text-ink-subtle">Mỗi gợi ý là một ý riêng để người học dễ xử lý.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={addRevisionSuggestion}>
              + Thêm gợi ý
            </Button>
          </div>
          <div className="grid gap-2">
            {revisionSuggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={suggestion}
                  onChange={(event) => updateRevisionSuggestion(index, event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-md border border-border bg-surface-low px-3 text-sm outline-none transition focus:border-secondary-container focus:bg-white focus:ring-2 focus:ring-secondary-container/15"
                  placeholder={index === 0 ? 'Ví dụ: Thu hẹp phạm vi chủ đề...' : 'Ví dụ: Bổ sung tài liệu tham khảo...'}
                />
                <Button type="button" variant="secondary" size="sm" className="min-w-0 px-3" onClick={() => removeRevisionSuggestion(index)}>
                  Xóa
                </Button>
              </div>
            ))}
          </div>
          {rejectErrors.suggestions && <p className="text-xs font-semibold text-error">{rejectErrors.suggestions}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRejectOpen(false)} disabled={rejectLoading}>Hủy</Button>
          <Button variant="danger" onClick={reject} disabled={rejectLoading}>
            {rejectLoading ? 'Đang từ chối...' : 'Xác nhận từ chối'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export function AdminTopicsPage() {
  const { data: topics, setData: setTopics } = useAsync(() => topicService.getTopics(), [])
  const [searchParams, setSearchParams] = useSearchParams()
  const status = getAdminTopicStatusFilter(searchParams.get('status'))
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [closeOpen, setCloseOpen] = useState(false)
  const [topicToClose, setTopicToClose] = useState<Topic | null>(null)
  const [closeReason, setCloseReason] = useState('Chủ đề đã kết thúc window học và chuyển sang chế độ lưu trữ.')
  const [closeLoading, setCloseLoading] = useState(false)
  const [closeError, setCloseError] = useState('')

  function updateStatus(nextStatus: TopicStatus | 'all') {
    const nextParams = new URLSearchParams(searchParams)
    if (nextStatus === 'all') {
      nextParams.delete('status')
    } else {
      nextParams.set('status', nextStatus)
    }
    setSearchParams(nextParams)
  }

  const visible = topics.filter((topic) => {
    const proposerName = getTopicProposerName(topic)
    const matchQuery = !query || [topic.title, topic.description, proposerName].join(' ').toLowerCase().includes(query.toLowerCase())
    const matchStatus = status === 'all' || topic.status === status
    const matchCategory = category === 'all' || topic.category === category
    return matchQuery && matchStatus && matchCategory
  })

  function openCloseModal(topic: Topic) {
    setTopicToClose(topic)
    setCloseReason('Chủ đề đã kết thúc window học và chuyển sang chế độ lưu trữ.')
    setCloseError('')
    setCloseOpen(true)
  }

  async function confirmCloseTopic() {
    if (!topicToClose) return
    if (!closeReason.trim()) {
      setCloseError('Vui lòng nhập lý do đóng chủ đề.')
      return
    }
    setCloseLoading(true)
    setCloseError('')
    try {
      const closedTopic = await topicService.closeTopic(topicToClose.id, closeReason.trim())
      setTopics((current) => current.map((topic) => (topic.id === closedTopic.id ? closedTopic : topic)))
      setCloseOpen(false)
      setTopicToClose(null)
    } catch {
      setCloseError('Không thể đóng chủ đề. Vui lòng thử lại.')
    } finally {
      setCloseLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý chủ đề" description="Toàn bộ chủ đề ở mọi trạng thái, dùng cùng dữ liệu với phía người học." action={<Button>Tạo chủ đề thủ công</Button>} />
      <Card className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[minmax(260px,1fr)_180px_180px_auto]">
        <Input placeholder="Tìm kiếm chủ đề hoặc người đề xuất" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={status} onChange={(event) => updateStatus(event.target.value as TopicStatus | 'all')}>
          <option value="all">Tất cả trạng thái</option>
          <option value="open">Đang mở</option>
          <option value="pending">Chờ duyệt</option>
          <option value="rejected">Bị từ chối</option>
          <option value="closed">Đã đóng</option>
        </Select>
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">Tất cả danh mục</option>
          <option value="Lập trình">Lập trình</option>
          <option value="Toán học">Toán học</option>
          <option value="Marketing">Marketing</option>
          <option value="Kỹ năng học tập">Kỹ năng học tập</option>
        </Select>
        <Button variant="secondary" onClick={() => { setQuery(''); updateStatus('all'); setCategory('all') }}>Xóa lọc</Button>
      </Card>
      <Card className="overflow-x-auto">
        <AdminTopicTable topics={visible} mode="manage" onClose={openCloseModal} />
      </Card>
      {!visible.length && <EmptyState title="Không tìm thấy chủ đề" description="Không có chủ đề phù hợp với bộ lọc hiện tại." />}
      <Modal open={closeOpen} title="Đóng chủ đề?" onClose={() => setCloseOpen(false)}>
        <p className="text-sm text-ink-muted">
          {topicToClose ? `Bạn đang đóng chủ đề "${topicToClose.title}". ` : ''}
          Người học sẽ không thể bắt đầu học mới, nhưng vẫn xem được bài đã nộp và thảo luận đã mở.
        </p>
        <Textarea className="mt-4" label="Lý do đóng chủ đề" value={closeReason} onChange={(event) => {
          setCloseReason(event.target.value)
          if (closeError) setCloseError('')
        }} />
        {closeError && <p className="mt-2 text-xs font-semibold text-error">{closeError}</p>}
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-muted"><input type="checkbox" defaultChecked /> Gửi thông báo cho người đã tham gia</label>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setCloseOpen(false)} disabled={closeLoading}>Hủy</Button>
          <Button variant="danger" onClick={confirmCloseTopic} disabled={closeLoading}>{closeLoading ? 'Đang đóng...' : 'Xác nhận đóng chủ đề'}</Button>
        </div>
      </Modal>
    </div>
  )
}

export function AdminTopicDetailPage() {
  const { id = 't1' } = useParams()
  const { data } = useAsync(() => adminService.getTopicDetail(id), {
    topic: lookupService.getTopic(id),
    submissions: [],
    comments: [],
  })
  const { topic, submissions } = data
  const proposerName = getTopicProposerName(topic)
  const proposerEmail = getTopicProposerEmail(topic)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <TopicStatusBadge status={topic.status} />
            <Badge tone="info">{topic.category}</Badge>
          </div>
          <PageHeader title="Chi tiết / chỉnh sửa chủ đề" description={topic.title} />
          <div className="mt-6 grid gap-4">
            <Input label="Tên chủ đề" defaultValue={topic.title} />
            <Textarea label="Mô tả" defaultValue={topic.description} />
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Danh mục" defaultValue={topic.category} />
              <Input label="Thời lượng học" defaultValue={`${topic.windowHours} giờ`} />
              <Input label="Trạng thái" defaultValue={getStatusLabel(topic.status)} />
            </div>
            <Input label="Tags" defaultValue={topic.tags.join(', ')} />
            <Textarea label="Điều kiện trước khi học" defaultValue={topic.prerequisites} />
            <Textarea label="Lý do đề xuất" defaultValue={topic.proposalReason ?? 'Chưa có lý do đề xuất được ghi nhận.'} />
            {topic.status === 'rejected' && <Textarea label="Lý do từ chối" defaultValue={topic.rejectionReason} />}
            <div>
              <p className="mb-2 text-sm font-bold text-ink">Tài liệu</p>
              <ResourceList resources={topic.resources} />
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <ActionLink to="/admin/topics">Quay lại danh sách</ActionLink>
              <Button variant="secondary">Xem bài nộp</Button>
              {topic.status === 'open' && <Button variant="danger">Đóng chủ đề</Button>}
              <Button>Lưu thay đổi</Button>
            </div>
          </div>
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-primary-container">Thống kê đồng bộ</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Bài nộp" value={topic.submissionCount} />
            <Metric label="Like" value={topic.likeCount} />
            <Metric label="Bình luận" value={getTopicCommentCount(topic, submissions)} />
            <Metric label="Người tham gia" value={new Set(submissions.map((submission) => submission.userId)).size} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-primary-container">Metadata</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <InfoLine label="Người đề xuất" value={proposerName} />
            <InfoLine label="Email" value={proposerEmail} />
            <InfoLine label="Ngày tạo" value={formatDate(topic.createdAt)} />
            <InfoLine label="Ngày duyệt" value={topic.reviewedAt ? formatDate(topic.reviewedAt) : 'Chưa duyệt'} />
            <InfoLine label="Người duyệt" value={getTopicReviewerName(topic)} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-primary-container">Bình luận</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {getTopicCommentCount(topic, submissions) ? `${getTopicCommentCount(topic, submissions)} bình luận đang được ghi nhận từ các bài nộp.` : 'Chưa có bình luận trong chủ đề này.'}
          </p>
        </Card>
      </aside>
    </div>
  )
}

export function AdminUsersPage() {
  const { data } = useAsync(() => adminService.getOverview(), { topics: [], users: [], submissions: [], comments: [] })
  const { users, topics, submissions } = data
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'all' | User['role']>('all')
  const [status, setStatus] = useState<'all' | User['status']>('all')
  const [lockOpen, setLockOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, User['status']>>({})
  const [lockReason, setLockReason] = useState('Spam bình luận trong chủ đề Python Cơ Bản')
  const [lockLoading, setLockLoading] = useState(false)
  const effectiveUsers = users.map((user) => ({ ...user, status: statusOverrides[user.id] ?? user.status }))
  const visible = effectiveUsers.filter((user) => {
    const matchQuery = !query || [user.name, user.email].join(' ').toLowerCase().includes(query.toLowerCase())
    const matchRole = role === 'all' || user.role === role
    const matchStatus = status === 'all' || user.status === status
    return matchQuery && matchRole && matchStatus
  })

  function openStatusModal(user: User) {
    setSelectedUser(user)
    setLockReason(user.status === 'locked' ? 'Mở khóa sau khi đã kiểm tra lại tài khoản.' : 'Spam bình luận trong chủ đề Python Cơ Bản')
    setLockOpen(true)
  }

  async function confirmStatusChange() {
    if (!selectedUser) return
    setLockLoading(true)
    try {
      const nextStatus = selectedUser.status === 'locked' ? 'active' : 'locked'
      if (nextStatus === 'locked') {
        await userService.lockUser(selectedUser.id, lockReason.trim())
      } else {
        await userService.unlockUser(selectedUser.id, lockReason.trim())
      }
      setStatusOverrides((current) => ({ ...current, [selectedUser.id]: nextStatus }))
      setLockOpen(false)
      setSelectedUser(null)
    } finally {
      setLockLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý người dùng" description="Theo dõi tài khoản, đề xuất, bài nộp và uy tín cộng đồng." action={<Button variant="secondary">Xuất CSV</Button>} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Người học" value={String(effectiveUsers.filter((user) => user.role === 'learner').length)} icon="users" />
        <StatCard label="Admin" value={String(effectiveUsers.filter((user) => user.role === 'admin').length)} icon="shield" />
        <StatCard label="Có huy hiệu" value={String(effectiveUsers.filter((user) => user.badgeStats.answerCount > 0).length)} icon="spark" />
        <StatCard label="Bị khóa" value={String(effectiveUsers.filter((user) => user.status === 'locked').length)} icon="lock" />
      </div>
      <Card className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[minmax(260px,1fr)_180px_180px_auto]">
        <Input placeholder="Tìm theo tên hoặc email" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={role} onChange={(event) => setRole(event.target.value as 'all' | User['role'])}>
          <option value="all">Tất cả role</option>
          <option value="learner">Learner</option>
          <option value="admin">Admin</option>
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value as 'all' | User['status'])}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Bị khóa</option>
        </Select>
        <Button variant="secondary" onClick={() => { setQuery(''); setRole('all'); setStatus('all') }}>Xóa lọc</Button>
      </Card>
      <Card className="overflow-x-auto">
        <AdminUserTable users={visible} topics={topics} submissions={submissions} onStatusChange={openStatusModal} />
      </Card>
      {!visible.length && <EmptyState title="Không tìm thấy người dùng" description="Thử xóa bộ lọc hoặc tìm bằng email khác." />}
      <Modal
        open={lockOpen}
        title={selectedUser?.status === 'locked' ? 'Mở khóa tài khoản người dùng?' : 'Khóa tài khoản người dùng?'}
        onClose={() => setLockOpen(false)}
      >
        <p className="text-sm text-ink-muted">
          {selectedUser?.status === 'locked'
            ? 'Người dùng sẽ được khôi phục quyền nộp bài, bình luận, like và bookmark.'
            : 'Người dùng sẽ không thể nộp bài, bình luận, like, bookmark hoặc đề xuất chủ đề mới.'}
        </p>
        <Textarea className="mt-4" label={selectedUser?.status === 'locked' ? 'Lý do mở khóa' : 'Lý do khóa'} value={lockReason} onChange={(event) => setLockReason(event.target.value)} />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setLockOpen(false)} disabled={lockLoading}>Hủy</Button>
          <Button variant={selectedUser?.status === 'locked' ? 'primary' : 'danger'} onClick={confirmStatusChange} disabled={lockLoading || !lockReason.trim()}>
            {lockLoading
              ? 'Đang xử lý...'
              : selectedUser?.status === 'locked'
                ? 'Xác nhận mở khóa'
                : 'Xác nhận khóa tài khoản'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export function AdminUserDetailPage() {
  const { id = 'u1' } = useParams()
  const { data } = useAsync(() => adminService.getUserDetail(id), {
    user: lookupService.getUser(id),
    topics: [],
    submissions: [],
  })
  const { user, topics, submissions } = data
  const pendingCount = topics.filter((topic) => topic.status === 'pending').length
  const rejectedCount = topics.filter((topic) => topic.status === 'rejected').length

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="p-6">
        <Avatar name={user.name} size="lg" />
        <h1 className="mt-4 text-2xl font-extrabold text-primary-container">{user.name}</h1>
        <p className="text-sm text-ink-muted">{user.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>{user.role === 'admin' ? 'Admin' : 'Người học'}</Badge>
          <Badge tone={user.status === 'active' ? 'success' : 'danger'}>{user.status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}</Badge>
        </div>
        <div className="mt-4"><ContributionBadge stats={user.badgeStats} /></div>
        <div className="mt-5 grid gap-2">
          <Button>Gửi thông báo</Button>
          {user.role !== 'admin' && <Button variant="danger">Khóa tài khoản</Button>}
          <ActionLink to="/admin/users">Quay lại danh sách</ActionLink>
        </div>
      </Card>
      <div className="space-y-5">
        <BadgeProgressCard stats={user.badgeStats} />
        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-primary-container">Thống kê học tập</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm xl:grid-cols-5">
            <Info label="Chủ đề tham gia" value={String(user.joinedTopicIds.length)} />
            <Info label="Bài đã nộp" value={String(submissions.length)} />
            <Info label="Đề xuất đã tạo" value={String(topics.length)} />
            <Info label="Chờ duyệt" value={String(pendingCount)} />
            <Info label="Bị từ chối" value={String(rejectedCount)} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-primary-container">Đề xuất của người dùng</h2>
          <div className="mt-4 grid gap-3">
            {topics.map((topic) => (
              <Link key={topic.id} to={topic.status === 'pending' ? `/admin/topics/pending/${topic.id}` : `/admin/topics/${topic.id}`} className="rounded-md border border-border-subtle p-3 transition hover:border-secondary-container hover:bg-surface-low">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-bold text-primary-container">{topic.title}</p>
                  <TopicStatusBadge status={topic.status} />
                </div>
                <p className="mt-2 text-sm text-ink-muted">Tạo ngày {formatDate(topic.createdAt)}</p>
              </Link>
            ))}
            {!topics.length && <p className="text-sm text-ink-muted">Người dùng chưa tạo đề xuất nào.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-primary-container">Bài đã nộp</h2>
          <div className="mt-4 grid gap-3">
            {submissions.map((submission) => {
              const topic = lookupService.getTopic(submission.topicId)
              return (
                <div key={submission.id} className="rounded-md border border-border-subtle p-3">
                  <p className="font-bold text-primary-container">{topic.title}</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {formatDate(submission.createdAt)} · {submission.wordCount} từ · {submission.likeCount} like · {submission.commentCount} bình luận
                  </p>
                </div>
              )
            })}
            {!submissions.length && <p className="text-sm text-ink-muted">Người dùng chưa nộp bài nào.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}

function AdminTopicTable({ topics, mode, onClose }: { topics: Topic[]; mode: 'pending' | 'manage'; onClose?: (topic: Topic) => void }) {
  return (
    <table className="w-full min-w-[1180px] table-fixed text-left text-sm">
      <colgroup>
        <col className="w-[24%]" />
        <col className="w-[8%]" />
        <col className="w-[12%]" />
        <col className="w-[10%]" />
        <col className="w-[8%]" />
        <col className="w-[11%]" />
        <col className="w-[8%]" />
        <col className="w-[8%]" />
        <col className="w-[11%]" />
      </colgroup>
      <thead className="bg-surface-low text-xs uppercase text-ink-muted">
        <tr>
          <th className="px-4 py-3">Chủ đề</th>
          <th className="px-4 py-3">Danh mục</th>
          <th className="px-4 py-3">Tags</th>
          <th className="px-4 py-3">Trạng thái</th>
          <th className="px-4 py-3">Window</th>
          <th className="px-4 py-3">Người đề xuất</th>
          <th className="px-4 py-3">Tài liệu</th>
          <th className="px-4 py-3 text-center">Bài / like</th>
          <th className="px-4 py-3 text-right">Hành động</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        {topics.map((topic) => (
          <tr key={topic.id} className="align-top">
            <td className="px-4 py-4">
              <p className="font-bold text-primary-container">{topic.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">{topic.proposalReason ?? topic.description}</p>
            </td>
            <td className="px-4 py-4 text-ink-muted"><span className="block truncate">{topic.category}</span></td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-1.5">{topic.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
            </td>
            <td className="px-4 py-4"><TopicStatusBadge status={topic.status} /></td>
            <td className="px-4 py-4 text-ink-muted">{topic.windowHours} giờ</td>
            <td className="px-4 py-4 text-ink-muted"><span className="block truncate">{getTopicProposerName(topic)}</span></td>
            <td className="px-4 py-4"><Badge tone={topic.resources.length ? 'success' : 'neutral'}>{topic.resources.length ? `${topic.resources.length} file` : 'Chưa có'}</Badge></td>
            <td className="px-4 py-4 text-center font-semibold text-ink-muted">{topic.submissionCount} / {topic.likeCount}</td>
            <td className="px-4 py-4 text-right">
              {mode === 'pending' ? <Link to={`/admin/topics/pending/${topic.id}`}><Button size="sm">Xem duyệt</Button></Link> : <div className="flex min-w-[132px] justify-end gap-2 whitespace-nowrap"><Link to={`/admin/topics/${topic.id}`}><Button size="sm" variant="secondary">Xem</Button></Link>{topic.status === 'open' && <Button size="sm" variant="danger" onClick={() => onClose?.(topic)}>Đóng</Button>}</div>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AdminUserTable({ users, topics, submissions, onStatusChange }: { users: User[]; topics: Topic[]; submissions: Submission[]; onStatusChange: (user: User) => void }) {
  return (
    <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
      <colgroup>
        <col className="w-[19%]" />
        <col className="w-[20%]" />
        <col className="w-[7%]" />
        <col className="w-[9%]" />
        <col className="w-[7%]" />
        <col className="w-[7%]" />
        <col className="w-[20%]" />
        <col className="w-[11%]" />
      </colgroup>
      <thead className="bg-surface-low text-xs uppercase text-ink-muted">
        <tr>
          <th className="px-4 py-3">Người dùng</th>
          <th className="px-4 py-3">Email</th>
          <th className="px-4 py-3">Role</th>
          <th className="px-4 py-3">Trạng thái</th>
          <th className="px-4 py-3">Đề xuất</th>
          <th className="px-4 py-3">Bài nộp</th>
          <th className="px-4 py-3">Huy hiệu</th>
          <th className="px-4 py-3 text-right">Hành động</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        {users.map((user) => {
          const proposalCount = topics.filter((topic) => topic.proposedBy === user.id).length
          const submissionCount = submissions.filter((submission) => submission.userId === user.id).length
          return (
            <tr key={user.id}>
              <td className="px-4 py-4"><div className="flex items-center gap-3"><Avatar name={user.name} size="sm" /><span className="font-bold text-ink">{user.name}</span></div></td>
              <td className="px-4 py-4 text-ink-muted"><span className="block truncate">{user.email}</span></td>
              <td className="px-4 py-4"><Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>{user.role === 'admin' ? 'Admin' : 'Learner'}</Badge></td>
              <td className="px-4 py-4"><Badge tone={user.status === 'active' ? 'success' : 'danger'}>{user.status === 'active' ? 'Active' : 'Locked'}</Badge></td>
              <td className="px-4 py-4">{proposalCount}</td>
              <td className="px-4 py-4">{submissionCount}</td>
              <td className="px-4 py-4">
                <div className="max-w-full overflow-hidden">
                  {user.role === 'admin' ? <Badge>Không áp dụng</Badge> : <ContributionBadge stats={user.badgeStats} compact />}
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex min-w-[132px] justify-end gap-2 whitespace-nowrap">
                  <Link to={`/admin/users/${user.id}`}><Button size="sm" variant="secondary">Xem</Button></Link>
                  {user.role !== 'admin' && (
                    <Button size="sm" variant={user.status === 'locked' ? 'secondary' : 'danger'} onClick={() => onStatusChange(user)}>
                      {user.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function ProposalReviewCard({ topic }: { topic: Topic }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-extrabold text-primary-container">Thông tin đề xuất</h2>
      <div className="mt-5 grid gap-5">
        <section>
          <h3 className="text-sm font-extrabold text-ink">Mục tiêu / mô tả chủ đề</h3>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{topic.description}</p>
        </section>
        <section>
          <h3 className="text-sm font-extrabold text-ink">Điều kiện trước khi học</h3>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{topic.prerequisites}</p>
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

function AdminTopicRow({ topic, actionTo, actionLabel }: { topic: Topic; actionTo: string; actionLabel: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border-subtle p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold text-primary-container">{topic.title}</p>
        <p className="text-sm text-ink-muted">{getTopicProposerName(topic)} đề xuất · {topic.windowHours} giờ · {topic.resources.length ? `${topic.resources.length} tài liệu` : 'chưa có tài liệu'}</p>
      </div>
      <ActionLink to={actionTo} variant="primary">{actionLabel}</ActionLink>
    </div>
  )
}

function AdminStatLink({ label, value, icon, to }: { label: string; value: number; icon: Parameters<typeof Icon>[0]['name']; to: string }) {
  return (
    <Link to={to} className="rounded-md border border-border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-secondary-container hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-ink-muted">{label}</span>
        <Icon name={icon} size={18} className="text-secondary-container" />
      </div>
      <p className="mt-3 text-3xl font-extrabold text-primary-container">{value}</p>
    </Link>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-surface-low p-3">
      <p className="text-xl font-extrabold text-primary-container">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  )
}

function getTopicCommentCount(topic: Topic, submissions: Submission[]) {
  if (typeof topic.commentCount === 'number') return topic.commentCount
  return submissions.filter((submission) => submission.topicId === topic.id).reduce((sum, submission) => sum + submission.commentCount, 0)
}

function getTopicProposerName(topic: Topic) {
  return topic.proposedByName ?? lookupService.getUser(topic.proposedBy).name
}

function getTopicProposerEmail(topic: Topic) {
  return topic.proposedByEmail ?? lookupService.getUser(topic.proposedBy).email
}

function getTopicReviewerName(topic: Topic) {
  if (!topic.reviewedBy) return 'Chưa có'
  return topic.reviewedByName ?? lookupService.getUser(topic.reviewedBy).name
}

function getStatusLabel(status: TopicStatus) {
  const labels: Record<TopicStatus, string> = {
    open: 'Đang mở',
    pending: 'Chờ duyệt',
    rejected: 'Bị từ chối',
    closed: 'Đã đóng',
  }
  return labels[status]
}

function getAdminTopicStatusFilter(value: string | null): TopicStatus | 'all' {
  if (value === 'open' || value === 'closed' || value === 'pending' || value === 'rejected') return value
  return 'all'
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-surface-low p-3"><p className="text-xs font-bold uppercase text-ink-subtle">{label}</p><p className="mt-1 font-semibold text-ink">{value}</p></div>
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-2 last:border-b-0 last:pb-0">
      <span className="font-semibold text-ink-muted">{label}</span>
      <span className="text-right font-bold text-ink">{value}</span>
    </div>
  )
}
