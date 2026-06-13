import { Link, Outlet } from 'react-router-dom'
import { ActionLink, Button } from '@/components/ui'

export function PublicLayout() {
  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 font-extrabold text-primary-container">
            <img
              src="/BCO.6d6b4df6-d95c-4ea7-bd31-1516d9022f26.png"
              alt="BCO"
              className="h-12 w-12 rounded-md object-cover"
            />
            <span>TimeBoxed Peer Learning</span>
          </Link>
          <nav className="flex items-center gap-2">
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
