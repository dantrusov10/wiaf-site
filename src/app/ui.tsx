import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ShineCard } from '../components/Motion'

export function EmptyState({
  title,
  text,
  to,
  cta,
}: {
  title: string
  text: string
  to?: string
  cta?: string
}) {
  return (
    <ShineCard className="rounded-xl border border-dashed border-line bg-white px-6 py-10 text-center">
      <p className="text-xl font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">{text}</p>
      {to && cta ? (
        <Link to={to} className="mt-6 inline-flex rounded-lg bg-brand px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-2">
          {cta}
        </Link>
      ) : null}
    </ShineCard>
  )
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <ShineCard className="rounded-xl border border-line bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </ShineCard>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-semibold text-ink">{label}</span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-[11.5px] text-mist">{hint}</span> : null}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-navy'
