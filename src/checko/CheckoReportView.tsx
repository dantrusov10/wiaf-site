import { useEffect, useMemo, useState } from 'react'
import type { CheckoFlag, CheckoLight, CheckoReport, CheckoRow, CheckoShelf, CheckoTone } from './types'

const lightClass: Record<CheckoLight, string> = {
  green: 'border-ok/40 bg-ok/10 text-ok',
  yellow: 'border-warn/40 bg-warn/10 text-warn',
  red: 'border-danger/50 bg-danger/10 text-danger',
  demo: 'border-line bg-fog text-muted',
  unknown: 'border-line bg-fog text-mist',
}

const toneDot: Record<CheckoTone, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  bad: 'bg-danger',
  neutral: 'bg-line',
}

const toneText: Record<CheckoTone, string> = {
  ok: 'text-ok',
  warn: 'text-warn',
  bad: 'text-danger',
  neutral: 'text-mist',
}

const toneRow: Record<CheckoTone, string> = {
  ok: 'border-l-ok bg-ok/5',
  warn: 'border-l-warn bg-warn/5',
  bad: 'border-l-danger bg-danger/5',
  neutral: 'border-l-line bg-fog/40',
}

const toneLabel: Record<CheckoTone, string> = {
  ok: 'хорошо',
  warn: 'подозрительно',
  bad: 'плохо',
  neutral: 'факт',
}

type ToneFilter = 'all' | 'attention' | CheckoTone

function rowMatches(row: CheckoRow, tone: ToneFilter, q: string) {
  if (tone === 'attention' && row.tone !== 'bad' && row.tone !== 'warn') return false
  if (tone !== 'all' && tone !== 'attention' && row.tone !== tone) return false
  if (!q) return true
  const hay = `${row.label} ${row.value} ${row.toneHint ?? ''}`.toLowerCase()
  return hay.includes(q)
}

function shelfMatches(shelf: CheckoShelf, tone: ToneFilter, q: string) {
  return shelf.rows.some((r) => rowMatches(r, tone, q))
}

function WidgetCard({
  shelf,
  open,
  onToggle,
  tone,
  q,
}: {
  shelf: CheckoShelf
  open: boolean
  onToggle: () => void
  tone: ToneFilter
  q: string
}) {
  const rows = shelf.rows.filter((r) => rowMatches(r, tone, q))
  const bad = rows.filter((r) => r.tone === 'bad').length
  const warn = rows.filter((r) => r.tone === 'warn').length
  const ok = rows.filter((r) => r.tone === 'ok').length
  if (!rows.length && (tone !== 'all' || q)) return null

  const preview = rows.filter((r) => r.tone === 'bad' || r.tone === 'warn').slice(0, 2)
  const previewFallback = rows.slice(0, 2)

  return (
    <article className={`flex flex-col rounded-xl border bg-white ${open ? 'border-navy/30' : 'border-line'}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${toneDot[shelf.tone]}`} />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-ink">{shelf.title}</span>
          <span className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] uppercase">
            <span className={toneText[shelf.tone]}>{toneLabel[shelf.tone]}</span>
            <span className="text-mist">{rows.length} строк</span>
            {bad ? <span className="text-danger">плохо {bad}</span> : null}
            {warn ? <span className="text-warn">подозр. {warn}</span> : null}
            {ok ? <span className="text-ok">ок {ok}</span> : null}
          </span>
          {!open ? (
            <span className="mt-2 block space-y-1">
              {(preview.length ? preview : previewFallback).map((r, i) => (
                <span key={i} className="block truncate text-[12px] text-muted">
                  <span className={toneText[r.tone]}>●</span> {r.label.split(' · ').slice(-1)[0]}: {r.value}
                </span>
              ))}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-mist">{open ? 'свернуть' : 'открыть'}</span>
      </button>
      {open ? (
        <ul className="max-h-80 overflow-y-auto border-t border-line">
          {rows.map((row, i) => (
            <li key={`${shelf.id}-${i}`} className={`border-l-4 px-4 py-2.5 ${toneRow[row.tone]}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-wide text-mist">{row.label}</p>
                <span className={`font-mono text-[10px] uppercase ${toneText[row.tone]}`}>
                  {row.toneHint || toneLabel[row.tone]}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-ink break-words whitespace-pre-wrap">{row.value}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

function FlagsWidget({ flags, open, onToggle }: { flags: CheckoFlag[]; open: boolean; onToggle: () => void }) {
  const attention = flags.filter((f) => f.level === 'bad' || f.level === 'warn')
  const list = attention.length ? attention : flags
  if (!list.length) return null
  return (
    <article className={`rounded-xl border bg-white ${open ? 'border-navy/30' : 'border-line'}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-warn" />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold">Флаги внимания</span>
          <span className="mt-1 font-mono text-[10px] uppercase text-mist">{list.length} пунктов</span>
          {!open ? (
            <span className="mt-2 block truncate text-[12px] text-muted">{list[0]?.title}</span>
          ) : null}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-mist">{open ? 'свернуть' : 'открыть'}</span>
      </button>
      {open ? (
        <ul className="space-y-2 border-t border-line px-4 py-3">
          {list.map((f) => (
            <li key={f.id} className="flex gap-2 text-[13px]">
              <span
                className={`mt-1 size-2 shrink-0 rounded-full ${
                  f.level === 'ok' ? 'bg-ok' : f.level === 'warn' ? 'bg-warn' : 'bg-danger'
                }`}
              />
              <span>
                <span className="font-medium">{f.title}</span>
                {f.detail ? <span className="text-muted"> — {f.detail}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

export function CheckoReportView({ report, compact }: { report: CheckoReport; compact?: boolean }) {
  const [tone, setTone] = useState<ToneFilter>(compact ? 'attention' : 'attention')
  const [q, setQ] = useState('')
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(['risks', 'flags']))

  useEffect(() => {
    setTone('attention')
    setQ('')
    setOpenIds(new Set(['risks', 'flags']))
  }, [report.inn, report.checkedAt])

  const qNorm = q.trim().toLowerCase()

  const visibleShelves = useMemo(
    () => report.shelves.filter((s) => shelfMatches(s, tone, qNorm)),
    [report.shelves, tone, qNorm],
  )

  const visibleRowCount = useMemo(
    () => visibleShelves.reduce((n, s) => n + s.rows.filter((r) => rowMatches(r, tone, qNorm)).length, 0),
    [visibleShelves, tone, qNorm],
  )

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandMatched = () => {
    setOpenIds(new Set(visibleShelves.map((s) => s.id).concat('flags')))
  }

  const collapseAll = () => setOpenIds(new Set())

  const filters: { id: ToneFilter; label: string; count?: number }[] = [
    { id: 'attention', label: 'Внимание', count: report.counts.bad + report.counts.warn },
    { id: 'bad', label: 'Плохо', count: report.counts.bad },
    { id: 'warn', label: 'Подозрительно', count: report.counts.warn },
    { id: 'ok', label: 'Хорошо', count: report.counts.ok },
    { id: 'neutral', label: 'Факты', count: report.counts.neutral },
    { id: 'all', label: 'Всё', count: report.counts.ok + report.counts.warn + report.counts.bad + report.counts.neutral },
  ]

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border px-4 py-3 ${lightClass[report.light]}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide opacity-80">Светофор</p>
            <p className="mt-1 text-[16px] font-semibold">{report.lightLabel}</p>
            <p className="mt-1 text-[13px]">
              {report.companyShort || '—'} · ИНН {report.inn} · {report.statusName || report.kind}
            </p>
            {report.registerHint ? <p className="mt-1 text-[12.5px] opacity-90">{report.registerHint}</p> : null}
            {report.error ? <p className="mt-1 text-[12.5px]">{report.error}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px] sm:grid-cols-4">
            <div className="rounded-lg bg-white/60 px-3 py-2">
              <p className="text-ok text-[16px] font-semibold">{report.counts.ok}</p>
              <p className="opacity-70">хорошо</p>
            </div>
            <div className="rounded-lg bg-white/60 px-3 py-2">
              <p className="text-warn text-[16px] font-semibold">{report.counts.warn}</p>
              <p className="opacity-70">подозр.</p>
            </div>
            <div className="rounded-lg bg-white/60 px-3 py-2">
              <p className="text-danger text-[16px] font-semibold">{report.counts.bad}</p>
              <p className="opacity-70">плохо</p>
            </div>
            <div className="rounded-lg bg-white/60 px-3 py-2">
              <p className="text-[16px] font-semibold text-ink">{report.counts.neutral}</p>
              <p className="opacity-70">факт</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-white p-3">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTone(f.id)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${
                tone === f.id ? 'bg-navy text-white' : 'bg-fog text-muted hover:text-ink'
              }`}
            >
              {f.label}
              {f.count != null ? <span className="ml-1 opacity-70">{f.count}</span> : null}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по полям (директор, адрес, ОКВЭД…)"
            className="min-w-[12rem] flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-[13px] outline-none focus:border-navy"
          />
          <button type="button" onClick={expandMatched} className="rounded-lg border border-line px-3 py-2 text-[12px]">
            Раскрыть найденное
          </button>
          <button type="button" onClick={collapseAll} className="rounded-lg border border-line px-3 py-2 text-[12px]">
            Свернуть всё
          </button>
        </div>
        <p className="mt-2 font-mono text-[11px] text-mist">
          Показано виджетов: {visibleShelves.length}
          {tone === 'attention' || tone !== 'all' || qNorm ? ` · строк: ${visibleRowCount}` : null}
          {tone === 'attention' ? ' · по умолчанию только внимание' : null}
        </p>
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
        {(tone === 'attention' || tone === 'all' || tone === 'bad' || tone === 'warn') && !qNorm ? (
          <FlagsWidget flags={report.flags} open={openIds.has('flags')} onToggle={() => toggle('flags')} />
        ) : null}
        {visibleShelves.map((shelf) => (
          <WidgetCard
            key={shelf.id}
            shelf={shelf}
            open={openIds.has(shelf.id)}
            onToggle={() => toggle(shelf.id)}
            tone={tone}
            q={qNorm}
          />
        ))}
      </div>

      {!visibleShelves.length ? (
        <p className="rounded-xl border border-dashed border-line bg-fog/40 px-4 py-6 text-center text-[13px] text-muted">
          По фильтру ничего нет — снимите фильтр или очистите поиск.
        </p>
      ) : null}
    </div>
  )
}
