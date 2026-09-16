import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'

export function ForwarderPage() {
  return (
    <main>
      <PageHero
        kicker="Исполнитель · Forwarder"
        title="Пять ставок за час. Комиссия — только если выиграли."
        dek="1 000 ₽ на счёте — активация. Чтобы ставить — на балансе хватает на 1% от вашей ставки. Комиссия с победы: 1%, не более 5 000 ₽."
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ['Слепые торги', 'Не видно конкурентов и заказчика. Нет чата для сговора.'],
            [
              'Счёт под комиссию лота',
              'Холд = 1% ставки, но не больше потолка 5 000 ₽. Мелкий лот — меньше на счёте; крупный — не выше пяти тысяч. Параллельные ставки суммируют холд.',
            ],
            ['Состоялось ≥ 2', 'Одна ставка не делает торги. Это правило площадки.'],
            ['ЭДО', 'Акты после победы. Не проценты «за вход в базу».'],
          ].map(([t, d]) => (
            <article key={t} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-2xl font-medium">{t}</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{d}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/app/login?role=forwarder" className="rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white">
            Войти в кабинет
          </Link>
          <Link to="/app/register?role=forwarder" className="rounded-full border border-line px-5 py-2.5 text-[14px] font-semibold">
            Регистрация ЮЛ
          </Link>
          <Link to="/app/register?role=forwarder&type=ip" className="rounded-full border border-line px-5 py-2.5 text-[14px] font-semibold">
            Регистрация ИП
          </Link>
        </div>
      </div>
    </main>
  )
}
