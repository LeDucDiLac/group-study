const ICON_PATHS = {
  arrowLeft: <path d="M15 18l-6-6 6-6M9 12h14" />,
  arrowRight: <path d="M9 18l6-6-6-6M15 12H1" />,
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM4 21.5A2.5 2.5 0 0 1 6.5 19H20" />,
  calendar: <><path d="M7 3v4M17 3v4M4 9h16" /><rect x="4" y="5" width="16" height="16" rx="2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m18 15-6-6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  fileImage: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 16l2-2 2 2 2-3 3 5H7z" /></>,
  fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  folder: <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11Z" />,
  heart: <path d="M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 21.5l8.8-8.7a5.1 5.1 0 0 0 0-7.2Z" />,
  message: <path d="M21 12a8 8 0 0 1-8 8H6l-3 3v-6a8 8 0 1 1 18-5Z" />,
  paperclip: <path d="m21.4 11.1-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />,
  question: <path d="M9.1 9a3 3 0 1 1 5.8 1c-.5 1.4-2 1.8-2.6 3-.2.3-.3.7-.3 1M12 18h.01" />,
  search: <path d="m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />,
  user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>,
}

export function Icon({ name, size = 18, className = '', strokeWidth = 1.8, filled = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name] ?? ICON_PATHS.file}
    </svg>
  )
}

export function StatusDot({ className = '' }) {
  return <span className={['inline-block h-1.5 w-1.5 rounded-full', className].join(' ')} aria-hidden="true" />
}

const VARIANT_CLASSES = {
  primary: 'bg-secondary-container text-white hover:bg-secondary active:scale-[0.98] shadow-sm disabled:bg-surface-container disabled:text-ink-muted',
  secondary: 'bg-white text-secondary-container border border-border hover:border-secondary-container hover:bg-surface-low',
  ghost: 'bg-transparent text-ink hover:bg-surface-low',
  danger: 'bg-error text-white hover:bg-error/90 active:scale-[0.98]',
  destructive: 'bg-error text-white hover:bg-error/90 active:scale-[0.98]',
  'danger-ghost': 'bg-transparent text-error border border-error hover:bg-error/10',
}

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-md gap-2',
  lg: 'h-12 px-6 text-base rounded-md gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-secondary-container focus:ring-offset-1',
        'disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}

const BADGE_VARIANTS = {
  blue: 'bg-info-fixed text-info-dark',
  emerald: 'bg-emerald-container text-emerald-dark',
  amber: 'bg-amber-light text-amber-900',
  red: 'bg-error-container text-error',
  neutral: 'bg-surface-low text-ink-muted',
  primary: 'bg-primary-fixed text-primary',
}

export function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span className={[
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
      BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.neutral,
      className,
    ].join(' ')}>
      {children}
    </span>
  )
}

export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-md shadow-card border border-border-subtle',
        hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function Avatar({ src, name = '?', size = 'md', anonymous = false, className = '' }) {
  const SIZE = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  const initials = anonymous ? '?' : name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const bg = anonymous ? 'bg-surface-container text-ink-subtle' : 'bg-primary text-white'

  return src && !anonymous ? (
    <img src={src} alt={name} className={['rounded-full object-cover', SIZE[size], className].join(' ')} />
  ) : (
    <div className={['rounded-full flex items-center justify-center font-semibold select-none', SIZE[size], bg, className].join(' ')}>
      {initials}
    </div>
  )
}

export function ProgressBar({ value = 0, max = 100, variant = 'emerald', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const COLOR = { emerald: 'bg-emerald', blue: 'bg-info-container', amber: 'bg-amber' }
  return (
    <div className={['h-1.5 bg-surface-container rounded-full overflow-hidden', className].join(' ')}>
      <div
        className={['h-full rounded-full transition-all duration-500', COLOR[variant] ?? COLOR.emerald].join(' ')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Input({ label, helper, error, id, className = '', required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}{required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        className={[
          'h-10 px-3 rounded-md text-sm bg-surface-low border border-border',
          'focus:bg-white focus:border-secondary-container focus:ring-2 focus:ring-secondary/20 outline-none',
          'transition-all duration-150 placeholder:text-ink-subtle',
          error ? 'border-error focus:ring-error/20' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {(helper || error) && (
        <p className={['text-xs', error ? 'text-error' : 'text-ink-muted'].join(' ')}>
          {error ?? helper}
        </p>
      )}
    </div>
  )
}

export function Textarea({ label, helper, error, id, rows = 4, className = '', required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}{required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={[
          'px-3 py-2.5 rounded-md text-sm bg-surface-low border border-border resize-none',
          'focus:bg-white focus:border-secondary-container focus:ring-2 focus:ring-secondary/20 outline-none',
          'transition-all duration-150 placeholder:text-ink-subtle',
          error ? 'border-error' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {(helper || error) && (
        <p className={['text-xs', error ? 'text-error' : 'text-ink-muted'].join(' ')}>
          {error ?? helper}
        </p>
      )}
    </div>
  )
}

export function Modal({ open, onClose, title, children, className = '' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-modal"
        onClick={onClose}
      />
      <div className={['relative bg-white rounded-lg shadow-modal w-full max-w-md animate-slide-up', className].join(' ')}>
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h3 className="text-lg font-semibold text-primary-container">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-low text-ink-muted transition-colors" aria-label="Đóng">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-border-subtle">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            'px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px',
            active === tab.id
              ? 'border-secondary-container text-secondary-container'
              : 'border-transparent text-ink-muted hover:text-ink hover:border-border',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function Divider({ label, className = '' }) {
  if (!label) return <hr className={['border-border-subtle', className].join(' ')} />
  return (
    <div className={['flex items-center gap-3', className].join(' ')}>
      <div className="flex-1 h-px bg-border-subtle" />
      <span className="text-xs text-ink-subtle font-medium">{label}</span>
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  )
}
