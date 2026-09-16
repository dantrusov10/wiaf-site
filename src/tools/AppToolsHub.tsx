import { Link } from 'react-router-dom'
import { toolPath, toolsFor, type ToolRole } from './catalog'
import { ToolNav } from './ui'

export function AppToolsHub({ role }: { role: ToolRole }) {
  const items = toolsFor(role)
  const isImp = role === 'importer'

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
        {isImp ? 'Кабинет заказчика' : 'Кабинет исполнителя'}
      </p>
      <h1 className="mt-1 text-xl font-semibold">
        {isImp ? 'Калькуляторы и журнал' : 'Расчёты и КП'}
      </h1>
      <p className="mt-1 max-w-2xl text-[13.5px] text-muted">
        {isImp
          ? 'Посчитать партию, сохранить чужие КП, вести фабрики, планировать сроки. Торги — когда готовы выложить груз.'
          : 'Посчитать объём и полную цену, вести закуп и продажу, собрать КП. Лента торгов — отдельно.'}
      </p>
      <div className="mt-4">
        <ToolNav />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((t) => (
          <Link
            key={t.slug}
            to={toolPath(role, t.slug)}
            className={`rounded-xl border border-line bg-white p-4 transition ${
              isImp ? 'hover:border-brand/50' : 'hover:border-brand-2/60'
            }`}
          >
            <p className="font-mono text-[10px] uppercase text-mist">{t.tag}</p>
            <p className="mt-1 text-[15px] font-semibold">{t.title}</p>
            <p className="mt-1 text-[13px] text-muted">{t.dek}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
