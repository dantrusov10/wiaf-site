export function Bars({
  a,
  b,
  labels,
}: {
  a: number[]
  b?: number[]
  labels: string[]
}) {
  const max = Math.max(...a, ...(b ?? []), 1)
  return (
    <div>
      <div className="flex h-[140px] items-end gap-1.5">
        {a.map((v, i) => {
          const hA = Math.max(4, Math.round((v / max) * 100))
          const hB = b ? Math.max(4, Math.round((b[i] / max) * 100)) : 0
          return (
            <div key={labels[i]} className="flex h-full flex-1 flex-col items-stretch justify-end gap-0.5">
              {b ? (
                <div
                  className="w-full rounded-sm bg-brand-2/85"
                  style={{ height: `${hB}%`, minHeight: b[i] > 0 ? 4 : 0 }}
                  title={`Состоялось: ${b[i]}`}
                />
              ) : null}
              <div
                className="w-full rounded-sm bg-navy"
                style={{ height: `${hA}%`, minHeight: v > 0 ? 6 : 0 }}
                title={`Сформировано: ${v}`}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {labels.map((l) => (
          <span key={l} className="flex-1 text-center font-mono text-[9px] text-mist">
            {l}
          </span>
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] text-mist">
        <span className="mr-3 inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-sm bg-navy" /> сформировано
        </span>
        {b ? (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block size-2 rounded-sm bg-brand-2" /> состоялось
          </span>
        ) : null}
      </p>
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
