import { Link } from 'react-router-dom'
import { DirectorLeadForm, PageLeadCta } from '../components/LeadMagnet'
import { PageHero } from '../components/PageHero'

export function DirectorPage() {
  return (
    <main>
      <PageHero
        kicker="Директору"
        title="Сводка часов, сравнение с рынком и автоотчёты"
        dek="В ЛК — режим «смотреть как директор»: аналитика, журнал действий, команда и автоотчёты. Регистрация бесплатная. Комиссия с победителя 1%, не более 5 000 ₽."
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold">Что в кабинете и в письме</h2>
            <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-muted">
              <li>Сыгранные конкурсы: плечо, объём, игроки, победа.</li>
              <li>Условия лота (Incoterm, страховка, что входит в ставку).</li>
              <li>Сравнение с полосой «как обычно играют» похожие аукционы.</li>
              <li>Автоотправка на почту директора после каждого состоявшегося часа — или сводка вручную.</li>
            </ul>
            <div className="mt-6">
              <DirectorLeadForm />
            </div>
          </article>
          <article className="rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold">Где открыть</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              Войдите как заказчик или исполнитель → в шапке ЛК «Смотреть как» выберите роль (директор / руководитель /
              сотрудник). Меню и доступ меняются целиком. Подписка на инструменты — в режиме операционки.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/app/login?role=importer" className="inline-flex rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
                Войти как заказчик
              </Link>
              <Link to="/articles" className="inline-flex rounded-lg border border-line px-4 py-2.5 text-[13px] font-medium">
                Статьи
              </Link>
              <Link to="/rates" className="inline-flex rounded-lg border border-line px-4 py-2.5 text-[13px] font-medium">
                Курсы ЦБ
              </Link>
            </div>
          </article>
        </div>
      </div>
      <PageLeadCta variant="importer" />
    </main>
  )
}
