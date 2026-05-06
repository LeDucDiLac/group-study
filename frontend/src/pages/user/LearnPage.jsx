import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { topics } from '@/data/mockData'
import { ShapeTime, ShapeLock } from '@/shapes'
import { Button, Card, Modal, ProgressBar, Icon } from '@/components/ui'

// Đếm ngược từ window_end_at
function useCountdown(endAt) {
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endAt) - new Date()
      setRemaining(Math.max(0, diff))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endAt])
  const totalMs = 48 * 3600 * 1000
  const pct = remaining / totalMs
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  return { h, m, s, pct, expired: remaining === 0 }
}

export default function LearnPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = topics.find(t => t.id === id) ?? topics[0]
  const { h, m, s, pct, expired } = useCountdown(topic.window_end_at ?? new Date(Date.now() + 48*3600*1000).toISOString())

  const [form, setForm] = useState({ understood: '', notUnderstood: '' })
  const [attachments, setAttachments] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showResources, setShowResources] = useState(true)
  const [savedAt, setSavedAt] = useState(null)
  const autoSaveRef = useRef(null)
  const fileInputRef = useRef(null)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    // Autosave simulation
    clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => setSavedAt(new Date()), 2000)
  }

  const wordCount = [...form.understood.split(/\s+/), ...form.notUnderstood.split(/\s+/)]
    .filter(Boolean).length

  const missingUnderstood = form.understood.trim().length <= 30
  const missingNotUnderstood = form.notUnderstood.trim().length <= 10
  const canSubmit = !missingUnderstood && !missingNotUnderstood
  const submitHint = expired
    ? 'Window học đã kết thúc'
    : missingUnderstood && missingNotUnderstood
      ? 'Cần điền đủ 2 phần bắt buộc'
      : missingUnderstood
        ? 'Cần viết thêm phần "Hiểu"'
        : missingNotUnderstood
          ? 'Cần viết thêm phần "Chưa hiểu"'
          : 'Sẵn sàng nộp và sang dạy chéo'

  const handleSubmit = () => {
    setShowConfirm(false)
    navigate(`/topics/${id}/peer`, { state: { justSubmitted: true } })
  }

  // File helpers
  const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.zip,.txt,.md'
  const MAX_FILES = 10
  const MAX_MB = 20

  const getFileIcon = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (['png','jpg','jpeg','gif','webp'].includes(ext)) return 'fileImage'
    if (['pdf','doc','docx','txt','md'].includes(ext)) return 'fileText'
    return 'file'
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(0)}KB`
    return `${(bytes/(1024*1024)).toFixed(1)}MB`
  }

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList).filter(f => {
      if (f.size > MAX_MB * 1024 * 1024) return false // bỏ qua file > 20MB
      return true
    })
    setAttachments(prev => {
      const combined = [...prev, ...incoming]
      return combined.slice(0, MAX_FILES) // max 10 files
    })
  }

  const removeFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const timerColor = pct > 0.5 ? 'text-emerald' : pct > 0.2 ? 'text-amber' : 'text-error'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header with timer */}
      <div className="sticky top-14 z-30 bg-white border-b border-border-subtle shadow-sm">
        <div className="content-max py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(`/topics/${id}`)}
              className="text-ink-muted hover:text-ink transition-colors shrink-0 text-sm">
              ← Quay lại
            </button>
            <div className="w-px h-5 bg-border-subtle shrink-0" />
            <p className="font-semibold text-primary-container text-sm truncate">{topic.title}</p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ShapeTime size={32} variant={pct > 0.3 ? 'emerald' : 'amber'} progress={pct} />
            <div className="text-right">
              <p className="text-xs text-ink-muted leading-none mb-0.5">Còn lại</p>
              <p className={['font-mono font-bold text-xl leading-none tabular-nums', timerColor].join(' ')}>
                {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
              </p>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-center gap-3 shrink-0">
            {!canSubmit || expired ? (
              <span className="hidden md:inline text-xs text-ink-muted">{submitHint}</span>
            ) : null}
            <Button onClick={() => setShowConfirm(true)} disabled={!canSubmit || expired} size="sm">
              Nộp bài <Icon name="arrowRight" size={15} />
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <ProgressBar value={pct * 100} max={100} variant={pct > 0.3 ? 'emerald' : 'amber'} />
      </div>

      {/* Content */}
      <div className="content-max py-6 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Resources */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="overflow-hidden">
            <button
              onClick={() => setShowResources(v => !v)}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-low transition-colors">
              <span className="font-semibold text-primary-container text-sm flex items-center gap-2">
                <Icon name="book" size={16} /> Tài liệu tham khảo
              </span>
              <span className="text-ink-muted text-xs flex items-center gap-1">
                {showResources ? <Icon name="chevronUp" size={14} /> : <Icon name="chevronDown" size={14} />}
                {showResources ? 'Thu gọn' : 'Mở rộng'}
              </span>
            </button>
            {showResources && (
              <div className="px-4 pb-4 space-y-2 border-t border-border-subtle pt-3">
                {topic.resources.length > 0 ? topic.resources.map(r => (
                  <a key={r.url} href={r.url} target="_blank" rel="noreferrer"
                    className="flex items-start gap-2 text-sm text-secondary-container hover:underline">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary-container mt-1.5 shrink-0" />
                    {r.label}
                  </a>
                )) : (
                  <p className="text-sm text-ink-muted">Không có tài liệu đính kèm.</p>
                )}
              </div>
            )}
          </Card>

          <Card className="p-4 bg-surface-low">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Thống kê</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Số từ</span>
                <span className="font-medium text-ink">{wordCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Bài đã nộp</span>
                <span className="font-medium text-ink">{topic.submission_count}</span>
              </div>
            </div>
          </Card>

          {/* Anonymous toggle */}
          <Card className="p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
                className="mt-0.5 accent-secondary-container" />
              <div>
                <p className="text-sm font-medium text-ink">Nộp ẩn danh</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Tên bạn sẽ không hiển thị với người khác. Hệ thống vẫn lưu để kiểm soát vi phạm.
                </p>
              </div>
            </label>
          </Card>
        </div>

        {/* Right — Editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Instruction */}
          <Card className="p-5 border-l-4 border-l-secondary-container">
            <p className="text-sm font-medium text-primary-container mb-1">Hướng dẫn</p>
            <p className="text-sm text-ink-muted leading-relaxed">
              Đọc tài liệu bên trái, sau đó viết lại theo cách <strong>hiểu của bạn</strong> — như thể bạn đang giải thích cho người chưa biết gì.
              Bài tốt là bài trung thực, không cần hoàn hảo.
            </p>
          </Card>

          {/* Section 1: Hiểu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-primary-container">
                <span className="inline-flex items-center gap-2"><Icon name="check" size={16} className="text-emerald" />Những gì tôi hiểu</span> <span className="text-error">*</span>
              </label>
              <span className="text-xs text-ink-muted">{form.understood.length} ký tự</span>
            </div>
            <textarea
              rows={8}
              value={form.understood}
              onChange={e => set('understood', e.target.value)}
              placeholder="Viết lại những gì bạn hiểu về chủ đề này bằng ngôn ngữ của bạn...

Ví dụ:
- Khái niệm X là gì theo cách bạn hiểu
- Cách bạn áp dụng kiến thức này
- Kết nối với những gì bạn đã biết"
              className="w-full px-4 py-3 rounded-md text-sm bg-surface-low border border-border resize-none
                focus:bg-white focus:border-secondary-container focus:ring-2 focus:ring-secondary/20
                outline-none transition-all leading-relaxed placeholder:text-ink-subtle"
            />
          </div>

          {/* Section 2: Chưa hiểu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-primary-container">
                <span className="inline-flex items-center gap-2"><Icon name="question" size={16} className="text-amber" />Những gì tôi chưa hiểu</span> <span className="text-error">*</span>
              </label>
              <span className="text-xs text-ink-muted">{form.notUnderstood.length} ký tự</span>
            </div>
            <textarea
              rows={5}
              value={form.notUnderstood}
              onChange={e => set('notUnderstood', e.target.value)}
              placeholder="Điều gì vẫn còn mơ hồ? Câu hỏi nào bạn chưa trả lời được?"
              className="w-full px-4 py-3 rounded-md text-sm bg-surface-low border border-border resize-none
                focus:bg-white focus:border-secondary-container focus:ring-2 focus:ring-secondary/20
                outline-none transition-all leading-relaxed placeholder:text-ink-subtle"
            />
          </div>

          {/* Section 3: Đính kèm file */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-primary-container">
                <span className="inline-flex items-center gap-2"><Icon name="paperclip" size={16} />Tài liệu đính kèm</span>
                <span className="text-ink-muted font-normal ml-1">(không bắt buộc, tối đa {MAX_FILES} file · {MAX_MB}MB/file)</span>
              </label>
              {attachments.length > 0 && (
                <span className="text-xs text-secondary-container font-medium">{attachments.length}/{MAX_FILES} file</span>
              )}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={[
                'border-2 border-dashed rounded-md transition-all duration-150',
                isDragOver
                  ? 'border-secondary-container bg-secondary-fixed/30 scale-[1.01]'
                  : 'border-border hover:border-secondary-container/60 hover:bg-surface-low',
              ].join(' ')}
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT}
                className="hidden"
                onChange={e => { addFiles(e.target.files); e.target.value = '' }}
              />

              {attachments.length === 0 ? (
                /* Empty state */
                <div className="py-6 flex flex-col items-center gap-3 text-center">
                  <div className="flex items-center gap-2 text-ink-subtle">
                    <Icon name="fileImage" size={24} />
                    <Icon name="fileText" size={24} />
                    <Icon name="file" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-ink-muted">Kéo thả file vào đây hoặc</p>
                    <p className="text-xs text-ink-subtle mt-0.5">Hỗ trợ: ảnh, PDF, Word, Excel, PowerPoint, video, zip...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-4 rounded-md text-sm font-medium bg-secondary-container text-white hover:bg-secondary transition-colors inline-flex items-center gap-1.5">
                      <Icon name="upload" size={15} /> Chọn file từ máy
                    </button>
                  </div>
                </div>
              ) : (
                /* File list */
                <div className="p-3 space-y-2">
                  {attachments.map((file, i) => (
                    <div key={i}
                      className="flex items-center gap-3 bg-white rounded border border-border-subtle px-3 py-2 group">
                      {/* Preview / icon */}
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-8 h-8 rounded object-cover shrink-0 border border-border-subtle"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded bg-surface-low border border-border-subtle flex items-center justify-center text-ink-muted shrink-0">
                          <Icon name={getFileIcon(file)} size={17} />
                        </span>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                        <p className="text-xs text-ink-muted">{formatSize(file.size)}</p>
                      </div>
                      {/* Remove */}
                      <button type="button" onClick={() => removeFile(i)}
                        className="w-6 h-6 flex items-center justify-center rounded text-ink-subtle hover:text-error hover:bg-error-container transition-colors opacity-0 group-hover:opacity-100">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  {/* Add more */}
                  {attachments.length < MAX_FILES && (
                    <button type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-8 border border-dashed border-border rounded text-xs text-ink-muted hover:border-secondary-container hover:text-secondary-container transition-colors">
                      + Thêm file
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Autosave + Submit */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {savedAt ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
                  <span className="text-xs text-ink-muted">
                    Đã lưu nháp lúc {savedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              ) : (
                <span className="text-xs text-ink-subtle">Nháp sẽ tự động lưu...</span>
              )}
            </div>
            <Button onClick={() => setShowConfirm(true)} disabled={!canSubmit || expired} size="lg">
              Nộp bài <Icon name="arrowRight" size={16} />
            </Button>
          </div>

          {!canSubmit && (
            <p className="text-xs text-ink-muted text-right">
              {submitHint}: cần viết ít nhất 30 ký tự ở phần "Hiểu" và 10 ký tự ở phần "Chưa hiểu".
            </p>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Xác nhận nộp bài">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-error-container rounded-md p-3">
            <ShapeLock size={24} variant="primary" />
            <p className="text-sm text-error-on-container leading-relaxed">
              <strong>Bài nộp sẽ bị khóa và không thể chỉnh sửa</strong> sau khi xác nhận.
              Hành động này không thể hoàn tác.
            </p>
          </div>

          {isAnonymous && (
            <div className="flex items-center gap-2 text-sm text-ink-muted bg-surface-low rounded p-3">
              <Icon name="user" size={16} />
              <span>Bài của bạn sẽ được nộp <strong>ẩn danh</strong>.</span>
            </div>
          )}

          {attachments.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-ink-muted bg-surface-low rounded p-3">
              <Icon name="paperclip" size={16} />
              <span>Đính kèm <strong>{attachments.length} file</strong>: {attachments.map(f => f.name).join(', ').slice(0, 60)}{attachments.map(f=>f.name).join(', ').length > 60 ? '...' : ''}</span>
            </div>
          )}
          <p className="text-sm text-ink-muted">
            Sau khi nộp, bạn có thể đọc và học từ bài viết của{' '}
            <strong>{topic.submission_count} người</strong> khác trong chủ đề này.
          </p>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)}>
              Kiểm tra lại
            </Button>
            <Button fullWidth onClick={handleSubmit}>
              <Icon name="check" size={16} /> Nộp và sang dạy chéo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
