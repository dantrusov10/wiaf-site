import { useEffect, useMemo, useState } from 'react'
import { lanes } from '../content/analytics'
import { formatMoney } from './calc'
import { listQuotes, saveQuotes, uid, type QuoteEntry } from './storage'
import { ToolPageFrame } from './ToolPageFrame'
import { Disclaimer, Field, inputClass, ResultCard, RowKV } from './ui'

export function QuotesToolPage() {
  const [rows, setRows] = useState<QuoteEntry[]>([])
  const [lane, setLane] = useState('Гуанчжоу → Москва')
  const [marketId, setMarketId] = useState(lanes[0].id)
  const [amount, setAmount] = useState(4500)
  const [currency, setCurrency] = useState<'USD' | 'RUB'>('USD')
  const [days, setDays] = useState('35–42')
  const [fromWho, setFromWho] = useState('')
  const [incoterms, setIncoterms] = useState('FOB')
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setRows(listQuotes())
  }, [])

  const persist = (next: QuoteEntry[]) => {
    setRows(next)
    saveQuotes(next)
  }

  const market = lanes.find((l) => l.id === marketId) ?? lanes[0]
  const usdRows = rows.filter((r) => r.currency === 'USD')
  const avg = usdRows.length ? usdRows.reduce((s, r) => s + r.amount, 0) / usdRows.length : null
  const min = usdRows.length ? Math.min(...usdRows.map((r) => r.amount)) : null
  const max = usdRows.length ? Math.max(...usdRows.map((r) => r.amount)) : null

  const picked = rows.filter((r) => selected.includes(r.id))
  const inviteHint = useMemo(() => {
    if (picked.length >= 2) {
      return `На час имеет смысл позвать: ${picked.map((p) => p.fromWho).join(', ')} — у вас уже ≥2 котировки.`
    }
    if (usdRows.length >= 2) return 'Отметьте 2–3 КП галочками — подскажем, кого звать на слепой час.'
    return 'Сохраните хотя бы две котировки по плечу — появится смысл звать конкурентов на час wIaF.'
  }, [picked, usdRows.length])

  return (
    <ToolPageFrame
      slug="quotes"
      title="Журнал котировок"
      dek="Записная книжка + сравнение с медианой слотов + кого звать на аукцион. Не публичный индекс фрахта."
      usp={
        <p>
          WhatsApp забывает. Журнал помнит вилку ваших КП, кладёт рядом медиану побед wIaF по коридору и помогает выбрать 2–3 экспедиторов на час — это мост к аукциону, не Excel ради Excel.
        </p>
      }
    >
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ResultCard title="Ваша вилка (USD)">
          {avg == null ? (
            <p className="text-[13px] text-muted">Пока пусто — добавьте КП из чата.</p>
          ) : (
            <>
              <RowKV k="Записей" v={String(usdRows.length)} />
              <RowKV k="Мин–макс" v={`$${formatMoney(min!)} – $${formatMoney(max!)}`} />
              <RowKV k="Среднее" v={`$${formatMoney(avg, 0)}`} strong />
            </>
          )}
        </ResultCard>
        <ResultCard title="Медиана слотов wIaF">
          <Field label="Коридор" tip="Срез состоявшихся торгов площадки — ориентир, не оферта на ваш груз.">
            <select className={inputClass()} value={marketId} onChange={(e) => setMarketId(e.target.value)}>
              {lanes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.from} → {l.to} · ${l.medianWin}
                </option>
              ))}
            </select>
          </Field>
          <RowKV k="Медиана победы" v={`$${formatMoney(market.medianWin)}`} strong />
          {avg != null ? (
            <RowKV k="Ваше среднее vs медиана" v={`${avg >= market.medianWin ? '+' : ''}$${formatMoney(avg - market.medianWin, 0)}`} />
          ) : null}
        </ResultCard>
        <ResultCard title="К аукциону">
          <p className="text-[13.5px] leading-relaxed">{inviteHint}</p>
        </ResultCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3 rounded-xl border border-line bg-white p-5">
          <p className="text-[13px] font-semibold">Новая котировка из чата</p>
          <Field label="Плечо" tip="Как вы сами называете маршрут в переговорах.">
            <input className={inputClass()} value={lane} onChange={(e) => setLane(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Сумма" tip="Цифра, которую назвали. Без «от» — берите то, что готовы сравнивать.">
              <input className={inputClass()} type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Валюта" tip="Большинство КП в USD; рубли тоже можно.">
              <select className={inputClass()} value={currency} onChange={(e) => setCurrency(e.target.value as 'USD' | 'RUB')}>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
              </select>
            </Field>
          </div>
          <Field label="Срок" tip="Что пообещали по дням.">
            <input className={inputClass()} value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
          <Field label="От кого" tip="Имя / компания — пригодится, когда будете звать на час.">
            <input className={inputClass()} value={fromWho} onChange={(e) => setFromWho(e.target.value)} />
          </Field>
          <Field label="Incoterms / состав" tip="FOB? Дверь? Что входит — иначе сравнивать бессмысленно.">
            <input className={inputClass()} value={incoterms} onChange={(e) => setIncoterms(e.target.value)} />
          </Field>
          <Field label="Заметка" tip="Любая оговорка из переписки.">
            <input className={inputClass()} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <button
            type="button"
            className="rounded-lg bg-navy px-4 py-2 text-[13px] font-semibold text-white"
            onClick={() =>
              persist([
                {
                  id: uid(),
                  createdAt: new Date().toISOString(),
                  lane,
                  amount,
                  currency,
                  days,
                  fromWho: fromWho || '—',
                  incoterms,
                  note,
                },
                ...rows,
              ])
            }
          >
            Сохранить
          </button>
          <Disclaimer>Хранится в браузере. Сравнение с медианой — факты слотов wIaF, не SCFI.</Disclaimer>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="border-b border-line bg-fog/50 font-mono text-[10px] uppercase text-mist">
              <tr>
                <th className="px-3 py-2">На час</th>
                <th className="px-3 py-2">Дата</th>
                <th className="px-3 py-2">Кто / плечо</th>
                <th className="px-3 py-2">Сумма</th>
                <th className="px-3 py-2">vs медиана</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const vs = r.currency === 'USD' ? r.amount - market.medianWin : null
                return (
                  <tr key={r.id} className="border-b border-line last:border-0 align-top">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(r.id)}
                        onChange={(e) =>
                          setSelected((s) => (e.target.checked ? [...s, r.id] : s.filter((x) => x !== r.id)))
                        }
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">{r.createdAt.slice(0, 10)}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{r.fromWho}</p>
                      <p className="text-[11px] text-mist">
                        {r.lane} · {r.days} · {r.incoterms}
                      </p>
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {formatMoney(r.amount)} {r.currency}
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px]">
                      {vs == null ? '—' : `${vs >= 0 ? '+' : ''}$${formatMoney(vs, 0)}`}
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" className="text-[12px] text-brand underline" onClick={() => persist(rows.filter((x) => x.id !== r.id))}>
                        Удал.
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPageFrame>
  )
}
