import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { PageLeadCta } from '../components/LeadMagnet'

export function ImporterPage() {
  return (
    <main>
      <PageHero
        kicker="Заказчик · Importer"
        title="Выкладываете груз. Ставку снижают за вас."
        dek="Для импортёра площадка бесплатна. ЮЛ или ИП — резидент РФ. Форма лота фиксирует условия «за всё», чтобы потом не вылез курс и досыл."
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ['0 ₽', 'Нет комиссии, нет договора на сервис, нет абонентки.'],
            ['Исчерпывающее ТЗ', 'Маршрут, кг, м³, вид транспорта, таможня и страховка — по желанию.'],
            ['Слепой аукцион', 'Вы не видите экспедиторов до победы. Они не видят вас.'],
            ['Договор сами', 'После победы стороны сами заключают договор перевозки. Площадка его не подписывает.'],
          ].map(([t, d]) => (
            <article key={t} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-2xl font-medium">{t}</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{d}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/app/login?role=importer" className="rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white">
            Войти в кабинет
          </Link>
          <Link to="/app/register?role=importer" className="rounded-full border border-line px-5 py-2.5 text-[14px] font-semibold">
            Регистрация ЮЛ
          </Link>
          <Link to="/app/register?role=importer&type=ip" className="rounded-full border border-line px-5 py-2.5 text-[14px] font-semibold">
            Регистрация ИП
          </Link>
        </div>
      </div>
      <PageLeadCta variant="importer" />
    </main>
  )
}
