import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { PageLeadCta } from '../components/LeadMagnet'

export function ImporterPage() {
  return (
    <main>
      <PageHero
        kicker="Заказчик"
        title="Выкладываете груз. Ставку снижают за вас."
        dek="Для заказчика площадка бесплатна. ЮЛ или ИП — резидент РФ. В лоте фиксируете условия «за всё», чтобы после часа не выяснилось «это отдельно»."
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ['0 ₽', 'Нет комиссии площадки, нет абонентской платы за торги.'],
            ['Полное описание', 'Маршрут, кг, м³, транспорт. Таможня и страховка — только если входят в цену ставки.'],
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
          <Link to="/app/register?role=importer" className="rounded-lg bg-brand px-5 py-2.5 text-[14px] font-semibold text-white">
            Попробовать
          </Link>
          <Link to="/app/login?role=importer" className="rounded-lg border border-line px-5 py-2.5 text-[14px] font-semibold">
            Войти
          </Link>
        </div>
      </div>
      <PageLeadCta variant="importer" />
    </main>
  )
}
