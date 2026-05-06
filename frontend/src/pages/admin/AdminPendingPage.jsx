import { useNavigate } from 'react-router-dom'
import { topics, profiles } from '@/data/mockData'
import { ShapeTopic, ShapeTime } from '@/shapes'
import { Card, Badge, Button, Icon } from '@/components/ui'

export default function AdminPendingPage() {
  const navigate = useNavigate()
  const pending = topics.filter(t => t.status === 'pending')
  const authors = pending.map(t => profiles.find(p => p.id === t.created_by))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-container">Chủ đề chờ duyệt</h1>
          <p className="text-ink-muted text-sm mt-1">
            {pending.length} chủ đề đang chờ xem xét
          </p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 bg-amber/15 text-amber rounded-md px-4 py-2">
            <ShapeTime size={20} variant="amber" progress={0.5} />
            <span className="text-sm font-medium">{pending.length} cần xử lý</span>
          </div>
        )}
      </div>

      {/* Table */}
      {pending.length === 0 ? (
        <Card className="p-16 text-center">
          <ShapeTopic size={56} variant="surface" className="mx-auto mb-4" />
          <h3 className="font-semibold text-primary-container mb-1">Không có gì cần xem xét</h3>
          <p className="text-ink-muted text-sm">Tất cả đề xuất đã được xử lý.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-low">
                <th className="text-left px-4 py-3 font-medium text-ink-muted">Chủ đề</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">Danh mục</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">Người đề xuất</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">Ngày gửi</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">Window</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pending.map((topic, i) => {
                const author = authors[i]
                return (
                  <tr key={topic.id} className="hover:bg-surface-low transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <ShapeTopic size={28} variant="surface" />
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate max-w-48">{topic.title}</p>
                          <p className="text-xs text-ink-muted mt-0.5 truncate max-w-48">{topic.description?.slice(0, 60)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{topic.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-secondary-container/20 flex items-center justify-center text-xs font-medium text-secondary-container">
                          {author?.display_name?.[0] ?? 'U'}
                        </div>
                        <span className="text-ink">{author?.display_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {new Date(topic.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {topic.window_days} ngày
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" onClick={() => navigate(`/admin/topics/pending/${topic.id}`)}>
                        Xem xét <Icon name="arrowRight" size={15} />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
