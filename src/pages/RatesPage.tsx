import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { ThemeIcon, ThemeTileRow } from '../components/ThemeIcon'
import { fetchCbrRates, type CbrRate } from '../content/cbr'
import { moneyCopy } from '../content/money'

export function RatesPage() {
  const [date, setDate] = useState('')
  const [rates, setRates] = useState<CbrRate[]>([])
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const r = await fetchCbrRates()
      if (cancelled) return
      setDate(r.date)
      setRates(r.rates)
      setLive(r.live)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main>
      <PageHero
        kicker="Справочник"
        title="Курсы Банка России"
        dek={`Ставки на wIaF в долларах, комиссия в рублях (${moneyCopy.commissionShort}). Курс ЦБ — ориентир пересчёта, не курс сделки.`}
      />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-6 flex items-center gap-3">
          <ThemeIcon id="rates" size={72} />
          <p className="text-[13.5px] text-muted">USD · EUR · CNY и другие — рядом с торгами и в ЛК.</p>
        </div>
        {loading ? (
          <p className="text-muted">Загрузка…</p>
        ) : (
          <>
            <p className="mb-4 font-mono text-[12px] text-mist">
              Дата: {date} · {live ? 'живой XML cbr.ru' : 'снимок макета (если CORS/сеть недоступны)'}
            </p>
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-line text-mist">
                  <th className="py-2 font-medium">Код</th>
                  <th className="py-2 font-medium">Валюта</th>
                  <th className="py-2 font-medium">Номинал</th>
                  <th className="py-2 font-medium">₽</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.code} className="border-b border-line/70">
                    <td className="py-2.5 font-mono font-semibold">{r.code}</td>
                    <td className="py-2.5 text-muted">{r.name}</td>
                    <td className="py-2.5 tabular-nums">{r.nominal}</td>
                    <td className="py-2.5 font-semibold tabular-nums">{r.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div className="mt-10">
          <ThemeTileRow
            items={[
              { id: 'auction', label: 'Аукционы', to: '/auctions' },
              { id: 'commission', label: 'Комиссия', to: '/pricing' },
              { id: 'hold', label: 'Холд', to: '/forwarder' },
              { id: 'rules', label: 'Правила', to: '/rules' },
            ]}
          />
        </div>
        <p className="mt-8 text-[13.5px] text-muted">
          {moneyCopy.freeReg}.{' '}
          <Link to="/app/login?role=importer" className="text-brand underline">
            Войти в кабинет
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
