import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Avatar, Badge, Icon } from '@/components/ui'
import { authService, userService } from '@/services/api'
import type { User } from '@/types/domain'
import { cn } from '@/utils/format'
import { useAsync } from '@/utils/hooks'

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/topics/pending', label: 'Chờ duyệt' },
  { to: '/admin/topics', label: 'Quản lý chủ đề' },
  { to: '/admin/users', label: 'Quản lý người dùng' },
]

const fallbackAdmin: User = {
  id: 'loading-admin',
  name: 'Admin',
  email: '',
  role: 'admin',
  status: 'active',
  interests: [],
  joinedTopicIds: [],
  submissionIds: [],
  createdTopicIds: [],
  badgeStats: { answerCount: 0, answerLikeCount: 0, level: 'newcomer' },
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: admin } = useAsync(() => userService.getCurrentAdmin(), fallbackAdmin)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authService.logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-primary/25 backdrop-blur-sm transition-opacity lg:hidden w-full h-full text-left cursor-default"
          aria-label="Đóng sidebar"
        />
      )}

      <aside
        className={cn(
          'fixed bottom-0 top-0 left-0 z-50 flex h-screen w-[260px] flex-col border-r border-border-subtle bg-white transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary-container text-white">
              <Icon name="shield" />
            </span>
            <div>
              <p className="font-extrabold leading-none text-primary-container">TimeBoxed</p>
              <p className="mt-1 text-xs font-semibold text-ink-subtle">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-low lg:hidden"
            aria-label="Đóng menu"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/topics'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex h-11 items-center justify-between rounded-md px-3 text-sm font-bold transition whitespace-nowrap ${
                  isActive ? 'bg-secondary-container text-white' : 'text-ink-muted hover:bg-surface-low hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <Avatar name={admin.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{admin.name}</p>
              <p className="truncate text-xs text-ink-subtle">{admin.email || 'admin'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-white text-sm font-bold text-ink-muted transition hover:bg-surface-low hover:text-ink"
          >
            <Icon name="logout" size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-ink-muted hover:bg-surface-low lg:hidden"
                aria-label="Mở menu"
              >
                <Icon name="menu" size={20} />
              </button>
              <div className="text-sm font-semibold text-ink-muted">Admin / TimeBoxed Peer Learning</div>
            </div>
            <Badge tone="success" className="self-start sm:self-auto">Phiên quản trị đang hoạt động</Badge>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
