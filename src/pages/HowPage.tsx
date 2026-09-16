import { Link } from 'react-router-dom'
import { howSteps } from '../components/HowItWorks'
import { PageHero } from '../components/PageHero'
import { PageLeadCta } from '../components/LeadMagnet'

const down = [
  { who: 'Первый', usd: 4680 },
  { who: 'Второй', usd: 3900 },
  { who: 'Третий', usd: 3120 },
]

export function HowPage() {
  return (
    <main>
      <PageHero
        kicker="Механика"
        title="Как проходит аукцион wIaF"
        dek="Не биржа объявлений и не карго-чат. Импортёр фиксирует условия, экспедиторы 60 минут снижают ставку вслепую."
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ol className="grid gap-4">
            {howSteps.map((step) => (
              <li key={step.n} className="rounded-2xl border border-line bg-white p-6 md:p-8">
                <p className="font-mono text-[12px] text-brand">{step.n}</p>
                <h2 className="mt-2 font-display text-3xl font-medium">{step.title}</h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
          <aside className="h-fit rounded-2xl border border-line bg-navy p-6 text-paper">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist">Обычный торг vs час wIaF</p>
            <p className="mt-3 text-[15px] leading-relaxed text-fog">
              В чате цена ползёт вверх от «набросайте КП». Здесь цена ползёт вниз от первой ставки. Побеждает наименьшая.
            </p>
            <ol className="mt-6 space-y-3">
              {down.map((row, i) => (
                <li key={row.who} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0">
                  <span className="text-[13px] text-mist">
                    {i + 1}. {row.who}
                  </span>
                  <span className="clock font-mono text-[18px] text-brand-2">${row.usd.toLocaleString('ru-RU')}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[12.5px] text-mist">Пример слота 26-28: трикотаж Гуанчжоу→Москва, 3 игрока. Чужие ставки вживую не видны — здесь разбор после часа.</p>
          </aside>
        </div>
        <div className="mt-10 rounded-2xl border border-line bg-white p-6 text-[14.5px] leading-relaxed text-muted">
          <p>
            Полный текст для этой тестовой площадки —{' '}
            <Link to="/rules" className="font-semibold text-ink underline underline-offset-4">
              правила на этом сайте
            </Link>
            . Кратко: резиденты РФ, слепые торги, шаг и срок задаются в лоте, комиссия только с победителя (1%, ≤5 000 ₽).
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link to="/faq" className="font-semibold text-ink underline underline-offset-4">
              FAQ
            </Link>
            <Link to="/analytics" className="font-semibold text-ink underline underline-offset-4">
              Как читать цифры
            </Link>
          </div>
        </div>
      </div>
      <PageLeadCta variant="guide" />
    </main>
  )
}
