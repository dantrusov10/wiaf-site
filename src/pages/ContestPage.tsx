import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { formatContestDate, getContest } from '../content/contests'

export function ContestPage() {
  const { slug } = useParams()
  const item = slug ? getContest(slug) : undefined

  if (!item) {
    return (
      <main>
        <PageHero kicker="404" title="Конкурса нет" dek="Вернитесь к списку." />
        <div className="mx-auto max-w-6xl px-5 py-10">
          <Link to="/contests" className="font-semibold underline underline-offset-4">
            Все конкурсы
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <PageHero
        kicker={`${item.status === 'open' ? 'Идёт' : 'Закрыт'} · ${item.audience}`}
        title={item.title}
        dek={item.dek}
      />
      <article className="mx-auto max-w-3xl px-5 py-14">
        <p className="font-mono text-[12px] text-mist">
          {formatContestDate(item.opens)} — {formatContestDate(item.closes)}
        </p>
        <p className="mt-6 rounded-xl border border-line bg-white p-4 text-[14.5px] leading-relaxed">
          <span className="font-semibold">Что получает победитель. </span>
          {item.prize}
        </p>
        <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-ink/90">
          {item.body.map((p) => (
            <p key={p.slice(0, 28)}>{p}</p>
          ))}
        </div>
        <h2 className="mt-10 text-lg font-semibold">Правила зачёта</h2>
        <ul className="mt-3 space-y-2 text-[14.5px] leading-relaxed text-muted">
          {item.rules.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
              {rule}
            </li>
          ))}
        </ul>
        {item.results ? (
          <div className="mt-10">
            <h2 className="text-lg font-semibold">Итоги</h2>
            <ul className="mt-4 space-y-3">
              {item.results.map((row) => (
                <li key={row.place} className="rounded-xl border border-line bg-white p-4">
                  <p className="font-mono text-[11px] text-mist">{row.place}</p>
                  <p className="mt-1 font-semibold">{row.who}</p>
                  <p className="mt-1 text-[14px] text-muted">{row.note}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/app/login?role=importer" className="rounded-lg bg-navy px-4 py-2 text-[13px] font-semibold text-white">
            Кабинет заказчика
          </Link>
          <Link to="/app/login?role=forwarder" className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold">
            Кабинет исполнителя
          </Link>
          <Link to="/contests" className="px-4 py-2 text-[13px] font-semibold underline underline-offset-4">
            Все конкурсы
          </Link>
        </div>
      </article>
    </main>
  )
}
