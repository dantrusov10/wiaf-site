import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { PageLeadCta } from '../components/LeadMagnet'

export function ForwarderPage() {
  return (
    <main>
      <PageHero
        kicker="Исполнитель"
        title="Пять ставок за час. Комиссия — только если выиграли."
        dek="На счёте от 1 000 ₽. Чтобы поставить ставку — на балансе должно хватать на 1% от неё (не больше 5 000 ₽). Комиссия с победы: 1%, не более 5 000 ₽."
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ['Слепые торги', 'Не видно конкурентов и заказчика. Нет чата для сговора.'],
            [
              'Деньги на счёте',
              'Под ставку резервируется 1% от суммы в рублях, максимум 5 000 ₽. На мелком лоте — меньше, на крупном — не выше пяти тысяч. Если ставите на несколько лотов сразу — суммы складываются.',
            ],
            ['Минимум двое', 'Одна ставка не делает торги состоявшимися. Это правило площадки.'],
            ['ЭДО', 'Акты после победы. Нет платы «за вход в базу».'],
          ].map(([t, d]) => (
            <article key={t} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-2xl font-medium">{t}</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{d}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/app/register?role=forwarder" className="rounded-lg bg-brand px-5 py-2.5 text-[14px] font-semibold text-white">
            Попробовать
          </Link>
          <Link to="/app/login?role=forwarder" className="rounded-lg border border-line px-5 py-2.5 text-[14px] font-semibold">
            Войти
          </Link>
        </div>
      </div>
      <PageLeadCta variant="forwarder" />
    </main>
  )
}
