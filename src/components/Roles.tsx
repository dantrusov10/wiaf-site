import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Magnetic } from './Motion'
import { Tag } from './Tag'
import { ThemeIcon, type ThemeIconId } from './ThemeIcon'

const importer = {
  tag: 'Заказчик',
  title: 'Выкладываете груз',
  price: '0 ₽',
  priceNote: 'без договора и комиссии площадки',
  icon: 'auction' as ThemeIconId,
  points: [
    'Резиденты РФ: ЮЛ и ИП',
    'Форма лота фиксирует условия «за всё»',
    'Не видит экспедиторов до победы',
    'После часа стороны сами заключают договор',
  ],
  cta: 'Выложить груз',
  href: '/app/login?role=importer',
}

const forwarder = {
  tag: 'Исполнитель',
  title: 'Снижаете ставку',
  price: '1% с победы',
  priceNote: 'не более 5к · на счёте от 1 000 ₽',
  icon: 'hold' as ThemeIconId,
  points: [
    '5 попыток за слот, шаг из лота',
    'Не видит конкурентов и заказчика',
    'Холд = 1% от своей ставки (≤5 000 ₽)',
    'Акты по ЭДО, комиссия в рублях',
  ],
  cta: 'Я перевозчик',
  href: '/app/login?role=forwarder',
}

const director = {
  tag: 'Директор',
  title: 'Читаете итог часа',
  price: 'письмо',
  priceNote: 'не обязанность закупить у победителя',
  icon: 'director' as ThemeIconId,
  points: [
    'Почта отдельно от логина логиста',
    'После каждого часа: вилка и число ставок',
    'Пустой слот тоже приходит — без сказки «площадка мёртвая»',
    'Кресло не ставится галочкой «я директор»',
  ],
  cta: 'Письма директору',
  href: '/director',
}

export function Roles() {
  const [tab, setTab] = useState<'importer' | 'forwarder' | 'director'>('importer')
  const cards = { importer, forwarder, director }
  const active = cards[tab]

  return (
    <section id="roles" className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-xl font-semibold">Три входа</h2>
        <p className="mt-1 text-[14px] text-muted">Логист работает руками. Перевозчик ставит. Директор видит след.</p>

        <div className="mt-8 hidden gap-4 md:grid md:grid-cols-3">
          <RoleCard data={importer} accent />
          <RoleCard data={forwarder} />
          <RoleCard data={director} />
        </div>

        <div className="mt-8 md:hidden">
          <div className="mb-4 grid grid-cols-3 rounded-lg border border-line bg-paper p-1 text-[12px] font-semibold">
            {(['importer', 'forwarder', 'director'] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={`rounded-md py-2 ${tab === id ? 'bg-navy text-paper' : ''}`}
                onClick={() => setTab(id)}
              >
                {cards[id].tag}
              </button>
            ))}
          </div>
          <RoleCard data={active} accent={tab === 'importer'} />
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TrustChip id="auction" title="Слепые торги" text="Нет окна сговора в чате" />
          <TrustChip id="commission" title="Комиссия 1%" text="не более 5 000 ₽" />
          <TrustChip id="balance" title="Импортёру ноль" text="Сервис без оплаты" />
          <TrustChip id="hold" title="Счёт исполнителя" text="От 1 000 ₽ + холд под лот" />
        </ul>
      </div>
    </section>
  )
}

function RoleCard({ data, accent }: { data: typeof importer; accent?: boolean }) {
  return (
    <article className={`lift-card flex flex-col rounded-lg border p-5 ${accent ? 'border-brand/30 bg-paper' : 'border-line bg-paper'}`}>
      <div className="flex items-start justify-between gap-3">
        <Tag tone={accent ? 'brand' : 'ink'}>{data.tag}</Tag>
        <ThemeIcon id={data.icon} size={88} />
      </div>
      <h3 className="mt-3 text-lg font-semibold">{data.title}</h3>
      <p className="mt-2 text-[18px] font-semibold text-brand">{data.price}</p>
      <p className="text-[13px] text-muted">{data.priceNote}</p>
      <ul className="mt-5 flex-1 space-y-2 text-[14px] leading-snug text-ink/90">
        {data.points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            {p}
          </li>
        ))}
      </ul>
      <Magnetic className="mt-6">
        <Link
          to={data.href}
          className={`lift-btn inline-flex rounded-lg px-4 py-2 text-[13.5px] font-semibold ${accent ? 'bg-brand text-white' : 'bg-navy text-white'}`}
        >
          {data.cta}
        </Link>
      </Magnetic>
    </article>
  )
}

function TrustChip({ id, title, text }: { id: ThemeIconId; title: string; text: string }) {
  return (
    <li className="lift-card flex gap-3 rounded-lg border border-line bg-white px-4 py-3">
      <ThemeIcon id={id} size={64} className="shrink-0" />
      <div>
        <p className="text-[13.5px] font-semibold">{title}</p>
        <p className="text-[12.5px] text-muted">{text}</p>
      </div>
    </li>
  )
}
