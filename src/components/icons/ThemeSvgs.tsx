import type { CSSProperties, ReactElement, ReactNode } from 'react'

/** Нативные SVG-иконки wIaF: ink / navy / brand / mist. Без белых квадратов, без красного/зелёного. */

export type ThemeIconId =
  | 'auction'
  | 'commission'
  | 'plan'
  | 'director'
  | 'hold'
  | 'rates'
  | 'rules'
  | 'tips'
  | 'balance'
  | 'route'
  | 'density'
  | 'deal'
  | 'market'
  | 'cargo'

const C = {
  ink: '#0a2f44',
  navy: '#1a2c3e',
  brand: '#2980b9',
  brand2: '#3498db',
  mist: '#8a9bab',
  line: '#d0e0ea',
  fog: '#eef2fa',
}

type Props = { className?: string; title?: string; style?: CSSProperties }

function Svg({ children, className, title, style }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

export function IconAuction(p: Props) {
  return (
    <Svg {...p}>
      <rect x="10" y="28" width="36" height="22" rx="3" fill={C.fog} stroke={C.ink} strokeWidth="1.6" />
      <path d="M14 34h28M14 40h28M14 46h16" stroke={C.mist} strokeWidth="1.4" />
      <path d="M42 12l6 14H36l6-14z" fill={C.brand} />
      <path d="M42 26v18" stroke={C.navy} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="42" cy="46" r="3.5" fill={C.ink} />
    </Svg>
  )
}

export function IconCommission(p: Props) {
  return (
    <Svg {...p}>
      <path d="M32 10v8M20 22h24" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M32 18v6" stroke={C.navy} strokeWidth="2" />
      <path d="M18 28c0 8 6 14 14 18 8-4 14-10 14-18" stroke={C.brand} strokeWidth="2" fill="none" />
      <circle cx="22" cy="36" r="7" fill={C.fog} stroke={C.ink} strokeWidth="1.5" />
      <circle cx="42" cy="36" r="7" fill={C.fog} stroke={C.brand} strokeWidth="1.5" />
      <path d="M39 34h6M42 31v6" stroke={C.brand} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 36h4" stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

export function IconPlan(p: Props) {
  return (
    <Svg {...p}>
      <rect x="12" y="18" width="40" height="26" rx="4" fill={C.fog} stroke={C.ink} strokeWidth="1.6" />
      <rect x="12" y="18" width="40" height="8" rx="4" fill={C.navy} />
      <circle cx="18" cy="22" r="1.4" fill={C.brand2} />
      <path d="M20 36h16M20 41h12" stroke={C.mist} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="46" cy="40" r="10" fill={C.brand} />
      <path d="M46 35v10M41 40h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  )
}

export function IconDirector(p: Props) {
  return (
    <Svg {...p}>
      <rect x="20" y="8" width="24" height="42" rx="4" fill={C.fog} stroke={C.ink} strokeWidth="1.6" />
      <rect x="24" y="14" width="16" height="28" rx="1.5" fill="#fff" stroke={C.line} />
      <path d="M27 36v-8l4 3 4-5v10" stroke={C.brand} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <path d="M27 36h8" stroke={C.mist} strokeWidth="1.2" />
      <circle cx="32" cy="46" r="1.8" fill={C.navy} />
    </Svg>
  )
}

export function IconHold(p: Props) {
  return (
    <Svg {...p}>
      <rect x="14" y="16" width="36" height="32" rx="4" fill={C.fog} stroke={C.ink} strokeWidth="1.6" />
      <path d="M22 16v-2a10 10 0 0 1 20 0v2" stroke={C.navy} strokeWidth="2" fill="none" />
      <circle cx="32" cy="34" r="8" fill="#fff" stroke={C.brand} strokeWidth="1.8" />
      <path d="M32 30v8M29 33h6" stroke={C.brand} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  )
}

export function IconRates(p: Props) {
  return (
    <Svg {...p}>
      <rect x="11" y="14" width="30" height="38" rx="3" fill={C.fog} stroke={C.ink} strokeWidth="1.6" />
      <path d="M17 24h18M17 30h14M17 36h16" stroke={C.mist} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="44" cy="40" r="12" fill={C.brand} />
      <path d="M39 40h10M44 35v10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 44h10" stroke={C.navy} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  )
}

export function IconRules(p: Props) {
  return (
    <Svg {...p}>
      <path
        d="M16 12h22l8 8v32a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z"
        fill={C.fog}
        stroke={C.ink}
        strokeWidth="1.6"
      />
      <path d="M38 12v8h8" stroke={C.navy} strokeWidth="1.6" fill="none" />
      <path d="M20 30h20M20 36h16M20 42h18" stroke={C.brand} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  )
}

export function IconTips(p: Props) {
  return (
    <Svg {...p}>
      <path
        d="M32 8c-9 0-16 7-16 15 0 5 2.5 9 6.5 12v5a3 3 0 0 0 3 3h13a3 3 0 0 0 3-3v-5c4-3 6.5-7 6.5-12 0-8-7-15-16-15z"
        fill={C.fog}
        stroke={C.ink}
        strokeWidth="1.6"
      />
      <path d="M26 46h12M28 51h8" stroke={C.navy} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 18v10M27 23h10" stroke={C.brand} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  )
}

export function IconBalance(p: Props) {
  return (
    <Svg {...p}>
      <rect x="14" y="22" width="36" height="26" rx="4" fill={C.fog} stroke={C.ink} strokeWidth="1.6" />
      <path d="M20 22v-4a12 12 0 0 1 24 0v4" stroke={C.navy} strokeWidth="1.8" fill="none" />
      <circle cx="32" cy="36" r="7" fill="#fff" stroke={C.brand} strokeWidth="1.6" />
      <path d="M32 32v8" stroke={C.brand} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 48h28" stroke={C.mist} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  )
}

export function IconRoute(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="16" cy="20" r="5" fill={C.brand} />
      <circle cx="48" cy="44" r="5" fill={C.ink} />
      <path
        d="M20 22c8 2 10 8 14 12s8 8 14 8"
        stroke={C.navy}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="28" y="28" width="14" height="10" rx="2" fill={C.fog} stroke={C.brand} strokeWidth="1.4" />
      <path d="M30 33h10" stroke={C.mist} strokeWidth="1.2" />
    </Svg>
  )
}

export function IconDensity(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="20" cy="24" r="7" fill={C.fog} stroke={C.ink} strokeWidth="1.5" />
      <circle cx="32" cy="20" r="7" fill={C.fog} stroke={C.brand} strokeWidth="1.5" />
      <circle cx="44" cy="24" r="7" fill={C.fog} stroke={C.navy} strokeWidth="1.5" />
      <path d="M12 48c2-8 6-12 8-12s6 4 8 12" fill={C.line} stroke={C.ink} strokeWidth="1.2" />
      <path d="M24 48c2-10 6-14 8-14s6 4 8 14" fill={C.fog} stroke={C.brand} strokeWidth="1.2" />
      <path d="M36 48c2-8 6-12 8-12s6 4 8 12" fill={C.line} stroke={C.navy} strokeWidth="1.2" />
    </Svg>
  )
}

export function IconDeal(p: Props) {
  return (
    <Svg {...p}>
      <rect x="10" y="18" width="28" height="34" rx="3" fill={C.fog} stroke={C.ink} strokeWidth="1.5" />
      <path d="M16 28h16M16 34h12M16 40h14" stroke={C.mist} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M34 28c6-2 14 2 16 10-4 2-10 4-16 2v-12z" fill={C.brand} opacity="0.95" />
      <path d="M36 36l3 3 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconMarket(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 48h40" stroke={C.mist} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="16" y="30" width="8" height="18" rx="1.5" fill={C.line} stroke={C.ink} strokeWidth="1.2" />
      <rect x="28" y="22" width="8" height="26" rx="1.5" fill={C.fog} stroke={C.navy} strokeWidth="1.2" />
      <rect x="40" y="14" width="8" height="34" rx="1.5" fill={C.brand} />
      <path d="M18 20l10 4 10-10 8 4" stroke={C.ink} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <circle cx="46" cy="18" r="2.2" fill={C.navy} />
    </Svg>
  )
}

export function IconCargo(p: Props) {
  return (
    <Svg {...p}>
      <rect x="12" y="22" width="22" height="26" rx="2" fill={C.fog} stroke={C.ink} strokeWidth="1.5" />
      <rect x="30" y="16" width="22" height="32" rx="2" fill={C.line} stroke={C.navy} strokeWidth="1.5" />
      <path d="M16 30h14M16 36h10" stroke={C.mist} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M36 26h10M36 32h8M36 38h10" stroke={C.brand} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="48" cy="20" r="5" fill={C.brand2} />
      <path d="M46 20h4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  )
}

const map: Record<ThemeIconId, (p: Props) => ReactElement> = {
  auction: IconAuction,
  commission: IconCommission,
  plan: IconPlan,
  director: IconDirector,
  hold: IconHold,
  rates: IconRates,
  rules: IconRules,
  tips: IconTips,
  balance: IconBalance,
  route: IconRoute,
  density: IconDensity,
  deal: IconDeal,
  market: IconMarket,
  cargo: IconCargo,
}

export function ThemeSvgIcon({ id, className, title, style }: Props & { id: ThemeIconId }) {
  const Comp = map[id]
  return <Comp className={className} title={title} style={style} />
}
