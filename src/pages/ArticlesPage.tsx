import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  articleCategories,
  articles,
  articleBySlug,
  formatArticleDate,
  type Article,
  type ArticleCategory,
} from '../content/articles'
import { ArticleCover, ThemeIcon } from '../components/ThemeIcon'
import { RatesStrip } from '../components/RatesStrip'
import { Magnetic } from '../components/Motion'
import { InlineTryMagnet, PageLeadCta } from '../components/LeadMagnet'
import { ArticleComments } from '../components/ArticleComments'

export function ArticlesPage() {
  const [cat, setCat] = useState<ArticleCategory>('Все')
  const featured = articles.find((a) => a.featured) ?? articles[0]
  const list = useMemo(
    () => articles.filter((a) => (cat === 'Все' ? true : a.category === cat) && a.slug !== featured.slug),
    [cat, featured.slug],
  )

  return (
    <main className="bg-paper">
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-4">
        <p className="text-[13px] text-mist">
          <Link to="/" className="hover:text-ink">
            Главная
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-ink">Блог</span>
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Блог wIaF</h1>
            <p className="mt-2 max-w-2xl text-[15px] text-muted">
              Релизы модели торгов, деньги площадки, кресло директора — в формате экспертного блога.
            </p>
          </div>
          <ThemeIcon id="tips" size={88} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-6">
        <Magnetic strength={0.12} className="block w-full">
          <Link to={`/articles/${featured.slug}`} className="block">
            <ArticleCover
              icon={featured.icon}
              category={featured.category}
              meta={`${formatArticleDate(featured.published)} · ${featured.readMinutes} мин на чтение`}
              title={featured.title}
              large
            />
            <p className="mt-3 max-w-2xl text-[15px] text-muted">{featured.dek}</p>
            <span className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white">Подробнее →</span>
          </Link>
        </Magnetic>
      </div>

      <div className="mx-auto max-w-6xl px-5">
        <ul className="flex flex-wrap gap-2 border-b border-line pb-4">
          {articleCategories.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => setCat(c)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  cat === c ? 'bg-brand text-white' : 'bg-white text-muted ring-1 ring-line hover:text-ink'
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_17rem]">
        <div className="grid gap-5 sm:grid-cols-2">
          {list.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
          {list.length === 0 ? <p className="text-[14px] text-muted sm:col-span-2">В этой рубрике пока пусто.</p> : null}
        </div>
        <aside className="space-y-4">
          <RatesStrip />
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-[13px] font-semibold">Свежие материалы</p>
            <ul className="mt-3 space-y-3">
              {[...articles]
                .sort((a, b) => b.published.localeCompare(a.published))
                .slice(0, 5)
                .map((a) => (
                  <li key={a.slug} className="flex gap-2">
                    <ThemeIcon id={a.icon} size={36} />
                    <div className="min-w-0">
                      <Link to={`/articles/${a.slug}`} className="text-[13.5px] font-medium text-ink hover:text-brand">
                        {a.title}
                      </Link>
                      <p className="font-mono text-[10px] text-mist">{formatArticleDate(a.published)}</p>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
      <PageLeadCta variant="try" />
    </main>
  )
}

export function ArticlePage() {
  const { slug } = useParams()
  const one = articleBySlug(slug ?? '')
  if (!one) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-muted">Статья не найдена.</p>
        <Link to="/articles" className="mt-3 inline-block text-brand underline">
          К блогу
        </Link>
      </main>
    )
  }
  return (
    <main className="bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-[13px] text-mist">
          <Link to="/" className="hover:text-ink">
            Главная
          </Link>
          <span className="mx-1.5">›</span>
          <Link to="/articles" className="hover:text-ink">
            Блог
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-ink">{one.category}</span>
        </p>
        <div className="mt-6">
          <ArticleCover
            icon={one.icon}
            category={one.category}
            meta={`${formatArticleDate(one.published)} · ${one.readMinutes} мин на чтение`}
            title={one.title}
            large
          />
        </div>
        <p className="mt-6 text-[17px] text-muted">{one.dek}</p>
        <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-ink">
          {one.body.map((p, i) => (
            <div key={p.slice(0, 32)}>
              <p>{p}</p>
              {i === 1 ? <InlineTryMagnet /> : null}
            </div>
          ))}
        </div>
        <InlineTryMagnet />
        <div className="mt-10 flex flex-wrap gap-2">
          {one.tags.map((t) => (
            <span key={t} className="rounded-full bg-fog px-3 py-1 text-[12px] text-muted">
              {t}
            </span>
          ))}
        </div>
        <Link to="/articles" className="mt-8 inline-block text-[13px] font-semibold text-brand hover:underline">
          ← Все материалы блога
        </Link>
        <ArticleComments slug={one.slug} />
      </div>
      <PageLeadCta variant="try" />
    </main>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <ArticleCover icon={article.icon} category={article.category} />
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-[11px] text-mist">
          {formatArticleDate(article.published)} · {article.readMinutes} мин
        </p>
        <h3 className="mt-2 text-[16px] font-semibold leading-snug text-ink group-hover:text-brand">{article.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[13.5px] text-muted">{article.dek}</p>
      </div>
    </Link>
  )
}
