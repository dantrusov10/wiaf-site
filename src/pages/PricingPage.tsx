import { Check, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { PageLeadCta } from '../components/LeadMagnet'
import {
  auctionMoney,
  forwarderHeroes,
  forwarderMatrix,
  importerHeroes,
  importerMatrix,
  teaserCards,
  yearlyNotes,
  type Cell,
  type MatrixRow,
  type PlanHero,
} from '../content/pricing'

function CellView({ value }: { value: Cell }) {
  if (value === true) {
    return <Check className="mx-auto size-4 text-ok" strokeWidth={2.5} aria-label="есть" />
  }
  if (value === false) {
    return <Minus className="mx-auto size-4 text-mist" strokeWidth={2} aria-label="нет" />
  }
  return <span className="text-[12.5px] leading-snug text-ink">{value}</span>
}

function PlanHeroCard({ plan, accent }: { plan: PlanHero; accent: 'brand' | 'brand-2' }) {
  const ring =
    accent === 'brand'
      ? plan.highlight
        ? 'border-brand bg-brand/5'
        : 'border-line bg-white'
      : plan.highlight
        ? 'border-brand-2/40 bg-brand-2/5'
        : 'border-line bg-white'
  const badge = accent === 'brand' ? 'text-brand' : 'text-brand-2'

  return (
    <article className={`flex flex-col rounded-2xl border p-5 ${ring}`}>
      {plan.highlight ? (
        <p className={`font-mono text-[10px] uppercase tracking-wide ${badge}`}>Главная ценность</p>
      ) : (
        <p className="font-mono text-[10px] uppercase tracking-wide text-mist">Ярус</p>
      )}
      <h3 className="mt-1 text-lg font-semibold">{plan.name}</h3>
      <p className="mt-3 font-display text-3xl font-medium tracking-tight">
        {plan.price}
        {plan.priceNote ? (
          <span className="ml-1 text-[14px] font-sans font-normal text-mist">{plan.priceNote}</span>
        ) : null}
      </p>
      <dl className="mt-4 space-y-3 text-[13px] leading-snug">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-mist">Для кого</dt>
          <dd className="mt-0.5 text-ink">{plan.forWhom}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-mist">Что получаете</dt>
          <dd className="mt-0.5 font-medium text-ink">{plan.outcome}</dd>
        </div>
      </dl>
      <p className="mt-auto pt-5 text-[12px] text-mist">{plan.cta} · оплата после пилота</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/app/register?role=${accent === 'brand' ? 'importer' : 'forwarder'}`}
          className={`inline-flex rounded-lg px-3.5 py-2 text-[13px] font-semibold ${
            accent === 'brand' ? 'bg-brand text-white hover:bg-navy-2' : 'bg-navy text-white hover:bg-navy-2'
          }`}
        >
          Попробовать
        </Link>
        <Link to="/app/login" className="inline-flex rounded-lg border border-line px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-brand">
          Войти
        </Link>
      </div>
    </article>
  )
}

function CompareMatrix({
  rows,
  midLabel,
  proLabel,
}: {
  rows: MatrixRow[]
  midLabel: string
  proLabel: string
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[40rem] text-left">
        <thead>
          <tr className="border-b border-line bg-fog/60">
            <th className="px-4 py-3 text-[12px] font-semibold text-ink sm:px-5">Что сравниваем</th>
            <th className="w-[18%] px-2 py-3 text-center text-[12px] font-semibold">Free</th>
            <th className="w-[22%] px-2 py-3 text-center text-[12px] font-semibold">{midLabel}</th>
            <th className="w-[22%] px-2 py-3 text-center text-[12px] font-semibold">{proLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.feature} className="border-b border-line last:border-0">
              <td className="px-4 py-3.5 sm:px-5">
                <p className="text-[13.5px] font-medium text-ink">{r.feature}</p>
                <p className="mt-0.5 text-[12px] text-mist">{r.why}</p>
              </td>
              <td className="px-2 py-3.5 text-center align-middle">
                <CellView value={r.free} />
              </td>
              <td className="px-2 py-3.5 text-center align-middle">
                <CellView value={r.mid} />
              </td>
              <td className="px-2 py-3.5 text-center align-middle">
                <CellView value={r.pro} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PricingPage() {
  return (
    <main>
      <PageHero
        kicker="Тарифы"
        title="Free — только аукцион. Инструменты — в подписке"
        dek="На бесплатном ярусе торгуете слотами. Журнал, калькуляторы, тарифы и КП открываются с «Закупки» / «Стола»."
      />

      <div className="mx-auto max-w-6xl space-y-16 px-5 py-10">
        <section className="rounded-2xl border border-line bg-white p-6 md:p-8">
          <h2 className="text-xl font-semibold">{auctionMoney.title}</h2>
          <p className="mt-2 max-w-2xl text-[14px] text-muted">{auctionMoney.lead}</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {auctionMoney.points.map((p) => (
              <li key={p.t} className="rounded-xl bg-fog/80 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-brand">{p.t}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink">{p.d}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-brand">Заказчик</p>
              <h2 className="mt-1 text-xl font-semibold">Три яруса закупки</h2>
              <p className="mt-1 max-w-xl text-[14px] text-muted">
                Free — только слот. Закупка — все инструменты. Pro — команда и проверки поставщиков.
              </p>
            </div>
            <Link to="/app/login?role=importer" className="text-[13px] font-semibold underline">
              Кабинет заказчика
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {importerHeroes.map((p) => (
              <PlanHeroCard key={p.id} plan={p} accent="brand" />
            ))}
          </div>
          <h3 className="mt-10 text-[15px] font-semibold">Что именно отличается</h3>
          <p className="mt-1 text-[13px] text-muted">Не «всё из Free + …», а строка за строкой — где ценность появляется.</p>
          <div className="mt-4">
            <CompareMatrix rows={importerMatrix} midLabel="Закупка" proLabel="Pro" />
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-brand-2">Исполнитель</p>
              <h2 className="mt-1 text-xl font-semibold">Три яруса стола</h2>
              <p className="mt-1 max-w-xl text-[14px] text-muted">
                Free — только ставки. Стол — все инструменты. Pro — несколько логистов и плеч.
              </p>
            </div>
            <Link to="/app/login?role=forwarder" className="text-[13px] font-semibold underline">
              Кабинет исполнителя
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {forwarderHeroes.map((p) => (
              <PlanHeroCard key={p.id} plan={p} accent="brand-2" />
            ))}
          </div>
          <h3 className="mt-10 text-[15px] font-semibold">Что именно отличается</h3>
          <p className="mt-1 text-[13px] text-muted">Правила счёта и 1% с победы — на всех ярусах. Инструменты — со «Стола».</p>
          <div className="mt-4">
            <CompareMatrix rows={forwarderMatrix} midLabel="Стол" proLabel="Pro" />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6 md:max-w-2xl">
          <h2 className="text-lg font-semibold">Как читать цены</h2>
          <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
            {yearlyNotes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-navy" />
                {n}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <PageLeadCta variant="pricing" />
    </main>
  )
}

export function PricingTeaser() {
  return (
    <section className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-brand">Тарифы</p>
            <h2 className="mt-1 text-xl font-semibold">Free — слот. Инструменты — по желанию</h2>
            <p className="mt-2 max-w-xl text-[14px] text-muted">
              Аукцион подпиской не запираем. Журнал и landed — в «Закупке» / «Столе».
            </p>
          </div>
          <Link to="/pricing" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
            Сравнить ярусы
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {teaserCards.map((x) => (
            <div key={x.k} className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="font-mono text-[10px] uppercase text-mist">{x.k}</p>
              <p className="mt-1 text-[18px] font-semibold">{x.v}</p>
              <p className="text-[12px] text-muted">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
