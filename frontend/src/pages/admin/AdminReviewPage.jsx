import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { topics, profiles } from '@/data/mockData'
import { ShapeTopic, ShapeTime, ShapeSpark } from '@/shapes'
import { Button, Card, Badge, Modal, Textarea, Icon, StatusDot } from '@/components/ui'

export default function AdminReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = topics.find(t => t.id === id) ?? topics[3]
  const author = profiles.find(p => p.id === topic.created_by)

  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [approved, setApproved] = useState(false)

  const handleApprove = () => {
    setApproved(true)
    setTimeout(() => navigate('/admin/topics/pending'), 1500)
  }

  const handleReject = () => {
    setShowReject(false)
    navigate('/admin/topics/pending')
  }

  if (approved) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center animate-slide-up">
          <ShapeSpark size={64} variant="emerald" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-container">Đã phê duyệt!</h2>
          <p className="text-ink-muted mt-2">Chủ đề đã được mở cho người dùng. Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/topics/pending')}
          className="text-ink-muted hover:text-ink text-sm flex items-center gap-1.5 transition-colors">
          ← Quay lại
        </button>
        <div className="h-4 w-px bg-border-subtle" />
        <h1 className="text-xl font-bold text-primary-container">Xem xét đề xuất</h1>
        <Badge variant="amber"><StatusDot className="bg-amber" />Chờ duyệt</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Topic content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Topic overview */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-5">
              <ShapeTopic size={44} variant="blue" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-primary-container">{topic.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="neutral">{topic.category}</Badge>
                  {topic.tags.map(t => <Badge key={t} variant="blue">{t}</Badge>)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Mô tả chủ đề', value: topic.description },
                { label: 'Kiến thức cần có trước', value: topic.prerequisites ?? 'Không yêu cầu' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">{label}</p>
                  <p className="text-sm text-ink leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Resources */}
          {topic.resources.length > 0 && (
            <Card className="p-5">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Tài liệu đính kèm</p>
              <div className="space-y-2">
                {topic.resources.map(r => (
                  <a key={r.url} href={r.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-secondary-container hover:underline">
                    <div className="w-1 h-1 rounded-full bg-secondary-container" />
                    {r.label}
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button fullWidth size="lg" onClick={handleApprove}>
              <Icon name="check" size={16} /> Phê duyệt chủ đề
            </Button>
            <Button fullWidth size="lg" variant="destructive" onClick={() => setShowReject(true)}>
              <Icon name="close" size={16} /> Từ chối
            </Button>
          </div>
        </div>

        {/* Right sidebar — Author info + Settings */}
        <div className="space-y-4">
          {/* Author */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Người đề xuất</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center font-bold text-secondary-container">
                {author?.display_name?.[0] ?? 'U'}
              </div>
              <div>
                <p className="font-medium text-ink text-sm">{author?.display_name}</p>
                <p className="text-xs text-ink-muted">{author?.email}</p>
              </div>
            </div>
            <p className="text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5"><Icon name="calendar" size={14} /> Ngày gửi: {new Date(topic.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
            </p>
          </Card>

          {/* Proposed settings */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Cài đặt đề xuất</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShapeTime size={24} variant="emerald" progress={0.5} />
                  <span className="text-sm text-ink">Window học</span>
                </div>
                <span className="text-sm font-bold text-primary-container">{topic.window_days} ngày</span>
              </div>
            </div>
          </Card>

          {/* Checklist */}
          <Card className="p-5 bg-surface-low">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Checklist duyệt</p>
            <div className="space-y-2">
              {[
                'Tên chủ đề rõ ràng, không trùng lặp',
                'Mô tả đủ thông tin để học',
                'Phù hợp với mục tiêu học tập',
                'Không chứa nội dung vi phạm',
                'Tài liệu tham khảo hợp lệ',
              ].map(item => (
                <label key={item} className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox" className="mt-0.5 accent-secondary-container" />
                  <span className="text-xs text-ink-muted group-hover:text-ink transition-colors">{item}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Reject modal */}
      <Modal open={showReject} onClose={() => setShowReject(false)} title="Từ chối đề xuất">
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Người dùng sẽ nhận được email thông báo từ chối cùng lý do bên dưới.
            Họ có thể chỉnh sửa và gửi lại.
          </p>
          <Textarea
            id="reject-reason"
            label="Lý do từ chối"
            rows={4}
            required
            placeholder="VD: Chủ đề quá rộng, cần thu hẹp phạm vi. Mô tả cần cụ thể hơn..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowReject(false)}>
              Huỷ
            </Button>
            <Button variant="destructive" fullWidth disabled={!rejectReason.trim()} onClick={handleReject}>
              <Icon name="close" size={16} /> Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
