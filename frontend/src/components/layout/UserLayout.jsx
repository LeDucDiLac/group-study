import { Link, NavLink, Outlet } from 'react-router-dom'
import { ShapeTopic } from '@/shapes'

const navLinkClass = ({ isActive }) => [
  'px-3 py-1.5 rounded-md text-sm transition-colors',
  isActive
    ? 'bg-secondary-fixed text-secondary-container font-semibold'
    : 'text-ink-muted hover:text-ink hover:bg-surface-low',
].join(' ')

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border-subtle">
        <div className="content-max flex items-center justify-between h-14">
          <Link to="/topics" className="flex items-center gap-2.5">
            <ShapeTopic size={26} variant="blue" />
            <span className="text-primary-container font-bold text-base">TimeBoxed</span>
          </Link>

          <div className="flex items-center gap-1">
            <NavLink to="/topics" className={navLinkClass}>
              Chủ đề
            </NavLink>
            <NavLink to="/topics/new" className={navLinkClass}>
              Tạo chủ đề
            </NavLink>
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              Admin
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-white text-xs font-semibold">
              NA
            </div>
            <span className="text-ink-muted text-sm hidden md:block">Nguyễn Minh Anh</span>
          </div>
        </div>
      </nav>

      <main className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}
