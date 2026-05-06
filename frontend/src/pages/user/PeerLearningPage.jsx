import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { topics, submissions, profiles } from '@/data/mockData'
import { ShapeUser, ShapeLock, ShapeOrbit } from '@/shapes'
import { Card, Avatar, Badge, Icon } from '@/components/ui'

function SubmissionCard({ sub, topicId }) {
  const navigate = useNavigate()
  const author = profiles.find(p => p.id === sub.user_id)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(Math.floor(Math.random() * 20 + 1))

  const handleLike = (e) => {
    e.stopPropagation()
    setLiked(l => !l)
    setLikes(n => liked ? n - 1 : n + 1)
  }

  return (
    <Card hover onClick={() => navigate(`/topics/${topicId}/peer/${sub.id}`)} className="p-5">
      {/* Author row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Avatar
            name={sub.is_anonymous ? '?' : author?.display_name ?? '?'}
            anonymous={sub.is_anonymous}
            size="md"
          />
          <div>
            <p className="text-sm font-medium text-ink">
              {sub.is_anonymous ? 'Người dùng ẩn danh' : author?.display_name}
            </p>
            <p className="text-xs text-ink-muted">
              {new Date(sub.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sub.is_anonymous && <Badge variant="neutral">Ẩn danh</Badge>}
          <ShapeLock size={16} variant="primary" className="opacity-40" />
        </div>
      </div>

      {/* Understood */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-emerald uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Icon name="check" size={14} /> Hiểu
        </p>
        <p className="text-sm text-ink leading-relaxed line-clamp-4">{sub.understood}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border-subtle my-3" />

      {/* Not understood */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-amber uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Icon name="question" size={14} /> Chưa hiểu
        </p>
        <p className="text-sm text-ink-muted leading-relaxed line-clamp-3">{sub.not_understood}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button onClick={handleLike}
          className={['flex items-center gap-1.5 text-sm transition-colors px-2 py-1 rounded hover:bg-surface-low',
            liked ? 'text-error font-medium' : 'text-ink-muted'].join(' ')}>
          <Icon name="heart" size={15} filled={liked} />
          <span>{likes}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/topics/${topicId}/peer/${sub.id}`) }}
          className="inline-flex items-center gap-1 text-sm text-secondary-container hover:underline">
          Xem & bình luận <Icon name="arrowRight" size={15} />
        </button>
      </div>
    </Card>
  )
}

export default function PeerLearningPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const topic = topics.find(t => t.id === id) ?? topics[0]
  const topicSubs = submissions.filter(s => s.topic_id === id)
  const [sort, setSort] = useState('Mới nhất')
  const justSubmitted = Boolean(location.state?.justSubmitted)

  // Nếu không có submission trong topic này, show tất cả submissions để demo
  const displaySubs = [...(topicSubs.length > 0 ? topicSubs : submissions)].sort((a, b) => {
    if (sort === 'Nhiều like nhất') return b.time_spent_seconds - a.time_spent_seconds
    if (sort === 'Ngẫu nhiên') return a.id.localeCompare(b.id)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="content-max py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate(`/topics/${id}`)}
            className="text-sm text-ink-muted hover:text-ink mb-2 flex items-center gap-1.5 transition-colors">
            ← Chi tiết chủ đề
          </button>
          <div className="flex items-center gap-3">
            <ShapeOrbit size={40} variant="emerald" />
            <div>
              <h1 className="text-xl font-bold text-primary-container">Dạy chéo</h1>
              <p className="text-ink-muted text-sm">{topic.title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShapeUser size={28} variant="blue" />
          <span className="font-semibold text-primary-container">{topic.submission_count}</span>
          <span className="text-ink-muted text-sm">bài nộp</span>
        </div>
      </div>

      {/* Gate banner — user has submitted */}
      <div className="flex items-center gap-3 bg-emerald/10 border border-emerald/25 rounded-md p-4 mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald shrink-0" />
        <p className="text-sm text-ink">
          {justSubmitted
            ? 'Bài của bạn đã được nộp và khóa. Bây giờ bạn có thể đọc bài của cộng đồng.'
            : 'Bạn đã nộp bài trong chủ đề này. Dưới đây là bài viết của cộng đồng.'}
        </p>
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm text-ink-muted">Sắp xếp:</span>
        {['Mới nhất', 'Nhiều like nhất', 'Ngẫu nhiên'].map((opt) => (
          <button key={opt} onClick={() => setSort(opt)}
            className={['px-3 py-1 rounded-full text-sm border transition-colors',
              sort === opt
                ? 'bg-secondary-container text-white border-secondary-container'
                : 'border-border text-ink-muted hover:border-secondary-container hover:text-secondary-container'
            ].join(' ')}>
            {opt}
          </button>
        ))}
      </div>

      {/* Submission list */}
      {displaySubs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displaySubs.map(sub => (
            <SubmissionCard key={sub.id} sub={sub} topicId={id} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <ShapeOrbit size={56} variant="emerald" className="mx-auto mb-4" />
          <h3 className="font-semibold text-primary-container mb-1">Chưa có bài nộp nào</h3>
          <p className="text-ink-muted text-sm">Hãy là người đầu tiên chia sẻ hiểu biết của bạn!</p>
        </Card>
      )}
    </div>
  )
}
