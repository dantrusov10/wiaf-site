import { Link } from 'react-router-dom'
import { Bars, Stat } from '../app/charts'
import { bestBid, isOpenLot, lotStatus, uniqueBidders } from '../app/engine'
import { useSession } from '../app/session'
import { FaqTeaser } from '../components/Faq'
import { Hero } from '../components/Hero'
import { HowItWorks } from '../components/HowItWorks'
import { HomeLeadStrip } from '../components/LeadMagnet'
import { NewsCard } from '../components/NewsCard'
import { RatesStrip } from '../components/RatesStrip'
import { Roles } from '../components/Roles'
import { ThemeIcon, ThemeTileRow } from '../components/ThemeIcon'
import { articles } from '../content/articles'
import { digests } from '../content/news'
import { weekSeries } from '../demo/seed'
import { ruInt } from '../data'
import { useNow } from '../hooks'
import { PricingTeaser } from './PricingPage'

export function HomePage() {
  const { lots } = useSession()
  const now = useNow(2000)
  const formed = lots.filter((l) => !l.isDraft).length
  const held = lots.filter((l) => lotStatus(l, now) === 'held')
  const live = lots.filter((l) => isOpenLot(l, now))
  const heldRate = formed ? Math.round((held.length / formed) * 100) : 0

  return (
    <main>
      <Hero />

      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl space-y-4 px-5 py-10">
          <RatesStrip />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Сформировано" value={String(formed)} hint="не шаблоны" spark={weekSeries.map((w) => w.formed)} />
            <Stat label="Состоялось" value={String(held.length)} hint={`${heldRate}% слотов с ≥2 игроками`} spark={weekSeries.map((w) => w.held)} />
            <Stat label="Сейчас в ленте" value={String(live.length)} hint="очередь + идёт" />
            <Stat label="Комиссия с победы" value="1%" hint="не более 5к" />
          </div>
          <ThemeTileRow
            className="pt-2"
            items={[
              { id: 'auction', label: 'Аукционы', to: '/auctions' },
              { id: 'plan', label: 'Тарифы', to: '/pricing' },
              { id: 'director', label: 'Директору', to: '/director' },
              { id: 'rules', label: 'Правила', to: '/rules' },
              { id: 'rates', label: 'Курсы ЦБ', to: '/rates' },
              { id: 'tips', label: 'Блог', to: '/articles' },
            ]}
          />
        </div>
      </section>

      <HowItWorks />
      <HomeLeadStrip />

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="mt-2 text-xl font-semibold">Прошедшие часы</h2>
              <p className="mt-1 text-[13px] text-muted">Вилка без имён фирм. Не обязанность закупить.</p>
            </div>
            <Link to="/auctions" className="text-[13px] font-medium underline">
              Вся лента
            </Link>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-line bg-paper p-4">
              <p className="text-[13px] font-semibold">Сформировано / состоялось по неделям</p>
              <p className="mb-3 text-[12px] text-mist">Тёмные — выложено, синие — состоялось</p>
              <Bars a={weekSeries.map((w) => w.formed)} b={weekSeries.map((w) => w.held)} labels={weekSeries.map((w) => w.w)} />
            </div>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[420px] text-left text-[13px]">
                <thead className="border-b border-line font-mono text-[10px] uppercase text-mist">
                  <tr>
                    <th className="px-3 py-2">Код</th>
                    <th className="px-3 py-2">Маршрут</th>
                    <th className="px-3 py-2">Win $</th>
                    <th className="px-3 py-2">n</th>
                  </tr>
                </thead>
                <tbody>
                  {held.slice(0, 8).map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-0">
                      <td className="px-3 py-2 font-mono">
                        <Link to={`/auctions/${r.id}`} className="underline">
                          {r.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {r.from} → {r.to}
                      </td>
                      <td className="px-3 py-2 font-mono">${ruInt.format(bestBid(r.bids) ?? 0)}</td>
                      <td className="px-3 py-2">{uniqueBidders(r.bids)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Roles />
      <PricingTeaser />

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Блог</h2>
              <p className="mt-1 text-[13px] text-muted">Как на itman.ru/blog — карточки, рубрики, featured.</p>
            </div>
            <Link to="/articles" className="text-[13px] font-medium underline">
              Все материалы
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <Link
                key={a.slug}
                to={`/articles/${a.slug}`}
                className="overflow-hidden rounded-2xl border border-line bg-paper transition hover:border-brand/40"
              >
                <div className="flex items-center justify-center bg-[#f4f5f7] py-6">
                  <ThemeIcon id={a.icon} size={104} />
                </div>
                <div className="p-4">
                  <p className="font-mono text-[10px] text-mist">{a.category}</p>
                  <p className="mt-1 text-[14px] font-semibold leading-snug">{a.title}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <p className="mb-3 text-[13px] font-semibold text-muted">Дайджесты с источниками</p>
            {digests.slice(0, 2).map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>
      <FaqTeaser />
    </main>
  )
}
