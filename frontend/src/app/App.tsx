import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { AdminLayout } from '@/layouts/AdminLayout'
import { LearnerLayout } from '@/layouts/LearnerLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminPage, AdminRedirect } from '@/pages/admin/AdminPages'
import { BookmarkPage, CalendarPage, CommunityInsightPage, NotificationsPage, PeerDetailPage, PeerLearningPage, ProfilePage } from '@/pages/learner/CommunityPages'
import { LearnPage } from '@/pages/learner/LearnPages'
import { CreateTopicPage, MyTopicsPage, TopicDetailPage, TopicPendingPage, TopicsPage } from '@/pages/learner/TopicPages'
import { ForgotPasswordPage, LandingPage, LoginPage, PublicTopicsPage } from '@/pages/public/PublicPages'
import { authService } from '@/services/api'
import type { User } from '@/types/domain'
import { AvatarCacheProvider } from '@/contexts/AvatarCacheContext'

export function App() {
  return (
    <AvatarCacheProvider>
      <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/topics/public" element={<PublicTopicsPage />} />
      </Route>

      <Route element={<RequireAuth><LearnerLayout /></RequireAuth>}>
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/topics/new" element={<CreateTopicPage />} />
        <Route path="/topics/my" element={<MyTopicsPage />} />
        <Route path="/topics/:id/edit" element={<CreateTopicPage />} />
        <Route path="/topics/:id" element={<TopicDetailPage />} />
        <Route path="/topics/:id/pending" element={<TopicPendingPage />} />
        <Route path="/topics/:id/learn" element={<LearnPage />} />
        <Route path="/topics/:id/peer" element={<PeerLearningPage />} />
        <Route path="/topics/:id/peer/:submissionId" element={<PeerDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/bookmarks" element={<BookmarkPage />} />
        <Route path="/insights" element={<CommunityInsightPage />} />
      </Route>

      <Route path="/admin" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>}>
        <Route index element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AvatarCacheProvider>
  )
}

function RequireAuth({ children, role }: { children: ReactNode; role?: User['role'] }) {
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    authService.getSessionUser()
      .then((sessionUser) => {
        if (mounted) setUser(sessionUser)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 text-sm font-semibold text-ink-muted">
        Đang kiểm tra phiên đăng nhập...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && user.role !== role) {
    return role === 'admin' ? <AdminAccessDenied user={user} /> : <Navigate to="/topics" replace />
  }

  return children
}

function AdminAccessDenied({ user }: { user: User }) {
  const navigate = useNavigate()

  const loginAsAdmin = async () => {
    await authService.logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#FFFDFB_0%,#FFF7F4_48%,#F8E6E2_100%)]">
      <div className="pointer-events-none absolute -right-32 -top-44 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(207,58,50,0.18)_0%,rgba(207,58,50,0)_68%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-48 left-[-120px] h-[420px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(109,52,47,0.12)_0%,rgba(109,52,47,0)_68%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:radial-gradient(circle_at_1px_1px,rgba(109,52,47,0.22)_1px,transparent_0)] [background-size:28px_28px]" />

      <header className="relative z-10 border-b border-border-subtle/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between gap-4 px-6">
          <Link to="/topics" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary-container text-white shadow-[0_10px_24px_rgba(207,58,50,0.24)]">
              <Icon name="clock" size={22} />
            </span>
            <span>
              <span className="block text-lg font-extrabold leading-none text-primary-container">TimeBoxed</span>
              <span className="mt-1 block text-xs font-semibold text-ink-subtle">Admin access</span>
            </span>
          </Link>
          <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border bg-white/90 px-3 py-2 text-xs font-bold text-ink-muted shadow-sm">
            <Icon name="user" size={14} className="shrink-0 text-secondary-container" />
            <span className="hidden sm:inline">Phiên hiện tại:</span>
            <span className="max-w-[180px] truncate text-primary-container">{user.displayName}</span>
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1180px] items-center px-6 py-10 sm:py-14">
        <section className="rounded-[20px] border border-white/75 bg-white/88 p-5 shadow-[0_24px_70px_rgba(109,52,47,0.14)] backdrop-blur sm:p-7 lg:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
            <AccessDeniedHero onLoginAsAdmin={loginAsAdmin} />
            <CurrentUserCard user={user} />
          </div>
        </section>
      </main>
    </div>
  )
}

function AccessDeniedHero({ onLoginAsAdmin }: { onLoginAsAdmin: () => void }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-[16px] border border-error-container/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,247,244,0.82))] p-6 sm:p-8">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-md bg-error-container text-error shadow-[0_14px_30px_rgba(207,58,50,0.16)]">
        <Icon name="shield" size={30} />
      </div>
      <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.12em] text-secondary-container">Quyền truy cập bị giới hạn</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-primary-container sm:text-4xl lg:text-5xl">
        Tài khoản hiện tại chưa có quyền quản trị
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">
        Bạn đang đăng nhập bằng tài khoản học viên. Để truy cập Admin Panel, vui lòng đăng nhập bằng tài khoản có vai trò Admin hoặc liên hệ quản trị viên hệ thống.
      </p>

      <AccessHelpBox />

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onLoginAsAdmin}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-secondary-container px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(207,58,50,0.22)] transition hover:-translate-y-0.5 hover:bg-secondary"
        >
          <Icon name="lock" size={18} />
          Đăng nhập tài khoản Admin
        </button>
        <Link
          to="/topics"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-white px-5 text-sm font-bold text-ink-muted transition hover:-translate-y-0.5 hover:border-secondary-container hover:bg-surface-low hover:text-ink"
        >
          <Icon name="arrowLeft" size={18} />
          Về khu học tập
        </Link>
      </div>
    </div>
  )
}

function AccessHelpBox() {
  return (
    <div className="mt-6 rounded-md border border-border-subtle bg-white/78 p-4 shadow-sm">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary-fixed text-secondary-container">
          <Icon name="spark" size={17} />
        </span>
        <p className="text-sm leading-6 text-ink-muted">
          Bạn có thể đăng nhập bằng tài khoản Admin, quay về khu học tập, hoặc liên hệ quản trị viên nếu cho rằng đây là lỗi phân quyền.
        </p>
      </div>
    </div>
  )
}

function CurrentUserCard({ user }: { user: User }) {
  return (
    <aside className="rounded-[16px] border border-border bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-4 border-b border-border-subtle pb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-primary text-white shadow-[0_12px_26px_rgba(109,52,47,0.18)]">
          <Icon name="user" size={25} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-primary-container">{user.displayName}</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink-subtle">{user.email}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <AccessRow label="Role hiện tại" value="Người học" tone="neutral" />
        <AccessRow label="Role yêu cầu" value="Admin" tone="admin" />
        <AccessRow label="Trạng thái" value="Bị từ chối" tone="denied" />
      </dl>

      <div className="mt-5 rounded-md border border-error-container bg-error-container/35 p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-error">Lý do</p>
        <p className="mt-2 text-sm leading-6 text-error">Tài khoản này không thuộc nhóm quản trị viên.</p>
      </div>
    </aside>
  )
}

function AccessRow({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'admin' | 'denied' }) {
  const tones = {
    neutral: 'bg-surface-low text-ink-muted',
    admin: 'bg-secondary-fixed text-secondary-container',
    denied: 'bg-error-container text-error',
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border-subtle bg-surface-low/45 px-3 py-3">
      <dt className="font-semibold text-ink-muted">{label}</dt>
      <dd className={`rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{value}</dd>
    </div>
  )
}
