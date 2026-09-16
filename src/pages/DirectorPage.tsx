import { Link } from 'react-router-dom'
import { DirectorLeadForm } from '../components/LeadMagnet'
import { PageHero } from '../components/PageHero'

export function DirectorPage() {
  return (
    <main>
      <PageHero
        kicker="Директору"
        title="Факт цены часа — на почту, не в кабинет логиста"
        dek="Площадка не может обязать закупить у победителя. Ставка часа — не твёрдый оффер. Груз в карточке площадка не гарантирует. Ценность для собственника — письмо после торга, пока логист снова не закрыл тему на полгода."
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold">Что придёт</h2>
            <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-muted">
              <li>Плечо, объём, состоялся или нет, сколько ставили, минимум и вилка.</li>
              <li>Прямым текстом: это не обязанность отдать груз победителю.</li>
              <li>Если слот пустой — тоже напишем. Иначе логист скажет «площадка мёртвая».</li>
            </ul>
            <div className="mt-6">
              <DirectorLeadForm />
            </div>
          </article>
          <article className="rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold">Кто не директор</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              Первый, кто ввёл ИНН, в кабинете — логист. Кресло директора не ставится галочкой. ФИО должно совпасть с
              ЕГРЮЛ; почта не равна логину логиста. УКЭП — позже. Пока бейдж «по ЕГРЮЛ», не «гарантирован паспорт».
            </p>
            <Link to="/app/login?role=importer" className="mt-5 inline-flex rounded-lg border border-line px-4 py-2.5 text-[13px] font-medium">
              Войти как заказчик
            </Link>
          </article>
        </div>
      </div>
    </main>
  )
}
