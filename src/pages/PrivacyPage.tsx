import { PageHero } from '../components/PageHero'

export function PrivacyPage() {
  return (
    <main>
      <PageHero
        kicker="152-ФЗ"
        title="Конфиденциальность"
        dek="Это черновик структуры, не действующая политика. На проде отдельного /privacy пока нет — его нужно будет утвердить юристом."
      />
      <div className="mx-auto max-w-3xl px-5 py-14 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>Оператор: ООО «ВИАФ». Контакт: info@wiaf.ru, +7 906 700-01-80.</p>
        <p>
          Регистрация и ход торгов живут в localStorage этого браузера. На сервер ничего не уходит. На боевом wiaf.ru — отдельные кабинеты.
        </p>
        <p>Политика, cookie-баннер и согласия — в очереди после правок прод-главной, не вместо них.</p>
      </div>
    </main>
  )
}
