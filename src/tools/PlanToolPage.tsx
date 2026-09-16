import { useMemo, useState } from 'react'
import { addDays } from './calc'
import { chinaHolidays2026, transitLanes } from './data'
import { ToolPageFrame } from './ToolPageFrame'
import { Disclaimer, Field, inputClass, ResultCard, RowKV, useActiveToolRole } from './ui'

export function PlanToolPage() {
  const role = useActiveToolRole()
  const [laneId, setLaneId] = useState(transitLanes[0].id)
  const [ready, setReady] = useState('2026-09-20')
  const [buffer, setBuffer] = useState(5)
  const lane = transitLanes.find((l) => l.id === laneId) ?? transitLanes[0]

  const stages = useMemo(() => {
    const factoryDone = ready
    const toPort = addDays(ready, Math.round(lane.daysMin * 0.15))
    const mainLeg = addDays(ready, Math.round(lane.daysMin * 0.75))
    const etaMin = addDays(ready, lane.daysMin)
    const etaMax = addDays(ready, lane.daysMax)
    const withBuffer = addDays(etaMax, buffer)
    return { factoryDone, toPort, mainLeg, etaMin, etaMax, withBuffer }
  }, [ready, lane, buffer])

  const clashes = useMemo(() => {
    const start = new Date(ready + 'T12:00:00')
    const end = new Date(stages.withBuffer + 'T12:00:00')
    return chinaHolidays2026.filter((h) => {
      const hs = new Date(h.start + 'T12:00:00')
      const he = new Date(h.end + 'T12:00:00')
      return hs <= end && he >= start
    })
  }, [ready, stages.withBuffer])

  return (
    <ToolPageFrame
      slug="plan"
      title="Календарь поставки"
      dek={
        role === 'importer'
          ? 'Когда ждать товар на складе и где праздники КНР могут сорвать срок.'
          : 'Какой ETA обещать клиенту и какой буфер заложить в КП.'
      }
      usp={
        <div className="space-y-2">
          <p>
            <strong>На чём ориентир:</strong> типовые окна transit time по схеме (море FCL/LCL, ж/д, авто, авиа) для Китай→РФ — отраслевые порядки величины, не трекинг конкретного контейнера и не обещание линии.
          </p>
          <p>
            Праздники 2026 — фиксированный календарь простоев фабрик. Буфер — ваш запас на таможню и выгрузку.
          </p>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-line bg-white p-5">
          <Field label="Дата готовности на фабрике" tip="День, когда груз реально можно забирать / грузить — не дата контракта.">
            <input className={inputClass()} type="date" value={ready} onChange={(e) => setReady(e.target.value)} />
          </Field>
          <Field label="Схема перевозки" tip="От схемы зависит длина основного плеча. Выберите ближайшую к вашему КП.">
            <select className={inputClass()} value={laneId} onChange={(e) => setLaneId(e.target.value)}>
              {transitLanes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.mode}: {l.from} → {l.to} ({l.daysMin}–{l.daysMax} сут.)
                </option>
              ))}
            </select>
          </Field>
          <p className="text-[13px] text-muted">{lane.note}</p>
          <Field label="Буфер, суток" tip="Запас на таможню, очередь на выгрузку, сдвиг линии. В рознице часто 5–10 дней.">
            <input className={inputClass()} type="number" min={0} value={buffer} onChange={(e) => setBuffer(Number(e.target.value) || 0)} />
          </Field>
        </div>

        <div className="space-y-4">
          <ResultCard title="Этапы (ориентир)">
            <RowKV k="Готов на фабрике" v={stages.factoryDone} />
            <RowKV k="К порту / ТЛЦ отправления" v={stages.toPort} />
            <RowKV k="Основное плечо (середина)" v={stages.mainLeg} />
            <RowKV k="Окно прибытия" v={`${stages.etaMin} … ${stages.etaMax}`} strong />
            <RowKV k="С буфером (планируйте склад)" v={stages.withBuffer} strong />
          </ResultCard>
          <ResultCard title="Праздники на пути">
            {clashes.length === 0 ? (
              <p className="text-[13px] text-muted">В окне с буфером пересечений с календарём 2026 нет.</p>
            ) : (
              <ul className="space-y-2">
                {clashes.map((h) => (
                  <li key={h.id} className="rounded-lg bg-fog/50 px-3 py-2 text-[13px]">
                    <span className="font-semibold">{h.name}</span> ({h.start}–{h.end}). {h.tip}
                  </li>
                ))}
              </ul>
            )}
          </ResultCard>
          <Disclaimer>
            Источник сроков: внутренние ориентиры схем Китай→РФ для СМБ (не API линий). Для факта статуса используйте номер контейнера у перевозчика.
          </Disclaimer>
        </div>
      </div>
    </ToolPageFrame>
  )
}
