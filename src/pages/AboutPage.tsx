import { PageHero } from '../components/PageHero'

export function AboutPage() {
  return (
    <main>
      <PageHero
        kicker="ООО «ВИАФ»"
        title="Площадка слепых аукционов на перевозку в РФ"
        dek="Юрлицо с декабря 2025 года. Продукт — не карго и не биржа объявлений, а час торгов на понижение ставки."
      />
      <div className="mx-auto max-w-3xl px-5 py-14 text-[16px] leading-relaxed text-muted">
        <p>
          Импортёр (в кабинете — Заказчик) выкладывает условия бесплатно. Экспедитор (Исполнитель)
          снижает ставку вслепую. Комиссия 1% только с победителя, без потолка 5 000 ₽.
        </p>
        <dl className="mt-10 grid gap-4 border-t border-line pt-8 font-mono text-[13px] text-ink">
          <div>
            <dt className="text-mist">Юрлицо</dt>
            <dd>ООО «ВИАФ»</dd>
          </div>
          <div>
            <dt className="text-mist">ИНН / ОГРН</dt>
            <dd>5043092742 · 1255000116799</dd>
          </div>
          <div>
            <dt className="text-mist">Регистрация</dt>
            <dd>19.12.2025 · Любучаны, МО · гендир Кравцов С. В.</dd>
          </div>
          <div>
            <dt className="text-mist">Прод</dt>
            <dd>
              <a href="https://wiaf.ru" className="underline underline-offset-4">
                wiaf.ru
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </main>
  )
}
