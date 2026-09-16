import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCbrRates, type CbrRate } from '../content/cbr'

export function RatesStrip({ className = '' }: { className?: string }) {
  const [date, setDate] = useState('')
  const [rates, setRates] = useState<CbrRate[]>([])
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const r = await fetchCbrRates()
      if (cancelled) return
      setDate(r.date)
      setRates(r.rates)
      setLive(r.live)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const show = rates.filter((r) => ['USD', 'EUR', 'CNY'].includes(r.code))

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-white px-4 py-3 ${className}`}>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-mist">Курсы ЦБ</p>
        <p className="font-mono text-[10px] text-mist">
          {date || '…'}
          {live ? ' · live' : ' · снимок'}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {show.length === 0 ? (
          <span className="text-[13px] text-muted">загрузка…</span>
        ) : (
          show.map((r) => (
            <div key={r.code} className="text-[13px]">
              <span className="font-mono font-semibold text-ink">{r.code}</span>
              <span className="ml-1.5 tabular-nums text-muted">{r.value.toFixed(2)} ₽</span>
            </div>
          ))
        )}
      </div>
      <Link to="/rates" className="ml-auto text-[12.5px] font-semibold text-brand hover:underline">
        Все курсы →
      </Link>
    </div>
  )
}
