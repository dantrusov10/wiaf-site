import { Link } from 'react-router-dom'
import { bestBid, isOpenLot, lotStatus, uniqueBidders } from '../app/engine'
import { useSession } from '../app/session'
import { FaqTeaser } from '../components/Faq'
import { Hero } from '../components/Hero'
import { HowItWorks } from '../components/HowItWorks'
import { HomeLeadStrip } from '../components/LeadMagnet'
import { Roles } from '../components/Roles'
import { ThemeIcon } from '../components/ThemeIcon'
import { articles } from '../content/articles'
import { moneyCopy } from '../content/money'
import { ruInt } from '../data'
import { useNow } from '../hooks'

export function HomePage() {
  const { lots } = useSession()
  const now = useNow(2000)
  const held = lots.filter((l) => lotStatus(l, now) === 'held')
  const live = lots.filter((l) => isOpenLot(l, now))
  const recentHeld = [...held].slice(0, 5)
  const cases = articles.filter((a) => a.category === 'Кейсы').slice(0, 3)

  return (
    <main>
      <Hero />

      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-mist">Плотность часов</p>
            <p className="mt-0.5 text-[15px] text-ink">
              В ленте <span className="font-semibold text-brand">{live.length}</span> · состоялось в демо{' '}
              <span className="font-semibold">{held.length}</span>
            </p>
            <p className="mt-1 max-w-xl text-[13px] text-muted">
              Плотность даёт приглашение «своих троих», не холод. KPI — состоявшийся час (≥2 ставки).
            </p>
          </div>
          <Link to="/guide" className="rounded-lg border border-line px-4 py-2.5 text-[13px] font-semibold hover:border-brand">
            Как собрать час →
          </Link>
        </div>
      </section>

      <HowItWorks />
      <HomeLeadStrip />

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Недавние состоявшиеся</h2>
              <p className="mt-1 text-[13px] text-muted">Вилка без имён фирм. Не обязанность закупить.</p>
            </div>
            <Link to="/auctions" className="text-[13px] font-medium underline">
              Вся лента
            </Link>
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-[13.5px]">
              <thead className="border-b border-line bg-fog/40 font-mono text-[10px] uppercase text-mist">
                <tr>
                  <th className="px-4 py-2.5">Код</th>
                  <th className="px-4 py-2.5">Маршрут</th>
                  <th className="hidden px-4 py-2.5 sm:table-cell">Win $</th>
                  <th className="px-4 py-2.5">Игроки</th>
                </tr>
              </thead>
              <tbody>
                {recentHeld.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono">
                      <Link to={`/auctions/${r.id}`} className="underline">
                        {r.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {r.from} → {r.to}
                    </td>
                    <td className="hidden px-4 py-3 font-mono sm:table-cell">${ruInt.format(bestBid(r.bids) ?? 0)}</td>
                    <td className="px-4 py-3 font-mono">{uniqueBidders(r.bids)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12.5px] text-mist">{moneyCopy.commissionLong}.</p>
        </div>
      </section>

      <Roles />

      <section className="border-t border-line bg-fog/30">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Кейсы под NDA</h2>
              <p className="mt-1 text-[13px] text-muted">Анонимные истории заказчиков и исполнителей. Без холодных цифр «рынка».</p>
            </div>
            <Link to="/articles?cat=Кейсы" className="text-[13px] font-medium underline">
              Все кейсы
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {cases.map((a) => (
              <Link
                key={a.slug}
                to={`/articles/${a.slug}`}
                className="rounded-2xl border border-line bg-white p-4 transition hover:border-brand/40"
              >
                <div className="flex items-start gap-3">
                  <ThemeIcon id={a.icon} size={48} />
                  <div>
                    <p className="font-mono text-[10px] text-mist">{a.category}</p>
                    <p className="mt-1 text-[14px] font-semibold leading-snug">{a.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="rounded-2xl border border-line bg-navy px-6 py-8 text-paper md:flex md:items-center md:justify-between md:gap-8 md:px-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-brand-2">Аукцион и инструменты</p>
              <h2 className="mt-1 text-2xl font-semibold">Слот — бесплатно. Tools — по желанию</h2>
              <p className="mt-2 max-w-lg text-[14px] text-fog">
                Торг не запираем подпиской. {moneyCopy.commissionShort}. «Закупка» / «Стол» — журнал и подсказки между часами.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 md:mt-0">
              <Link to="/app/register?role=importer" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
                Попробовать
              </Link>
              <Link to="/pricing" className="rounded-lg border border-white/30 px-4 py-2.5 text-[13px] font-semibold text-white">
                Тарифы
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FaqTeaser />
    </main>
  )
}
