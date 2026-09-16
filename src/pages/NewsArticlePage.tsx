import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { formatDigestDate, getDigest } from '../content/news'

export function NewsArticlePage() {
  const { slug } = useParams()
  const item = slug ? getDigest(slug) : undefined

  if (!item) {
    return (
      <main>
        <PageHero kicker="404" title="Материала нет" dek="Проверьте адрес или вернитесь в дайджест." />
        <div className="mx-auto max-w-6xl px-5 py-10">
          <Link to="/news" className="font-semibold underline underline-offset-4">
            Все новости
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <PageHero kicker={item.topics.join(' · ')} title={item.title} dek={item.dek} />
      <article className="mx-auto max-w-3xl px-5 py-14">
        <p className="font-mono text-[12px] text-mist">
          Дайджест wIaF · {formatDigestDate(item.published)}
        </p>
        <p className="mt-6 rounded-xl border border-line bg-white p-4 text-[14px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">Почему это нам:</span> {item.why}
        </p>
        <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-ink/90">
          {item.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <p className="mt-8 rounded-xl border border-brand/25 bg-white p-4 text-[14.5px] leading-relaxed">
          <span className="font-semibold">Что менять в лоте.</span> {item.auctionNote}
        </p>
        <p className="mt-8 font-mono text-[12px] text-mist">
          Источник факта:{' '}
          <a href={item.source.url} className="text-ink underline underline-offset-4">
            {item.source.name}
          </a>
          , {item.source.date}. Текст — пересказ wIaF, не копия статьи.
        </p>
        <Link to="/news" className="mt-10 inline-block font-semibold underline underline-offset-4">
          ← К дайджесту
        </Link>
      </article>
    </main>
  )
}
