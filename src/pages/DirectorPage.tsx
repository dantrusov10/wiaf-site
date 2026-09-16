import { Link } from 'react-router-dom'
import { PageLeadCta, TryCtaButtons } from '../components/LeadMagnet'
import { PageHero } from '../components/PageHero'

export function DirectorPage() {
  return (
    <main>
      <PageHero
        kicker="В кабинете"
        title="Режим директора"
        dek="Не отдельная регистрация. После входа в шапке кабинета выберите «Смотреть как → Директор»: сводка часов, отчёты и команда."
      />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <article className="rounded-2xl border border-line bg-white p-6 md:p-8">
          <h2 className="text-lg font-semibold">Как открыть</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14.5px] leading-relaxed text-muted">
            <li>Зарегистрируйтесь или войдите как заказчик или исполнитель.</li>
            <li>В шапке кабинета нажмите «Смотреть как» и выберите «Директор».</li>
            <li>Откроются сводка, отчёты, журнал и команда.</li>
          </ol>
          <p className="mt-4 text-[14px] text-muted">Письма с итогами часа настраиваются внутри кабинета.</p>
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
