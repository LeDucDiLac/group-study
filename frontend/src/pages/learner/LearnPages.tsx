import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Icon, Modal, PageHeader, ProgressBar, Textarea } from '@/components/ui'
import { ResourceList } from '@/components/topic/TopicCard'
import { FileUploadBox } from '@/components/submission/FileUploadBox'
import { draftService, submissionService, topicService, topicFallback, uploadService } from '@/services/api'
import type { ResourceFile } from '@/types/domain'
import { countWords, formatDateTime } from '@/utils/format'
import { useAsync } from '@/utils/hooks'

const maxFiles = 10

export function LearnPage() {
  const { id = 't1' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Nhận participationStartTime và windowHours từ navigation state (truyền từ TopicDetailPage)
  const navState = location.state as { participationStartTime?: number | null; windowHours?: number } | null

  const { data: topic } = useAsync(() => topicService.getTopicById(id), topicFallback(id), [id])

  // Ưu tiên dùng giá trị từ navigation state (có ngay lập tức),
  // fallback về topic từ API khi đã load xong
  const participationStartTime = topic.participationStartTime ?? navState?.participationStartTime ?? null
  const windowHours = topic.windowHours || navState?.windowHours || 48

  const [understood, setUnderstood] = useState('')
  const [notUnderstood, setNotUnderstood] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<ResourceFile[]>([])
  const [uploadError, setUploadError] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draftStatus, setDraftStatus] = useState('Đang tải bản nháp...')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [error, setError] = useState('')
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const hasLocalDraftChangesRef = useRef(false)
  const latestDraftValueRef = useRef({ understood: '', notUnderstood: '', anonymous: false })

  const words = useMemo(() => countWords(`${understood} ${notUnderstood}`), [notUnderstood, understood])
  const timeSpentSeconds = Math.max(0, Math.round((now - startedAt) / 1000))

  const deadlineMs = participationStartTime
    ? new Date(participationStartTime).getTime() + windowHours * 60 * 60 * 1000
    : undefined
  const remainingMs = typeof deadlineMs === 'number' ? deadlineMs - now : undefined

  const expired = topic.status !== 'Đang mở' || (typeof remainingMs === 'number' && remainingMs <= 0)
  const warning = !expired && typeof remainingMs === 'number' && remainingMs < windowHours * 60 * 60 * 1000 * 0.2
  const submitDisabled = expired || submitting || words === 0 || !understood.trim() || !notUnderstood.trim() || uploadedFiles.length > maxFiles

  latestDraftValueRef.current = { understood, notUnderstood, anonymous }

  useEffect(() => {
    const handle = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(handle)
  }, [])

  useEffect(() => {
    const draft = draftService.getDraft(id)
    if (draft) {
      setUnderstood(draft.understood)
      setNotUnderstood(draft.notUnderstood)
      setAnonymous(draft.isAnonymous)
      setDraftStatus(draft.updatedAt ? `Đã khôi phục bản nháp lúc ${formatDateTime(draft.updatedAt)}` : 'Đã khôi phục bản nháp')
    } else {
      setDraftStatus('Chưa có bản nháp')
    }
    setDraftLoaded(true)
  }, [id])

  useEffect(() => {
    if (!draftLoaded || expired) return
    const handle = window.setTimeout(() => {
      if (!understood.trim() && !notUnderstood.trim()) return
      if (!hasLocalDraftChangesRef.current) return
      const payload = { understood, notUnderstood, isAnonymous: anonymous, timeSpentSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)) }
      setDraftStatus('Đang lưu bản nháp...')
      const saved = draftService.saveDraft(id, payload)
      const latestDraft = latestDraftValueRef.current
      if (
        latestDraft.understood === payload.understood
        && latestDraft.notUnderstood === payload.notUnderstood
        && latestDraft.anonymous === payload.isAnonymous
      ) {
        hasLocalDraftChangesRef.current = false
      }
      setDraftStatus(saved.updatedAt ? `Đã lưu lúc ${formatDateTime(saved.updatedAt)}` : 'Đã lưu bản nháp')
    }, 900)
    return () => window.clearTimeout(handle)
  }, [anonymous, draftLoaded, expired, id, notUnderstood, startedAt, understood])

  function updateUnderstood(value: string) { hasLocalDraftChangesRef.current = true; setUnderstood(value) }
  function updateNotUnderstood(value: string) { hasLocalDraftChangesRef.current = true; setNotUnderstood(value) }
  function updateAnonymous(value: boolean) { hasLocalDraftChangesRef.current = true; setAnonymous(value) }

  async function handleUpload(file: File) {
    setUploadError('')
    try {
      const resource = await uploadService.uploadFile(file)
      setUploadedFiles((prev) => [...prev, resource])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload thất bại, vui lòng thử lại.')
    }
  }

  function handleRemoveFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
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
        resources: uploadedFiles,
      })
      draftService.clearDraft(id)
      navigate(`/topics/${id}/peer`)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể nộp bài. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
      setConfirm(false)
    }
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
            <Textarea label="Điều đã hiểu" value={understood} onChange={(e) => updateUnderstood(e.target.value)} rows={7} disabled={expired} />
            <Textarea
              label="Điều chưa hiểu / cần hỏi cộng đồng"
              value={notUnderstood}
              onChange={(e) => updateNotUnderstood(e.target.value)}
              rows={5}
              disabled={expired}
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
              <input type="checkbox" checked={anonymous} disabled={expired} onChange={(e) => updateAnonymous(e.target.checked)} />
              Nộp bài ẩn danh trong khu vực dạy chéo
            </label>
            <FileUploadBox
              state={uploadedFiles.length >= maxFiles ? 'limit' : 'ready'}
              uploadedFiles={uploadedFiles}
              disabled={expired}
              onUpload={handleUpload}
              onRemove={handleRemoveFile}
            />
            {uploadError && <p className="text-sm font-semibold text-error">{uploadError}</p>}
            <div className="flex items-center justify-between gap-4 rounded-md bg-surface-low p-4">
              <div className="text-sm text-ink-muted">
                <span className="font-bold text-ink">{words}</span> từ, <span className="font-bold text-ink">{uploadedFiles.length}</span> file đính kèm.
              </div>
              <Button disabled={submitDisabled} onClick={() => setConfirm(true)}>
                {expired ? 'Đã hết hạn nộp' : submitting ? 'Đang nộp...' : 'Nộp bài'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <Card className="p-5">
            <p className="text-sm font-bold text-ink-muted">Countdown</p>
            <p className={`mt-2 text-timer font-extrabold ${warning ? 'text-amber-900' : expired ? 'text-error' : 'text-primary-container'}`}>
              {formatRemaining(remainingMs)}
            </p>
            <p className="text-sm text-ink-muted">
              {expired ? 'Window học đã hết hạn, nút nộp bị khóa.' : 'Thời gian còn lại trong window học.'}
            </p>
            <ProgressBar value={getWindowProgress(windowHours, remainingMs)} className="mt-4" />
          </Card>
          <Card className="p-5">
            <p className="mb-3 font-bold text-primary-container">Tài liệu tham khảo</p>
            <ResourceList resources={topic.resources} />
          </Card>
        </div>
      </aside>

      <Modal open={confirm} title="Xác nhận nộp bài" onClose={() => setConfirm(false)}>
        <div className="space-y-4 text-sm text-ink-muted">
          <p>Bài nộp sẽ bị khóa sau khi gửi. Bạn vẫn có thể xem lại bài trong khu dạy chéo.</p>
          <div className="rounded-md bg-surface-low p-4">
            <p><span className="font-bold text-ink">Trạng thái:</span> {anonymous ? 'Ẩn danh' : 'Công khai tên người học'}</p>
            <p><span className="font-bold text-ink">Số từ:</span> {words}</p>
            <p><span className="font-bold text-ink">File:</span> {uploadedFiles.length ? uploadedFiles.map((f) => f.label).join(', ') : 'Không có'}</p>
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

function formatRemaining(remainingMs?: number) {
  if (typeof remainingMs !== 'number') return '--:--:--'
  if (remainingMs <= 0) return '00:00:00'
  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':')
}

function getWindowProgress(windowHours: number, remainingMs?: number) {
  if (typeof remainingMs !== 'number') return 0
  const totalMs = windowHours * 60 * 60 * 1000
  if (remainingMs <= 0) return 100
  return Math.min(100, Math.max(0, Math.round(((totalMs - remainingMs) / totalMs) * 100)))
}
