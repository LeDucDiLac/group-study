import { Link, Outlet } from 'react-router-dom'
import { ActionLink, Button, Icon } from '@/components/ui'

export function PublicLayout() {
  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 font-extrabold text-primary-container">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary-container text-white"><Icon name="book" /></span>
            TimeBoxed
          </Link>
          <nav className="flex items-center gap-2">
            <ActionLink to="/topics/public" variant="ghost">Xem chủ đề</ActionLink>
            <Link to="/login"><Button>Đăng nhập</Button></Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
