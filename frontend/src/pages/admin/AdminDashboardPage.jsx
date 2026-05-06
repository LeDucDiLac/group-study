import { useNavigate } from 'react-router-dom'
import { topics, submissions, profiles } from '@/data/mockData'
import { ShapeTopic, ShapeUser, ShapeAchievement, ShapeTime } from '@/shapes'
import { Card, Badge, Button, StatusDot } from '@/components/ui'

function StatCard({ shape, value, label, sub, onClick }) {
  return (
    <Card hover={!!onClick} onClick={onClick} className={`p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="shrink-0">{shape}</div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-primary-container">{value}</p>
        <p className="text-sm text-ink-muted font-medium">{label}</p>
        {sub && <p className="text-xs text-ink-subtle mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const pending = topics.filter(t => t.status === 'pending')
  const approved = topics.filter(t => t.status === 'approved')
  const closed = topics.filter(t => t.status === 'closed')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-container">Dashboard</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng quan hoạt động hệ thống — {new Date().toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          shape={<ShapeTime size={44} variant="amber" progress={0.6} />}
          value={pending.length}
          label="Chờ duyệt"
          sub="Cần xem xét"
          onClick={() => navigate('/admin/topics/pending')}
        />
        <StatCard
          shape={<ShapeTopic size={44} variant="blue" />}
          value={approved.length}
          label="Đang mở"
          sub="Chủ đề active"
        />
        <StatCard
          shape={<ShapeAchievement size={44} variant="emerald" />}
          value={submissions.length}
          label="Bài nộp"
          sub="Tổng cộng"
        />
        <StatCard
          shape={<ShapeUser size={44} variant="blue" />}
          value={profiles.length}
          label="Người dùng"
          sub="Đã đăng ký"
        />
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Pending topics */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-primary-container">Chủ đề chờ duyệt</h2>
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin/topics/pending')}>
              Xem tất cả
            </Button>
          </div>

          {pending.length === 0 ? (
            <Card className="p-8 text-center">
              <ShapeAchievement size={40} variant="emerald" className="mx-auto mb-3" />
              <p className="text-sm text-ink-muted">Không có chủ đề nào chờ duyệt.</p>
            </Card>
          ) : (
            pending.map(topic => (
              <Card key={topic.id} hover onClick={() => navigate(`/admin/topics/pending/${topic.id}`)}
                className="p-4 flex items-start gap-4">
                <ShapeTopic size={36} variant="surface" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{topic.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{topic.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="neutral">{topic.category}</Badge>
                    <span className="text-xs text-ink-muted">
                      {new Date(topic.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' })}
                    </span>
                  </div>
                </div>
                <Badge variant="amber"><StatusDot className="bg-amber" />Chờ</Badge>
              </Card>
            ))
          )}
        </div>

        {/* Right — Quick stats */}
        <div className="space-y-4">
          <h2 className="font-semibold text-primary-container">Theo danh mục</h2>
          {['Toán học', 'Công nghệ thông tin', 'Kỹ năng mềm', 'Kinh tế'].map(cat => {
            const count = topics.filter(t => t.category === cat).length
            const pct = Math.round((count / topics.length) * 100)
            return (
              <Card key={cat} className="p-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-ink font-medium">{cat}</span>
                  <span className="text-xs text-ink-muted">{count} chủ đề</span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container rounded-full transition-all"
                    style={{ width: `${pct}%` }} />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
