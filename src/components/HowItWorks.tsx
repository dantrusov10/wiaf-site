import { Link } from 'react-router-dom'
import { ThemeIcon, type ThemeIconId } from './ThemeIcon'
import { ShineCard } from './Motion'

export const howSteps: { n: string; title: string; text: string; icon: ThemeIconId }[] = [
  {
    n: '1',
    title: 'Импортёр описывает перевозку',
    text: 'Маршрут, объём, вес, транспорт. Таможня и страховка — если входят в ставку.',
    icon: 'route',
  },
  {
    n: '2',
    title: 'Слепые торги',
    text: 'До пяти ставок, шаг из лота. Не видно конкурентов. Состоялись только при ≥ 2 игроках.',
    icon: 'auction',
  },
  {
    n: '3',
    title: 'Победитель получает контакты',
    text: 'Наименьшая ставка автоматом. Комиссия 1% с победителя, не более 5к. Импортёру бесплатно.',
    icon: 'deal',
  },
]

export function HowItWorks() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Как проходит час</h2>
            <p className="mt-1 text-[13px] text-muted">Три шага. Без 13 галочек на первом экране.</p>
          </div>
          <Link to="/how" className="text-[13px] font-medium underline underline-offset-4">
            Правила подробно
          </Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {howSteps.map((step) => (
            <ShineCard key={step.n} className="rounded-xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-[12px] text-brand">{step.n}</p>
                <ThemeIcon id={step.icon} size={88} />
              </div>
              <h3 className="mt-2 text-[16px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{step.text}</p>
            </ShineCard>
          ))}
        </div>
      </div>
    </section>
  )
}
