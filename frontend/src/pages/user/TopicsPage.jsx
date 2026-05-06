import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { topics } from '@/data/mockData'
import { ShapeTopic, ShapeTime } from '@/shapes'
import { Badge, Card, Button, ProgressBar, Icon, StatusDot } from '@/components/ui'

const CATEGORIES = ['Tất cả', 'Toán học', 'Công nghệ thông tin', 'Kỹ năng mềm', 'Kinh tế']
const STATUS_BADGE = {
  approved: { variant: 'emerald', label: 'Đang mở', dot: 'bg-emerald' },
  closed:   { variant: 'neutral', label: 'Đã đóng', dot: 'bg-ink-subtle' },
  pending:  { variant: 'amber',   label: 'Chờ duyệt', dot: 'bg-amber' },
}

function getTimeLeft(endAt) {
  if (!endAt) return null
  const diff = new Date(endAt) - new Date()
  if (diff <= 0) return 'Đã hết hạn'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h > 24 ? `Còn ${Math.floor(h/24)} ngày ${h%24}h` : `Còn ${h}h ${m}m`
}

function TopicCard({ topic }) {
  const navigate = useNavigate()
  const { variant, label, dot } = STATUS_BADGE[topic.status] ?? STATUS_BADGE.pending
  const timeLeft = getTimeLeft(topic.window_end_at)

  return (
    <Card hover onClick={() => navigate(`/topics/${topic.id}`)} className="p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <ShapeTopic size={36} variant={topic.status === 'approved' ? 'blue' : 'surface'} />
        <Badge variant={variant}><StatusDot className={dot} />{label}</Badge>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-semibold text-primary-container leading-snug line-clamp-2">{topic.title}</h3>
        <p className="text-ink-muted text-sm mt-1 line-clamp-2">{topic.description}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="neutral">{topic.category}</Badge>
        {topic.tags.slice(0, 2).map(t => (
          <Badge key={t} variant="blue">{t}</Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border-subtle">
        {timeLeft && topic.status === 'approved' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <div className="flex items-center gap-1.5">
                <ShapeTime size={16} variant="emerald" progress={0.6} />
                <span className="font-medium text-emerald">{timeLeft}</span>
              </div>
              <span>{topic.submission_count} bài nộp</span>
            </div>
            <ProgressBar value={topic.submission_count} max={50} />
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>{topic.submission_count} bài nộp</span>
            <span>{topic.window_days} ngày</span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function TopicsPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('Tất cả')
  const displayedTopics = useMemo(
    () => category === 'Tất cả' ? topics : topics.filter(topic => topic.category === category),
    [category]
  )

  return (
    <div className="content-max py-10">
      {/* Hero */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container">Khám phá chủ đề</h1>
          <p className="text-ink-muted mt-1">Chọn một chủ đề, đọc tài liệu và chia sẻ hiểu biết của bạn trong 48h</p>
        </div>
        <Button onClick={() => navigate('/topics/new')}>
          Đề xuất chủ đề <Icon name="arrowRight" size={16} />
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={[
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              category === cat
                ? 'bg-secondary-container text-white border-secondary-container'
                : 'border-border text-ink-muted hover:border-secondary-container hover:text-secondary-container'
            ].join(' ')}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTopics.map(topic => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  )
}
