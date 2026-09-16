import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { excludedNotes, includedChecks } from '../content/included'
import { forwarderWeek } from '../demo/seed'
import { formatWhen, loadLabel, modeLabel, ruDec, ruInt } from '../data'
import { useNow } from '../hooks'
import { BidBox } from './BidBox'
import { Bars, Stat } from './charts'
import { RatesStrip } from '../components/RatesStrip'
import {
  bestBid,
  commissionRub,
  countryKey,
  isOpenLot,
  loadFromContainer,
  lotStatus,
  modeEnum,
  slotLabel,
  statusRu,
  uniqueBidders,
  weekLabelFromIso,
  winnerId,
  type AppLot,
} from './engine'
import { MessageForm } from './MessageForm'
import { useSession } from './session'
import { EmptyState, Panel } from './ui'
import { DataTable, type Col } from './DataTable'

type DealRow = {
  id: string
  code: string
  from: string
  to: string
  cargo: string
  country: string
  cbm: number
  kg: number
  mode: string
  container: string
  hs: string
  incoterm: string
  insurance: string
  customs: string
  cargoValue: number
  myBid: number
  winBid: number
  bidders: number
  status: 'won' | 'lost' | 'archive'
  slot: string
  week: string
}

function dealsOf(userId: string, lots: AppLot[], now: number): DealRow[] {
  const out: DealRow[] = []
  for (const l of lots) {
    const mine = l.bids.filter((b) => b.userId === userId)
    if (!mine.length) continue
    const st = lotStatus(l, now)
    if (st === 'scheduled' || st === 'live' || st === 'draft') continue
    const myBid = Math.min(...mine.map((b) => b.amount))
    const win = bestBid(l.bids) ?? myBid
    const winU = winnerId(l.bids)
    let status: DealRow['status'] = 'archive'
    if (!l.archived && st === 'held' && winU === userId) status = 'won'
    else if (!l.archived && st === 'held') status = 'lost'
    out.push({
      id: l.id,
      code: l.code,
      from: l.from,
      to: l.to,
      cargo: l.cargo,
      country: l.country,
      cbm: l.cbm,
      kg: l.kg,
      mode: l.mode,
      container: l.container,
      hs: l.hs || '—',
      incoterm: l.incoterm,
      insurance: l.insurance ? 'да' : 'нет',
      customs: l.customs ? 'да' : 'нет',
      cargoValue: l.cargoValue,
      myBid,
      winBid: win,
      bidders: uniqueBidders(l.bids),
      status,
      slot: slotLabel(l.startIso),
      week: weekLabelFromIso(l.startIso),
    })
  }
  return out
}

function cargoValueWarn(lot: AppLot) {
  if (lot.cargoValue > 0) return null
  return (
    <p className="rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 text-[13px] text-brand">
      Стоимость груза 0 — экспедитору нечем оценить риск.
    </p>
  )
}

function LotCard({ lot, now }: { lot: AppLot; now: number }) {
  const st = lotStatus(lot, now)
  return (
    <article className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] text-mist">
            {lot.code} · {statusRu(st)}
          </p>
          <h2 className="text-lg font-semibold">
            {lot.from} → {lot.to}
          </h2>
          <p className="mt-1 text-[14px] text-muted">{lot.cargo}</p>
        </div>
        <span className="rounded bg-fog px-2 py-0.5 font-mono text-[11px]">{st === 'live' ? 'идёт' : 'очередь'}</span>
      </div>
      <p className="mt-2 font-mono text-[12px] text-muted">
        {ruDec.format(lot.cbm)} м³ · {ruInt.format(lot.kg)} кг · {loadLabel(loadFromContainer(lot.container))} ·{' '}
        {modeLabel(modeEnum(lot.mode))} · {slotLabel(lot.startIso)}
      </p>
      {cargoValueWarn(lot)}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={`/app/forwarder/lots/${lot.id}`} className="rounded-lg border border-line px-3 py-1.5 text-[13px]">
          Карточка
        </Link>
      </div>
      <div className="mt-3">
        <BidBox lot={lot} compact />
      </div>
    </article>
  )
}

export function ForwarderHome() {
  const navigate = useNavigate()
  const { user, lots, resetDemo, setSubscribed } = useSession()
  const now = useNow(2000)
  const deals = user ? dealsOf(user.id, lots, now) : []
  const won = deals.filter((d) => d.status === 'won')
  const lost = deals.filter((d) => d.status === 'lost')
  const played = won.length + lost.length
  const winRate = played ? Math.round((won.length / played) * 100) : 0
  const commission = won.reduce((s, d) => s + commissionRub(d.winBid), 0)
  const turnover = won.reduce((s, d) => s + d.myBid, 0)
  const myBids = lots.reduce((n, l) => n + l.bids.filter((b) => b.userId === user?.id).length, 0)
  const open = lots.filter((l) => isOpenLot(l, now))
  const byCountry = {
    china: open.filter((l) => countryKey(l.country) === 'china').length,
    turkey: open.filter((l) => countryKey(l.country) === 'turkey').length,
    vietnam: open.filter((l) => countryKey(l.country) === 'vietnam').length,
    india: open.filter((l) => countryKey(l.country) === 'india').length,
  }
  const balance = user?.balance ?? 0
  const subscribed = user?.subscribed ?? false

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {balance < 1000 ? (
        <div className="rounded-xl border border-danger/25 bg-white px-4 py-3">
          <p className="text-[14px] font-semibold">Счёт меньше 1 000 ₽</p>
          <p className="mt-1 text-[13px] text-muted">Пока нельзя ставить. Активация — тысяча на счёте; холд под лот = 1% ставки.</p>
          <Link to="/app/forwarder/balance" className="mt-2 inline-block text-[13px] font-semibold text-brand underline">
            Пополнить
          </Link>
        </div>
      ) : null}

      <div className="rounded-xl border border-line bg-white p-5 md:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">Кабинет исполнителя</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ставки и маржа</h1>
        <p className="mt-1 max-w-xl text-[13.5px] text-muted">
          {user?.company} · сначала all-in, потом лента. Ставка — если хватает на 1% от цифры.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-line px-4 py-2">
            <p className="font-mono text-[10px] text-mist">Счёт</p>
            <p className="font-mono text-[18px] font-semibold">
              {ruInt.format(balance)} ₽{' '}
              <span className={`text-[12px] ${balance >= 1000 ? 'text-ok' : 'text-danger'}`}>
                {balance >= 1000 ? 'активен' : 'нужно ≥ 1 000'}
              </span>
            </p>
          </div>
          <Link to="/app/forwarder/balance" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
            Пополнить
          </Link>
          <Link to="/app/forwarder/plan" className="rounded-lg border border-line px-4 py-2.5 text-[13px] font-semibold">
            Подписка
          </Link>
          <Link to="/rates" className="rounded-lg border border-line px-4 py-2.5 text-[13px] font-semibold">
            Курсы ЦБ
          </Link>
        </div>
        <div className="mt-4">
          <RatesStrip />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Открытые слоты сейчас" action={<Link to="/app/forwarder/china" className="text-[13px] underline">лента</Link>}>
          {open.length === 0 ? (
            <EmptyState title="Сейчас пусто" text="Включите почту по ленте и ждите Китай. Турцию не обещаем, если слотов нет." to="/app/forwarder/china" cta="Открыть ленту" />
          ) : (
            <ul className="divide-y divide-line text-[13.5px]">
              {open.slice(0, 5).map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div>
                    <Link to={`/app/forwarder/lots/${l.id}`} className="font-semibold underline">
                      {l.from} → {l.to}
                    </Link>
                    <p className="text-[12px] text-mist">
                      {l.cbm} м³ · {l.cargo}
                    </p>
                  </div>
                  <Link to={`/app/forwarder/lots/${l.id}`} className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white">
                    К ставке
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel
          title="Почта по ленте"
          action={
            <button type="button" className="text-[13px] underline" onClick={() => setSubscribed(!subscribed)}>
              {subscribed ? 'выкл' : 'вкл'}
            </button>
          }
        >
          <p className="text-[13.5px] text-muted">
            Алерт ленты: <span className="font-semibold text-ink">{subscribed ? 'вкл' : 'выкл'}</span>. Тарифы инструментов — в{' '}
            <Link to="/app/forwarder/plan" className="font-semibold text-brand underline">
              Подписке
            </Link>
            .
          </p>
          <ul className="mt-3 space-y-1.5 text-[13px]">
            <li className="flex justify-between">
              <span>Китай</span>
              <span className="font-mono">{byCountry.china}</span>
            </li>
            <li className="flex justify-between">
              <span>Турция</span>
              <span className="font-mono">{byCountry.turkey}</span>
            </li>
            <li className="flex justify-between">
              <span>Вьетнам / Индия</span>
              <span className="font-mono">
                {byCountry.vietnam + byCountry.india}
              </span>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Выиграно / сыграно" value={`${won.length} / ${played}`} hint={`win rate ${winRate}%`} spark={forwarderWeek.map((w) => w.won)} />
        <Stat label="Комиссия" value={`${ruInt.format(commission)} ₽`} hint="1%, ≤5 000 ₽" />
        <Stat label="Оборот побед" value={`$${ruInt.format(turnover)}`} hint="сумма выигравших ставок" />
        <Stat label="Ваших ставок" value={String(myBids)} hint="по всем лотам" />
      </div>

      <Panel title="Ставки и победы по неделям">
        <Bars
          a={forwarderWeek.map((w) => w.bids)}
          b={forwarderWeek.map((w) => w.won)}
          labels={forwarderWeek.map((w) => w.w)}
          aLabel="ставки"
          bLabel="победы"
          onBarClick={(_i, label) => navigate(`/app/forwarder/won?week=${encodeURIComponent(label)}`)}
        />
      </Panel>

      <div className="flex justify-end">
        <button type="button" onClick={resetDemo} className="text-[12px] text-mist underline">
          Сбросить демо-кабинет
        </button>
      </div>
    </div>
  )
}

function DealTable({ items, initialFilters }: { items: DealRow[]; initialFilters?: Record<string, string> }) {
  if (!items.length) {
    return <p className="px-4 py-8 text-center text-[13.5px] text-muted">Пока нет закрытых слотов с вашей ставкой.</p>
  }

  const columns: Col<DealRow>[] = [
    { key: 'code', label: 'Код', get: (d) => d.code, className: 'font-mono' },
    { key: 'week', label: 'Неделя', get: (d) => d.week, className: 'font-mono' },
    { key: 'country', label: 'Страна', get: (d) => d.country },
    { key: 'route', label: 'Маршрут', get: (d) => `${d.from} → ${d.to}` },
    { key: 'cargo', label: 'Груз', get: (d) => d.cargo },
    { key: 'hs', label: 'ТН ВЭД', get: (d) => d.hs, className: 'font-mono' },
    { key: 'cbm', label: 'м³', get: (d) => d.cbm, sortType: 'number', cell: (d) => <span className="font-mono">{ruDec.format(d.cbm)}</span> },
    { key: 'kg', label: 'кг', get: (d) => d.kg, sortType: 'number', cell: (d) => <span className="font-mono">{ruInt.format(d.kg)}</span> },
    { key: 'mode', label: 'Транспорт', get: (d) => d.mode },
    { key: 'container', label: 'Загрузка', get: (d) => d.container },
    { key: 'incoterm', label: 'Базис', get: (d) => d.incoterm, className: 'font-mono' },
    { key: 'insurance', label: 'Страховка', get: (d) => d.insurance },
    { key: 'customs', label: 'ТО', get: (d) => d.customs },
    {
      key: 'value',
      label: 'Груз $',
      get: (d) => d.cargoValue,
      sortType: 'number',
      cell: (d) => <span className="font-mono">{d.cargoValue ? ruInt.format(d.cargoValue) : '0'}</span>,
    },
    { key: 'my', label: 'Моя $', get: (d) => d.myBid, sortType: 'number', cell: (d) => <span className="font-mono">${ruInt.format(d.myBid)}</span> },
    { key: 'win', label: 'Победа $', get: (d) => d.winBid, sortType: 'number', cell: (d) => <span className="font-mono">${ruInt.format(d.winBid)}</span> },
    { key: 'n', label: 'n', get: (d) => d.bidders, sortType: 'number' },
    { key: 'slot', label: 'Слот', get: (d) => d.slot },
    {
      key: 'status',
      label: 'Итог',
      get: (d) => (d.status === 'won' ? 'выиграли' : d.status === 'lost' ? 'ниже' : 'архив'),
    },
  ]

  return (
    <DataTable
      rows={items}
      columns={columns}
      rowKey={(d) => d.id}
      facetKey="country"
      facetAllLabel="Все страны"
      searchPlaceholder="Поиск: код, маршрут, груз, ТН ВЭД…"
      initialFilters={initialFilters}
      renderDetail={(d, close) => (
        <div className="space-y-3 text-[13.5px]">
          <p className="font-mono text-[11px] text-mist">
            {d.code} · {d.status === 'won' ? 'выиграли' : d.status === 'lost' ? 'ниже победы' : 'архив'} · неделя {d.week}
          </p>
          <h2 className="text-lg font-semibold">
            {d.from} → {d.to}
          </h2>
          <p className="text-muted">
            {d.cargo} · {d.country}
          </p>
          <dl className="grid grid-cols-2 gap-2 border-y border-line py-3 font-mono text-[12px]">
            <div>
              <dt className="text-mist">м³ / кг</dt>
              <dd>
                {ruDec.format(d.cbm)} / {ruInt.format(d.kg)}
              </dd>
            </div>
            <div>
              <dt className="text-mist">Транспорт</dt>
              <dd className="font-sans">{d.mode}</dd>
            </div>
            <div>
              <dt className="text-mist">Базис / страховка</dt>
              <dd className="font-sans">
                {d.incoterm} · {d.insurance}
              </dd>
            </div>
            <div>
              <dt className="text-mist">Моя ставка</dt>
              <dd>${ruInt.format(d.myBid)}</dd>
            </div>
            <div>
              <dt className="text-mist">Победа</dt>
              <dd>${ruInt.format(d.winBid)}</dd>
            </div>
            <div>
              <dt className="text-mist">Игроки</dt>
              <dd>{d.bidders}</dd>
            </div>
            <div>
              <dt className="text-mist">Слот</dt>
              <dd className="font-sans">{d.slot}</dd>
            </div>
          </dl>
          <Link to={`/app/forwarder/lots/${d.id}`} className="inline-flex rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white" onClick={close}>
            Карточка лота
          </Link>
        </div>
      )}
    />
  )
}

function DealList({
  title,
  hint,
  items,
}: {
  title: string
  hint: string
  items: DealRow[]
}) {
  const [params] = useSearchParams()
  const week = params.get('week')?.trim() ?? ''
  const initialFilters = useMemo(() => (week ? { week } : undefined), [week])
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          {hint}
          {week ? (
            <>
              {' '}
              · неделя <span className="font-mono text-ink">{week}</span>
            </>
          ) : null}
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <DealTable items={items} initialFilters={initialFilters} />
      </div>
    </div>
  )
}

function CountryFeed({ name, keyName, note }: { name: string; keyName: string; note: string }) {
  const { lots } = useSession()
  const now = useNow(1000)
  const feed = lots.filter((l) => countryKey(l.country) === keyName && isOpenLot(l, now))

  const columns: Col<AppLot>[] = [
    { key: 'code', label: 'Код', get: (l) => l.code, className: 'font-mono' },
    { key: 'route', label: 'Маршрут', get: (l) => `${l.from} → ${l.to}`, cell: (l) => <span className="font-medium">{l.from} → {l.to}</span> },
    { key: 'cargo', label: 'Груз', get: (l) => l.cargo },
    { key: 'hs', label: 'ТН ВЭД', get: (l) => l.hs || '—', className: 'font-mono' },
    { key: 'cbm', label: 'м³', get: (l) => l.cbm, sortType: 'number', cell: (l) => <span className="font-mono">{ruDec.format(l.cbm)}</span> },
    { key: 'kg', label: 'кг', get: (l) => l.kg, sortType: 'number', cell: (l) => <span className="font-mono">{ruInt.format(l.kg)}</span> },
    { key: 'mode', label: 'Транспорт', get: (l) => l.mode },
    { key: 'container', label: 'Загрузка', get: (l) => loadLabel(loadFromContainer(l.container)) },
    { key: 'incoterm', label: 'Базис', get: (l) => l.incoterm },
    {
      key: 'value',
      label: 'Груз ₽',
      get: (l) => l.cargoValue,
      sortType: 'number',
      cell: (l) => <span className="font-mono">{l.cargoValue ? ruInt.format(l.cargoValue) : '0'}</span>,
    },
    { key: 'slot', label: 'Слот', get: (l) => slotLabel(l.startIso) },
    { key: 'st', label: 'Статус', get: (l) => (lotStatus(l, now) === 'live' ? 'идёт' : 'очередь') },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="mt-1 text-[13.5px] text-muted">{note}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        {feed.length === 0 ? (
          <EmptyState
            title="В этой стране пока пусто"
            text="Живая лента сейчас — Китай. Пустую Турцию и Индию не обещаем на главной."
            to="/app/forwarder/china"
            cta="К ленте Китая"
          />
        ) : (
          <DataTable
            rows={feed}
            columns={columns}
            rowKey={(l) => l.id}
            searchPlaceholder="Поиск: маршрут, ТН ВЭД, груз…"
            renderDetail={(lot, close) => (
              <div className="space-y-4">
                <LotCard lot={lot} now={now} />
                <Link to={`/app/forwarder/lots/${lot.id}`} className="inline-flex rounded-lg border border-line px-3 py-2 text-[13px]" onClick={close}>
                  Полная карточка
                </Link>
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}

export function ForwarderChina() {
  return <CountryFeed name="Китай · живая лента" keyName="china" note="Открытые слоты. Ставка на карточке и на полном лоте." />
}

export function ForwarderTurkey() {
  return <CountryFeed name="Турция" keyName="turkey" note="Открытые слоты по Турции." />
}

export function ForwarderVietnam() {
  return <CountryFeed name="Вьетнам" keyName="vietnam" note="Открытые слоты по Вьетнаму." />
}

export function ForwarderIndia() {
  return <CountryFeed name="Индия" keyName="india" note="Открытые слоты по Индии." />
}

export function ForwarderEmptyCountry({ name }: { name: string }) {
  return <CountryFeed name={name} keyName="other" note="Прочие направления." />
}

export function ForwarderWon() {
  const { user, lots } = useSession()
  const now = useNow(2000)
  const deals = user ? dealsOf(user.id, lots, now) : []
  return (
    <DealList
      title="Выигранные"
      hint="Победы по вашим ставкам. Кнопка «Фильтр» — по всем полям."
      items={deals.filter((d) => d.status === 'won')}
    />
  )
}

export function ForwarderLost() {
  const { user, lots } = useSession()
  const now = useNow(2000)
  const deals = user ? dealsOf(user.id, lots, now) : []
  return (
    <DealList
      title="Проигранные"
      hint="Сыграли, но победа у другого. Кнопка «Фильтр» — по всем полям."
      items={deals.filter((d) => d.status === 'lost')}
    />
  )
}

export function ForwarderArchive() {
  const { user, lots } = useSession()
  const now = useNow(2000)
  const deals = user ? dealsOf(user.id, lots, now) : []
  return (
    <DealList
      title="Архив"
      hint="Закрытые слоты с вашей ставкой. Кнопка «Фильтр» — по всем полям."
      items={deals.filter((d) => d.status === 'archive')}
    />
  )
}

export function ForwarderBalance() {
  const { user, ledger, topup } = useSession()
  const now = useNow(2000)
  const { lots } = useSession()
  const [err, setErr] = useState<string | null>(null)
  const amounts = [1000, 3000, 5000, 10000, 20000]
  const mine = ledger.filter((t) => t.userId === user?.id)
  const deals = user ? dealsOf(user.id, lots, now) : []
  const commission = deals.filter((d) => d.status === 'won').reduce((s, d) => s + commissionRub(d.winBid), 0)
  const topped = mine.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const balance = user?.balance ?? 0

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Счёт</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Доступно"
          value={`${ruInt.format(balance)} ₽`}
          hint={balance >= 1000 ? 'активен · холд = 1% ставки' : 'нужно ≥ 1 000 ₽'}
        />
        <Stat label="Пополнено всего" value={`${ruInt.format(topped)} ₽`} />
        <Stat label="Комиссия списана" value={`${ruInt.format(commission)} ₽`} />
      </div>
      <Panel title="Пополнить">
        <p className="mb-3 text-[13px] text-muted">
          Минимум 1 000 ₽ за раз. Чтобы ставить на лот, на счёте должно хватать на 1% от вашей ставки, но не больше
          потолка комиссии 5 000 ₽. Деньги никуда не уходят — только этот браузер.
        </p>
        <div className="flex flex-wrap gap-2">
          {amounts.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                const fail = topup(n)
                setErr(fail)
              }}
              className="rounded-lg border border-line px-4 py-2 text-[13.5px] font-semibold hover:bg-fog"
            >
              {ruInt.format(n)} ₽
            </button>
          ))}
        </div>
        {err ? <p className="mt-2 text-[13px] text-brand">{err}</p> : null}
      </Panel>
      <Panel title="Движения">
        <ul className="text-[13.5px]">
          {mine.map((t) => (
            <li key={t.id} className="flex justify-between border-b border-line py-2 last:border-0">
              <span>
                {t.at.replace('T', ' ').slice(0, 16)} · {t.note}
              </span>
              <span className="font-mono">
                {t.amount > 0 ? '+' : ''}
                {ruInt.format(t.amount)} ₽
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

export function ForwarderLot() {
  const { id } = useParams()
  const { lots } = useSession()
  const lot = lots.find((l) => l.id === id)
  if (!lot || lot.isDraft) {
    return <EmptyState title="Лот не найден" text="Нет такого id в ленте." to="/app/forwarder/china" cta="К ленте" />
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="font-mono text-[12px] text-mist">{lot.code}</p>
      <h1 className="text-2xl font-semibold">
        {lot.from} → {lot.to}
      </h1>
      <p className="text-[15px] text-muted">{lot.cargo}</p>
      {cargoValueWarn(lot)}
      <dl className="grid gap-3 rounded-xl border border-line bg-white p-5 text-[14px] sm:grid-cols-2">
        <div>
          <dt className="text-mist">Слот</dt>
          <dd>
            {formatWhen(lot.startIso)} — {formatWhen(lot.endIso)} МСК
          </dd>
        </div>
        <div>
          <dt className="text-mist">Тип</dt>
          <dd>
            {loadLabel(loadFromContainer(lot.container))} · {modeLabel(modeEnum(lot.mode))}
          </dd>
        </div>
        <div>
          <dt className="text-mist">Объём / масса</dt>
          <dd>
            {ruDec.format(lot.cbm)} м³ · {ruInt.format(lot.kg)} кг
          </dd>
        </div>
        <div>
          <dt className="text-mist">Инкотермс</dt>
          <dd>{lot.incoterm}</dd>
        </div>
        <div>
          <dt className="text-mist">Упаковка</dt>
          <dd>{lot.packing}</dd>
        </div>
        <div>
          <dt className="text-mist">Готовность</dt>
          <dd>{lot.ready}</dd>
        </div>
        <div>
          <dt className="text-mist">Отправитель</dt>
          <dd>{lot.shipperName || lot.shipperAddress}</dd>
        </div>
        <div>
          <dt className="text-mist">Назначение</dt>
          <dd>{lot.destAddress}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-mist">Комментарий</dt>
          <dd>{lot.comment}</dd>
        </div>
      </dl>
      <div className="rounded-xl border border-line bg-white p-5">
        <p className="font-semibold">Что входит в ставку</p>
        <ul className="mt-2 space-y-1 text-[14px] text-muted">
          {includedChecks.map((c) => (
            <li key={c.id}>— {c.label}</li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 text-[13px] text-mist">
          {excludedNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      <BidBox lot={lot} />
    </div>
  )
}

export function ForwarderMessage() {
  return <MessageForm who="экспедитора" />
}
