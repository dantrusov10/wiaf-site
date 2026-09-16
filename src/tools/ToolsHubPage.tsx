import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { landingToolExamples } from './catalog'

/** Публичная витрина: примеры, не рабочие инструменты. */
export function ToolsHubPage() {
  return (
    <main>
      <PageHero
        kicker="Примеры из кабинетов"
        title="Инструменты живут внутри ЛК, не на лендинге"
        dek="Ниже — как это выглядит по ролям. Полный набор открывается после входа: у заказчика свой, у исполнителя свой (часть пересекается)."
      />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {landingToolExamples.map((block) => (
            <section key={block.role} className="rounded-xl border border-line bg-white p-6">
              <h2 className="text-lg font-semibold">{block.title}</h2>
              <ul className="mt-4 space-y-4">
                {block.items.map((item) => (
                  <li key={item.name} className="rounded-lg border border-line bg-fog/40 px-4 py-3">
                    <p className="text-[13px] font-semibold">{item.name}</p>
                    <p className="mt-1 font-mono text-[12.5px] text-muted">{item.example}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-mist">пример · не живой расчёт</p>
                  </li>
                ))}
              </ul>
              <Link
                to={block.role === 'importer' ? '/app/login?role=importer' : '/app/login?role=forwarder'}
                className="mt-5 inline-block rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-navy-2"
              >
                Войти в кабинет {block.role === 'importer' ? 'заказчика' : 'исполнителя'}
              </Link>
            </section>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-[13px] text-mist">
          Рабочие калькуляторы, журналы и реестр поставщиков доступны только авторизованным пользователям соответствующих ролей.
        </p>
      </div>
    </main>
  )
}
