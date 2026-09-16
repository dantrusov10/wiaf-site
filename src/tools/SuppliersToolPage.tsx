import { useEffect, useState } from 'react'
import { supplierFlags } from './data'
import { uid } from './storage'
import { ToolPageFrame } from './ToolPageFrame'
import { Disclaimer, Field, inputClass, HintLabel } from './ui'

export type WiafReviewStatus = 'none' | 'self_only' | 'queued' | 'reviewed'

export type SupplierRecord = {
  id: string
  name: string
  city: string
  product: string
  contact: string
  answers: Record<string, 'yes' | 'no' | ''>
  ownScore: number
  ownNote: string
  wiafStatus: WiafReviewStatus
  wiafNote: string
  updatedAt: string
}

const KEY = 'wiaf-tool-suppliers-v1'
const statusRu: Record<WiafReviewStatus, string> = {
  none: '—',
  self_only: 'Самопроверка',
  queued: 'Очередь ВИАФ',
  reviewed: 'Есть пометка ВИАФ',
}

function load(): SupplierRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SupplierRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(rows: SupplierRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(rows))
}

function score(answers: Record<string, 'yes' | 'no' | ''>) {
  let yes = 0
  let no = 0
  for (const f of supplierFlags) {
    if (answers[f.id] === 'yes') yes += 1
    if (answers[f.id] === 'no') no += 1
  }
  return { yes, no, of: supplierFlags.length, pct: Math.round((yes / supplierFlags.length) * 100) }
}

export function SuppliersToolPage() {
  const [rows, setRows] = useState<SupplierRecord[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [panel, setPanel] = useState<'profile' | 'checklist'>('profile')

  useEffect(() => {
    const initial = load()
    setRows(initial)
    setActiveId(initial[0]?.id ?? null)
  }, [])

  const persist = (next: SupplierRecord[]) => {
    setRows(next)
    save(next)
  }

  const active = rows.find((r) => r.id === activeId) ?? null
  const sc = active ? score(active.answers) : null

  const create = () => {
    const rec: SupplierRecord = {
      id: uid(),
      name: '',
      city: 'Гуанчжоу',
      product: 'Одежда',
      contact: '',
      answers: Object.fromEntries(supplierFlags.map((f) => [f.id, ''] as const)),
      ownScore: 3,
      ownNote: '',
      wiafStatus: 'self_only',
      wiafNote: '',
      updatedAt: new Date().toISOString(),
    }
    persist([rec, ...rows])
    setActiveId(rec.id)
    setPanel('profile')
  }

  const patch = (id: string, p: Partial<SupplierRecord>) => {
    persist(rows.map((r) => (r.id === id ? { ...r, ...p, updatedAt: new Date().toISOString() } : r)))
  }

  return (
    <ToolPageFrame
      slug="suppliers"
      title="Поставщики"
      dek="Реестр фабрик в вашем кабинете: чеклист методики ВИАФ, ваша оценка, статус проверки площадкой."
      usp={
        <p>
          Не «поиск всех фабрик Китая». Вы заводите тех, с кем уже пишете → прогоняете чеклист → копите историю. Позже кнопка «очередь ВИАФ» даёт короткую пометку команды (не инспекция SGS).
        </p>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-[13px] font-semibold">Реестр · {rows.length}</p>
          <button type="button" className="rounded-lg bg-navy px-3 py-1.5 text-[12px] font-semibold text-white" onClick={create}>
            Добавить поставщика
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="px-6 py-16 text-center text-[14px] text-muted">Пока никого нет. Добавьте фабрику из переписки.</p>
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr]">
            <ul className="max-h-[70vh] overflow-y-auto border-b border-line lg:border-b-0 lg:border-r">
              {rows.map((r) => {
                const s = score(r.answers)
                const activeRow = r.id === activeId
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(r.id)
                        setPanel('profile')
                      }}
                      className={`w-full border-b border-line px-4 py-3 text-left last:border-0 ${
                        activeRow ? 'bg-brand/10' : 'hover:bg-fog/60'
                      }`}
                    >
                      <p className="truncate text-[14px] font-semibold">{r.name || 'Без названия'}</p>
                      <p className="truncate text-[12px] text-muted">
                        {r.city} · {r.product || '—'}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fog">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${s.pct}%` }} />
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-mist">
                        чеклист {s.yes}/{s.of} · {r.ownScore}★ · {statusRu[r.wiafStatus]}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>

            {active && sc ? (
              <div className="flex min-h-[420px] flex-col">
                <div className="flex gap-1 border-b border-line px-2 pt-2">
                  {(
                    [
                      ['profile', 'Карточка'],
                      ['checklist', 'Чеклист ВИАФ'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPanel(id)}
                      className={`rounded-t-lg px-4 py-2 text-[13px] ${
                        panel === id ? 'bg-fog font-semibold text-ink' : 'text-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {panel === 'profile' ? (
                  <div className="space-y-4 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Название" tip="Как в контракте или как зовёте в чате.">
                        <input
                          className={inputClass()}
                          value={active.name}
                          placeholder="Фабрика / компания"
                          onChange={(e) => patch(active.id, { name: e.target.value })}
                        />
                      </Field>
                      <Field label="Город" tip="Регион производства или склада отгрузки.">
                        <input className={inputClass()} value={active.city} onChange={(e) => patch(active.id, { city: e.target.value })} />
                      </Field>
                      <Field label="Товар" tip="Что берёте у них (для фильтра в голове).">
                        <input className={inputClass()} value={active.product} onChange={(e) => patch(active.id, { product: e.target.value })} />
                      </Field>
                      <Field label="Контакт" tip="WeChat / телефон / менеджер.">
                        <input className={inputClass()} value={active.contact} onChange={(e) => patch(active.id, { contact: e.target.value })} />
                      </Field>
                      <Field label="Ваша оценка 1–5" tip="Субъективно: качество связи, честность сроков.">
                        <input
                          className={inputClass()}
                          type="number"
                          min={1}
                          max={5}
                          value={active.ownScore}
                          onChange={(e) => patch(active.id, { ownScore: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })}
                        />
                      </Field>
                      <Field label="Статус ВИАФ" tip="Самопроверка → очередь → пометка команды. На localhost очередь демо.">
                        <select
                          className={inputClass()}
                          value={active.wiafStatus}
                          onChange={(e) => patch(active.id, { wiafStatus: e.target.value as WiafReviewStatus })}
                        >
                          {(Object.keys(statusRu) as WiafReviewStatus[]).map((k) => (
                            <option key={k} value={k}>
                              {statusRu[k]}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Ваша заметка" tip="Свободный текст: условия оплаты, брак, что обещали.">
                      <textarea
                        className={inputClass()}
                        rows={2}
                        value={active.ownNote}
                        onChange={(e) => patch(active.id, { ownNote: e.target.value })}
                      />
                    </Field>
                    <Field label="Пометка ВИАФ" tip="Что напишет команда после очереди. Сейчас можно заполнить как демо.">
                      <textarea
                        className={inputClass()}
                        rows={2}
                        value={active.wiafNote}
                        onChange={(e) => patch(active.id, { wiafNote: e.target.value })}
                      />
                    </Field>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="rounded-lg border border-line px-3 py-2 text-[12px] font-semibold"
                        onClick={() => patch(active.id, { wiafStatus: 'queued' })}
                      >
                        В очередь ВИАФ
                      </button>
                      <button
                        type="button"
                        className="text-[12px] text-brand underline"
                        onClick={() => {
                          const next = rows.filter((r) => r.id !== active.id)
                          persist(next)
                          setActiveId(next[0]?.id ?? null)
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                    <Disclaimer>
                      Оценка чеклиста: {sc.yes}/{sc.of} «да», рисков «нет»: {sc.no}. Методика площадки — вопросы ниже во вкладке.
                    </Disclaimer>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <HintLabel label="Прогресс чеклиста" tip="Доля пунктов, закрытых ответом «да»." />
                      <span className="font-mono text-[13px]">{sc.pct}%</span>
                    </div>
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-fog">
                      <div className="h-full bg-brand" style={{ width: `${sc.pct}%` }} />
                    </div>
                    {supplierFlags.map((f, idx) => (
                      <div key={f.id} className="rounded-xl border border-line px-4 py-3">
                        <p className="text-[13px] font-medium">
                          {idx + 1}. {f.q}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            className={`rounded-lg px-3 py-1 text-[12px] ${
                              active.answers[f.id] === 'yes' ? 'bg-ok text-white' : 'border border-line'
                            }`}
                            onClick={() => patch(active.id, { answers: { ...active.answers, [f.id]: 'yes' } })}
                          >
                            Да
                          </button>
                          <button
                            type="button"
                            className={`rounded-lg px-3 py-1 text-[12px] ${
                              active.answers[f.id] === 'no' ? 'bg-brand text-white' : 'border border-line'
                            }`}
                            onClick={() => patch(active.id, { answers: { ...active.answers, [f.id]: 'no' } })}
                          >
                            Нет
                          </button>
                        </div>
                        {active.answers[f.id] === 'no' ? <p className="mt-2 text-[12px] text-brand">{f.bad}</p> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </ToolPageFrame>
  )
}
