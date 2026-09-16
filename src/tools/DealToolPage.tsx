import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, Copy } from 'lucide-react'
import { docChecklist, incoterms, type Incoterm } from './data'
import { ToolPageFrame } from './ToolPageFrame'
import { Field, inputClass } from './ui'

type Step = 'situation' | 'map' | 'docs' | 'summary'

const DOCS_KEY = 'wiaf-deal-docs-v1'

const situations = [
  {
    id: 'exw-clothes',
    title: 'Забираю с фабрики в Китае',
    dek: 'Типичная одежда: продавец отдал на своём складе',
    code: 'EXW',
    mode: 'Любой',
  },
  {
    id: 'fob-sea',
    title: 'Продавец грузит на судно',
    dek: 'Море: риск с борта, фрахт мой',
    code: 'FOB',
    mode: 'Море',
  },
  {
    id: 'fca-rail',
    title: 'Отдаю перевозчику на терминале',
    dek: 'Ж/д или авто: точнее, чем «FOB на суше»',
    code: 'FCA',
    mode: 'Любой',
  },
  {
    id: 'cif',
    title: 'Продавец оплатил фрахт до порта РФ',
    dek: 'Осторожно: риск часто уже перешёл раньше',
    code: 'CIF',
    mode: 'Море',
  },
  {
    id: 'ddp',
    title: 'Под ключ до моего склада',
    dek: 'Редко и дорого с китайской стороны',
    code: 'DDP',
    mode: 'Любой',
  },
] as const

const pathNodes = [
  { id: 'factory', label: 'Фабрика / склад CN' },
  { id: 'export', label: 'Экспорт CN' },
  { id: 'main', label: 'Основной фрахт' },
  { id: 'import', label: 'Импорт РФ' },
  { id: 'door', label: 'Склад в РФ' },
] as const

/** Кто платит сегмент пути при данном базисе (упрощённая модель для UI). */
function payerFor(code: string, node: (typeof pathNodes)[number]['id']): 'seller' | 'buyer' | 'split' {
  switch (code) {
    case 'EXW':
      return node === 'factory' ? 'seller' : 'buyer'
    case 'FCA':
      return node === 'factory' || node === 'export' ? 'seller' : 'buyer'
    case 'FOB':
    case 'FAS':
      return node === 'factory' || node === 'export' ? 'seller' : node === 'main' ? 'buyer' : 'buyer'
    case 'CFR':
      return node === 'import' || node === 'door' ? 'buyer' : node === 'main' ? 'seller' : 'seller'
    case 'CIF':
      return node === 'import' || node === 'door' ? 'buyer' : 'seller'
    case 'DAP':
      return node === 'import' ? 'buyer' : node === 'door' ? 'split' : 'seller'
    case 'DDP':
      return 'seller'
    default:
      return 'split'
  }
}

function loadDocs(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(DOCS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

export function DealToolPage() {
  const [step, setStep] = useState<Step>('situation')
  const [sitId, setSitId] = useState<(typeof situations)[number]['id']>('exw-clothes')
  const [compare, setCompare] = useState('FOB')
  const [cargo, setCargo] = useState('Одежда, 28 м³')
  const [docs, setDocs] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setDocs(loadDocs())
  }, [])

  const sit = situations.find((s) => s.id === sitId) ?? situations[0]
  const primary = incoterms.find((i) => i.code === sit.code) ?? incoterms[0]
  const secondary = incoterms.find((i) => i.code === compare) ?? incoterms[2]
  const doneDocs = docChecklist.filter((d) => docs[d.id]).length

  const chatText = useMemo(() => {
    return [
      `Базис: ${primary.code} (${primary.title}).`,
      `Груз: ${cargo}.`,
      `Риск переходит: ${primary.risk}.`,
      `С моей стороны обычно: ${primary.buyerPays.join('; ')}.`,
      `С стороны продавца: ${primary.sellerPays.join('; ')}.`,
      `Ловушка: ${primary.trap}`,
      `Документы: собрано ${doneDocs} из ${docChecklist.length}.`,
    ].join('\n')
  }, [primary, cargo, doneDocs])

  const toggleDoc = (id: string) => {
    setDocs((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem(DOCS_KEY, JSON.stringify(next))
      return next
    })
  }

  const steps: { id: Step; label: string }[] = [
    { id: 'situation', label: 'Ситуация' },
    { id: 'map', label: 'Кто платит' },
    { id: 'docs', label: 'Документы' },
    { id: 'summary', label: 'В чат' },
  ]

  return (
    <ToolPageFrame
      slug="deal"
      title="Сделка: базис и бумаги"
      dek="Не справочник «прочитай Incoterms». Выбираете ситуацию → видите путь денег → отмечаете документы → копируете формулировку в WhatsApp."
      usp={
        <p>
          Цель — за 3–4 минуты договориться с фабрикой и брокером на одном языке: какой базис, кто за какой кусок пути, каких бумаг не хватает.
        </p>
      }
    >
      {/* Stepper */}
      <div className="mb-6 flex flex-wrap gap-1">
        {steps.map((s, i) => {
          const active = step === s.id
          const idx = steps.findIndex((x) => x.id === step)
          const done = i < idx
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                active
                  ? 'bg-brand text-white'
                  : done
                    ? 'bg-brand/15 text-brand'
                    : 'bg-white text-muted border border-line'
              }`}
            >
              <span className="font-mono text-[10px]">{i + 1}</span>
              {s.label}
            </button>
          )
        })}
      </div>

      {step === 'situation' && (
        <div className="space-y-5">
          <Field label="Что везёте (для формулировки)" tip="Коротко — попадёт в текст для чата.">
            <input className={inputClass()} value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {situations.map((s) => {
              const on = s.id === sitId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSitId(s.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    on ? 'border-brand bg-brand/10 shadow-sm' : 'border-line bg-white hover:border-brand/40'
                  }`}
                >
                  <p className="font-mono text-[11px] text-brand">{s.code}</p>
                  <p className="mt-1 text-[15px] font-semibold leading-snug">{s.title}</p>
                  <p className="mt-2 text-[12.5px] text-muted">{s.dek}</p>
                </button>
              )
            })}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl bg-navy px-4 py-2.5 text-[13px] font-semibold text-white"
              onClick={() => setStep('map')}
            >
              Дальше: кто платит
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {step === 'map' && (
        <div className="space-y-6">
          <PathMap term={primary} />
          <div className="grid gap-4 lg:grid-cols-2">
            <CompareCard title="Ваш базис" term={primary} accent />
            <div className="space-y-3">
              <Field label="Сравнить с" tip="Часто путают EXW и FOB — положите рядом.">
                <select className={inputClass()} value={compare} onChange={(e) => setCompare(e.target.value)}>
                  {incoterms
                    .filter((i) => i.code !== primary.code)
                    .map((i) => (
                      <option key={i.code} value={i.code}>
                        {i.code} — {i.title}
                      </option>
                    ))}
                </select>
              </Field>
              <CompareCard title="Для сравнения" term={secondary} />
            </div>
          </div>
          <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-[13.5px] leading-relaxed">
            <span className="font-semibold text-brand">Ловушка {primary.code}: </span>
            {primary.trap}
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" className="text-[13px] text-muted underline" onClick={() => setStep('situation')}>
              Назад
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl bg-navy px-4 py-2.5 text-[13px] font-semibold text-white"
              onClick={() => setStep('docs')}
            >
              Дальше: документы
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {step === 'docs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold">Пакет на ввоз</p>
              <p className="text-[13px] text-muted">Отмечайте, что уже есть. Прогресс сохраняется в браузере.</p>
            </div>
            <p className="font-mono text-[13px] text-brand">
              {doneDocs}/{docChecklist.length}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-fog">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${(doneDocs / docChecklist.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-2">
            {docChecklist.map((d) => {
              const on = !!docs[d.id]
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => toggleDoc(d.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                      on ? 'border-ok/40 bg-ok/5' : 'border-line bg-white hover:border-brand/30'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${
                        on ? 'border-ok bg-ok text-white' : 'border-line'
                      }`}
                    >
                      {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold">{d.title}</span>
                      <span className="mt-0.5 block text-[12.5px] text-muted">
                        {d.when} · зона: {d.side}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <button type="button" className="text-[13px] text-muted underline" onClick={() => setStep('map')}>
              Назад
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl bg-navy px-4 py-2.5 text-[13px] font-semibold text-white"
              onClick={() => setStep('summary')}
            >
              Собрать текст в чат
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {step === 'summary' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3 rounded-2xl border border-line bg-white p-5">
            <p className="text-[13px] font-semibold">Карточка сделки</p>
            <p className="text-[28px] font-semibold tracking-tight text-brand">{primary.code}</p>
            <p className="text-[14px] text-muted">{primary.title}</p>
            <p className="text-[13.5px]">{cargo}</p>
            <p className="text-[13px] text-muted">Документов отмечено: {doneDocs}/{docChecklist.length}</p>
            <button type="button" className="text-[13px] text-brand underline" onClick={() => setStep('situation')}>
              Сменить ситуацию
            </button>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-navy p-5 text-fog">
              <p className="font-mono text-[10px] uppercase tracking-wide text-mist">Вставить продавцу / брокеру</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed">{chatText}</pre>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-semibold text-white"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(chatText)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                } catch {
                  /* ignore */
                }
              }}
            >
              <Copy className="size-4" />
              {copied ? 'Скопировано' : 'Копировать'}
            </button>
            <button type="button" className="block text-[13px] text-muted underline" onClick={() => setStep('docs')}>
              Назад к документам
            </button>
          </div>
        </div>
      )}
    </ToolPageFrame>
  )
}

function PathMap({ term }: { term: Incoterm }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[14px] font-semibold">Путь денег · {term.code}</p>
        <div className="flex gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-ok" /> продавец
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-brand" /> вы (покупатель)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-mist" /> спорно
          </span>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-0 md:flex-row md:items-stretch">
        {pathNodes.map((node, i) => {
          const who = payerFor(term.code, node.id)
          const color = who === 'seller' ? 'bg-ok' : who === 'buyer' ? 'bg-brand' : 'bg-mist'
          const label = who === 'seller' ? 'продавец' : who === 'buyer' ? 'вы' : 'уточнить'
          return (
            <div key={node.id} className="flex flex-1 items-center">
              <div className="w-full rounded-xl border border-line bg-fog/40 px-3 py-3 text-center">
                <div className={`mx-auto mb-2 h-1.5 w-full max-w-[4.5rem] rounded-full ${color}`} />
                <p className="text-[12px] font-semibold leading-snug">{node.label}</p>
                <p className="mt-1 font-mono text-[10px] uppercase text-mist">{label}</p>
              </div>
              {i < pathNodes.length - 1 ? (
                <ChevronRight className="mx-1 hidden size-4 shrink-0 text-mist md:block" />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CompareCard({ title, term, accent }: { title: string; term: Incoterm; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? 'border-brand/40 bg-brand/5' : 'border-line bg-white'}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-mist">{title}</p>
      <p className="mt-1 text-[18px] font-semibold">
        {term.code} <span className="text-[13px] font-normal text-muted">{term.title}</span>
      </p>
      <p className="mt-2 text-[12.5px] text-muted">Риск: {term.risk}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-[12.5px]">
        <div>
          <p className="font-semibold text-ok">Продавец</p>
          <ul className="mt-1 space-y-1 text-muted">
            {term.sellerPays.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-brand">Вы</p>
          <ul className="mt-1 space-y-1 text-muted">
            {term.buyerPays.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
