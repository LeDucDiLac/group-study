import { useParams, useNavigate } from 'react-router-dom'
import { topics } from '@/data/mockData'
import { ShapeTopic, ShapeTime, ShapeUser } from '@/shapes'
import { Badge, Button, Card, Icon } from '@/components/ui'

export default function TopicDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = topics.find(t => t.id === id) ?? topics[0]

  return (
    <div className="content-max py-10">
      <button onClick={() => navigate('/topics')} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-6 transition-colors">
        <Icon name="arrowLeft" size={15} /> Quay lại danh sách
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start gap-4">
            <ShapeTopic size={48} variant="blue" />
            <div>
              <h1 className="text-2xl font-bold text-primary-container">{topic.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="neutral">{topic.category}</Badge>
                {topic.tags.map(t => <Badge key={t} variant="blue">{t}</Badge>)}
              </div>
            </div>
          </div>
          <Card className="p-6">
            <h3 className="font-semibold text-primary-container mb-3">Mô tả chủ đề</h3>
            <p className="text-ink leading-relaxed">{topic.description}</p>
          </Card>
          {topic.prerequisites && (
            <Card className="p-6">
              <h3 className="font-semibold text-primary-container mb-2">Kiến thức cần có trước</h3>
              <p className="text-ink-muted text-sm">{topic.prerequisites}</p>
            </Card>
          )}
          {topic.resources.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-primary-container mb-3">Tài liệu tham khảo</h3>
              <ul className="space-y-2">
                {topic.resources.map(r => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noreferrer"
                      className="text-secondary-container hover:underline text-sm flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary-container" />
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShapeTime size={32} variant="emerald" progress={0.7} />
              <div>
                <p className="text-xs text-ink-muted">Window học</p>
                <p className="font-bold text-emerald text-lg">{topic.window_days} ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <ShapeUser size={32} variant="blue" />
              <div>
                <p className="text-xs text-ink-muted">Số bài nộp</p>
                <p className="font-bold text-primary-container text-lg">{topic.submission_count}</p>
              </div>
            </div>
            <Button fullWidth size="lg" onClick={() => navigate(`/topics/${topic.id}/learn`)}
              disabled={topic.status !== 'approved'}>
              {topic.status === 'approved' ? <>Bắt đầu học <Icon name="arrowRight" size={16} /></> : 'Chủ đề đã đóng'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
