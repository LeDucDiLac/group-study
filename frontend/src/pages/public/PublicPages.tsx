import { useState } from 'react'
import type { FormEvent } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActionLink, Button, Card, EmptyState, Icon, Input, PageHeader, Popup } from '@/components/ui'
import { TopicCard } from '@/components/topic/TopicCard'
import { authService, topicService } from '@/services/api'
import { useAsync } from '@/utils/hooks'

export function LandingPage() {
  return (
    <div className="mx-auto h-full max-w-[1360px] overflow-hidden px-6 pb-4 pt-4">
      <section className="relative grid min-h-[60vh] grid-cols-1 items-center gap-6 overflow-hidden rounded-[28px] xl:grid-cols-[minmax(0,1.02fr)_minmax(520px,0.98fr)]">
        <div className="relative z-10 max-w-[680px] py-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-secondary-container shadow-card">
            <Icon name="spark" size={16} />
            Học sâu hơn mỗi ngày
          </span>
          <h1 className="mt-5 text-[46px] font-extrabold leading-[1.08] tracking-[-0.02em] text-primary-container">
            Học sâu hơn bằng cách <span className="text-secondary-container">tự học, viết lại và dạy chéo cho cộng đồng.</span>
          </h1>
          <p className="mt-4 max-w-[620px] text-[17px] leading-7 text-ink-muted">
            TimeBoxed giúp bạn chọn một chủ đề nhỏ, hoàn thành bài tự học trong khung thời gian rõ ràng, rồi học tiếp qua phản hồi của bạn học.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ActionLink to="/login" variant="primary">
              <Icon name="arrowRight" size={17} />
              Bắt đầu học
            </ActionLink>
            <ActionLink to="/topics/public">
              <Icon name="book" size={17} />
              Xem chủ đề public
            </ActionLink>
          </div>
        </div>

        <div className="relative min-h-[450px]">
          <div className="absolute inset-y-0 right-0 w-[88%] rounded-full bg-secondary-fixed/70 blur-2xl" />
          <Card className="absolute right-12 top-0 z-20 w-[360px] p-6 shadow-modal">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-secondary-container">Luồng học</p>
            <div className="mt-5 space-y-4">
              {[
                ['Chọn chủ đề đang mở', 'Chọn chủ đề phù hợp với bạn.'],
                ['Tự học và viết bài giải thích', 'Học sâu bằng cách viết lại.'],
                ['Nộp bài trước khi hết giờ', 'Hoàn thành trong khung thời gian.'],
                ['Mở khóa dạy chéo và nhận phản hồi', 'Dạy lại để hiểu sâu hơn.'],
              ].map(([step, note], index) => (
                <div key={step} className="flex items-center gap-3 rounded-md border border-border-subtle bg-white p-3 shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-sm font-extrabold text-white">{index + 1}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-low text-ink-muted">
                    <Icon name={index === 0 ? 'book' : index === 1 ? 'file' : index === 2 ? 'users' : 'message'} size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold leading-5 text-primary-container">{step}</span>
                    <span className="block text-xs font-medium leading-5 text-ink-subtle">{note}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          ['clock', '48h', 'time-box rõ ràng', 'Tập trung - Hiệu quả - Có thời hạn'],
          ['users', '44+', 'bài nộp mẫu', 'Tham khảo và học hỏi từ cộng đồng'],
          ['shield', '10 cấp', 'huy hiệu uy tín', 'Ghi nhận hành trình học tập của bạn'],
        ].map(([icon, value, label, helper]) => (
          <Card key={label} className="flex items-center gap-5 p-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-secondary-container">
              <Icon name={icon as 'clock'} size={24} />
            </span>
            <span>
              <span className="block text-[28px] font-extrabold leading-none text-primary-container">{value}</span>
              <span className="mt-2 block text-sm font-extrabold text-ink">{label}</span>
              <span className="mt-1 block text-xs font-medium text-ink-subtle">{helper}</span>
            </span>
          </Card>
        ))}
      </section>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [googlePopupOpen, setGooglePopupOpen] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '')
    let redirectTo = '/topics'
    try {
      if (tab === 'register') {
        await authService.register(name, email, password)
      } else {
        const { user } = await authService.login(email, password, remember)
        redirectTo = user.role === 'admin' ? '/admin' : '/topics'
      }
    } catch {
      setError(tab === 'register' ? 'Không thể tạo tài khoản. Vui lòng kiểm tra email/mật khẩu.' : 'Email hoặc mật khẩu chưa chính xác.')
      setLoading(false)
      return
    }
    setLoading(false)
    navigate(redirectTo)
  }

  return (
    <div className="relative h-[calc(100vh-72px)] overflow-hidden bg-[linear-gradient(135deg,#FFFDFB_0%,#FFF7F4_46%,#FCEDEA_100%)]">
      <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,#F8CFC7_0%,rgba(248,207,199,0)_68%)] opacity-80" />
      <div className="absolute -bottom-40 -left-28 h-[360px] w-[620px] rounded-[50%] bg-secondary-fixed/80 blur-3xl" />
      <div className="absolute right-12 top-20 hidden grid-cols-6 gap-3 opacity-30 lg:grid">
        {Array.from({ length: 36 }).map((_, index) => <span key={index} className="h-1.5 w-1.5 rounded-full bg-secondary-container" />)}
      </div>

      <div className="relative mx-auto grid h-full max-w-[1180px] grid-cols-1 items-center gap-10 px-6 py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,480px)]">
        <section className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-bold text-ink shadow-sm backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-container" />
            Peer learning
          </span>
          <h1 className="mt-5 max-w-[560px] text-[40px] font-extrabold leading-[1.08] tracking-[-0.01em] text-primary-container md:text-[48px]">
            Đăng nhập để mở khóa luồng học <span className="text-secondary-container">bằng cách dạy.</span>
          </h1>
          <p className="mt-4 max-w-[520px] text-[17px] leading-7 text-ink-muted">
            Một tài khoản dùng cho tự học, dạy chéo, theo dõi deadline và huy hiệu đóng góp.
          </p>

          <div className="mt-6 grid gap-4">
            {[
              ['book', 'Học hiệu quả hơn', 'Ghi nhớ sâu hơn khi bạn dạy lại.'],
              ['users', 'Cộng đồng tích cực', 'Kết nối, hỗ trợ và cùng tiến bộ.'],
              ['shield', 'Theo dõi & ghi nhận', 'Deadline rõ ràng, huy hiệu xứng đáng.'],
            ].map(([icon, title, description]) => (
              <div key={title} className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary-fixed text-secondary-container">
                  <Icon name={icon as 'book'} size={22} />
                </span>
                <span>
                  <span className="block text-base font-extrabold text-primary-container">{title}</span>
                  <span className="block text-sm font-medium text-ink-muted">{description}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-[480px]">
          <LoginDecorations />
          <Card className="relative z-20 rounded-lg border-border-subtle bg-white/92 p-7 shadow-modal backdrop-blur md:p-8">
            <div className="grid grid-cols-2 rounded-lg bg-surface-low p-1.5">
              <button
                type="button"
                className={`h-12 rounded-md text-base font-extrabold transition ${tab === 'login' ? 'bg-white text-secondary-container shadow-sm' : 'text-ink-muted hover:text-ink'}`}
                onClick={() => setTab('login')}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={`h-12 rounded-md text-base font-extrabold transition ${tab === 'register' ? 'bg-white text-secondary-container shadow-sm' : 'text-ink-muted hover:text-ink'}`}
                onClick={() => {
                  setTab('register')
                  setError('')
                }}
              >
                Đăng ký
              </button>
            </div>

            <form className="mt-6 flex min-h-[420px] flex-col gap-4" onSubmit={submit}>
              <div className="grid gap-4">
                {tab === 'register' && (
                  <TextInputWithIcon icon="user" label="Họ và tên" name="name" />
                )}
                <TextInputWithIcon icon="mail" label="Email" name="email" error={error} />
                <TextInputWithIcon
                  icon="lock"
                  label="Mật khẩu"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  trailing={
                    <button type="button" className="text-ink-muted hover:text-ink" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  }
                />

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex items-center gap-2 font-semibold text-ink-muted">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-secondary-container" />
                    Ghi nhớ phiên
                  </label>
                  {tab === 'login' && (
                    <Link className="font-extrabold text-secondary-container hover:text-secondary" to="/forgot-password">Quên mật khẩu?</Link>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                <Button
                  type="submit"
                  size="lg"
                  className="h-[52px] w-full rounded-lg bg-secondary-container hover:bg-secondary shadow-md text-white font-extrabold transition-all"
                >
                  {loading ? 'Đang xử lý...' : tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                </Button>

                {tab === 'login' && (
                  <>
                    <Button type="button" variant="secondary" size="lg" onClick={() => setGooglePopupOpen(true)} className="h-[52px] w-full rounded-lg border-border-subtle bg-white hover:bg-secondary-fixed/50">
                      <span className="text-lg font-extrabold text-[#4285F4]">G</span>
                      Tiếp tục với Google
                    </Button>

                    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-ink-subtle">
                      <Icon name="lock" size={15} />
                      Dữ liệu của bạn luôn được bảo mật
                    </p>
                  </>
                )}
              </div>
            </form>
            <Popup
              open={googlePopupOpen}
              title="Đăng nhập Google"
              description="Tính năng đăng nhập Google đang được hoàn thiện. Vui lòng sử dụng email/mật khẩu trong lúc chờ cập nhật."
              confirmText="Đã hiểu"
              onClose={() => setGooglePopupOpen(false)}
            />
          </Card>
        </section>
      </div>
    </div>
  )
}

function TextInputWithIcon({
  label,
  icon,
  trailing,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: 'mail' | 'lock' | 'user'
  trailing?: ReactNode
  error?: string
}) {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-primary-container">
      {label}
      <span className={`flex h-[52px] items-center gap-3 rounded-lg border bg-white px-4 transition focus-within:border-secondary-container focus-within:ring-4 focus-within:ring-secondary-container/10 ${error ? 'border-error' : 'border-border-subtle'}`}>
        <Icon name={icon} size={18} className="shrink-0 text-ink-subtle" />
        <input {...props} className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-primary-container outline-none placeholder:text-ink-subtle" />
        {trailing}
      </span>
      {error && <span className="text-xs font-bold text-error">{error}</span>}
    </label>
  )
}

function LoginDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
      <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,#FCEBE8_0%,rgba(252,235,232,0)_70%)] opacity-70" />
      <div className="absolute -left-10 top-16 h-16 w-16 rotate-[-8deg] rounded-lg border border-border-subtle bg-white/65 shadow-card" />
      <div className="absolute -right-10 top-40 h-20 w-32 rotate-[7deg] rounded-md border border-border-subtle bg-white/70 p-4 shadow-card">
        <div className="h-8 w-8 rounded-full bg-secondary-container/50" />
        <div className="mt-3 h-2 w-20 rounded bg-border-subtle" />
        <div className="mt-2 h-2 w-16 rounded bg-border-subtle" />
      </div>
      <div className="absolute -bottom-10 -left-10 h-28 w-48 rotate-[-7deg] rounded-lg border border-border-subtle bg-white/55 shadow-card" />
      <div className="absolute -bottom-6 right-10 flex h-14 w-14 rotate-[8deg] items-center justify-center rounded-md bg-secondary-container text-white shadow-md shadow-secondary-container/20">
        <Icon name="spark" size={28} />
      </div>
    </div>
  )
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  return (
    <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-form place-items-center px-6 py-12">
      <Card className="w-full rounded-lg p-8 shadow-modal">
        <PageHeader title="Quên mật khẩu" description="Nhập email để nhận liên kết khôi phục. Kiểm tra cả hộp thư spam nếu chưa thấy email." />
        {sent ? (
          <EmptyState
            title="Đã gửi link khôi phục"
            description="Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới minh.anh@student.edu.vn."
            actionLabel="Quay lại đăng nhập"
            to="/login"
          />
        ) : (
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault()
              const result = await authService.forgotPassword('minh.anh@student.edu.vn')
              if (result?.sent) setSent(true)
            }}
          >
            <Input label="Email" defaultValue="minh.anh@student.edu.vn" />
            <Button type="submit" className="bg-[linear-gradient(135deg,#E84A43_0%,#DC3A34_100%)]">Gửi link khôi phục</Button>
          </form>
        )}
      </Card>
    </div>
  )
}

export function PublicTopicsPage() {
  const { data: topics } = useAsync(() => topicService.getTopics({ status: 'Đang mở' }), [])
  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <PageHeader title="Chủ đề public" description="Bạn có thể xem trước các chủ đề đang mở. Để tham gia học và nộp bài, hãy đăng nhập." />
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => <TopicCard key={topic._id} topic={topic} publicMode />)}
      </div>
    </div>
  )
}
