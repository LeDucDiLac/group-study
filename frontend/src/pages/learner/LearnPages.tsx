import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Icon, Modal, PageHeader, ProgressBar, Textarea } from '@/components/ui'
import { ResourceList } from '@/components/topic/TopicCard'
import { FileUploadBox } from '@/components/submission/FileUploadBox'
import { draftService, lookupService, submissionService, topicService } from '@/services/api'
import { countWords, formatDateTime, minutesToReadable } from '@/utils/format'
import { useAsync } from '@/utils/hooks'

const maxFiles = 10
const maxFileBytes = 20 * 1024 * 1024

export function LearnPage() {
  const { id = 't1' } = useParams()
  const navigate = useNavigate()
  const { data: topic } = useAsync(() => topicService.getTopicById(id), lookupService.getTopic(id), [id])
  const { data: existingSubmission } = useAsync(() => submissionService.getMySubmission(id), null, [id])
  const [understood, setUnderstood] = useState('')
  const [notUnderstood, setNotUnderstood] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [confirm, setConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draftStatus, setDraftStatus] = useState('Đang tải bản nháp...')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [error, setError] = useState('')
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const hasLocalDraftChangesRef = useRef(false)
  const draftLoadVersionRef = useRef(0)
  const latestDraftValueRef = useRef({ understood: '', notUnderstood: '', anonymous: false })

  const words = useMemo(() => countWords(`${understood} ${notUnderstood}`), [notUnderstood, understood])
  const timeSpentSeconds = Math.max(0, Math.round((now - startedAt) / 1000))
  const remainingMs = topic.closesAt ? new Date(topic.closesAt).getTime() - now : undefined
  const expired = topic.status !== 'open' || (typeof remainingMs === 'number' && remainingMs <= 0)
  const warning = !expired && typeof remainingMs === 'number' && remainingMs < topic.windowHours * 60 * 60 * 1000 * 0.2
  const invalidFiles = files.some((file) => file.size > maxFileBytes)
  const submitDisabled = expired || submitting || words === 0 || !understood.trim() || !notUnderstood.trim() || invalidFiles || files.length > maxFiles || Boolean(existingSubmission)

  latestDraftValueRef.current = { understood, notUnderstood, anonymous }

  useEffect(() => {
    const handle = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(handle)
  }, [])

  useEffect(() => {
    let mounted = true
    const loadVersion = draftLoadVersionRef.current + 1
    draftLoadVersionRef.current = loadVersion
    hasLocalDraftChangesRef.current = false
    setDraftLoaded(false)
    setDraftStatus('Đang tải bản nháp...')

    draftService.getDraft(id).then((draft) => {
      if (!mounted || draftLoadVersionRef.current !== loadVersion) return
      if (draft) {
        if (!hasLocalDraftChangesRef.current) {
          setUnderstood(draft.understood)
          setNotUnderstood(draft.notUnderstood)
          setAnonymous(draft.isAnonymous)
        }
        setDraftStatus(draft.updatedAt ? `Đã khôi phục bản nháp lúc ${formatDateTime(draft.updatedAt)}` : 'Đã khôi phục bản nháp')
      } else {
        setDraftStatus('Chưa có bản nháp')
      }
      setDraftLoaded(true)
    }).catch(() => {
      if (!mounted || draftLoadVersionRef.current !== loadVersion) return
      setDraftStatus('Chưa tải được bản nháp')
      setDraftLoaded(true)
    })
    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (!draftLoaded || existingSubmission || expired || !hasLocalDraftChangesRef.current) return
    const handle = window.setTimeout(() => {
      if (!understood.trim() && !notUnderstood.trim()) return
      const payload = { understood, notUnderstood, isAnonymous: anonymous, timeSpentSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)) }
      setDraftStatus('Đang lưu bản nháp...')
      draftService.saveDraft(id, payload)
        .then((draft) => {
          const latestDraft = latestDraftValueRef.current
          if (
            latestDraft.understood === payload.understood
            && latestDraft.notUnderstood === payload.notUnderstood
            && latestDraft.anonymous === payload.isAnonymous
          ) {
            hasLocalDraftChangesRef.current = false
          }
          setDraftStatus(draft.updatedAt ? `Đã lưu lúc ${formatDateTime(draft.updatedAt)}` : 'Đã lưu bản nháp')
        })
        .catch(() => setDraftStatus('Chưa lưu được bản nháp'))
    }, 900)
    return () => window.clearTimeout(handle)
  }, [anonymous, draftLoaded, existingSubmission, expired, id, notUnderstood, startedAt, understood])

  function updateUnderstood(value: string) {
    hasLocalDraftChangesRef.current = true
    setUnderstood(value)
  }

  function updateNotUnderstood(value: string) {
    hasLocalDraftChangesRef.current = true
    setNotUnderstood(value)
  }

  function updateAnonymous(value: boolean) {
    hasLocalDraftChangesRef.current = true
    setAnonymous(value)
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      await submissionService.submit(id, {
        understood,
        notUnderstood,
        isAnonymous: anonymous,
        timeSpentSeconds,
        files,
      })
      navigate(`/topics/${id}/success`)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể nộp bài. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
      setConfirm(false)
    }
  }

  if (existingSubmission) {
    return (
      <Card className="mx-auto max-w-3xl p-7 text-center">
        <Badge tone="success">Đã nộp bài</Badge>
        <h1 className="mt-4 text-3xl font-extrabold text-primary-container">Bài học đã được khóa</h1>
        <p className="mt-3 text-ink-muted">Bạn đã nộp bài cho chủ đề này. Hãy xem lại bài của mình hoặc vào khu vực dạy chéo.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={`/topics/${id}/my-submission`}><Button variant="secondary">Xem bài của tôi</Button></Link>
          <Link to={`/topics/${id}/peer`}><Button>Vào dạy chéo</Button></Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <PageHeader title="Tự học / Viết bài" description={topic.title} />
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <p className="font-bold text-primary-container">Tiến độ bài học</p>
              <p className="text-sm text-ink-muted">{draftStatus}. Bài sẽ bị khóa sau khi nộp.</p>
            </div>
            <Badge tone={expired ? 'danger' : warning ? 'warning' : 'success'}>
              {expired ? 'Đã hết hạn' : warning ? 'Sắp hết hạn' : 'Đang mở'}
            </Badge>
          </div>

          <div className="mt-5 grid gap-4">
            {error && <div className="rounded-md border border-error-container bg-error-container/35 px-4 py-3 text-sm font-semibold text-error">{error}</div>}
            <Textarea label="Điều đã hiểu" value={understood} onChange={(event) => updateUnderstood(event.target.value)} rows={7} disabled={expired} />
            <Textarea
              label="Điều chưa hiểu / cần hỏi cộng đồng"
              value={notUnderstood}
              onChange={(event) => updateNotUnderstood(event.target.value)}
              rows={5}
              disabled={expired}
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
              <input type="checkbox" checked={anonymous} disabled={expired} onChange={(event) => updateAnonymous(event.target.checked)} />
              Nộp bài ẩn danh trong khu vực dạy chéo
            </label>
            <FileUploadBox
              state={invalidFiles ? 'error' : files.length >= maxFiles ? 'limit' : 'ready'}
              files={files}
              disabled={expired}
              onFilesChange={setFiles}
            />
            <div className="flex items-center justify-between gap-4 rounded-md bg-surface-low p-4">
              <div className="text-sm text-ink-muted">
                <span className="font-bold text-ink">{words}</span> từ, <span className="font-bold text-ink">{files.length}</span> file đính kèm.
              </div>
              <Button disabled={submitDisabled} onClick={() => setConfirm(true)}>
                {expired ? 'Đã hết hạn nộp' : submitting ? 'Đang nộp...' : 'Nộp bài'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card className="sticky top-24 p-5">
          <p className="text-sm font-bold text-ink-muted">Countdown</p>
          <p className={`mt-2 text-timer font-extrabold ${warning ? 'text-amber-900' : expired ? 'text-error' : 'text-primary-container'}`}>
            {formatRemaining(remainingMs)}
          </p>
          <p className="text-sm text-ink-muted">
            {expired ? 'Window học đã hết hạn, nút nộp bị khóa.' : 'Thời gian còn lại trong window học.'}
          </p>
          <ProgressBar value={getWindowProgress(topic.windowHours, remainingMs)} className="mt-4" />
        </Card>
        <Card className="p-5">
          <p className="mb-3 font-bold text-primary-container">Tài liệu tham khảo</p>
          <ResourceList resources={topic.resources} />
        </Card>
      </aside>

      <Modal open={confirm} title="Xác nhận nộp bài" onClose={() => setConfirm(false)}>
        <div className="space-y-4 text-sm text-ink-muted">
          <p>Bài nộp sẽ bị khóa sau khi gửi. Bạn vẫn có thể xem lại trong mục “Bài của tôi”.</p>
          <div className="rounded-md bg-surface-low p-4">
            <p><span className="font-bold text-ink">Trạng thái:</span> {anonymous ? 'Ẩn danh' : 'Công khai tên người học'}</p>
            <p><span className="font-bold text-ink">Số từ:</span> {words}</p>
            <p><span className="font-bold text-ink">File:</span> {files.length ? files.map((file) => file.name).join(', ') : 'Không có'}</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirm(false)}>Kiểm tra lại</Button>
            <Button onClick={submit} disabled={submitting}>{submitting ? 'Đang nộp...' : 'Nộp bài'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export function SubmitSuccessPage() {
  const { id = 't1' } = useParams()
  const { data: topic } = useAsync(() => topicService.getTopicById(id), lookupService.getTopic(id), [id])
  const { data: submission } = useAsync(() => submissionService.getMySubmission(id), null, [id])
  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-container text-emerald-dark">
          <Icon name="check" size={28} />
        </div>
        <h1 className="mt-5 text-[34px] font-extrabold text-primary-container">Nộp bài thành công</h1>
        <p className="mt-3 text-ink-muted">
          Bài của bạn trong chủ đề “{topic.title}” đã được khóa và mở quyền vào khu vực dạy chéo.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4 text-left">
          <Card className="p-4"><p className="text-2xl font-extrabold">{submission ? minutesToReadable(submission.timeSpentMinutes) : '--'}</p><p className="text-sm text-ink-muted">thời gian học</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold">{submission?.wordCount ?? '--'}</p><p className="text-sm text-ink-muted">số từ</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold">{submission?.isAnonymous ? 'Ẩn danh' : 'Công khai'}</p><p className="text-sm text-ink-muted">hiển thị</p></Card>
        </div>
        <div className="mt-7 flex justify-center gap-3">
          <Link to={`/topics/${id}/my-submission`}><Button variant="secondary">Xem bài của tôi</Button></Link>
          <Link to={`/topics/${id}/peer`}><Button>Vào dạy chéo</Button></Link>
        </div>
      </Card>
    </div>
  )
}

export function MySubmissionPage() {
  const { id = 't2' } = useParams()
  const { data: submission } = useAsync(() => submissionService.getMySubmission(id), null, [id])
  const { data: topic } = useAsync(() => topicService.getTopicById(id), lookupService.getTopic(id), [id])

  if (!submission) {
    return (
      <Card className="p-6">
        <p className="font-bold text-primary-container">Bạn chưa có bài nộp cho chủ đề này.</p>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <nav className="text-sm font-semibold text-ink-subtle">
        <Link to="/topics" className="hover:text-secondary-container">Chủ đề</Link>
        <span className="mx-2">/</span>
        <Link to={`/topics/${id}`} className="hover:text-secondary-container">{topic.title}</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Bài của tôi</span>
      </nav>

      <div className="rounded-md border border-border-subtle bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[32px] font-extrabold leading-tight text-primary-container">Bài của tôi</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-ink-muted">{topic.title}</p>
          </div>
          <Badge tone="brand">Đã khóa</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SubmissionStat label="Nộp ngày" value={formatDateTime(submission.createdAt)} />
        <SubmissionStat label="Số từ" value={String(submission.wordCount)} />
        <SubmissionStat label="Thời gian viết" value={minutesToReadable(submission.timeSpentMinutes)} />
        <SubmissionStat label="Lượt thích" value={String(submission.likeCount)} />
      </div>

      <Card className="p-6">
        <div className="grid gap-5">
          <SubmissionReadOnlySection title="Điều đã hiểu" icon="check" content={submission.understood} />
          <SubmissionReadOnlySection title="Điều chưa hiểu" icon="message" content={submission.notUnderstood} />
          {submission.files.length > 0 && (
            <section className="rounded-md bg-surface-low p-5">
              <h2 className="text-lg font-extrabold text-primary-container">File đính kèm</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {submission.files.map((file) => <Badge key={file.id}>{file.name}</Badge>)}
              </div>
            </section>
          )}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 rounded-md border border-border-subtle bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">Bạn có thể tiếp tục học qua bài của cộng đồng và phản hồi cho người khác.</p>
        <div className="flex flex-wrap justify-end gap-3">
          <Link to={`/topics/${id}`}><Button variant="secondary">Quay lại chủ đề</Button></Link>
          <Link to={`/topics/${id}/peer`}><Button>Xem bài cộng đồng</Button></Link>
        </div>
      </div>
    </div>
  )
}

function SubmissionReadOnlySection({ title, icon, content }: { title: string; icon: 'check' | 'message'; content: string }) {
  return (
    <section className="rounded-md bg-emerald-container/45 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-white">
          <Icon name={icon} size={16} />
        </span>
        <h2 className="text-lg font-extrabold text-primary-container">{title}</h2>
      </div>
      <p className="mt-3 text-base leading-7 text-ink-muted">{content}</p>
    </section>
  )
}

function SubmissionStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-lg font-extrabold leading-tight text-primary-container">{value}</p>
      <p className="mt-1 text-xs font-semibold text-ink-subtle">{label}</p>
    </Card>
  )
}

function formatRemaining(remainingMs?: number) {
  if (typeof remainingMs !== 'number') return '--:--:--'
  if (remainingMs <= 0) return '00:00:00'
  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function getWindowProgress(windowHours: number, remainingMs?: number) {
  if (typeof remainingMs !== 'number') return 0
  const totalMs = windowHours * 60 * 60 * 1000
  if (remainingMs <= 0) return 100
  return Math.min(100, Math.max(0, Math.round(((totalMs - remainingMs) / totalMs) * 100)))
}
