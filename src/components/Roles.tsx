import { useState } from 'react'
import { Link } from 'react-router-dom'
import { moneyCopy } from '../content/money'
import { Magnetic } from './Motion'
import { ThemeIcon, type ThemeIconId } from './ThemeIcon'

const importer = {
  tag: 'Заказчик',
  title: 'Выкладываете груз',
  price: '0 ₽',
  priceNote: 'без комиссии площадки',
  icon: 'auction' as ThemeIconId,
  points: [
    'Резиденты РФ: ЮЛ и ИП',
    'Форма лота фиксирует условия «за всё»',
    'Не видит экспедиторов до победы',
    'После часа стороны сами заключают договор',
  ],
  cta: 'Попробовать как заказчик',
  href: '/app/register?role=importer&next=/app/importer/create&guide=1',
}

const forwarder = {
  tag: 'Исполнитель',
  title: 'Снижаете ставку',
  price: '1% с победы',
  priceNote: moneyCopy.commissionShort + ' · счёт от 1 000 ₽',
  icon: 'hold' as ThemeIconId,
  points: [
    'До 5 попыток за слот, шаг из лота',
    'Не видит конкурентов и заказчика',
    moneyCopy.holdShort,
    'Акты по ЭДО, комиссия в рублях',
  ],
  cta: 'Попробовать как исполнитель',
  href: '/app/register?role=forwarder&next=/app/forwarder/balance',
}

export function Roles() {
  const [tab, setTab] = useState<'importer' | 'forwarder'>('importer')
  const cards = { importer, forwarder }
  const active = cards[tab]

  return (
    <section id="roles" className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-xl font-semibold">Два входа</h2>
        <p className="mt-1 text-[14px] text-muted">
          Логист выкладывает слот. Перевозчик ставит. Режим «директор» — внутри кабинета после входа.
        </p>

        <div className="mt-8 hidden gap-4 md:grid md:grid-cols-2">
          <RoleCard data={importer} accent />
          <RoleCard data={forwarder} />
        </div>

        <div className="mt-8 md:hidden">
          <div className="mb-4 grid grid-cols-2 rounded-lg border border-line bg-paper p-1 text-[12px] font-semibold">
            {(['importer', 'forwarder'] as const).map((id) => (
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
          <TrustChip id="commission" title="Комиссия 1%" text={moneyCopy.commissionHint} />
          <TrustChip id="balance" title="Импортёру ноль" text="Сервис без оплаты" />
          <TrustChip id="hold" title="Счёт исполнителя" text="От 1 000 ₽ + холд под лот" />
        </ul>
      </div>
    </section>
  )
}

function RoleCard({ data, accent }: { data: typeof importer; accent?: boolean }) {
  return (
    <article className={`flex flex-col rounded-2xl border p-6 ${accent ? 'border-brand/40 bg-brand/5' : 'border-line bg-paper'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand">{data.tag}</p>
          <h3 className="mt-1 text-xl font-semibold">{data.title}</h3>
        </div>
        <ThemeIcon id={data.icon} size={56} />
      </div>
      <p className="mt-4 font-display text-3xl font-medium tracking-tight">{data.price}</p>
      <p className="mt-1 text-[13px] text-muted">{data.priceNote}</p>
      <ul className="mt-5 space-y-2 text-[13.5px] text-muted">
        {data.points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Magnetic className="mt-auto pt-6">
        <Link to={data.href} className="lift-btn inline-flex rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
          {data.cta}
        </Link>
      </Magnetic>
    </article>
  )
}

function TrustChip({ id, title, text }: { id: ThemeIconId; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-line bg-paper px-3 py-3">
      <ThemeIcon id={id} size={36} />
      <div>
        <p className="text-[13px] font-semibold">{title}</p>
        <p className="mt-0.5 text-[12.5px] text-muted">{text}</p>
      </div>
    </li>
  )
}
