import type { CSSProperties, ReactElement, ReactNode } from 'react'

/** Нативные SVG wIaF: ink / navy / brand / mist. Богаче по деталям, без красного/зелёного. */

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
  soft: '#c5d8e6',
  white: '#ffffff',
}

type Props = { className?: string; title?: string; style?: CSSProperties }

function Svg({ children, className, title, style }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 80 80"
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
      <ellipse cx="40" cy="70" rx="26" ry="4" fill={C.line} opacity="0.7" />
      <rect x="12" y="34" width="40" height="28" rx="4" fill={C.fog} stroke={C.ink} strokeWidth="1.8" />
      <rect x="12" y="34" width="40" height="9" rx="4" fill={C.navy} />
      <path d="M18 50h28M18 56h20M18 62h14" stroke={C.soft} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M52 14l10 22H42L52 14z" fill={C.brand} stroke={C.ink} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M48 20l4 9h-8l4-9z" fill={C.brand2} opacity="0.85" />
      <path d="M52 36v22" stroke={C.navy} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="52" cy="60" r="4.5" fill={C.ink} />
      <circle cx="52" cy="60" r="2" fill={C.brand2} />
      <path d="M58 28c6 2 10 8 10 14" stroke={C.mist} strokeWidth="1.4" strokeDasharray="2 3" />
    </Svg>
  )
}

export function IconCommission(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="70" rx="24" ry="3.5" fill={C.line} opacity="0.65" />
      <path d="M40 10v8M22 24h36" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M40 18c0 0 0 6 0 8" stroke={C.navy} strokeWidth="2" />
      <path
        d="M20 32c0 10 8 18 20 24 12-6 20-14 20-24"
        stroke={C.brand}
        strokeWidth="2.2"
        fill={C.fog}
        fillOpacity="0.5"
      />
      <circle cx="26" cy="42" r="9" fill={C.white} stroke={C.ink} strokeWidth="1.7" />
      <circle cx="54" cy="42" r="9" fill={C.white} stroke={C.brand} strokeWidth="1.7" />
      <path d="M50 39h8M54 35v8" stroke={C.brand} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M23 42h6M26 39v6" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      <path d="M34 48h12" stroke={C.mist} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  )
}

export function IconPlan(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="22" ry="3" fill={C.line} opacity="0.6" />
      <rect x="14" y="18" width="42" height="40" rx="5" fill={C.fog} stroke={C.ink} strokeWidth="1.8" />
      <rect x="14" y="18" width="42" height="11" rx="5" fill={C.navy} />
      <circle cx="20" cy="23.5" r="1.6" fill={C.brand2} />
      <circle cx="26" cy="23.5" r="1.6" fill={C.soft} />
      <path d="M22 40h20M22 47h14M22 54h17" stroke={C.mist} strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="54" cy="48" r="14" fill={C.brand} stroke={C.ink} strokeWidth="1.2" />
      <path d="M54 40v16M46 48h16" stroke={C.white} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M48 42l12 12M60 42L48 54" stroke={C.brand2} strokeWidth="1.2" opacity="0.35" />
    </Svg>
  )
}

export function IconDirector(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="18" ry="3" fill={C.line} opacity="0.6" />
      <rect x="24" y="8" width="32" height="56" rx="6" fill={C.fog} stroke={C.ink} strokeWidth="1.8" />
      <rect x="28" y="14" width="24" height="36" rx="2" fill={C.white} stroke={C.line} strokeWidth="1.4" />
      <path d="M32 42V28l5 5 5-8v17" stroke={C.brand} strokeWidth="2.2" fill="none" strokeLinejoin="round" />
      <path d="M32 42h10" stroke={C.mist} strokeWidth="1.4" />
      <circle cx="48" cy="24" r="3" fill={C.brand2} opacity="0.9" />
      <rect x="34" y="54" width="12" height="3" rx="1.5" fill={C.navy} />
      <circle cx="40" cy="60" r="2.2" fill={C.navy} />
    </Svg>
  )
}

export function IconHold(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="22" ry="3" fill={C.line} opacity="0.55" />
      <path d="M26 28v-4a14 14 0 0 1 28 0v4" stroke={C.navy} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <rect x="16" y="28" width="48" height="36" rx="6" fill={C.fog} stroke={C.ink} strokeWidth="1.8" />
      <circle cx="40" cy="46" r="11" fill={C.white} stroke={C.brand} strokeWidth="2" />
      <circle cx="40" cy="46" r="7" fill={C.fog} stroke={C.brand2} strokeWidth="1.2" />
      <path d="M40 40v12M35 46h10" stroke={C.brand} strokeWidth="2" strokeLinecap="round" />
      <path d="M22 36h8M50 36h8" stroke={C.soft} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  )
}

export function IconRates(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="24" ry="3" fill={C.line} opacity="0.55" />
      <rect x="10" y="14" width="34" height="48" rx="4" fill={C.fog} stroke={C.ink} strokeWidth="1.7" />
      <path d="M17 26h20M17 34h16M17 42h18M17 50h12" stroke={C.mist} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="52" cy="48" r="16" fill={C.brand} stroke={C.navy} strokeWidth="1.2" />
      <path d="M45 48h14M52 41v14" stroke={C.white} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M48 44c4-6 10-6 14 0" stroke={C.brand2} strokeWidth="1.4" fill="none" />
      <rect x="14" y="56" width="14" height="3" rx="1.5" fill={C.navy} />
    </Svg>
  )
}

export function IconRules(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="20" ry="3" fill={C.line} opacity="0.5" />
      <path
        d="M18 12h26l12 12v44a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"
        fill={C.fog}
        stroke={C.ink}
        strokeWidth="1.8"
      />
      <path d="M44 12v12h12" stroke={C.navy} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <path d="M24 36h28M24 44h22M24 52h26M24 60h16" stroke={C.brand} strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="56" cy="58" r="8" fill={C.navy} />
      <path d="M53 58l2.2 2.2 4.2-5" stroke={C.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconTips(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="16" ry="3" fill={C.line} opacity="0.5" />
      <path
        d="M40 8c-12 0-22 9-22 20 0 7 3.5 12.5 9 16v7a4 4 0 0 0 4 4h18a4 4 0 0 0 4-4v-7c5.5-3.5 9-9 9-16 0-11-10-20-22-20z"
        fill={C.fog}
        stroke={C.ink}
        strokeWidth="1.8"
      />
      <path d="M32 58h16M34 64h12" stroke={C.navy} strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="28" r="3.5" fill={C.brand} />
      <path d="M40 34v12" stroke={C.brand} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M28 24c2-6 8-10 12-10" stroke={C.brand2} strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M52 24c-2-6-8-10-12-10" stroke={C.mist} strokeWidth="1.4" fill="none" opacity="0.7" />
    </Svg>
  )
}

export function IconBalance(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="22" ry="3" fill={C.line} opacity="0.55" />
      <path d="M24 26v-6a16 16 0 0 1 32 0v6" stroke={C.navy} strokeWidth="2.2" fill="none" />
      <rect x="14" y="26" width="52" height="36" rx="6" fill={C.fog} stroke={C.ink} strokeWidth="1.8" />
      <rect x="20" y="34" width="18" height="20" rx="3" fill={C.white} stroke={C.line} />
      <rect x="42" y="34" width="18" height="20" rx="3" fill={C.white} stroke={C.brand} />
      <path d="M24 42h10M24 48h7" stroke={C.mist} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="51" cy="44" r="5" fill={C.brand} />
      <path d="M51 41v6M48 44h6" stroke={C.white} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  )
}

export function IconRoute(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="24" ry="3" fill={C.line} opacity="0.5" />
      <circle cx="16" cy="22" r="7" fill={C.brand} stroke={C.ink} strokeWidth="1.2" />
      <circle cx="16" cy="22" r="2.5" fill={C.white} />
      <circle cx="64" cy="54" r="7" fill={C.ink} stroke={C.navy} strokeWidth="1.2" />
      <circle cx="64" cy="54" r="2.5" fill={C.brand2} />
      <path
        d="M22 26c10 2 14 12 20 18s12 10 20 8"
        stroke={C.navy}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M22 26c10 2 14 12 20 18s12 10 20 8"
        stroke={C.brand2}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="3 4"
        opacity="0.8"
      />
      <rect x="32" y="34" width="18" height="14" rx="3" fill={C.fog} stroke={C.brand} strokeWidth="1.6" />
      <path d="M36 41h10M36 45h7" stroke={C.mist} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  )
}

export function IconDensity(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="26" ry="3" fill={C.line} opacity="0.5" />
      <circle cx="22" cy="28" r="10" fill={C.fog} stroke={C.ink} strokeWidth="1.6" />
      <circle cx="40" cy="22" r="11" fill={C.fog} stroke={C.brand} strokeWidth="1.8" />
      <circle cx="58" cy="28" r="10" fill={C.fog} stroke={C.navy} strokeWidth="1.6" />
      <path d="M12 58c3-12 8-18 10-18s8 6 10 18" fill={C.soft} stroke={C.ink} strokeWidth="1.3" />
      <path d="M30 58c3-14 8-20 10-20s8 6 10 20" fill={C.fog} stroke={C.brand} strokeWidth="1.4" />
      <path d="M48 58c3-12 8-18 10-18s8 6 10 18" fill={C.line} stroke={C.navy} strokeWidth="1.3" />
      <circle cx="40" cy="22" r="3" fill={C.brand2} />
    </Svg>
  )
}

export function IconDeal(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="22" ry="3" fill={C.line} opacity="0.5" />
      <rect x="10" y="18" width="34" height="44" rx="4" fill={C.fog} stroke={C.ink} strokeWidth="1.7" />
      <path d="M18 30h18M18 38h14M18 46h16" stroke={C.mist} strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M40 30c8-4 22 2 24 14-6 4-14 6-24 4V30z"
        fill={C.brand}
        stroke={C.navy}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M44 40l4 4 8-9" stroke={C.white} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="52" cy="22" r="6" fill={C.brand2} opacity="0.9" />
      <path d="M50 22h4" stroke={C.white} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  )
}

export function IconMarket(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="26" ry="3" fill={C.line} opacity="0.5" />
      <path d="M10 60h60" stroke={C.mist} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="14" y="38" width="12" height="22" rx="2" fill={C.soft} stroke={C.ink} strokeWidth="1.3" />
      <rect x="30" y="28" width="12" height="32" rx="2" fill={C.fog} stroke={C.navy} strokeWidth="1.4" />
      <rect x="46" y="16" width="12" height="44" rx="2" fill={C.brand} stroke={C.ink} strokeWidth="1.2" />
      <path d="M18 24l12 6 12-14 12 8" stroke={C.ink} strokeWidth="2.2" fill="none" strokeLinejoin="round" />
      <circle cx="54" cy="24" r="3" fill={C.navy} />
      <path d="M18 24l12 6 12-14 12 8" stroke={C.brand2} strokeWidth="1" fill="none" opacity="0.5" />
    </Svg>
  )
}

export function IconCargo(p: Props) {
  return (
    <Svg {...p}>
      <ellipse cx="40" cy="72" rx="24" ry="3" fill={C.line} opacity="0.5" />
      <rect x="10" y="28" width="28" height="32" rx="3" fill={C.fog} stroke={C.ink} strokeWidth="1.7" />
      <rect x="34" y="18" width="30" height="42" rx="3" fill={C.soft} stroke={C.navy} strokeWidth="1.7" />
      <path d="M16 38h16M16 46h12" stroke={C.mist} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42 30h14M42 38h12M42 46h14" stroke={C.brand} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M34 28h-4v-6l4 2v4z" fill={C.brand2} stroke={C.ink} strokeWidth="1" />
      <circle cx="58" cy="24" r="7" fill={C.brand} />
      <path d="M55 24h6M58 21v6" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" />
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
