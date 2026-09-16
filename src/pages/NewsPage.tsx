import { NewsCard } from '../components/NewsCard'
import { PageHero } from '../components/PageHero'
import { digests, editorialMethod } from '../content/news'

export function NewsPage() {
  return (
    <main>
      <PageHero kicker="Редакция" title={editorialMethod.title} dek="Чужой текст не перепечатываем. Берём проверяемый факт, пишем, что он меняет в лоте на wIaF." />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <ol className="mb-14 grid gap-3 md:grid-cols-2">
          {editorialMethod.steps.map((step, i) => (
            <li key={step} className="rounded-2xl border border-line bg-white p-5 text-[14.5px] leading-relaxed text-muted">
              <span className="font-mono text-[12px] text-brand">0{i + 1}</span>
              <p className="mt-2 text-ink">{step}</p>
            </li>
          ))}
        </ol>
        {digests.map((item) => (
          <NewsCard key={item.slug} item={item} />
        ))}
      </div>
    </main>
  )
}
