import { NavLink, Outlet } from 'react-router-dom'
import { ShapeAdmin } from '@/shapes'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/topics/pending', label: 'Chờ duyệt', badge: 5 },
  { to: '/admin/topics', label: 'Quản lý chủ đề' },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="w-64 shrink-0 bg-white border-r border-border-subtle flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border-subtle">
          <ShapeAdmin size={28} variant="blue" />
          <div>
            <p className="text-primary-container font-bold text-sm leading-none">TimeBoxed</p>
            <p className="text-ink-subtle text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, badge }) => (
            <NavLink key={to} to={to}
              end={to === '/admin/topics'}
              className={({ isActive }) => [
                'flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-secondary-container text-white font-semibold'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-low',
              ].join(' ')}>
              <span>{label}</span>
              {badge && (
                <span className="bg-error-container text-error text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border-subtle">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
            <div>
              <p className="text-ink text-xs font-medium">Admin TimeBoxed</p>
              <p className="text-ink-subtle text-xs">admin@timebox.edu.vn</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-surface overflow-auto animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}
