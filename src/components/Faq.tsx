import { Link } from 'react-router-dom'
import { faqItems } from '../content/faq'
import { prod } from '../data'

export function FaqList() {
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqItems.map((item) => (
        <details key={item.q} className="group py-4">
          <summary className="cursor-pointer list-none font-display text-xl font-medium tracking-tight marker:content-none">
            <span className="flex items-start justify-between gap-4">
              {item.q}
              <span className="font-mono text-brand group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  )
}

export function FaqTeaser() {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-xl font-semibold">Вопросы из чата</h2>
          <Link
            to="/help"
            className="mt-4 inline-block text-[14px] font-semibold text-ink underline decoration-brand/60 underline-offset-4"
          >
            Все из базы
          </Link>
          <p className="mt-4 max-w-sm text-[13.5px] text-muted">
            Юридический текст — в{' '}
            <a href={prod.rules} className="underline underline-offset-4">
              правилах на wiaf.ru
            </a>
            .
          </p>
        </div>
        <FaqList />
      </div>
    </section>
  )
}
