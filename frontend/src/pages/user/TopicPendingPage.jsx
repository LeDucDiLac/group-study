import { useParams, useNavigate } from 'react-router-dom'
import { topics } from '@/data/mockData'
import { ShapeTime, ShapeSpark } from '@/shapes'
import { Button, Card, Badge, Icon, StatusDot } from '@/components/ui'

const STEPS = [
  { key: 'sent', label: 'Đã gửi đề xuất' },
  { key: 'review', label: 'Admin đang xem xét' },
  { key: 'open', label: 'Chủ đề được mở' },
]

export default function TopicPendingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = topics.find(t => t.id === id) ?? topics[3]
  const activeStep = 1

  return (
    <div className="content-max py-20 flex items-center justify-center">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Main card */}
        <Card className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShapeTime size={72} variant="amber" progress={0.55} />
              <div className="absolute inset-0 rounded-full animate-pulse-slow bg-amber/10" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-primary-container mb-2">
            Đề xuất đang được xem xét
          </h1>
          <p className="text-ink-muted mb-8 leading-relaxed">
            Admin sẽ xem xét và phản hồi trong vòng <strong>24 giờ</strong>.
            Bạn sẽ nhận thông báo qua email khi có kết quả.
          </p>

          {/* Topic info card */}
          <div className="bg-surface-low rounded-md p-4 text-left mb-8 space-y-2.5">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-primary-container text-sm leading-snug flex-1 mr-4">
                {topic.title}
              </p>
              <Badge variant="amber"><StatusDot className="bg-amber" />Chờ duyệt</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5"><Icon name="folder" size={14} /> {topic.category}</span>
              <span className="flex items-center gap-1.5"><Icon name="calendar" size={14} /> Window: {topic.window_days} ngày</span>
              <span className="flex items-center gap-1.5"><Icon name="calendar" size={14} /> Gửi lúc: {new Date().toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((step, i) => {
              const done = i < activeStep
              const active = i === activeStep
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  {/* Connector line before */}
                  <div className="flex items-center w-full mb-3">
                    {i > 0 && (
                      <div className={['flex-1 h-0.5', done ? 'bg-emerald' : 'bg-border'].join(' ')} />
                    )}
                    <div className={[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all',
                      done ? 'bg-emerald text-white' : active ? 'bg-amber text-white' : 'bg-surface-container text-ink-muted',
                    ].join(' ')}>
                      {done ? <Icon name="check" size={15} /> : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={['flex-1 h-0.5', done ? 'bg-emerald' : 'bg-border'].join(' ')} />
                    )}
                  </div>
                  <p className={['text-xs text-center leading-tight', active ? 'text-amber font-medium' : done ? 'text-emerald font-medium' : 'text-ink-muted'].join(' ')}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button fullWidth onClick={() => navigate('/topics')}>
              Về trang chủ
            </Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/topics')}>
              Xem chủ đề khác
            </Button>
          </div>
        </Card>

        {/* Note */}
        <p className="text-center text-xs text-ink-muted mt-4">
          Nếu bị từ chối, bạn sẽ nhận email giải thích lý do và có thể chỉnh sửa lại đề xuất.
        </p>
      </div>
    </div>
  )
}
