import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Icon } from '@/components/ui'
import { authService } from '@/services/api'
import type { User } from '@/types/domain'
import { RANK_LABELS, getRankTier } from '@/utils/badges'
import { cn } from '@/utils/format'
import { useAsync } from '@/utils/hooks'

const nav = [
  { to: '/topics', label: 'Chủ đề', end: true },
  { to: '/topics/new', label: 'Tạo chủ đề', end: true },
  { to: '/topics/my', label: 'Quản lý', end: false },
  { to: '/calendar', label: 'Lịch học', end: false },
  { to: '/bookmarks', label: 'Đã lưu', end: false },
  { to: '/notifications', label: 'Thông báo', end: false },
]

const fallbackLearner: User = {
  id: 'loading',
  displayName: 'Người học',
  email: '',
  role: 'learner',
  rank: 0,
}

export function LearnerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: user } = useAsync(() => authService.getSessionUser().then(u => u ?? fallbackLearner), fallbackLearner)
  const badgeLabel = user.role === 'admin' ? 'Admin' : RANK_LABELS[getRankTier(user.rank)]
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authService.logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between px-6">
          <Link to="/topics" className="flex items-center gap-3">
            <img
              src="/BCO.6d6b4df6-d95c-4ea7-bd31-1516d9022f26.png"
              alt="BCO"
              className="h-11 w-11 rounded-md object-cover shadow-[0_10px_24px_rgba(207,58,50,0.22)]"
            />
            <span>
              <span className="block text-lg font-extrabold leading-none text-primary-container">TimeBoxed Peer Learning</span>
              <span className="mt-1 hidden text-xs font-semibold text-ink-subtle sm:block">Học bằng cách dạy</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${isActive ? 'bg-secondary-fixed text-secondary-container' : 'text-ink-muted hover:bg-surface-low hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="relative flex items-center gap-3">
            <Badge tone={user.role === 'admin' ? 'brand' : 'success'} className="hidden sm:inline-flex">
              {badgeLabel}
            </Badge>
            <Link
              to="/profile"
              className="hidden h-10 items-center gap-2 rounded-md bg-white px-2.5 shadow-sm transition hover:bg-surface-low sm:flex"
              aria-label="Hồ sơ cá nhân"
            >
              <Avatar name={user.displayName} userId={user.id} size="sm" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-10 w-10 items-center justify-center rounded-md bg-white text-ink-muted shadow-sm transition hover:bg-surface-low sm:flex"
              aria-label="Đăng xuất"
            >
              <Icon name="logout" size={17} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-ink-muted hover:bg-surface-low md:hidden"
              aria-label="Mở menu"
            >
              <Icon name="menu" size={22} />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-50 h-full w-full cursor-default bg-primary/25 text-left backdrop-blur-sm md:hidden"
          aria-label="Đóng menu"
        />
      )}

      <div
        className={cn(
          'fixed bottom-0 right-0 top-0 z-50 flex w-[280px] flex-col border-l border-border-subtle bg-white p-6 shadow-modal transition-transform duration-300 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link to="/topics" className="flex items-center gap-3 font-extrabold text-primary-container" onClick={() => setMobileMenuOpen(false)}>
            <img
              src="/BCO.6d6b4df6-d95c-4ea7-bd31-1516d9022f26.png"
              alt="BCO"
              className="h-12 w-12 rounded-md object-cover"
            />
            TimeBoxed Peer Learning
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-low" aria-label="Đóng">
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-secondary-fixed text-secondary-container' : 'text-ink-muted hover:bg-surface-low hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <hr className="my-4 border-border-subtle" />
          <Link to="/profile" className="mt-auto flex items-center gap-3 rounded-md p-3 transition hover:bg-surface-low" onClick={() => setMobileMenuOpen(false)}>
            <Avatar name={user.displayName} userId={user.id} size="sm" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-bold text-ink">{user.displayName}</p>
              <p className="truncate text-xs font-semibold text-secondary-container">
                {badgeLabel}
              </p>
            </div>
          </Link>
        </nav>
      </div>

      <main className="mx-auto max-w-[1360px] px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

