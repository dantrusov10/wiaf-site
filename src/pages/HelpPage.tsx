import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { helpBySlug, helpDocs, helpGroups, searchHelp, type HelpGroup } from '../content/help'
import { Magnetic } from '../components/Motion'
import { PageHero } from '../components/PageHero'

export function HelpHubPage() {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState<HelpGroup | 'all'>('all')
  const found = useMemo(() => {
    const list = searchHelp(q)
    return group === 'all' ? list : list.filter((d) => d.group === group)
  }, [q, group])

  return (
    <main>
      <header className="relative overflow-hidden border-b border-line bg-white">
        <div className="help-dots pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-24 text-center md:pt-28">
          <p className="text-[12px] font-medium text-brand">База</p>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight md:text-[2.35rem]">Как мы можем помочь?</h1>
          <p className="mt-2 text-[14.5px] text-muted">Лайфхаки, инструкции к инструментам, инсайты кабинета. Не дубль статей про рынок.</p>
          <label className="mt-6 flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2.5 text-left">
            <span className="sr-only">Поиск по базе</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Введите ваш запрос — холд, ТН ВЭД, директор…"
              className="w-full bg-transparent text-[15px] outline-none"
            />
          </label>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <button type="button" className={`rounded-md px-3 py-1.5 text-[12px] ${group === 'all' ? 'bg-brand text-white' : 'text-muted hover:text-ink'}`} onClick={() => setGroup('all')}>
              По всей базе
            </button>
            {helpGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`rounded-md px-3 py-1.5 text-[12px] ${group === g.id ? 'bg-brand text-white' : 'text-muted hover:text-ink'}`}
                onClick={() => setGroup(g.id)}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      {q || group !== 'all' ? (
        <div className="mx-auto max-w-6xl px-5 py-10">
          <p className="mb-4 font-mono text-[12px] text-mist">{found.length} материалов</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {found.map((d) => (
              <li key={d.slug}>
                <Link to={`/help/${d.slug}`} className="block rounded-lg border border-line bg-white px-4 py-3 hover:border-brand">
                  <p className="text-[15px] font-semibold">{d.title}</p>
                  <p className="mt-1 text-[13px] text-muted">{d.dek}</p>
                </Link>
              </li>
            ))}
          </ul>
          {found.length === 0 ? <p className="text-[14px] text-muted">Ничего не нашли. Попробуйте «холд», «директор», «КП».</p> : null}
        </div>
      ) : (
        <div className="bg-navy text-paper">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2">
            {helpGroups.map((g) => (
              <section key={g.id}>
                <h2 className="text-[15px] font-semibold tracking-tight">{g.title}</h2>
                <p className="mt-1 text-[12.5px] text-fog/80">{g.dek}</p>
                <ul className="mt-4 space-y-2">
                  {helpDocs
                    .filter((d) => d.group === g.id)
                    .map((d) => (
                      <li key={d.slug}>
                        <Link to={`/help/${d.slug}`} className="text-[14.5px] text-fog transition-colors hover:text-white">
                          {d.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

export function HelpArticlePage() {
  const { slug = '' } = useParams()
  const doc = helpBySlug(slug)
  if (!doc) {
    return (
      <main>
        <PageHero kicker="База" title="Материал не найден" dek="Вернитесь к поиску." />
        <div className="mx-auto max-w-3xl px-5 py-10">
          <Link to="/help" className="underline">
            К базе
          </Link>
        </div>
      </main>
    )
  }
  const group = helpGroups.find((g) => g.id === doc.group)

  return (
    <main>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-24 md:grid-cols-[15rem_1fr] md:pt-28">
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <p className="font-mono text-[10px] uppercase tracking-wide text-mist">Разделы</p>
            <nav className="mt-3 flex flex-col gap-3">
              {helpGroups.map((g) => (
                <div key={g.id}>
                  <p className="text-[12px] font-semibold">{g.title}</p>
                  <ul className="mt-1 space-y-1">
                    {helpDocs
                      .filter((d) => d.group === g.id)
                      .map((d) => (
                        <li key={d.slug}>
                          <Link to={`/help/${d.slug}`} className={`text-[12.5px] ${d.slug === doc.slug ? 'font-semibold text-brand' : 'text-muted hover:text-ink'}`}>
                            {d.title}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>
        <article>
          <Link to="/help" className="text-[13px] text-muted hover:text-ink">
            ← База
          </Link>
          <p className="mt-4 text-[12px] font-medium text-brand">{group?.title}</p>
          <h1 className="mt-1 max-w-2xl text-[1.75rem] font-semibold tracking-tight">{doc.title}</h1>
          <p className="mt-2 max-w-xl text-[15px] text-muted">{doc.dek}</p>
          <div className="mt-8 max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink">
            {doc.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          {doc.related?.length ? (
            <div className="mt-10 border-t border-line pt-6">
              <p className="text-[13px] font-semibold">Ещё по теме</p>
              <ul className="mt-2 space-y-1">
                {doc.related.map((s) => {
                  const r = helpBySlug(s)
                  if (!r) return null
                  return (
                    <li key={s}>
                      <Link to={`/help/${s}`} className="text-[14px] text-brand hover:underline">
                        {r.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
          <Magnetic className="mt-8">
            <Link to="/guide" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
              Гид: первый лот за 10 минут
            </Link>
          </Magnetic>
        </article>
      </div>
    </main>
  )
}
