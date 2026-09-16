import { Link } from 'react-router-dom'
import { Bars, Stat } from '../app/charts'
import { PageHero } from '../components/PageHero'
import { bidderMix, includedSplit, lanes, rulesOfRead, snapshot } from '../content/analytics'
import { weekSeries } from '../demo/seed'
import { ruInt } from '../data'

export function AnalyticsPage() {
  return (
    <main>
      <PageHero
        kicker="Аналитика слотов"
        title="Цифры с аукциона, не индекс фрахта"
        dek={`Срез публичной главной ${snapshot.asOf}: ${snapshot.formed} сформировано, ${snapshot.held} состоялось. Ниже — коридоры и плотность игроков. Экономию в процентах не считаем.`}
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Сформировано" value={String(snapshot.formed)} hint="публичная главная" />
          <Stat label="Состоялось" value={String(snapshot.held)} hint={`${snapshot.heldShare}% слотов с ≥2`} spark={weekSeries.map((w) => w.held)} />
          <Stat label="Живых на срез" value={String(snapshot.live)} hint="все Китай → Москва" />
          <Stat label="Комиссия" value="1%" hint="не более 5 000 ₽" />
        </div>

        <div className="mt-10 rounded-xl border border-line bg-white p-5">
            <p className="text-[13px] font-semibold">Сформировано и состоялось по неделям</p>
            <p className="mb-3 text-[12px] text-mist">Тёмные — выложено, синие — состоялось. Масштаб площадки, не «миллионы TEU».</p>
            <Bars a={weekSeries.map((w) => w.formed)} b={weekSeries.map((w) => w.held)} labels={weekSeries.map((w) => w.w)} />
          </div>

        <h2 className="mt-14 text-xl font-semibold">Коридоры</h2>
        <p className="mt-1 max-w-2xl text-[14px] text-muted">
          Медиана победы — по состоявшимся слотам этого коридора. Это не оферта на ваш груз.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="border-b border-line bg-fog/50 font-mono text-[10px] uppercase text-mist">
              <tr>
                <th className="px-4 py-2">Маршрут</th>
                <th className="px-4 py-2">Тип</th>
                <th className="px-4 py-2">Лотов</th>
                <th className="px-4 py-2">Сост.</th>
                <th className="px-4 py-2">Медиана $</th>
                <th className="px-4 py-2">Игроков</th>
                <th className="px-4 py-2">Тип. объём</th>
              </tr>
            </thead>
            <tbody>
              {lanes.map((lane) => (
                <tr key={lane.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold">
                      {lane.from} → {lane.to}
                    </p>
                    <p className="mt-1 max-w-xs text-[12px] text-muted">{lane.note}</p>
                  </td>
                  <td className="px-4 py-3">{lane.type}</td>
                  <td className="px-4 py-3 font-mono">{lane.lots}</td>
                  <td className="px-4 py-3 font-mono">{lane.held}</td>
                  <td className="px-4 py-3 font-mono">${ruInt.format(lane.medianWin)}</td>
                  <td className="px-4 py-3 font-mono">{lane.medianN}</td>
                  <td className="px-4 py-3">{lane.typicalCbm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-line bg-white p-5">
            <h2 className="text-[16px] font-semibold">Сколько игроков приходит</h2>
            <ul className="mt-4 space-y-3">
              {bidderMix.map((row) => (
                <li key={row.n} className="flex gap-3">
                  <span className="w-10 font-mono text-[13px] text-brand">{row.n}</span>
                  <div>
                    <p className="text-[13.5px] font-medium">
                      {row.lots} лотов · {row.share}%
                    </p>
                    <p className="text-[12.5px] text-muted">{row.meaning}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-white p-5">
            <h2 className="text-[16px] font-semibold">Что входит в ставку</h2>
            <ul className="mt-4 space-y-3">
              {includedSplit.map((row) => (
                <li key={row.label}>
                  <div className="flex justify-between text-[13px]">
                    <span>{row.label}</span>
                    <span className="font-mono">{row.share}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-fog">
                    <div className="h-full bg-navy" style={{ width: `${row.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] text-mist">Большинство слотов — только перевозка. Таможня и маркировка редко стоят в all-in, хотя для одежды они решают выпуск.</p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-brand/30 bg-white p-5">
          <h2 className="text-[16px] font-semibold">Как это читать</h2>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted">
            {rulesOfRead.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                {rule}
              </li>
            ))}
          </ul>
          <Link to="/auctions" className="mt-4 inline-block text-[13px] font-semibold underline underline-offset-4">
            К живой ленте
          </Link>
        </div>
      </div>
    </main>
  )
}
