import { useId, useState, type ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { toolPath, toolsFor, type ToolRole } from './catalog'

export function useActiveToolRole(): ToolRole {
  const { pathname } = useLocation()
  if (pathname.startsWith('/app/forwarder')) return 'forwarder'
  return 'importer'
}

export function useToolBase(): string {
  return toolPath(useActiveToolRole())
}

export function ToolNav({ currentSlug }: { currentSlug?: string }) {
  const role = useActiveToolRole()
  const items = toolsFor(role)
  const accent = role === 'importer' ? 'border-brand bg-brand/10 text-brand' : 'border-navy bg-navy/10 text-navy'

  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        to={toolPath(role)}
        className={`rounded-lg border px-3 py-1 text-[12px] ${
          !currentSlug ? accent : 'border-line bg-white text-muted hover:border-brand/40'
        }`}
      >
        Все
      </Link>
      {items.map((t) => (
        <Link
          key={t.slug}
          to={toolPath(role, t.slug)}
          className={`rounded-lg border px-3 py-1 text-[12px] ${
            currentSlug === t.slug ? accent : 'border-line bg-white text-muted hover:border-brand/40'
          }`}
        >
          {t.title}
        </Link>
      ))}
    </nav>
  )
}

export function HintLabel({ label, tip }: { label: string; tip: string }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex items-center gap-1 text-[12px] font-medium text-muted">
      {label}
      <button
        type="button"
        className="inline-flex size-4 items-center justify-center rounded-full text-mist hover:text-brand"
        aria-label={`Подсказка: ${label}`}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        <HelpCircle className="size-3.5" strokeWidth={2} />
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-line bg-navy px-3 py-2 text-[12px] font-normal leading-snug text-fog shadow-lg"
        >
          {tip}
        </span>
      ) : null}
    </span>
  )
}

export function Field({
  label,
  tip,
  children,
  hint,
}: {
  label: string
  tip: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <HintLabel label={label} tip={tip} />
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-[11px] text-mist">{hint}</span> : null}
    </label>
  )
}

export function inputClass() {
  return 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-brand'
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-fog/60 px-3 py-2 text-[12.5px] leading-relaxed text-muted">{children}</p>
  )
}

export function ResultCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-[13px] font-semibold">{title}</p>
      <div className="mt-3 space-y-2 text-[14px]">{children}</div>
    </div>
  )
}

export function RowKV({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div
      className={`flex justify-between gap-4 border-b border-line/70 py-1.5 last:border-0 ${strong ? 'font-semibold' : ''}`}
    >
      <span className="text-muted">{k}</span>
      <span className="font-mono text-ink">{v}</span>
    </div>
  )
}

export function UspBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">{title}</p>
      <div className="mt-2 text-[13.5px] leading-relaxed text-ink">{children}</div>
    </div>
  )
}
