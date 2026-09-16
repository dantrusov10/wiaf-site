import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { excludedNotes, includedChecks } from '../content/included'
import { importerWeek } from '../demo/seed'
import { ruDec, ruInt } from '../data'
import { useNow } from '../hooks'
import {
  bestBid,
  isoToDd,
  isoToHm,
  lotStatus,
  parseSlot,
  slotLabel,
  statusRu,
  uniqueBidders,
  weekLabelFromIso,
  type AppLot,
} from './engine'
import { Bars, Stat } from './charts'
import { EmptyState, Field, inputClass, Panel } from './ui'
import { DataTable, type Col } from './DataTable'
import { MessageForm } from './MessageForm'
import { useSession } from './session'
import { smartLotHints } from '../content/lotHints'
import { RatesStrip } from '../components/RatesStrip'
import { ThemeIcon } from '../components/ThemeIcon'

const steps = ['Маршрут', 'Груз', 'Что в ставке', 'Слот и цена', 'Проверка']

const emptyForm = {
  title: '',
  country: 'Китай',
  from: 'Гуанчжоу',
  to: 'Москва',
  destAddress: 'Химки',
  cargo: 'Одежда',
  hs: '',
  kg: '15000',
  cbm: '28',
  places: '40',
  mode: 'Наземный',
  container: 'Не важно',
  insurance: false,
  customs: false,
  incoterm: 'EXW',
  currency: 'USD',
  cargoValue: '',
  packing: 'Коробка картон',
  danger: 'Не опасный',
  ready: '',
  exportDecl: 'Платит отправитель',
  shipperName: '',
  shipperAddress: '',
  comment: 'нет',
  date: '',
  time: '13:00',
  maxBidUsd: '8000',
  bidStepUsd: '1',
  durationMin: '60',
}

function todayDd() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

function plusDays(base: string, days: number) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(base)
  const src = m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date()
  src.setDate(src.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(src.getDate())}.${pad(src.getMonth() + 1)}.${src.getFullYear()}`
}

function parseDd(s: string) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s.trim())
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
}

export function ImporterHome() {
  const { user, lots, resetDemo } = useSession()
  const navigate = useNavigate()
  const now = useNow(2000)
  const mine = lots.filter((d) => d.ownerId === user?.id)
  const work = mine.filter((d) => !d.archived)
  const withSt = work.map((d) => ({ d, st: lotStatus(d, now) }))
  const held = withSt.filter((x) => x.st === 'held').map((x) => x.d)
  const failed = withSt.filter((x) => x.st === 'failed').map((x) => x.d)
  const current = withSt.filter((x) => x.st === 'scheduled' || x.st === 'live').map((x) => x.d)
  const templates = withSt.filter((x) => x.st === 'draft').map((x) => x.d)
  const vol = held.reduce((s, d) => s + d.cbm, 0)
  const avgB = held.length ? held.reduce((s, d) => s + uniqueBidders(d.bids), 0) / held.length : 0

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {!user?.directorEmail && !user?.directorPrefs?.email ? (
        <div className="rounded-xl border border-warn/30 bg-white px-4 py-3">
          <p className="text-[14px] font-semibold">Почта директора пустая</p>
          <p className="mt-1 text-[13px] text-muted">
            Итоги часов не уйдут собственнику. Настройте автоотчёты в кабинете директора.
          </p>
          <Link to="/app/importer/director/reports" className="mt-2 inline-block text-[13px] font-semibold text-brand underline">
            Указать почту и автоотправку
          </Link>
        </div>
      ) : null}

      <div className="rounded-xl border border-line bg-white p-5 md:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">Кабинет заказчика</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Закупка и слоты</h1>
        <p className="mt-1 max-w-xl text-[13.5px] text-muted">
          {user?.company} · сначала партия и свои экспедиторы — потом час.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/importer/create" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
            Выложить слот
          </Link>
          <Link to="/app/importer/plan" className="rounded-lg border border-line px-4 py-2.5 text-[13px] font-semibold">
            Подписка
          </Link>
          <Link to="/app/importer/director" className="rounded-lg border border-line px-4 py-2.5 text-[13px] font-semibold">
            Смотреть как директор
          </Link>
          <Link to="/help" className="rounded-lg px-4 py-2.5 text-[13px] font-medium text-muted hover:text-ink">
            База
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Состоялось" value={String(held.length)} hint={`${failed.length} не состоялись`} spark={importerWeek.map((w) => w.held)} />
        <Stat label="В работе" value={String(current.length)} hint={`${templates.length} шаблона`} />
        <Stat label="Объём состоявшихся" value={`${ruDec.format(vol)} м³`} hint={`${ruInt.format(held.reduce((s, d) => s + d.kg, 0))} кг`} />
        <Stat label="Игроков на слот" value={avgB.toFixed(1)} hint="нужно ≥ 2" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Ближайшие слоты" action={<Link to="/app/importer/current" className="text-[13px] underline">все</Link>}>
          {current.length === 0 ? (
            <EmptyState
              title="Нет очереди"
              text="Слот после журнала КП: хотя бы два ответа из чата, потом час."
              to="/app/importer/create"
              cta="Выложить слот"
            />
          ) : (
            <DataTable
              rows={current}
              columns={[
                { key: 'route', label: 'Маршрут', get: (d) => `${d.from} → ${d.to}`, cell: (d) => <span className="font-medium">{d.from} → {d.to}</span> },
                { key: 'cargo', label: 'Груз', get: (d) => d.cargo },
                { key: 'slot', label: 'Слот', get: (d) => slotLabel(d.startIso) },
                { key: 'st', label: 'Статус', get: (d) => (lotStatus(d, now) === 'live' ? 'идёт' : 'очередь') },
              ]}
              rowKey={(d) => d.id}
              searchPlaceholder="Поиск по маршруту…"
              renderDetail={(d, close) => <LotDetail lot={d} now={now} onClose={close} />}
            />
          )}
        </Panel>
        <Panel title="Слоты по неделям">
          <Bars
            a={importerWeek.map((w) => w.lots)}
            b={importerWeek.map((w) => w.held)}
            labels={importerWeek.map((w) => w.w)}
            onBarClick={(_i, label) => navigate(`/app/importer/held?week=${encodeURIComponent(label)}`)}
          />
        </Panel>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={resetDemo} className="text-[12px] text-mist underline">
          Сбросить демо-кабинет
        </button>
      </div>
    </div>
  )
}

export function ImporterCreate() {
  const { user, lots, saveLot } = useSession()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ ...emptyForm, ready: todayDd(), date: plusDays(todayDd(), 3) })
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState<null | 'draft' | 'scheduled'>(null)
  const smart = Boolean(user?.subscribed || (user?.planId && user.planId !== 'imp-free'))

  const set = (k: keyof typeof emptyForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const from = params.get('from')
    if (!from) return
    const src = lots.find((l) => l.id === from)
    if (!src) return
    setForm({
      title: src.title,
      country: src.country,
      from: src.from,
      to: src.to,
      destAddress: src.destAddress,
      cargo: src.cargo,
      hs: src.hs,
      kg: String(src.kg),
      cbm: String(src.cbm),
      places: String(src.places),
      mode: src.mode,
      container: src.container,
      insurance: src.insurance,
      customs: src.customs,
      incoterm: src.incoterm,
      currency: src.currency,
      cargoValue: src.cargoValue ? String(src.cargoValue) : '',
      packing: src.packing,
      danger: src.danger,
      ready: src.ready || todayDd(),
      exportDecl: src.exportDecl,
      shipperName: src.shipperName,
      shipperAddress: src.shipperAddress,
      comment: src.comment || 'нет',
      date: isoToDd(src.startIso),
      time: isoToHm(src.startIso),
      maxBidUsd: String(src.maxBidUsd || 8000),
      bidStepUsd: String(src.bidStepUsd ?? 1),
      durationMin: String(src.durationMin ?? 60),
    })
  }, [params, lots])

  const included = useMemo(() => includedChecks.map((c) => c.label), [])

  const hints = useMemo(
    () =>
      smart
        ? smartLotHints({
            step: step as 0 | 1 | 2 | 3 | 4,
            country: form.country,
            cargo: form.cargo,
            cbm: Number(form.cbm) || 0,
            kg: Number(form.kg) || 0,
            mode: form.mode,
            incoterm: form.incoterm,
            insurance: form.insurance,
            customs: form.customs,
            cargoValue: Number(form.cargoValue) || 0,
            maxBidUsd: Number(form.maxBidUsd) || 0,
            durationMin: Number(form.durationMin) || 60,
            bidStepUsd: Number(form.bidStepUsd) || 1,
            hs: form.hs,
            from: form.from,
            to: form.to,
            shipperAddress: form.shipperAddress,
            ready: form.ready,
            date: form.date,
            places: Number(form.places) || 0,
          })
        : [],
    [smart, form, step],
  )

  const buildLot = (isDraft: boolean): AppLot => {
    const durationMin = Math.max(15, Math.min(240, Number(form.durationMin) || 60))
    const slot = parseSlot(form.date, form.time, durationMin) ?? {
      startIso: new Date().toISOString(),
      endIso: new Date(Date.now() + durationMin * 60 * 1000).toISOString(),
      durationMin,
    }
    const maxBid = Math.max(100, Number(form.maxBidUsd) || Number(form.cargoValue) || 8000)
    return {
      id: crypto.randomUUID(),
      ownerId: user!.id,
      code: `L-${Date.now().toString().slice(-5)}`,
      title: form.title || `${form.from} → ${form.to}`,
      isDraft,
      archived: false,
      settled: false,
      country: form.country,
      from: form.from,
      to: form.to,
      destAddress: form.destAddress,
      cargo: form.cargo,
      hs: form.hs,
      kg: Number(form.kg) || 0,
      cbm: Number(form.cbm) || 0,
      places: Number(form.places) || 0,
      mode: form.mode,
      container: form.container,
      insurance: form.insurance,
      customs: form.customs,
      incoterm: form.incoterm,
      currency: form.currency,
      cargoValue: Number(form.cargoValue) || 0,
      packing: form.packing,
      danger: form.danger,
      ready: form.ready,
      exportDecl: form.exportDecl,
      shipperName: form.shipperName,
      shipperAddress: form.shipperAddress,
      comment: form.comment || 'нет',
      startIso: slot.startIso,
      endIso: slot.endIso,
      included,
      createdAt: new Date().toISOString(),
      maxBidUsd: maxBid,
      bidStepUsd: Math.max(1, Number(form.bidStepUsd) || 1),
      durationMin: slot.durationMin ?? durationMin,
      bids: [],
    }
  }

  const check = () => {
    const e: string[] = []
    if (!form.from || !form.to) e.push('Нужны город отправления и доставки')
    if (!form.cargo) e.push('Опишите груз или ТН ВЭД')
    if (!Number(form.kg) || !Number(form.cbm)) e.push('Нужны брутто кг и объём м³')
    const ready = parseDd(form.ready)
    const slot = parseDd(form.date)
    const durationMin = Number(form.durationMin) || 60
    if (!ready) e.push('Дата готовности — дд.мм.гггг')
    if (!parseSlot(form.date, form.time, durationMin)) e.push('Слот аукциона — дд.мм.гггг и час чч:мм')
    if (ready && slot) {
      const min = new Date(ready)
      min.setDate(min.getDate() + 2)
      if (slot < min) e.push('Слот аукциона — минимум через 2 суток после готовности, лучше 3–4')
    }
    if (!form.cargoValue) e.push('Стоимость груза 0 — экспедитору нечем оценить риск. Укажите сумму.')
    if (!Number(form.maxBidUsd) || Number(form.maxBidUsd) < 100) e.push('Укажите потолок первой ставки (USD), минимум 100')
    if (!Number(form.bidStepUsd) || Number(form.bidStepUsd) < 1) e.push('Шаг снижения — минимум $1')
    if (durationMin < 15 || durationMin > 240) e.push('Длительность слота — от 15 до 240 минут')
    setErrors(e)
    return e.length === 0
  }

  const onCheck = () => {
    if (check()) setStep(4)
  }

  if (saved) {
    return (
      <EmptyState
        title={saved === 'draft' ? 'Шаблон сохранён' : 'Аукцион в очереди'}
        text={
          saved === 'draft'
            ? 'Черновик в «Шаблоны». Можно открыть и выложить слот.'
            : 'Лот виден на /auctions и в ленте исполнителя по стране.'
        }
        to={saved === 'draft' ? '/app/importer/templates' : '/app/importer/current'}
        cta="Открыть список"
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Создать аукцион</h1>
          <p className="mt-2 text-[13.5px] text-muted">
            Можно переключать этапы сверху — предпросмотр без потери данных. Публикация только после «Проверить».
          </p>
          <ol className="mt-5 flex flex-wrap gap-2">
            {steps.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`rounded-lg px-3 py-1.5 font-mono text-[11px] transition-colors ${
                    i === step ? 'bg-brand text-white' : 'border border-line bg-white text-muted hover:border-brand hover:text-ink'
                  }`}
                >
                  {i + 1}. {s}
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-6 space-y-4 rounded-xl border border-line bg-white p-5">
        {step === 0 ? (
          <>
            <Field label="Название аукциона" hint="Своё или оставьте пустым — подставим маршрут">
              <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Направление">
              <select className={inputClass} value={form.country} onChange={(e) => set('country', e.target.value)}>
                {['Китай', 'Турция', 'Вьетнам', 'Индия', 'Другие страны', 'Экспорт'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Город отправления">
                <input className={inputClass} value={form.from} onChange={(e) => set('from', e.target.value)} />
              </Field>
              <Field label="Город доставки в РФ">
                <input className={inputClass} value={form.to} onChange={(e) => set('to', e.target.value)} />
              </Field>
            </div>
            <Field label="Адрес доставки">
              <input className={inputClass} value={form.destAddress} onChange={(e) => set('destAddress', e.target.value)} />
            </Field>
            <Field label="Отправитель" hint="Один завод. Несколько отправителей — напишите в комментарии.">
              <input
                className={inputClass}
                placeholder="Название фабрики"
                value={form.shipperName}
                onChange={(e) => set('shipperName', e.target.value)}
              />
            </Field>
            <Field label="Адрес, откуда экспедитор начинает работу">
              <input className={inputClass} value={form.shipperAddress} onChange={(e) => set('shipperAddress', e.target.value)} />
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Field label="Груз или коды ТН ВЭД">
              <input className={inputClass} value={form.cargo} onChange={(e) => set('cargo', e.target.value)} />
            </Field>
            <Field label="ТН ВЭД, 6 цифр" hint="Можно несколько через запятую">
              <input className={inputClass} value={form.hs} onChange={(e) => set('hs', e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Мест">
                <input className={inputClass} value={form.places} onChange={(e) => set('places', e.target.value)} />
              </Field>
              <Field label="Брутто, кг">
                <input className={inputClass} value={form.kg} onChange={(e) => set('kg', e.target.value)} />
              </Field>
              <Field label="Объём, м³">
                <input className={inputClass} value={form.cbm} onChange={(e) => set('cbm', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Упаковка">
                <select className={inputClass} value={form.packing} onChange={(e) => set('packing', e.target.value)}>
                  {['Коробка картон', 'На поддоне', 'Мешок', 'Другое'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Опасность">
                <select className={inputClass} value={form.danger} onChange={(e) => set('danger', e.target.value)}>
                  {['Не опасный', 'Класс 1', 'Класс 2', 'Класс 3', 'Класс 9'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Дата готовности груза" hint="Формат дд.мм.гггг, не mm/dd/yyyy">
              <input
                className={inputClass}
                placeholder="14.09.2026"
                value={form.ready}
                onChange={(e) => set('ready', e.target.value)}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Инкотермс">
                <select className={inputClass} value={form.incoterm} onChange={(e) => set('incoterm', e.target.value)}>
                  {['EXW', 'FCA', 'FAS', 'FOB'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Экспортная декларация">
                <select className={inputClass} value={form.exportDecl} onChange={(e) => set('exportDecl', e.target.value)}>
                  <option>Платит отправитель</option>
                  <option>Платит импортёр</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Валюта стоимости груза">
                <select className={inputClass} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  {['USD', 'EUR', 'CNY', 'RUB'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Стоимость груза" hint="На проде часто 0 — экспедитор не может оценить риск">
                <input className={inputClass} value={form.cargoValue} onChange={(e) => set('cargoValue', e.target.value)} />
              </Field>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Field label="Транспорт">
              <select className={inputClass} value={form.mode} onChange={(e) => set('mode', e.target.value)}>
                {['Авиа', 'Авто', 'ЖД', 'Море', 'Наземный', 'Море+ЖД', 'Море+Авто', 'Не важно'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Тип контейнера">
              <select className={inputClass} value={form.container} onChange={(e) => set('container', e.target.value)}>
                {['Не важно', 'Сборный LCL', '20′', '40′', '40HC'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.insurance} onChange={(e) => set('insurance', e.target.checked)} />
              Страховка включена в ставку
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.customs} onChange={(e) => set('customs', e.target.checked)} />
              ТО (таможня РФ) включена в ставку
            </label>
            <div className="rounded-xl bg-fog/60 p-4 text-[14px] leading-relaxed">
              <p className="font-semibold text-ink">Что входит в ставку «за всё»</p>
              <ul className="mt-2 space-y-1.5 text-muted">
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
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Дата аукциона" hint="дд.мм.гггг · минимум +2 суток от готовности">
                <input
                  className={inputClass}
                  placeholder="17.09.2026"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                />
              </Field>
              <Field label="Час начала (МСК)">
                <input className={inputClass} value={form.time} onChange={(e) => set('time', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Длительность, мин" hint="15–240 · обычно 60">
                <input className={inputClass} value={form.durationMin} onChange={(e) => set('durationMin', e.target.value)} />
              </Field>
              <Field label="Потолок ставки, $" hint="Максимум первой / стартовой вилки">
                <input className={inputClass} value={form.maxBidUsd} onChange={(e) => set('maxBidUsd', e.target.value)} />
              </Field>
              <Field label="Шаг снижения, $" hint="Минимум 1">
                <input className={inputClass} value={form.bidStepUsd} onChange={(e) => set('bidStepUsd', e.target.value)} />
              </Field>
            </div>
            <Field label="Комментарий" hint="Если нечего сказать — оставьте «нет»">
              <textarea className={`${inputClass} min-h-24`} value={form.comment} onChange={(e) => set('comment', e.target.value)} />
            </Field>
          </>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3 text-[14.5px] leading-relaxed">
            <p>
              <strong>{form.from}</strong> → <strong>{form.to}</strong>, {form.cargo}, {form.kg} кг / {form.cbm} м³,{' '}
              {form.incoterm}, {form.mode}.
            </p>
            <p>
              Слот {form.date} {form.time} МСК · {form.durationMin || 60} мин. Потолок ставки {form.maxBidUsd || '—'} $, шаг{' '}
              {form.bidStepUsd || 1} $. Страховка {form.insurance ? 'да' : 'нет'}, ТО {form.customs ? 'да' : 'нет'}.
              Стоимость груза {form.cargoValue || '0'} {form.currency}.
            </p>
            {errors.length ? (
              <ul className="rounded-xl border border-brand/40 bg-brand/5 p-3 text-[13.5px] text-brand">
                {errors.map((er) => (
                  <li key={er}>{er}</li>
                ))}
              </ul>
            ) : (
              <p className="text-ok">Проверка прошла. Дальше — шаблон или постановка в очередь: лот сразу попадёт в ленту.</p>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          {step > 0 && step < 4 ? (
            <button type="button" className="rounded-lg border border-line px-4 py-2 text-[13px]" onClick={() => setStep((s) => s - 1)}>
              Назад
            </button>
          ) : null}
          {step < 3 ? (
            <button
              type="button"
              className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-navy-2"
              onClick={() => setStep((s) => s + 1)}
            >
              Дальше
            </button>
          ) : null}
          {step === 3 ? (
            <button type="button" className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-navy-2" onClick={onCheck}>
              Проверить
            </button>
          ) : null}
          {step === 4 ? (
            <>
              <button
                type="button"
                className="rounded-lg border border-line px-4 py-2 text-[13px]"
                onClick={() => {
                  saveLot(buildLot(true))
                  setSaved('draft')
                }}
              >
                Сохранить шаблон
              </button>
              <button
                type="button"
                className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-navy-2"
                onClick={() => {
                  if (!check()) return
                  saveLot(buildLot(false))
                  setSaved('scheduled')
                }}
              >
                Поставить в очередь
              </button>
            </>
          ) : null}
        </div>
        {step === 3 ? (
          <p className="text-[12.5px] text-mist">
            После «Проверить» можно сохранить шаблон или поставить слот — он появится в публичной ленте.
          </p>
        ) : null}
      </div>
        </div>

        <aside className="h-fit space-y-3 lg:sticky lg:top-24">
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-mist">Предпросмотр</p>
            <p className="mt-2 text-[15px] font-semibold">{form.title || `${form.from || '…'} → ${form.to || '…'}`}</p>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-muted">
              <li>
                {form.country} · {form.incoterm} · {form.mode}
              </li>
              <li>
                {form.cargo || 'груз'} · ТН ВЭД {form.hs || '—'}
              </li>
              <li className="font-mono">
                {form.cbm || '0'} м³ · {form.kg || '0'} кг · {form.places || '0'} мест
              </li>
              <li>
                {form.container} · страховка {form.insurance ? 'да' : 'нет'} · ТО {form.customs ? 'да' : 'нет'}
              </li>
              <li>
                Слот {form.date || '—'} {form.time} · {form.durationMin || 60} мин
              </li>
              <li>
                Потолок {form.maxBidUsd || '—'} $ · шаг {form.bidStepUsd || 1} $
              </li>
              <li>
                Груз {form.cargoValue || '0'} {form.currency}
              </li>
            </ul>
            <p className="mt-4 text-[12px] text-mist">
              Этап {step + 1} из {steps.length}. Клик по шагам сверху — свободный переход.
            </p>
          </div>

          {smart && hints.length > 0 ? (
            <div className="rounded-xl border border-line bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <ThemeIcon id="tips" size={40} />
                <p className="text-[12px] font-semibold text-ink">Подсказки по этому шагу</p>
              </div>
              <ul className="space-y-2">
                {hints.map((h) => (
                  <li key={h.id} className="rounded-lg bg-fog/70 px-2.5 py-2">
                    <p
                      className={`text-[12px] font-semibold ${
                        h.tone === 'warn' ? 'text-danger' : h.tone === 'ok' ? 'text-ok' : 'text-ink'
                      }`}
                    >
                      {h.title}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{h.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <RatesStrip />
        </aside>
      </div>
    </div>
  )
}

function LotDetail({ lot, now, onClose }: { lot: AppLot; now: number; onClose: () => void }) {
  const st = lotStatus(lot, now)
  const win = bestBid(lot.bids)
  return (
    <div className="space-y-4 text-[13.5px]">
      <div>
        <p className="font-mono text-[11px] text-mist">
          {lot.code} · {statusRu(st)}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{lot.title}</h2>
        <p className="mt-1 text-muted">
          {lot.from} → {lot.to} · {lot.country}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-y border-line py-3 font-mono text-[12px]">
        <div>
          <dt className="text-mist">Груз</dt>
          <dd className="font-sans text-[13px] font-medium">{lot.cargo}</dd>
        </div>
        <div>
          <dt className="text-mist">ТН ВЭД</dt>
          <dd>{lot.hs || '—'}</dd>
        </div>
        <div>
          <dt className="text-mist">м³ / кг / мест</dt>
          <dd>
            {ruDec.format(lot.cbm)} / {ruInt.format(lot.kg)} / {lot.places}
          </dd>
        </div>
        <div>
          <dt className="text-mist">Стоимость груза</dt>
          <dd>
            {lot.cargoValue ? `${ruInt.format(lot.cargoValue)} ${lot.currency}` : '0 — риск'}
          </dd>
        </div>
        <div>
          <dt className="text-mist">Транспорт</dt>
          <dd className="font-sans">{lot.mode}</dd>
        </div>
        <div>
          <dt className="text-mist">Контейнер</dt>
          <dd className="font-sans">{lot.container}</dd>
        </div>
        <div>
          <dt className="text-mist">Базис</dt>
          <dd>{lot.incoterm}</dd>
        </div>
        <div>
          <dt className="text-mist">Слот</dt>
          <dd className="font-sans">{slotLabel(lot.startIso)}</dd>
        </div>
        <div>
          <dt className="text-mist">Страховка / ТО</dt>
          <dd>
            {lot.insurance ? 'да' : 'нет'} / {lot.customs ? 'да' : 'нет'}
          </dd>
        </div>
        <div>
          <dt className="text-mist">Игроки / min $</dt>
          <dd>
            {lot.bids.length ? uniqueBidders(lot.bids) : 0}
            {' / '}
            {win !== undefined ? `$${ruInt.format(win)}` : '—'}
          </dd>
        </div>
      </dl>
      <p className="text-[13px] text-muted">
        Отправитель: {lot.shipperName || '—'} · {lot.shipperAddress || 'адрес не указан'}
      </p>
      <p className="text-[13px] text-muted">Готовность {lot.ready} · комментарий: {lot.comment}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Link to={`/app/importer/lots/${lot.id}`} className="rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white" onClick={onClose}>
          Открыть полностью
        </Link>
        <Link to={`/app/importer/create?from=${lot.id}`} className="rounded-lg border border-line px-3 py-2 text-[13px]" onClick={onClose}>
          Повторить
        </Link>
      </div>
    </div>
  )
}

function LotTable({
  items,
  now,
  initialFilters,
}: {
  items: AppLot[]
  now: number
  initialFilters?: Record<string, string>
}) {
  if (!items.length) {
    return <EmptyState title="Пусто" text="Нет строк." to="/app/importer/create" cta="Создать аукцион" />
  }

  const columns: Col<AppLot>[] = [
    { key: 'code', label: 'Код', get: (d) => d.code, className: 'font-mono' },
    { key: 'title', label: 'Лот', get: (d) => d.title, cell: (d) => <span className="font-medium">{d.title}</span> },
    { key: 'country', label: 'Страна', get: (d) => d.country },
    { key: 'route', label: 'Маршрут', get: (d) => `${d.from} → ${d.to}` },
    { key: 'cargo', label: 'Груз', get: (d) => d.cargo },
    { key: 'hs', label: 'ТН ВЭД', get: (d) => d.hs || '—', className: 'font-mono' },
    {
      key: 'cbm',
      label: 'м³',
      get: (d) => d.cbm,
      sortType: 'number',
      cell: (d) => <span className="font-mono">{ruDec.format(d.cbm)}</span>,
    },
    {
      key: 'kg',
      label: 'кг',
      get: (d) => d.kg,
      sortType: 'number',
      cell: (d) => <span className="font-mono">{ruInt.format(d.kg)}</span>,
    },
    { key: 'mode', label: 'Транспорт', get: (d) => d.mode },
    { key: 'container', label: 'Загрузка', get: (d) => d.container },
    { key: 'incoterm', label: 'Базис', get: (d) => d.incoterm, className: 'font-mono' },
    { key: 'insurance', label: 'Страховка', get: (d) => (d.insurance ? 'да' : 'нет') },
    { key: 'customs', label: 'ТО', get: (d) => (d.customs ? 'да' : 'нет') },
    { key: 'currency', label: 'Валюта', get: (d) => d.currency },
    { key: 'packing', label: 'Упаковка', get: (d) => d.packing || '—' },
    {
      key: 'value',
      label: 'Груз $',
      get: (d) => d.cargoValue,
      sortType: 'number',
      cell: (d) => <span className="font-mono">{d.cargoValue ? ruInt.format(d.cargoValue) : '0'}</span>,
    },
    { key: 'week', label: 'Неделя', get: (d) => weekLabelFromIso(d.startIso), className: 'font-mono' },
    { key: 'slot', label: 'Слот', get: (d) => slotLabel(d.startIso), cell: (d) => slotLabel(d.startIso) },
    {
      key: 'bidders',
      label: 'n',
      get: (d) => (d.bids.length ? uniqueBidders(d.bids) : 0),
      sortType: 'number',
    },
    {
      key: 'win',
      label: 'Min $',
      get: (d) => bestBid(d.bids) ?? -1,
      sortType: 'number',
      cell: (d) => {
        const w = bestBid(d.bids)
        return <span className="font-mono">{w !== undefined ? `$${ruInt.format(w)}` : '—'}</span>
      },
    },
    { key: 'status', label: 'Статус', get: (d) => statusRu(lotStatus(d, now)) },
  ]

  return (
    <DataTable
      rows={items}
      columns={columns}
      rowKey={(d) => d.id}
      facetKey="country"
      facetAllLabel="Все страны"
      searchPlaceholder="Поиск: код, маршрут, ТН ВЭД, груз…"
      initialFilters={initialFilters}
      renderDetail={(d, close) => <LotDetail lot={d} now={now} onClose={close} />}
    />
  )
}

function DraftList({
  title,
  hint,
  items,
}: {
  title: string
  hint: string
  items: AppLot[]
}) {
  const now = useNow(2000)
  const [params] = useSearchParams()
  const week = params.get('week')?.trim() ?? ''
  const initialFilters = useMemo(() => (week ? { week } : undefined), [week])
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
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
        <LotTable items={items} now={now} initialFilters={initialFilters} />
      </div>
    </div>
  )
}

function useMyLots() {
  const { user, lots } = useSession()
  const now = useNow(2000)
  const mine = lots.filter((d) => d.ownerId === user?.id)
  return { mine, now }
}

export function ImporterTemplates() {
  const { mine, now } = useMyLots()
  return (
    <DraftList
      title="Шаблоны"
      hint="Черновики. Откройте лот → «Повторить» или выложите слот."
      items={mine.filter((d) => lotStatus(d, now) === 'draft')}
    />
  )
}

export function ImporterCurrent() {
  const { mine, now } = useMyLots()
  return (
    <DraftList
      title="Текущие"
      hint="Очередь и живой слот. Без опечатки «ТЕКУШИЕ»."
      items={mine.filter((d) => {
        const st = lotStatus(d, now)
        return !d.archived && (st === 'scheduled' || st === 'live')
      })}
    />
  )
}

export function ImporterHeld() {
  const { mine, now } = useMyLots()
  return (
    <DraftList
      title="Состоялись"
      hint="≥ 2 исполнителя со ставками. Показаны незакрытые в архив. Кнопка «Фильтр» — по всем полям."
      items={mine.filter((d) => lotStatus(d, now) === 'held' && !d.archived)}
    />
  )
}

export function ImporterFailed() {
  const { mine, now } = useMyLots()
  return (
    <DraftList
      title="Не состоялись"
      hint="Не набралось двух исполнителей. Откройте лот и поставьте новый слот."
      items={mine.filter((d) => lotStatus(d, now) === 'failed')}
    />
  )
}

export function ImporterBids() {
  const { mine } = useMyLots()
  type BidRow = { id: string; lotId: string; title: string; amount: number; at: string; route: string; code: string }
  const rows: BidRow[] = mine
    .flatMap((l) =>
      l.bids.map((b, i) => ({
        id: `${l.id}-${i}-${b.at}`,
        lotId: l.id,
        title: l.title,
        code: l.code,
        route: `${l.from} → ${l.to}`,
        amount: b.amount,
        at: b.at,
      })),
    )
    .sort((a, b) => b.at.localeCompare(a.at))

  const columns: Col<BidRow>[] = [
    { key: 'code', label: 'Код', get: (r) => r.code, className: 'font-mono' },
    { key: 'title', label: 'Лот', get: (r) => r.title },
    { key: 'route', label: 'Маршрут', get: (r) => r.route },
    {
      key: 'amount',
      label: 'USD',
      get: (r) => r.amount,
      sortType: 'number',
      cell: (r) => <span className="font-mono">${ruInt.format(r.amount)}</span>,
    },
    {
      key: 'at',
      label: 'Когда',
      get: (r) => r.at,
      cell: (r) => <span className="text-muted">{r.at.replace('T', ' ').slice(0, 16)}</span>,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Ставки по вашим лотам</h1>
      <p className="text-[13.5px] text-muted">Слепые: видно сумму и время, не видно кто. Клик по строке — карточка лота.</p>
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        {rows.length === 0 ? (
          <EmptyState title="Ставок ещё нет" text="Когда экспедиторы поставят — появятся здесь." to="/app/importer/current" cta="К текущим" />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            searchPlaceholder="Поиск по лоту, коду, маршруту…"
            renderDetail={(r, close) => (
              <div className="space-y-3 text-[13.5px]">
                <p className="font-mono text-[11px] text-mist">{r.code}</p>
                <h2 className="text-lg font-semibold">{r.title}</h2>
                <p className="text-muted">{r.route}</p>
                <p className="font-mono text-[18px] font-semibold">${ruInt.format(r.amount)}</p>
                <p className="text-mist">{r.at.replace('T', ' ').slice(0, 16)}</p>
                <Link to={`/app/importer/lots/${r.lotId}`} className="inline-flex rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white" onClick={close}>
                  Открыть лот
                </Link>
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}

export function ImporterArchive() {
  const { mine } = useMyLots()
  return (
    <DraftList
      title="Архив"
      hint="Старые закрытые слоты. Не путать с «не состоялись». Кнопка «Фильтр» — по всем полям."
      items={mine.filter((d) => d.archived)}
    />
  )
}

export function ImporterLot() {
  const { id } = useParams()
  const navigate = useNavigate()
  const now = useNow(1000)
  const { user, lots, startNow, finishNow, archiveLot, newSlot, removeLot } = useSession()
  const [date, setDate] = useState(plusDays(todayDd(), 3))
  const [time, setTime] = useState('13:00')
  const [msg, setMsg] = useState<string | null>(null)
  const lot = lots.find((l) => l.id === id && l.ownerId === user?.id)

  if (!lot) {
    return <EmptyState title="Лот не найден" text="Нет такого id в вашем кабинете." to="/app/importer" cta="На дашборд" />
  }

  const st = lotStatus(lot, now)
  const win = bestBid(lot.bids)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="font-mono text-[12px] text-mist">
        {lot.code} · {statusRu(st)}
      </p>
      <h1 className="text-2xl font-semibold">{lot.title}</h1>
      <p className="text-[15px] text-muted">
        {lot.from} → {lot.to} · {lot.cargo} · {ruDec.format(lot.cbm)} м³ / {ruInt.format(lot.kg)} кг
      </p>
      <dl className="grid gap-3 rounded-xl border border-line bg-white p-5 text-[14px] sm:grid-cols-2">
        <div>
          <dt className="text-mist">Слот</dt>
          <dd>
            {slotLabel(lot.startIso)} — {slotLabel(lot.endIso)}
          </dd>
        </div>
        <div>
          <dt className="text-mist">Игроки / лучшая $</dt>
          <dd>
            {uniqueBidders(lot.bids)} / {win !== undefined ? `$${ruInt.format(win)}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-mist">Инкотермс · транспорт</dt>
          <dd>
            {lot.incoterm} · {lot.mode}
          </dd>
        </div>
        <div>
          <dt className="text-mist">Стоимость груза</dt>
          <dd>
            {lot.cargoValue || '0'} {lot.currency}
          </dd>
        </div>
      </dl>
      <div className="rounded-xl border border-line bg-white p-5">
        <p className="font-semibold">Ставки (слепые)</p>
        {lot.bids.length ? (
          <ul className="mt-2 space-y-1 text-[14px]">
            {[...lot.bids]
              .sort((a, b) => b.at.localeCompare(a.at))
              .map((b, i) => (
                <li key={`${b.at}-${i}`} className="flex justify-between font-mono text-[13px]">
                  <span>${ruInt.format(b.amount)}</span>
                  <span className="text-mist">{b.at.replace('T', ' ').slice(0, 16)}</span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-2 text-[14px] text-muted">Пока пусто.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {st === 'scheduled' || st === 'draft' ? (
          <button type="button" className="rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white hover:bg-navy-2" onClick={() => startNow(lot.id)}>
            Начать сейчас
          </button>
        ) : null}
        {st === 'live' || st === 'scheduled' ? (
          <button type="button" className="rounded-lg border border-line px-3 py-2 text-[13px]" onClick={() => finishNow(lot.id)}>
            Завершить сейчас
          </button>
        ) : null}
        <Link to={`/app/importer/create?from=${lot.id}`} className="rounded-lg border border-line px-3 py-2 text-[13px]">
          Повторить как новый
        </Link>
        {!lot.archived ? (
          <button type="button" className="rounded-lg border border-line px-3 py-2 text-[13px]" onClick={() => archiveLot(lot.id)}>
            В архив
          </button>
        ) : null}
        {lot.isDraft ? (
          <button
            type="button"
            className="rounded-lg border border-brand/40 px-3 py-2 text-[13px] text-brand"
            onClick={() => {
              const fail = removeLot(lot.id)
              if (fail) setMsg(fail)
              else navigate('/app/importer/templates')
            }}
          >
            Удалить шаблон
          </button>
        ) : null}
      </div>
      {st === 'failed' || st === 'held' || st === 'archived' ? (
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="font-semibold">Новый слот</p>
          <p className="mt-1 text-[13px] text-muted">Анкета та же, ставки обнулятся. Лот снова в ленте.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
            <input className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} placeholder="дд.мм.гггг" />
            <input className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
            <button
              type="button"
              className="rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white hover:bg-navy-2"
              onClick={() => {
                const fail = newSlot(lot.id, date, time)
                setMsg(fail ?? 'Слот поставлен, лот в ленте.')
              }}
            >
              Поставить
            </button>
          </div>
        </div>
      ) : null}
      {msg ? <p className="text-[13px] text-muted">{msg}</p> : null}
    </div>
  )
}

export function ImporterMessage() {
  return <MessageForm who="заказчика" />
}
