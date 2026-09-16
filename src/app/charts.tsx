/** Парные столбцы + явная ось Y и сетка. */
export function Bars({
  a,
  b,
  labels,
  aLabel = 'сформировано',
  bLabel = 'состоялось',
  onBarClick,
}: {
  a: number[]
  b?: number[]
  labels: string[]
  aLabel?: string
  bLabel?: string
  onBarClick?: (index: number, label: string) => void
}) {
  const max = Math.max(...a, ...(b ?? []), 1)
  const niceMax = Math.max(2, Math.ceil(max / 4) * 4)
  const ticks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax].map((n) => Math.round(n))
  const h = 168

  return (
    <div>
      <div className="flex gap-2">
        {/* ось Y */}
        <div
          className="relative w-8 shrink-0 font-mono text-[10px] text-mist"
          style={{ height: h }}
          aria-hidden
        >
          {ticks.map((t) => {
            const top = ((niceMax - t) / niceMax) * 100
            return (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2 tabular-nums"
                style={{ top: `${top}%` }}
              >
                {t}
              </span>
            )
          })}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative rounded-md border border-line/80 bg-fog/20" style={{ height: h }}>
            {/* горизонтальная сетка */}
            {ticks.map((t) => {
              const top = ((niceMax - t) / niceMax) * 100
              return (
                <div
                  key={t}
                  className="pointer-events-none absolute left-0 right-0 border-t border-line"
                  style={{ top: `${top}%` }}
                />
              )
            })}
            {/* лёгкая вертикальная сетка по неделям */}
            <div className="pointer-events-none absolute inset-0 flex">
              {labels.map((l) => (
                <div key={l} className="h-full flex-1 border-r border-line/40 last:border-r-0" />
              ))}
            </div>

            <div className="absolute inset-0 flex items-end gap-1 px-1 pb-0.5 sm:gap-1.5 sm:px-1.5">
              {a.map((v, i) => {
                const ha = Math.round((v / niceMax) * (h - 6))
                const hb = b ? Math.round((b[i] / niceMax) * (h - 6)) : 0
                const clickable = Boolean(onBarClick)
                const bars = (
                  <>
                    <div
                      className="w-[42%] max-w-[15px] rounded-t-md bg-navy transition group-hover:bg-navy-2"
                      style={{ height: Math.max(v > 0 ? 3 : 0, ha) }}
                      title={`${aLabel}: ${v}`}
                    />
                    {b ? (
                      <div
                        className="w-[42%] max-w-[15px] rounded-t-md bg-brand transition group-hover:bg-brand-2"
                        style={{ height: Math.max(b[i] > 0 ? 3 : 0, hb) }}
                        title={`${bLabel}: ${b[i]}`}
                      />
                    ) : null}
                  </>
                )
                return clickable ? (
                  <button
                    key={labels[i]}
                    type="button"
                    className="group relative z-[1] flex h-full flex-1 cursor-pointer items-end justify-center gap-0.5 rounded-sm hover:bg-brand/10"
                    onClick={() => onBarClick?.(i, labels[i])}
                    title={`Неделя ${labels[i]} → история`}
                  >
                    {bars}
                  </button>
                ) : (
                  <div key={labels[i]} className="relative z-[1] flex h-full flex-1 items-end justify-center gap-0.5">
                    {bars}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-1.5 flex gap-1 border-t border-line pt-2 sm:gap-1.5">
            {labels.map((l, i) =>
              onBarClick ? (
                <button
                  key={l}
                  type="button"
                  onClick={() => onBarClick(i, l)}
                  className="flex-1 text-center font-mono text-[10px] text-mist underline-offset-2 hover:text-brand hover:underline"
                >
                  {l}
                </button>
              ) : (
                <span key={l} className="flex-1 text-center font-mono text-[10px] text-mist">
                  {l}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-navy" />
          {aLabel}
        </span>
        {b ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
            {bLabel}
          </span>
        ) : null}
        {onBarClick ? <span className="text-mist">клик по столбцу → история с фильтром недели</span> : null}
      </div>
    </div>
  )
}

export function Spark({ values, className = 'text-navy' }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const w = 120
  const h = 28
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * h
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-7 w-[120px] ${className}`} aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.8" points={pts} />
    </svg>
  )
}

export function Stat({
  label,
  value,
  hint,
  spark,
}: {
  label: string
  value: string
  hint?: string
  spark?: number[]
}) {
  return (
    <div className="rounded-xl border border-line bg-white px-3.5 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-mist">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-[1.45rem] font-semibold leading-none tracking-tight">{value}</p>
        {spark ? <Spark values={spark} /> : null}
      </div>
      {hint ? <p className="mt-1.5 text-[12px] text-muted">{hint}</p> : null}
    </div>
  )
}
