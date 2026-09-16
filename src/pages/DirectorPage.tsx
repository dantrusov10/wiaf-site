import { Link } from 'react-router-dom'
import { PageLeadCta, TryCtaButtons } from '../components/LeadMagnet'
import { PageHero } from '../components/PageHero'

export function DirectorPage() {
  return (
    <main>
      <PageHero
        kicker="В кабинете"
        title="Режим «Смотреть как директор»"
        dek="Не отдельный продукт и не рассылка. После входа в шапке ЛК выберите роль — сводка часов, журнал и команда. Регистрация бесплатная."
      />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <article className="rounded-2xl border border-line bg-white p-6 md:p-8">
          <h2 className="text-lg font-semibold">Как открыть</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14.5px] leading-relaxed text-muted">
            <li>Зарегистрируйтесь или войдите как заказчик / исполнитель.</li>
            <li>В шапке кабинета — «Смотреть как» → Директор.</li>
            <li>Меню сменится на сводку, отчёты, журнал и команду.</li>
          </ol>
          <p className="mt-4 text-[14px] text-muted">
            Письма с итогами — опция внутри кабинета, не отдельный вход с главной.
          </p>
          <div className="mt-6">
            <TryCtaButtons />
          </div>
          <Link to="/app/login" className="mt-4 inline-block text-[13px] font-semibold text-brand underline">
            Уже есть аккаунт — войти
          </Link>
        </article>
      </div>
      <PageLeadCta variant="try" />
    </main>
  )
}
