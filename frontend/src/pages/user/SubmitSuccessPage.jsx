import { useParams, useNavigate } from 'react-router-dom'
import { topics } from '@/data/mockData'
import { ShapeAchievement, ShapeTime, ShapeUser, ShapeLock } from '@/shapes'
import { Button, Card, Icon } from '@/components/ui'

export default function SubmitSuccessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = topics.find(t => t.id === id) ?? topics[0]

  // Giả lập stats của người dùng
  const stats = { minutes: 28, words: 342, rank: 12 }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        <Card className="p-8 text-center">
          {/* Achievement shape */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShapeAchievement size={80} variant="emerald" />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full animate-pulse-slow"
                style={{ boxShadow: '0 0 0 12px rgba(0,164,114,0.1)' }} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-primary-container mb-2">
            Đã nộp bài thành công
          </h1>
          <p className="text-ink-muted mb-1.5">Bạn đã hoàn thành và chia sẻ hiểu biết về</p>
          <p className="font-semibold text-primary-container text-lg mb-6 leading-snug">
            "{topic.title}"
          </p>

          <div className="h-px bg-border-subtle mb-6" />

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { shape: <ShapeTime size={28} variant="emerald" progress={0.5} />, value: `${stats.minutes} phút`, label: 'Thời gian học' },
              { shape: <ShapeAchievement size={28} variant="blue" />, value: `${stats.words} từ`, label: 'Bạn đã viết' },
              { shape: <ShapeUser size={28} variant="blue" />, value: `Người thứ ${stats.rank}`, label: 'Trong chủ đề' },
            ].map(({ shape, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 bg-surface-low rounded-md py-3 px-2">
                {shape}
                <p className="font-bold text-primary-container text-sm leading-none mt-1">{value}</p>
                <p className="text-xs text-ink-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Highlight message */}
          <div className="bg-emerald/10 border border-emerald/25 rounded-md p-4 mb-6 text-left">
            <p className="text-sm text-ink leading-relaxed">
              Bài của bạn đã được lưu. Giờ bạn có thể đọc và học từ bài viết của{' '}
              <strong>{topic.submission_count - 1} người</strong> khác trong nhóm!
            </p>
          </div>

          {/* Lock note */}
          <div className="flex items-center gap-2 text-xs text-ink-muted mb-6 justify-center">
            <ShapeLock size={16} variant="primary" />
            <span>
              Bài nộp đã khóa. Window kết thúc:{' '}
              {topic.window_end_at
                ? new Date(topic.window_end_at).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
                : 'Không xác định'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button fullWidth size="lg" onClick={() => navigate(`/topics/${id}/peer`)}>
              Xem bài của mọi người <Icon name="arrowRight" size={16} />
            </Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/topics')}>
              Quay về trang chủ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
