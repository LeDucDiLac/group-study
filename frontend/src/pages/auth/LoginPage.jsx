import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShapeOrbit } from '@/shapes'
import { Button, Divider, Input, Tabs, Icon } from '@/components/ui'

const TABS = [
  { id: 'login', label: 'Đăng nhập' },
  { id: 'register', label: 'Đăng ký' },
]

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-12">
          <ShapeOrbit size={48} variant="blue" />
          <span className="text-white text-2xl font-bold">TimeBoxed</span>
        </div>
        <h1 className="text-white text-4xl font-bold leading-tight mb-4 text-balance">
          Học bằng cách dạy.<br />Hiểu bằng cách chia sẻ.
        </h1>
        <p className="text-white/75 text-lg mb-10">
          Nền tảng học tập ngang hàng với time-box 48h giúp bạn ghi nhớ sâu hơn và học từ góc nhìn đa chiều.
        </p>
        <div className="space-y-4">
          {[
            ['Viết lại kiến thức', 'Ghi nhớ sâu hơn 70% so với đọc thụ động'],
            ['Học từ cộng đồng', 'Đọc cách hiểu của 30+ người cùng chủ đề'],
            ['Time-box 48h', 'Tạo focus tuyệt đối, tránh procrastination'],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-container mt-2 shrink-0" />
              <div>
                <p className="text-white font-medium text-sm">{title}</p>
                <p className="text-white/70 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary-container">Chào mừng trở lại</h2>
            <p className="text-ink-muted text-sm mt-1">Đăng nhập để tiếp tục học tập</p>
          </div>

          <Tabs tabs={TABS} active={tab} onChange={setTab} />

          <div className="mt-6 space-y-4">
            {tab === 'login' ? (
              <>
                <Input id="email" label="Email" type="email" placeholder="email@example.com" />
                <Input id="password" label="Mật khẩu" type="password" placeholder="••••••••" />
                <div className="text-right">
                  <button className="text-xs text-secondary-container hover:underline" onClick={() => setNotice('Chức năng khôi phục mật khẩu sẽ được kết nối khi có backend auth.')}>Quên mật khẩu?</button>
                </div>
                <Button fullWidth size="lg" onClick={() => navigate('/topics')}>
                  Đăng nhập <Icon name="arrowRight" size={16} />
                </Button>
              </>
            ) : (
              <>
                <Input id="reg-name" label="Họ và tên" placeholder="Nguyễn Văn A" required />
                <Input id="reg-email" label="Email" type="email" placeholder="email@example.com" required />
                <Input id="reg-password" label="Mật khẩu" type="password" placeholder="Tối thiểu 8 ký tự" required />
                <Button fullWidth size="lg" onClick={() => navigate('/topics')}>
                  Tạo tài khoản <Icon name="arrowRight" size={16} />
                </Button>
              </>
            )}
          </div>

          {notice && (
            <p className="mt-4 text-xs text-ink-muted bg-surface-low border border-border-subtle rounded-md px-3 py-2">
              {notice}
            </p>
          )}

          <Divider label="hoặc" className="my-5" />

          <button onClick={() => navigate('/topics')} className="w-full h-10 flex items-center justify-center gap-2.5 border border-border rounded-md text-sm text-ink hover:bg-surface-low transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2a10.34 10.34 0 00-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A8.99 8.99 0 009 18z" fill="#34A853"/>
              <path d="M3.97 10.71A5.41 5.41 0 013.69 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.99 8.99 0 00.96 4.96L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
    </div>
  )
}
