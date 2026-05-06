/**
 * Abstract Shape System — TimeBoxed Peer Learning
 * Option B: Custom SVG illustrations with gradients and abstract forms.
 * Inspired by: Linear, Stripe, Vercel design language.
 *
 * Each shape accepts:
 *   size      — number (default 40)
 *   variant   — 'primary' | 'blue' | 'emerald' | 'amber' | 'surface' | 'ghost'
 *   className — additional Tailwind classes
 */

// ── Gradient defs reused across shapes ─────────────────────────────────────
export const GradientDefs = () => (
  <defs>
    <linearGradient id="grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#34303A" />
      <stop offset="100%" stopColor="#25222B" />
    </linearGradient>
    <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E1584D" />
      <stop offset="100%" stopColor="#CF3A32" />
    </linearGradient>
    <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2F9A73" />
      <stop offset="100%" stopColor="#176F51" />
    </linearGradient>
    <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFD166" />
      <stop offset="100%" stopColor="#8A5200" />
    </linearGradient>
    <linearGradient id="grad-surface" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor="#F7F2EF" />
    </linearGradient>
    <filter id="shadow-soft">
      <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.08" />
    </filter>
  </defs>
)

const FILLS = {
  primary: 'url(#grad-primary)',
  blue: 'url(#grad-blue)',
  emerald: 'url(#grad-emerald)',
  amber: 'url(#grad-amber)',
  surface: 'url(#grad-surface)',
  ghost: 'none',
}

const STROKES = {
  primary: '#34303A',
  blue: '#CF3A32',
  emerald: '#176F51',
  amber: '#8A5200',
  surface: '#E0D6D0',
  ghost: '#E0D6D0',
}

// ── 1. Abstract Cluster — Topic / Document ─────────────────────────────────
// A bold rotated square + smaller accent square overlapping → "knowledge block"
export function ShapeTopic({ size = 40, variant = 'primary', className = '' }) {
  const fill = FILLS[variant]
  const stroke = STROKES[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <GradientDefs />
      {/* Main square rotated 12° */}
      <rect x="6" y="6" width="26" height="26" rx="3"
        fill={fill} transform="rotate(12 20 20)" filter="url(#shadow-soft)" />
      {/* Accent square top-right */}
      <rect x="18" y="4" width="14" height="14" rx="2"
        fill={variant === 'ghost' ? 'none' : '#FFFFFF'} fillOpacity="0.15"
        stroke={stroke} strokeWidth="1.2" transform="rotate(-6 25 11)" />
      {/* Line accent */}
      <line x1="10" y1="20" x2="26" y2="20" stroke="#FFFFFF" strokeWidth="1.5"
        strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="10" y1="24" x2="22" y2="24" stroke="#FFFFFF" strokeWidth="1.5"
        strokeOpacity="0.3" strokeLinecap="round" />
    </svg>
  )
}

// ── 2. Abstract Ring — Time / Duration ─────────────────────────────────────
// Thick arc ring with a break → "countdown, time-bound"
export function ShapeTime({ size = 40, variant = 'emerald', progress = 0.75, className = '' }) {
  const fill = FILLS[variant]
  const stroke = STROKES[variant]
  const r = 14
  const cx = 20, cy = 20
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress)
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <GradientDefs />
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} stroke="#E0E3E5" strokeWidth="4" />
      {/* Progress arc */}
      <circle cx={cx} cy={cy} r={r}
        stroke={stroke} strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="4" fill={fill} filter="url(#shadow-soft)" />
    </svg>
  )
}

// ── 3. Abstract Diamond — Achievement / Success ────────────────────────────
// Layered diamond shapes with glow → "milestone reached"
export function ShapeAchievement({ size = 40, variant = 'emerald', className = '' }) {
  const fill = FILLS[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <GradientDefs />
      {/* Outer diamond ghost */}
      <polygon points="20,3 37,20 20,37 3,20"
        fill="none" stroke={STROKES[variant]} strokeWidth="1"
        strokeOpacity="0.25" />
      {/* Main diamond */}
      <polygon points="20,8 32,20 20,32 8,20"
        fill={fill} filter="url(#shadow-soft)" />
      {/* Inner highlight */}
      <polygon points="20,13 27,20 20,27 13,20"
        fill="#FFFFFF" fillOpacity="0.15" />
      {/* Center dot */}
      <circle cx="20" cy="20" r="3" fill="#FFFFFF" fillOpacity="0.8" />
    </svg>
  )
}

// ── 4. Abstract Arrow Cluster — Submit / Action ────────────────────────────
// Two offset triangles suggesting forward movement → "submit, send, proceed"
export function ShapeAction({ size = 40, variant = 'blue', className = '' }) {
  const fill = FILLS[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <GradientDefs />
      {/* Back triangle (offset, ghost) */}
      <polygon points="8,32 8,8 28,20"
        fill="none" stroke={STROKES[variant]} strokeWidth="1.5"
        strokeOpacity="0.3" strokeLinejoin="round" />
      {/* Main triangle */}
      <polygon points="12,30 12,10 32,20"
        fill={fill} filter="url(#shadow-soft)" />
    </svg>
  )
}

// ── 5. Abstract Hexagon — Admin / System ──────────────────────────────────
// Hexagon with inner geometric detail → "system, management, authority"
export function ShapeAdmin({ size = 40, variant = 'primary', className = '' }) {
  const fill = FILLS[variant]
  // Flat-top hexagon points
  const hex = (cx, cy, r) => {
    const pts = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30)
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
    }
    return pts.join(' ')
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <GradientDefs />
      {/* Outer hex ghost */}
      <polygon points={hex(20, 20, 18)}
        fill="none" stroke={STROKES[variant]} strokeWidth="1" strokeOpacity="0.2" />
      {/* Main hex */}
      <polygon points={hex(20, 20, 15)}
        fill={fill} filter="url(#shadow-soft)" />
      {/* Inner hex */}
      <polygon points={hex(20, 20, 8)}
        fill="#FFFFFF" fillOpacity="0.1" />
      {/* Center cross */}
      <line x1="20" y1="14" x2="20" y2="26" stroke="#FFFFFF" strokeWidth="1.5"
        strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="14" y1="20" x2="26" y2="20" stroke="#FFFFFF" strokeWidth="1.5"
        strokeOpacity="0.6" strokeLinecap="round" />
    </svg>
  )
}

// ── 6. Abstract User Cluster — Person / Community ─────────────────────────
// Overlapping circles → "people, community, peer learning"
export function ShapeUser({ size = 40, variant = 'blue', className = '' }) {
  const fill = FILLS[variant]
  const stroke = STROKES[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <GradientDefs />
      {/* Back person circle */}
      <circle cx="26" cy="14" r="7" fill={fill} fillOpacity="0.4"
        stroke={stroke} strokeWidth="1" strokeOpacity="0.3" />
      {/* Back person body */}
      <path d="M17 34 Q17 26 26 26 Q35 26 35 34"
        fill={fill} fillOpacity="0.3" />
      {/* Front person circle */}
      <circle cx="16" cy="14" r="8" fill={fill} filter="url(#shadow-soft)" />
      {/* Front person body */}
      <path d="M4 36 Q4 27 16 27 Q28 27 28 36"
        fill={fill} />
    </svg>
  )
}

// ── 7. Abstract Orbit — Peer Learning / Connection ────────────────────────
// Central node with orbiting smaller nodes → "interconnected knowledge sharing"
export function ShapeOrbit({ size = 40, variant = 'emerald', className = '' }) {
  const fill = FILLS[variant]
  const stroke = STROKES[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <GradientDefs />
      {/* Orbit ring */}
      <ellipse cx="20" cy="20" rx="16" ry="10"
        fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.3"
        transform="rotate(-30 20 20)" />
      {/* Satellite nodes */}
      <circle cx="8" cy="16" r="3" fill={stroke} fillOpacity="0.5" />
      <circle cx="32" cy="24" r="3" fill={stroke} fillOpacity="0.5" />
      <circle cx="20" cy="8" r="2.5" fill={stroke} fillOpacity="0.4" />
      {/* Central node */}
      <circle cx="20" cy="20" r="6" fill={fill} filter="url(#shadow-soft)" />
      <circle cx="20" cy="20" r="3" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  )
}

// ── 8. Abstract Lock — Submitted/Locked ───────────────────────────────────
// Geometric padlock form → "immutable, locked submission"
export function ShapeLock({ size = 36, variant = 'primary', className = '' }) {
  const fill = FILLS[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className}>
      <GradientDefs />
      {/* Shackle arc */}
      <path d="M10 16 L10 12 A8 8 0 0 1 26 12 L26 16"
        stroke={STROKES[variant]} strokeWidth="2.5" strokeLinecap="round"
        fill="none" />
      {/* Body */}
      <rect x="7" y="16" width="22" height="16" rx="4"
        fill={fill} filter="url(#shadow-soft)" />
      {/* Keyhole */}
      <circle cx="18" cy="23" r="3" fill="#FFFFFF" fillOpacity="0.5" />
      <rect x="17" y="24" width="2" height="4" rx="1"
        fill="#FFFFFF" fillOpacity="0.5" />
    </svg>
  )
}

// ── 9. Abstract Spark — Notification / Alert ──────────────────────────────
export function ShapeSpark({ size = 36, variant = 'amber', className = '' }) {
  const fill = FILLS[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className}>
      <GradientDefs />
      {/* Star burst */}
      <polygon points="18,4 21,14 31,14 23,21 26,31 18,25 10,31 13,21 5,14 15,14"
        fill={fill} filter="url(#shadow-soft)" />
    </svg>
  )
}

// ── Default export map ─────────────────────────────────────────────────────
export default {
  Topic: ShapeTopic,
  Time: ShapeTime,
  Achievement: ShapeAchievement,
  Action: ShapeAction,
  Admin: ShapeAdmin,
  User: ShapeUser,
  Orbit: ShapeOrbit,
  Lock: ShapeLock,
  Spark: ShapeSpark,
}
