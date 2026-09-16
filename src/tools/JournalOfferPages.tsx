import { useEffect, useMemo, useState } from 'react'
import { formatMoney } from './calc'
import { listRates, saveRates, uid, type RateEntry } from './storage'
import { ToolPageFrame } from './ToolPageFrame'
import { Disclaimer, Field, inputClass, ResultCard, RowKV } from './ui'

export function RatesToolPage() {
  const [rows, setRows] = useState<RateEntry[]>([])
  const [lane, setLane] = useState('Нинбо → Москва')
  const [buy, setBuy] = useState(3800)
  const [sell, setSell] = useState(4500)
  const [currency, setCurrency] = useState<'USD' | 'RUB'>('USD')
  const [mode, setMode] = useState('Море FCL 40HC')
  const [note, setNote] = useState('')

  useEffect(() => {
    setRows(listRates())
  }, [])

  const persist = (next: RateEntry[]) => {
    setRows(next)
    saveRates(next)
  }

  const margin = sell - buy
  const marginPct = buy > 0 ? (margin / buy) * 100 : 0

  return (
    <ToolPageFrame
      slug="rates"
      title="Книга тарифов"
      dek="Только для исполнителя: закуп ёмкости vs цена клиенту. Заказчик этот экран не видит."
      usp={
        <p>
          Журнал котировок у заказчика — чужие КП. Здесь — ваши деньги и маржа по плечу, чтобы не продать в минус и быстро подставить цифры в all-in / КП.
        </p>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3 rounded-xl border border-line bg-white p-5">
          <Field label="Плечо" tip="Маршрут, как вы его ведёте внутри.">
            <input className={inputClass()} value={lane} onChange={(e) => setLane(e.target.value)} />
          </Field>
          <Field label="Режим" tip="FCL / LCL / авто — чтобы не смешивать несравнимое.">
            <input className={inputClass()} value={mode} onChange={(e) => setMode(e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Закуп" tip="Что платите линии / агенту.">
              <input className={inputClass()} type="number" value={buy} onChange={(e) => setBuy(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Продажа" tip="Что отдаёте клиенту (или планируете).">
              <input className={inputClass()} type="number" value={sell} onChange={(e) => setSell(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Валюта" tip="Обычно USD.">
              <select className={inputClass()} value={currency} onChange={(e) => setCurrency(e.target.value as 'USD' | 'RUB')}>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
              </select>
            </Field>
          </div>
          <ResultCard title="Сейчас">
            <RowKV k="Маржа" v={`${formatMoney(margin)} ${currency}`} strong />
            <RowKV k="% к закупу" v={`${formatMoney(marginPct, 1)}%`} />
            {margin < 0 ? <p className="text-[13px] text-brand">Продажа ниже закупа.</p> : null}
          </ResultCard>
          <Field label="Заметка" tip="Условия, дата линии, оговорки.">
            <input className={inputClass()} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <button
            type="button"
            className="rounded-lg bg-navy px-4 py-2 text-[13px] font-semibold text-white"
            onClick={() =>
              persist([{ id: uid(), createdAt: new Date().toISOString(), lane, buy, sell, currency, mode, note }, ...rows])
            }
          >
            Записать
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="border-b border-line bg-fog/50 font-mono text-[10px] uppercase text-mist">
              <tr>
                <th className="px-3 py-2">Дата</th>
                <th className="px-3 py-2">Плечо</th>
                <th className="px-3 py-2">Закуп</th>
                <th className="px-3 py-2">Продажа</th>
                <th className="px-3 py-2">Маржа</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 font-mono text-[11px]">{r.createdAt.slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    {r.lane}
                    <p className="text-[11px] text-mist">{r.mode}</p>
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {formatMoney(r.buy)} {r.currency}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {formatMoney(r.sell)} {r.currency}
                  </td>
                  <td className={`px-3 py-2 font-mono ${r.sell - r.buy < 0 ? 'text-brand' : 'text-ok'}`}>
                    {formatMoney(r.sell - r.buy)}
                  </td>
                  <td className="px-3 py-2">
                    <button type="button" className="text-[12px] text-brand underline" onClick={() => persist(rows.filter((x) => x.id !== r.id))}>
                      Удал.
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPageFrame>
  )
}

type OfferLine = { id: string; name: string; amount: number; on: boolean }

export function OfferToolPage() {
  const [company, setCompany] = useState('ООО РЛТ')
  const [client, setClient] = useState('ООО Пример')
  const [lane, setLane] = useState('Гуанчжоу → Москва')
  const [mode, setMode] = useState('Авто / сборный')
  const [cbm, setCbm] = useState('32')
  const [kg, setKg] = useState('4800')
  const [incoterms, setIncoterms] = useState('FOB Гуанчжоу')
  const [transit, setTransit] = useState('28–35 суток')
  const [freeTime, setFreeTime] = useState('7 суток free time')
  const [payment, setPayment] = useState('50% / 50%')
  const [validDays, setValidDays] = useState('3')
  const [excludes, setExcludes] = useState('Таможня РФ, сертификация, страхование, простой сверх free time')
  const [lines, setLines] = useState<OfferLine[]>([
    { id: '1', name: 'Фрахт', amount: 4200, on: true },
    { id: '2', name: 'THC', amount: 160, on: true },
    { id: '3', name: 'DOC', amount: 45, on: true },
  ])
  const [copied, setCopied] = useState(false)

  const total = lines.reduce((s, l) => s + (l.on ? l.amount : 0), 0)
  const validUntil = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + (Number(validDays) || 0))
    return d.toLocaleDateString('ru-RU')
  }, [validDays])

  const text = useMemo(() => {
    const parts = lines.filter((l) => l.on).map((l) => `  — ${l.name}: $${formatMoney(l.amount)}`)
    return [
      `КП от ${company} для ${client}`,
      `дата ${new Date().toLocaleDateString('ru-RU')} · до ${validUntil}`,
      ``,
      `${lane} · ${mode} · ${cbm} м³ / ${kg} кг · ${incoterms}`,
      ``,
      `Ставка USD:`,
      ...parts,
      `ИТОГО: $${formatMoney(total)}`,
      ``,
      `Срок: ${transit}`,
      `Free time: ${freeTime}`,
      `Оплата: ${payment}`,
      `Не включено: ${excludes}`,
      ``,
      `Предложение исполнителя, не оферта wIaF.`,
    ].join('\n')
  }, [company, client, validUntil, lane, mode, cbm, kg, incoterms, lines, total, transit, freeTime, payment, excludes])

  return (
    <ToolPageFrame
      slug="offer"
      title="Конструктор КП"
      dek="Упаковка цифр для клиента. Себестоимость считайте в all-in, сюда — финальный текст."
      usp={
        <p>
          Не одно поле «цена». Разбивка, free time, исключения и срок действия — чтобы клиент не писал «а THC?» через час после «ок».
        </p>
      }
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-line bg-white p-5 sm:grid-cols-2">
            <Field label="От кого" tip="Ваше юрлицо в шапке КП.">
              <input className={inputClass()} value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field label="Клиенту" tip="Кому уходит предложение.">
              <input className={inputClass()} value={client} onChange={(e) => setClient(e.target.value)} />
            </Field>
            <Field label="Маршрут" tip="Как в запросе клиента.">
              <input className={inputClass()} value={lane} onChange={(e) => setLane(e.target.value)} />
            </Field>
            <Field label="Режим" tip="Чтобы не путали FCL и сборный.">
              <input className={inputClass()} value={mode} onChange={(e) => setMode(e.target.value)} />
            </Field>
            <Field label="м³" tip="Из запроса или калькулятора объёма.">
              <input className={inputClass()} value={cbm} onChange={(e) => setCbm(e.target.value)} />
            </Field>
            <Field label="кг" tip="Брутто партии.">
              <input className={inputClass()} value={kg} onChange={(e) => setKg(e.target.value)} />
            </Field>
            <Field label="Incoterms" tip="Базис, на котором стоит ставка.">
              <input className={inputClass()} value={incoterms} onChange={(e) => setIncoterms(e.target.value)} />
            </Field>
            <Field label="Срок действия, дней" tip="После этой даты цифры могут сгореть.">
              <input className={inputClass()} type="number" value={validDays} onChange={(e) => setValidDays(e.target.value)} />
            </Field>
          </div>
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-[13px] font-semibold">Строки ставки</p>
            {lines.map((l) => (
              <div key={l.id} className="mt-2 flex flex-wrap items-center gap-2">
                <input type="checkbox" checked={l.on} onChange={(e) => setLines((p) => p.map((x) => (x.id === l.id ? { ...x, on: e.target.checked } : x)))} />
                <input className={`${inputClass()} min-w-[10rem] flex-1`} value={l.name} onChange={(e) => setLines((p) => p.map((x) => (x.id === l.id ? { ...x, name: e.target.value } : x)))} />
                <input className={`${inputClass()} w-28`} type="number" value={l.amount} onChange={(e) => setLines((p) => p.map((x) => (x.id === l.id ? { ...x, amount: Number(e.target.value) || 0 } : x)))} />
              </div>
            ))}
            <p className="mt-3 font-mono font-semibold">Итого ${formatMoney(total)}</p>
          </div>
          <div className="space-y-3 rounded-xl border border-line bg-white p-5">
            <Field label="Срок в пути" tip="Ориентир ETA, не гарантия.">
              <input className={inputClass()} value={transit} onChange={(e) => setTransit(e.target.value)} />
            </Field>
            <Field label="Free time" tip="Сколько суток без DEM/DET.">
              <input className={inputClass()} value={freeTime} onChange={(e) => setFreeTime(e.target.value)} />
            </Field>
            <Field label="Оплата" tip="График, чтобы не спорили потом.">
              <input className={inputClass()} value={payment} onChange={(e) => setPayment(e.target.value)} />
            </Field>
            <Field label="Не включено" tip="Явно вынести — снижает конфликты.">
              <textarea className={inputClass()} rows={2} value={excludes} onChange={(e) => setExcludes(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl bg-navy p-5 text-fog">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">{text}</pre>
          </div>
          <button
            type="button"
            className="rounded-lg bg-brand-2 px-4 py-2.5 text-[13px] font-semibold text-navy"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch {
                /* ignore */
              }
            }}
          >
            {copied ? 'Скопировано' : 'Скопировать'}
          </button>
          <Disclaimer>Сначала посчитайте all-in, потом соберите текст здесь.</Disclaimer>
        </div>
      </div>
    </ToolPageFrame>
  )
}
