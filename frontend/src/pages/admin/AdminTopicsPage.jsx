import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { topics, profiles } from '@/data/mockData'
import { ShapeTopic } from '@/shapes'
import { Card, Badge, Button, Icon } from '@/components/ui'

const STATUS_OPTS = ['Tất cả', 'Đang mở', 'Đã đóng', 'Chờ duyệt']
const STATUS_MAP = { approved: 'Đang mở', closed: 'Đã đóng', pending: 'Chờ duyệt' }
const STATUS_BADGE_MAP = { approved: 'emerald', closed: 'neutral', pending: 'amber' }

export default function AdminTopicsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Tất cả')
  const [search, setSearch] = useState('')

  const displayed = topics.filter(t => {
    const matchFilter = filter === 'Tất cả' || STATUS_MAP[t.status] === filter
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-container">Quản lý chủ đề</h1>
          <p className="text-ink-muted text-sm mt-1">{topics.length} chủ đề tổng cộng</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên chủ đề..."
            className="w-full h-9 pl-9 pr-3 rounded text-sm bg-surface-low border border-border
              focus:bg-white focus:border-secondary-container focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
          />
          <Icon name="search" size={16} className="absolute left-2.5 top-2.5 text-ink-muted" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {STATUS_OPTS.map(opt => (
            <button key={opt} onClick={() => setFilter(opt)}
              className={['px-3 py-1.5 rounded text-sm transition-colors',
                filter === opt
                  ? 'bg-secondary-container text-white'
                  : 'bg-surface-low border border-border text-ink-muted hover:border-secondary-container hover:text-secondary-container'
              ].join(' ')}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-low">
              <th className="text-left px-4 py-3 font-medium text-ink-muted">Chủ đề</th>
              <th className="text-left px-4 py-3 font-medium text-ink-muted">Danh mục</th>
              <th className="text-left px-4 py-3 font-medium text-ink-muted">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-ink-muted">Bài nộp</th>
              <th className="text-left px-4 py-3 font-medium text-ink-muted">Người tạo</th>
              <th className="text-left px-4 py-3 font-medium text-ink-muted">Window</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-muted text-sm">
                  Không tìm thấy chủ đề nào
                </td>
              </tr>
            ) : displayed.map(topic => {
              const author = profiles.find(p => p.id === topic.created_by)
              return (
                <tr key={topic.id} className="hover:bg-surface-low transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <ShapeTopic size={28} variant={topic.status === 'approved' ? 'blue' : 'surface'} />
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate max-w-48">{topic.title}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {new Date(topic.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{topic.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE_MAP[topic.status]}>
                      {STATUS_MAP[topic.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{topic.submission_count}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {author?.display_name ?? 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {topic.window_days}d
                  </td>
                  <td className="px-4 py-3">
                    {topic.status === 'pending' ? (
                      <Button size="sm" onClick={() => navigate(`/admin/topics/pending/${topic.id}`)}>
                        Duyệt
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/topics/${topic.id}`)}>
                        Xem
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border-subtle bg-surface-low">
          <p className="text-xs text-ink-muted">
            Hiển thị {displayed.length} / {topics.length} chủ đề
          </p>
        </div>
      </Card>
    </div>
  )
}
