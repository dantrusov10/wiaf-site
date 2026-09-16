import { useMemo, useState } from 'react'
import { formatMoney } from './calc'
import { ToolPageFrame } from './ToolPageFrame'
import { Disclaimer, Field, inputClass, ResultCard, RowKV } from './ui'

type Line = {
  id: string
  code: string
  name: string
  tip: string
  when: string
  defaultOn: boolean
  defaultUsd: number
}

const LINES: Line[] = [
  {
    id: 'base',
    code: 'BASE',
    name: 'Голый фрахт',
    tip: 'То, что линия/агент назвали «ставкой» без кусков. Часто без терминала и документов.',
    when: 'Всегда',
    defaultOn: true,
    defaultUsd: 2900,
  },
  {
    id: 'thc',
    code: 'THC',
    name: 'Терминал',
    tip: 'Обработка контейнера. Может быть на отправлении и назначении — уточняйте стороны.',
    when: 'FCL почти всегда',
    defaultOn: true,
    defaultUsd: 160,
  },
  {
    id: 'doc',
    code: 'DOC',
    name: 'Документы',
    tip: 'BL / release / оформление. Мелочь, но клиент видит в счёте.',
    when: 'Часто',
    defaultOn: true,
    defaultUsd: 45,
  },
  {
    id: 'baf',
    code: 'BAF',
    name: 'Топливо',
    tip: 'Надбавка к топливу. Иногда уже внутри base — не дублируйте.',
    when: 'Море',
    defaultOn: false,
    defaultUsd: 180,
  },
  {
    id: 'pss',
    code: 'PSS',
    name: 'Сезон',
    tip: 'Peak season до НГ Китая и в Q3–Q4.',
    when: 'Сезон',
    defaultOn: false,
    defaultUsd: 200,
  },
  {
    id: 'ins',
    code: 'INS',
    name: 'Страховка',
    tip: 'Если предлагаете клиенту отдельно.',
    when: 'По запросу',
    defaultOn: false,
    defaultUsd: 70,
  },
]

/** Смысл: превратить «ставку из чата» в сумму, которую честно назвать клиенту. */
export function AllinToolPage() {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(LINES.map((l) => [l.id, l.defaultOn])))
  const [usd, setUsd] = useState<Record<string, number>>(() => Object.fromEntries(LINES.map((l) => [l.id, l.defaultUsd])))
  const [marginPct, setMarginPct] = useState(12)
  const [focus, setFocus] = useState('base')

  const cost = LINES.reduce((s, l) => s + (on[l.id] ? usd[l.id] || 0 : 0), 0)
  const sell = cost * (1 + marginPct / 100)
  const focusLine = LINES.find((l) => l.id === focus) ?? LINES[0]

  const story = useMemo(() => {
    const parts = LINES.filter((l) => on[l.id]).map((l) => `${l.code} $${formatMoney(usd[l.id] || 0)}`)
    return parts.join(' + ')
  }, [on, usd])

  return (
    <ToolPageFrame
      slug="allin"
      title="Сборка all-in"
      dek="Зачем: клиент слышит «$2900», а в счёте вылезает больше. Здесь вы заранее собираете честную сумму и свою маржу."
      usp={
        <div className="space-y-2">
          <p>
            <strong>Не словарь аббревиатур.</strong> Три шага: (1) что входит в себестоимость котировки, (2) какая маржа, (3) какую цифру нести в КП.
          </p>
          <p>Связка с конструктором КП и книгой тарифов: all-in считает «из чего», КП упаковывает «как сказать».</p>
        </div>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { n: '1', t: 'Себестоимость', d: 'База + надбавки' },
          { n: '2', t: 'Маржа', d: 'Ваш % сверху' },
          { n: '3', t: 'Клиенту', d: 'Цифра в КП' },
        ].map((s) => (
          <div key={s.n} className="rounded-xl border border-line bg-white px-4 py-3">
            <p className="font-mono text-[11px] text-brand-2">{s.n}</p>
            <p className="font-semibold">{s.t}</p>
            <p className="text-[12px] text-muted">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line bg-fog/60 font-mono text-[10px] uppercase text-mist">
              <tr>
                <th className="px-4 py-2">Вкл.</th>
                <th className="px-4 py-2">Позиция</th>
                <th className="px-4 py-2">USD</th>
              </tr>
            </thead>
            <tbody>
              {LINES.map((l) => (
                <tr
                  key={l.id}
                  className={`cursor-pointer border-b border-line last:border-0 ${focus === l.id ? 'bg-brand-2/5' : ''}`}
                  onClick={() => setFocus(l.id)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!on[l.id]}
                      onChange={(e) => setOn((p) => ({ ...p, [l.id]: e.target.checked }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-brand-2">{l.code}</span>
                    <span className="ml-2 font-medium">{l.name}</span>
                    <p className="text-[11px] text-mist">{l.when}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className={`${inputClass()} w-28`}
                      type="number"
                      disabled={!on[l.id]}
                      value={usd[l.id]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setUsd((p) => ({ ...p, [l.id]: Number(e.target.value) || 0 }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line bg-fog/40 px-4 py-3 text-[13px] text-muted">
            <p className="font-semibold text-ink">
              {focusLine.code}: {focusLine.name}
            </p>
            <p className="mt-1">{focusLine.tip}</p>
          </div>
        </div>

        <div className="space-y-4">
          <ResultCard title="Итог">
            <RowKV k="Себестоимость" v={`$${formatMoney(cost)}`} />
            <Field label="Маржа %" tip="Надбавка исполнителя к себестоимости all-in перед клиентом.">
              <input className={inputClass()} type="number" value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value) || 0)} />
            </Field>
            <RowKV k="Клиенту (all-in)" v={`$${formatMoney(sell, 0)}`} strong />
            <p className="pt-2 font-mono text-[11px] leading-relaxed text-mist">{story || '—'}</p>
          </ResultCard>
          <Disclaimer>
            DEM/DET сюда не кладём: это штрафы за простой, их пишут в КП как free time, а не как строку ставки «на полке».
          </Disclaimer>
        </div>
      </div>
    </ToolPageFrame>
  )
}
