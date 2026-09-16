import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { contests, formatContestDate } from '../content/contests'

export function ContestsPage() {
  const open = contests.filter((c) => c.status === 'open')
  const closed = contests.filter((c) => c.status === 'closed')

  return (
    <main>
      <PageHero
        kicker="Конкурсы площадки"
        title="Плотность ленты, не розыгрыш фуры"
        dek="Денежных призов нет. Зачёт идёт по состоявшимся часам и по ставкам на разные лоты. Комиссия 1%, ≤5 000 ₽ не отменяется."
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-lg font-semibold">Открыты</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {open.map((c) => (
            <ContestCard key={c.slug} slug={c.slug} title={c.title} audience={c.audience} dek={c.dek} closes={c.closes} status="Идёт" />
          ))}
        </div>
        <h2 className="mt-12 text-lg font-semibold">Закрыты</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {closed.map((c) => (
            <ContestCard key={c.slug} slug={c.slug} title={c.title} audience={c.audience} dek={c.dek} closes={c.closes} status="Итоги" />
          ))}
        </div>
      </div>
    </main>
  )
}

function ContestCard({
  slug,
  title,
  audience,
  dek,
  closes,
  status,
}: {
  slug: string
  title: string
  audience: string
  dek: string
  closes: string
  status: string
}) {
  return (
    <article className="rounded-xl border border-line bg-white p-5">
      <p className="font-mono text-[11px] text-mist">
        {status} · {audience} · до {formatContestDate(closes)}
      </p>
      <h3 className="mt-2 text-[18px] font-semibold">
        <Link to={`/contests/${slug}`} className="hover:text-brand">
          {title}
        </Link>
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{dek}</p>
      <Link to={`/contests/${slug}`} className="mt-4 inline-block text-[13px] font-semibold underline underline-offset-4">
        Условия
      </Link>
    </article>
  )
}
