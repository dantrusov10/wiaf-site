import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bars } from '../app/charts'
import { bestBid, countryKey, isOpenLot, loadFromContainer, lotStatus, modeEnum, uniqueBidders } from '../app/engine'
import { useSession } from '../app/session'
import { AuctionBoard } from '../components/AuctionBoard'
import { PageHero } from '../components/PageHero'
import { PageLeadCta } from '../components/LeadMagnet'
import { weekSeries } from '../demo/seed'
import { formatWhen, loadLabel, modeLabel, ruDec, ruInt } from '../data'
import { useNow } from '../hooks'

const filters = [
  { id: 'all', label: 'Все' },
  { id: 'china', label: 'Китай' },
  { id: 'turkey', label: 'Турция' },
  { id: 'vietnam', label: 'Вьетнам' },
  { id: 'india', label: 'Индия' },
] as const

export function AuctionsPage() {
  const { lots } = useSession()
  const now = useNow(2000)
  const [lane, setLane] = useState<(typeof filters)[number]['id']>('all')
  const openAll = lots.filter((l) => isOpenLot(l, now)).sort((a, b) => a.startIso.localeCompare(b.startIso))
  const open = useMemo(
    () => (lane === 'all' ? openAll : openAll.filter((l) => countryKey(l.country) === lane)),
    [openAll, lane],
  )
  const live = open.filter((l) => lotStatus(l, now) === 'live').length
  const held = lots.filter((l) => lotStatus(l, now) === 'held' && !l.isDraft)

  return (
    <main>
      <PageHero
        kicker="Лента"
        title="Текущие аукционы"
        dek={`${live} идёт, ${open.length} открытых слотов. Ставка — после входа исполнителя; на счёте ≥ 1% от ставки.`}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setLane(f.id)}
                className={`rounded-full px-3 py-1 text-[13px] font-medium ${
                  lane === f.id ? 'bg-navy text-white' : 'border border-line bg-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <AuctionBoard lane={lane} />
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="border-b border-line bg-fog/50 font-mono text-[10px] uppercase text-mist">
                <tr>
                  <th className="px-4 py-2">Лот</th>
                  <th className="px-4 py-2">Маршрут</th>
                  <th className="px-4 py-2">Тип</th>
                  <th className="px-4 py-2">м³ / кг</th>
                  <th className="px-4 py-2">Слот</th>
                </tr>
              </thead>
              <tbody>
                {open.map((lot) => (
                  <tr key={lot.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 font-mono text-[12px]">
                      <Link to={`/auctions/${lot.id}`} className="underline">
                        {lot.code}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      {lot.from} → {lot.to}
                    </td>
                    <td className="px-4 py-2.5">
                      {loadLabel(loadFromContainer(lot.container))} · {modeLabel(modeEnum(lot.mode))}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {ruDec.format(lot.cbm)} / {ruInt.format(lot.kg)}
                    </td>
                    <td className="px-4 py-2.5">{formatWhen(lot.startIso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-[13px] font-semibold">Состоявшиеся</p>
            <p className="mb-2 text-[12px] text-mist">Только слоты, где поставило ≥ 2 исполнителя.</p>
            <table className="w-full text-left text-[13px]">
              <tbody>
                {held.slice(0, 12).map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="py-2 font-mono">
                      <Link to={`/auctions/${r.id}`} className="underline">
                        {r.code}
                      </Link>
                    </td>
                    <td className="py-2">
                      {r.from} → {r.to}
                    </td>
                    <td className="py-2 font-mono">${ruInt.format(bestBid(r.bids) ?? 0)}</td>
                    <td className="py-2">{uniqueBidders(r.bids)} игр.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="h-fit space-y-4">
          <div className="rounded-xl border border-line bg-white p-5 text-[14px] text-muted">
            <h2 className="text-lg font-semibold text-ink">Правила часа</h2>
            <ul className="mt-3 space-y-1.5">
              <li>60 минут, до 5 ставок, шаг $1.</li>
              <li>Слепые: не видно конкурентов и заказчика.</li>
              <li>Состоялись только при ≥ 2 ставках разных исполнителей.</li>
              <li>Счёт от 1 000 ₽. Холд = 1% ставки. Комиссия 1%, ≤5 000 ₽.</li>
            </ul>
            <Link to="/app/login?role=forwarder" className="mt-4 inline-flex rounded-lg bg-navy px-4 py-2 text-[13px] font-semibold text-white">
              Войти и ставить
            </Link>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="mb-2 text-[13px] font-semibold">Недели с июля</p>
            <Bars a={weekSeries.map((w) => w.formed)} b={weekSeries.map((w) => w.held)} labels={weekSeries.map((w) => w.w)} />
          </div>
        </aside>
      </div>
      <PageLeadCta variant="forwarder" />
    </main>
  )
}
