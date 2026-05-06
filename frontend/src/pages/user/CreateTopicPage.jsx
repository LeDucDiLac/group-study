import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Textarea, Icon } from '@/components/ui'
import { ShapeTopic, ShapeSpark } from '@/shapes'

const CATEGORIES = ['Toán học', 'Công nghệ thông tin', 'Kỹ năng mềm', 'Kinh tế', 'Vật lý', 'Hóa học', 'Ngoại ngữ', 'Khác']

export default function CreateTopicPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', category: '', prerequisites: '',
    reasoning: '', windowDays: 2, tagInput: '', tags: [],
    resources: [{ label: '', url: '' }],
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const addTag = (e) => {
    if (e.key === 'Enter' && form.tagInput.trim() && form.tags.length < 5) {
      set('tags', [...form.tags, form.tagInput.trim()])
      set('tagInput', '')
    }
  }
  const removeTag = (t) => set('tags', form.tags.filter(x => x !== t))

  const addResource = () => {
    if (form.resources.length < 5)
      set('resources', [...form.resources, { label: '', url: '' }])
  }
  const setResource = (i, key, val) => {
    const r = [...form.resources]
    r[i] = { ...r[i], [key]: val }
    set('resources', r)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/topics/t4/pending')
  }

  return (
    <div className="content-max py-10">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/topics')}
          className="text-sm text-ink-muted hover:text-ink mb-3 flex items-center gap-1.5 transition-colors">
          <Icon name="arrowLeft" size={15} /> Quay lại
        </button>
        <div className="flex items-center gap-3">
          <ShapeTopic size={40} variant="blue" />
          <div>
            <h1 className="text-2xl font-bold text-primary-container">Đề xuất chủ đề mới</h1>
            <p className="text-ink-muted text-sm mt-0.5">Chủ đề sẽ được Admin xem xét và phê duyệt</p>
          </div>
        </div>
      </div>

      {/* Notice banner */}
      <div className="flex items-start gap-3 bg-amber-light border border-amber/30 rounded-md p-4 mb-8">
        <ShapeSpark size={20} variant="amber" className="shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900">
          <strong>Lưu ý:</strong> Chủ đề của bạn sẽ được Admin xem xét trong vòng 24h.
          Bạn sẽ nhận thông báo qua email khi có kết quả.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-form mx-auto space-y-6">
        {/* 1. Tên chủ đề */}
        <Input
          id="title" label="Tên chủ đề" required
          placeholder="VD: Giải Tích 1 — Giới hạn và Liên tục"
          helper={`${form.title.length}/100 ký tự`}
          maxLength={100}
          value={form.title} onChange={e => set('title', e.target.value)}
        />

        {/* 2. Mô tả */}
        <Textarea
          id="description" label="Mô tả chủ đề" required rows={4}
          placeholder="Mô tả mục tiêu học, nội dung chính, lý do nên học chủ đề này..."
          value={form.description} onChange={e => set('description', e.target.value)}
        />

        {/* 3. Danh mục */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium text-ink">
            Danh mục <span className="text-error">*</span>
          </label>
          <select id="category" required
            value={form.category} onChange={e => set('category', e.target.value)}
            className="h-10 px-3 rounded text-sm bg-surface-low border border-border
              focus:bg-white focus:border-secondary-container focus:ring-2 focus:ring-secondary/20
              outline-none transition-all duration-150 text-ink">
            <option value="">Chọn danh mục...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* 4. Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Tags <span className="text-ink-muted font-normal">(tối đa 5)</span></label>
          <div className="min-h-10 px-3 py-2 rounded bg-surface-low border border-border flex flex-wrap gap-1.5 items-center
            focus-within:bg-white focus-within:border-secondary-container focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
            {form.tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 bg-secondary-fixed text-secondary text-xs font-medium px-2 py-0.5 rounded-full">
                {t}
                <button type="button" onClick={() => removeTag(t)} className="hover:text-error transition-colors">×</button>
              </span>
            ))}
            {form.tags.length < 5 && (
              <input
                value={form.tagInput} onChange={e => set('tagInput', e.target.value)}
                onKeyDown={addTag}
                placeholder={form.tags.length === 0 ? 'Nhập tag và nhấn Enter...' : ''}
                className="flex-1 min-w-24 text-sm bg-transparent outline-none placeholder:text-ink-subtle"
              />
            )}
          </div>
          <p className="text-xs text-ink-muted">Nhấn Enter để thêm tag</p>
        </div>

        {/* 5. Window học */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-ink">
            Thời gian nộp bài (window) <span className="text-error">*</span>
          </label>
          <div className="flex items-center gap-4">
            <input type="range" min={1} max={7} value={form.windowDays}
              onChange={e => set('windowDays', +e.target.value)}
              className="flex-1 accent-secondary-container" />
            <span className="text-lg font-bold text-primary-container w-20 shrink-0">
              {form.windowDays} ngày
            </span>
          </div>
          <div className="flex justify-between text-xs text-ink-muted">
            <span>1 ngày (nhanh)</span><span>7 ngày (thoải mái)</span>
          </div>
        </div>

        {/* 6. Kiến thức cần có */}
        <Textarea
          id="prerequisites" label="Kiến thức cần có trước" rows={2}
          placeholder="VD: Hiểu cơ bản về hàm số và đồ thị... (không bắt buộc)"
          value={form.prerequisites} onChange={e => set('prerequisites', e.target.value)}
        />

        {/* 7. Tài liệu tham khảo */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">
            Tài liệu / Link tham khảo <span className="text-ink-muted font-normal">(tối đa 5)</span>
          </label>
          <div className="space-y-2">
            {form.resources.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Tên tài liệu" value={r.label}
                  onChange={e => setResource(i, 'label', e.target.value)}
                  className="flex-1 h-9 px-3 rounded text-sm bg-surface-low border border-border
                    focus:bg-white focus:border-secondary-container outline-none transition-all" />
                <input placeholder="https://" value={r.url}
                  onChange={e => setResource(i, 'url', e.target.value)}
                  className="flex-1 h-9 px-3 rounded text-sm bg-surface-low border border-border
                    focus:bg-white focus:border-secondary-container outline-none transition-all" />
              </div>
            ))}
          </div>
          {form.resources.length < 5 && (
            <button type="button" onClick={addResource}
              className="text-sm text-secondary-container hover:underline text-left w-fit">
              + Thêm link
            </button>
          )}
        </div>

        {/* 8. Lý do đề xuất */}
        <Textarea
          id="reasoning" label="Lý do đề xuất chủ đề" required rows={3}
          placeholder="Tại sao chủ đề này quan trọng với cộng đồng học tập?"
          value={form.reasoning} onChange={e => set('reasoning', e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="ghost" onClick={() => navigate('/topics')}>
            Huỷ
          </Button>
          <Button type="submit" size="lg">
            Gửi đề xuất <Icon name="arrowRight" size={16} />
          </Button>
        </div>
      </form>
    </div>
  )
}
