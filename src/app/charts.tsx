/** Парные столбцы бок о бок — читаемый сравнительный график. */
export function Bars({
  a,
  b,
  labels,
  aLabel = 'сформировано',
  bLabel = 'состоялось',
}: {
  a: number[]
  b?: number[]
  labels: string[]
  aLabel?: string
  bLabel?: string
}) {
  const max = Math.max(...a, ...(b ?? []), 1)
  const h = 132

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: h }}>
        {a.map((v, i) => {
          const ha = Math.round((v / max) * (h - 8))
          const hb = b ? Math.round((b[i] / max) * (h - 8)) : 0
          return (
            <div key={labels[i]} className="flex h-full flex-1 items-end justify-center gap-0.5">
              <div
                className="w-[42%] max-w-[14px] rounded-t-md bg-navy"
                style={{ height: Math.max(v > 0 ? 6 : 0, ha) }}
                title={`${aLabel}: ${v}`}
              />
              {b ? (
                <div
                  className="w-[42%] max-w-[14px] rounded-t-md bg-brand"
                  style={{ height: Math.max(b[i] > 0 ? 6 : 0, hb) }}
                  title={`${bLabel}: ${b[i]}`}
                />
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-line pt-2">
        {labels.map((l) => (
          <span key={l} className="flex-1 text-center font-mono text-[10px] text-mist">
            {l}
          </span>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
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
