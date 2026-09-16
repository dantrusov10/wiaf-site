import { Plane, Ship, Train, Truck } from 'lucide-react'
import type { Mode } from '../data'

export function IncotermChip({ value }: { value: string }) {
  return (
    <span className="rounded-full border border-line bg-fog px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wide text-ink">
      {value}
    </span>
  )
}

export function HsChip({ value }: { value: string }) {
  if (!value) return null
  return <span className="font-mono text-[11px] text-mist">HS {value}</span>
}

export function ModeIcon({ mode, className = 'size-3.5' }: { mode: Mode; className?: string }) {
  if (mode === 'rail') return <Train className={className} />
  if (mode === 'air') return <Plane className={className} />
  if (mode === 'sea') return <Ship className={className} />
  return <Truck className={className} />
}

export function StatusChip({
  tone,
  children,
}: {
  tone: 'live' | 'queue' | 'held' | 'fail'
  children: string
}) {
  const cls =
    tone === 'live'
      ? 'bg-navy text-brand-2'
      : tone === 'held'
        ? 'bg-ok/15 text-ok'
        : tone === 'fail'
          ? 'bg-danger/10 text-danger'
          : 'bg-fog text-muted'
  return (
    <span className={`clock inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] ${cls}`}>
      {children}
    </span>
  )
}
