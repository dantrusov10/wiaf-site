import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { ThemeIcon } from '../components/ThemeIcon'
import { legalNote, legalParagraphs, legalSummary, legalTabs, type LegalTab } from '../content/legal'

function LegalBlock({ text }: { text: string }) {
  if (text.startsWith('#### ')) {
    return <h2 className="pt-6 text-xl font-semibold tracking-tight text-ink">{text.replace(/^#+\s*/, '')}</h2>
  }
  if (text.startsWith('## ')) {
    return <h2 className="pt-8 text-xl font-semibold tracking-tight text-ink">{text.replace(/^#+\s*/, '')}</h2>
  }
  if (text.startsWith('### ')) {
    return <h3 className="pt-5 text-base font-semibold text-ink">{text.replace(/^#+\s*/, '')}</h3>
  }
  if (text.startsWith('# ')) {
    return <h2 className="pt-4 text-lg font-semibold text-ink">{text.replace(/^#+\s*/, '')}</h2>
  }
  if (text.startsWith('(') && text.includes('УТВЕРЖД')) {
    return <p className="text-[13px] italic text-mist">{text}</p>
  }
  // term definition (ALL CAPS start)
  if (/^[А-ЯЁA-Z]{3,}/.test(text) && (text.includes(' – ') || text.includes(' - '))) {
    const sep = text.includes(' – ') ? ' – ' : ' - '
    const i = text.indexOf(sep)
    if (i > 0 && i < 120) {
      return (
        <p className="rounded-xl border border-line/70 bg-white px-4 py-3 text-[14px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">{text.slice(0, i)}</span>
          {sep}
          {text.slice(i + sep.length)}
        </p>
      )
    }
  }
  return <p className="text-[14.5px] leading-relaxed text-muted">{text}</p>
}

export function RulesPage() {
  const [tab, setTab] = useState<LegalTab>('summary')
  const body = tab === 'summary' ? legalSummary : legalParagraphs(tab)

  return (
    <main>
      <PageHero
        kicker="Правовые документы"
        title="Правила, регламент и обработка ПД"
        dek="Полный перенос документов с прода на этот тестовый сайт — без ухода на wiaf.ru."
      />
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-start gap-4 rounded-2xl border border-line bg-white p-4">
          <ThemeIcon id="rules" size={88} />
          <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-muted">{legalNote}</p>
        </div>

        <ul className="flex flex-wrap gap-2 border-b border-line pb-3">
          {legalTabs.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  tab === t.id ? 'bg-brand text-white' : 'bg-white text-muted ring-1 ring-line hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        <article className="mt-6 space-y-3">
          {body.map((p, i) => (
            <LegalBlock key={i} text={p} />
          ))}
        </article>

        <div className="mt-10 flex flex-wrap gap-3 text-[14px]">
          <Link to="/privacy" className="rounded-lg border border-line bg-white px-3 py-2 font-medium hover:border-brand">
            Конфиденциальность
          </Link>
          <Link to="/faq" className="rounded-lg border border-line bg-white px-3 py-2 font-medium hover:border-brand">
            FAQ
          </Link>
          <Link to="/pricing" className="rounded-lg border border-line bg-white px-3 py-2 font-medium hover:border-brand">
            Тарифы
          </Link>
        </div>
      </div>
    </main>
  )
}
