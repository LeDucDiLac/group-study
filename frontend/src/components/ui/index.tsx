import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/format'
import { useAvatarCache } from '@/contexts/AvatarCacheContext'

type IconName =
  | 'arrowLeft'
  | 'arrowRight'
  | 'book'
  | 'calendar'
  | 'check'
  | 'chevronDown'
  | 'clock'
  | 'close'
  | 'download'
  | 'file'
  | 'heart'
  | 'brokenHeart'
  | 'liked'
  | 'disliked'
  | 'eye'
  | 'eyeOff'
  | 'lock'
  | 'logout'
  | 'mail'
  | 'menu'
  | 'more'
  | 'message'
  | 'search'
  | 'shield'
  | 'spark'
  | 'upload'
  | 'user'
  | 'users'
  | 'link'

const paths: Record<IconName, ReactNode> = {
  arrowLeft: <path d="M15 18l-6-6 6-6M9 12h12" />,
  arrowRight: <path d="M9 18l6-6-6-6M15 12H3" />,
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM4 21.5A2.5 2.5 0 0 1 6.5 19H20" />,
  calendar: <><path d="M7 3v4M17 3v4M4 9h16" /><rect x="4" y="5" width="16" height="16" rx="2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  heart: <path d="M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 21.5l8.8-8.7a5.1 5.1 0 0 0 0-7.2Z" />,
  brokenHeart:
    <svg viewBox="0 0 24 24">
      <path d="M12 21.5L3.2 12.8a5.1 5.1 0 0 1 7.2-7.2L12 7.2V21.5Z" />
      <path d="M12 21.5l8.8-8.7a5.1 5.1 0 0 0-7.2-7.2L12 7.2V21.5Z" />
      <path d="M12 7.2l-1 2 2 2-2 2 2 2-1 2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>,
  liked: <path d="M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 21.5l8.8-8.7a5.1 5.1 0 0 0 0-7.2Z" fill="#dc2626" />,
  disliked:
    <svg viewBox="0 0 24 24" fill="#71717a">
      <path d="M12 21.5L3.2 12.8a5.1 5.1 0 0 1 7.2-7.2L12 7.2V21.5Z" />
      <path d="M12 21.5l8.8-8.7a5.1 5.1 0 0 0-7.2-7.2L12 7.2V21.5Z" />
      <path d="M12 7.2l-1 2 2 2-2 2 2 2-1 2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
    </svg>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 14 14M7.4 7.5C4 9.1 2 12 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8M12.8 6.1C18.8 6.6 22 12 22 12s-.9 1.6-2.6 3.1" /></>,
  lock: <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 3v18" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  more: <path d="M12 12h.01M19 12h.01M5 12h.01" />,
  message: <path d="M21 12a8 8 0 0 1-8 8H6l-3 3v-6a8 8 0 1 1 18-5Z" />,
  search: <path d="m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  spark: <path d="M12 2l2.2 6.2L20 10l-5.8 1.8L12 18l-2.2-6.2L4 10l5.8-1.8L12 2Z" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />,
  user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>,
  users: <><path d="M16 21a6 6 0 0 0-12 0M22 21a5.5 5.5 0 0 0-6-5.5" /><circle cx="10" cy="7" r="4" /><path d="M18 4.5a3 3 0 0 1 0 6" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
}

export function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {paths[name]}
    </svg>
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: 'bg-secondary-container text-white hover:bg-secondary',
    secondary: 'bg-white text-ink border border-border hover:border-secondary-container hover:bg-surface-low',
    ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-low',
    danger: 'bg-error text-white hover:bg-error/90',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs min-w-[72px]',
    md: 'h-10 px-4 text-sm min-w-[88px]',
    lg: 'h-12 px-6 text-base min-w-[120px]',
  }
  return (
    <button
      type={type}
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold focus-ring disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap active:scale-97 transition-all duration-200',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={cn('rounded-md border border-border bg-white shadow-card transition-all duration-300', className)}>{children}</section>
}

export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand' | 'info'; className?: string }) {
  const tones = {
    neutral: 'bg-surface-low text-ink-muted',
    success: 'bg-emerald-container text-emerald-dark',
    warning: 'bg-amber-light text-amber-900',
    danger: 'bg-error-container text-error',
    brand: 'bg-secondary-fixed text-secondary-container',
    info: 'bg-info-fixed text-info-dark',
  }
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', tones[tone], className)}>{children}</span>
}

export function Avatar({ name, anonymous = false, size = 'md', userId }: { name?: string; anonymous?: boolean; size?: 'sm' | 'md' | 'lg'; userId?: string }) {
  const { version } = useAvatarCache()
  const [imgFailed, setImgFailed] = useState(false)

  const initials = anonymous ? '?' : (name ?? '').split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?'
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }
  
  const backendUrl = import.meta.env.VITE_API_URL || ''
  const baseUrlClean = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl
  const avatarUrl = userId && !anonymous ? `${baseUrlClean}/api/profiles/${userId}/avatar?v=${version}` : null

  useEffect(() => {
    setImgFailed(false)
  }, [avatarUrl])

  if (avatarUrl && !imgFailed) {
    return (
      <img
        key={avatarUrl}
        src={avatarUrl}
        alt={name || 'Avatar'}
        onError={() => setImgFailed(true)}
        className={cn('shrink-0 rounded-full object-cover border border-border bg-surface-low', sizes[size])}
      />
    )
  }

  return <div className={cn('flex shrink-0 items-center justify-center rounded-full font-bold', anonymous ? 'bg-surface-container text-ink-muted' : 'bg-primary text-white', sizes[size])}>{initials}</div>
}

export function Input({ label, error, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink">
      {label}
      <input
        {...props}
        className={cn('h-11 rounded-md border border-border bg-surface-low px-3 text-sm font-normal outline-none transition focus:border-secondary-container focus:bg-white focus:ring-2 focus:ring-secondary-container/15', error && 'border-error', className)}
      />
      {error && <span className="text-xs font-medium text-error">{error}</span>}
    </label>
  )
}

export function Textarea({ label, error, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink">
      {label}
      <textarea
        {...props}
        className={cn('min-h-[112px] rounded-md border border-border bg-surface-low px-3 py-2.5 text-sm font-normal outline-none transition focus:border-secondary-container focus:bg-white focus:ring-2 focus:ring-secondary-container/15', error && 'border-error', className)}
      />
      {error && <span className="text-xs font-medium text-error">{error}</span>}
    </label>
  )
}

export function Select({ label, children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink">
      {label}
      <select {...props} className={cn('h-11 rounded-md border border-border bg-surface-low px-3 text-sm font-normal outline-none focus:border-secondary-container focus:bg-white', className)}>
        {children}
      </select>
    </label>
  )
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-surface-container', className)}>
      <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Modal({ open, title, children, onClose, className = '' }: { open: boolean; title: string; children: ReactNode; onClose: () => void; className?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button aria-label="Đóng modal" className="absolute inset-0 bg-primary/35 backdrop-blur-modal" onClick={onClose} />
      <Card className={cn('relative w-full max-w-xl overflow-hidden shadow-modal', className)}>
        <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h3 className="text-xl font-bold text-primary-container">{title}</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-low" aria-label="Đóng">
            <Icon name="close" />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </Card>
    </div>
  )
}

export function Popup({
  open,
  title,
  description,
  confirmText = 'Đã hiểu',
  cancelText,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onClose: () => void
  onConfirm?: () => void
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
      return
    }
    onClose()
  }

  return (
    <Modal open={open} title={title} onClose={onClose} className="max-w-md">
      <div className="space-y-5 text-sm text-ink-muted">
        {description && <p className="leading-6">{description}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          {cancelText && (
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
          )}
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  )
}

export function EmptyState({ title, description, actionLabel, to }: { title: string; description: string; actionLabel?: string; to?: string }) {
  return (
    <Card className="grid place-items-center px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed text-secondary-container">
        <Icon name="search" />
      </div>
      <h3 className="text-xl font-bold text-primary-container">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      {actionLabel && to && (
        <Link to={to} className="mt-5">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </Card>
  )
}

export function StatCard({ label, value, helper, icon = 'spark' }: { label: string; value: string; helper?: string; icon?: IconName }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-muted">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-primary-container">{value}</p>
          {helper && <p className="mt-1 text-xs font-medium text-ink-subtle">{helper}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary-fixed text-secondary-container">
          <Icon name={icon} />
        </span>
      </div>
    </Card>
  )
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div>
        {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.08em] text-secondary-container">{eyebrow}</p>}
        <h1 className="mt-1 text-[28px] sm:text-[34px] font-extrabold leading-tight text-primary-container">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm sm:text-base text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
    </div>
  )
}

export function ActionLink({ to, children, variant = 'secondary' }: { to: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' }) {
  const location = window.location
  
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === to) {
      event.preventDefault()
      location.reload()
    }
  }

  const variants = {
    primary: 'bg-secondary-container text-white hover:bg-secondary',
    secondary: 'border border-border bg-white text-ink hover:border-secondary-container hover:bg-surface-low',
    ghost: 'text-ink-muted hover:bg-surface-low hover:text-ink',
  }
  return <Link to={to} onClick={handleClick} className={cn('inline-flex h-10 min-w-[88px] items-center justify-center rounded-md px-4 text-sm font-semibold transition whitespace-nowrap', variants[variant])}>{children}</Link>
}
