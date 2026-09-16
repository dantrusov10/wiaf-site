import { Link } from 'react-router-dom'
import type { Digest } from '../content/news'
import { formatDigestDate } from '../content/news'

export function NewsCard({ item }: { item: Digest }) {
  return (
    <article className="border-b border-line py-6 first:pt-0">
      <p className="font-mono text-[11px] text-mist">
        {formatDigestDate(item.published)}
        <span className="mx-2">·</span>
        {item.topics.join(' · ')}
      </p>
      <h3 className="mt-2 font-display text-2xl font-medium tracking-tight">
        <Link to={`/news/${item.slug}`} className="hover:text-brand">
          {item.title}
        </Link>
      </h3>
      <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">{item.dek}</p>
      <p className="mt-3 font-mono text-[11px] text-mist">
        Источник факта: {item.source.name}
      </p>
    </article>
  )
}
