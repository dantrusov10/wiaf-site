import { useMemo, useState } from 'react'
import { calcCbm, formatMoney, type CartonRow } from './calc'
import { containers } from './data'
import { ToolPageFrame } from './ToolPageFrame'
import { Disclaimer, Field, inputClass, ResultCard, RowKV, useActiveToolRole } from './ui'

const presets: { name: string; row: Omit<CartonRow, 'id'> }[] = [
  { name: 'Одежда · короб 60×40×40', row: { label: 'Короб одежда', lCm: 60, wCm: 40, hCm: 40, kg: 12, qty: 40 } },
  { name: 'Обувь · короб 55×35×35', row: { label: 'Короб обувь', lCm: 55, wCm: 35, hCm: 35, kg: 14, qty: 30 } },
  { name: 'Мелочь · короб 50×30×30', row: { label: 'Мелочь', lCm: 50, wCm: 30, hCm: 30, kg: 8, qty: 60 } },
]

function newRow(partial?: Partial<CartonRow>): CartonRow {
  return {
    id: Math.random().toString(36).slice(2, 9),
    label: 'Короб',
    lCm: 60,
    wCm: 40,
    hCm: 40,
    kg: 12,
    qty: 50,
    ...partial,
  }
}

export function CbmToolPage() {
  const role = useActiveToolRole()
  const [rows, setRows] = useState<CartonRow[]>([newRow()])
  const [containerId, setContainerId] = useState('40hc')
  const result = useMemo(() => calcCbm(rows, containerId), [rows, containerId])

  /** Тарифный вес авиа: max(факт кг, CBM×167) — ориентир. */
  const airChargeable = Math.max(result.totalKg, result.totalCbm * 167)
  const lclFreightTons = Math.max(result.totalCbm, result.totalKg / 1000)

  const update = (id: string, patch: Partial<CartonRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <ToolPageFrame
      slug="cbm"
      title="Объём и контейнер"
      dek={
        role === 'importer'
          ? 'Понять, сколько места займёт партия и какой режим просить у экспедиторов — до чатов и до лота.'
          : 'Быстро проверить запрос клиента: LCL или контейнер, нет ли перегруза по весу.'
      }
      usp={
        role === 'importer' ? (
          <p>
            Не «ещё один калькулятор CBM в гугле». Шаблоны под одежду, заполнение контейнера и подсказка LCL/FCL — чтобы в WhatsApp писать объём, а не «примерно фура».
          </p>
        ) : (
          <p>
            Для исполнителя: за 30 секунд понять, реалистичен ли запрос клиента и какую ёмкость закладывать в КП / all-in.
          </p>
        )
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.name}
            type="button"
            className="rounded-full border border-line bg-white px-3 py-1 text-[12px] hover:border-brand"
            onClick={() => setRows([newRow(p.row)])}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Field label="Тип контейнера" tip="Сравниваем с практическим полезным объёмом, не с паспортной «водой» в брошюре линии.">
            <select className={inputClass()} value={containerId} onChange={(e) => setContainerId(e.target.value)}>
              {containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · ~{c.cbm} м³ · до {formatMoney(c.maxKg)} кг
                </option>
              ))}
            </select>
          </Field>
          {rows.map((r, i) => (
            <div key={r.id} className="rounded-xl border border-line bg-white p-4">
              <div className="flex justify-between">
                <p className="text-[13px] font-semibold">Место {i + 1}</p>
                {rows.length > 1 ? (
                  <button type="button" className="text-[12px] text-brand underline" onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}>
                    Удалить
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Название" tip="Чтобы не путать строки, если короба разные.">
                  <input className={inputClass()} value={r.label} onChange={(e) => update(r.id, { label: e.target.value })} />
                </Field>
                <Field label="Кол-во мест" tip="Сколько одинаковых коробов.">
                  <input className={inputClass()} type="number" value={r.qty} onChange={(e) => update(r.id, { qty: Number(e.target.value) || 0 })} />
                </Field>
                <Field label="Вес одного, кг" tip="Вес одного короба брутто.">
                  <input className={inputClass()} type="number" step={0.1} value={r.kg} onChange={(e) => update(r.id, { kg: Number(e.target.value) || 0 })} />
                </Field>
                <Field label="Длина, см" tip="Внешний размер короба.">
                  <input className={inputClass()} type="number" value={r.lCm} onChange={(e) => update(r.id, { lCm: Number(e.target.value) || 0 })} />
                </Field>
                <Field label="Ширина, см" tip="Внешний размер короба.">
                  <input className={inputClass()} type="number" value={r.wCm} onChange={(e) => update(r.id, { wCm: Number(e.target.value) || 0 })} />
                </Field>
                <Field label="Высота, см" tip="Внешний размер короба.">
                  <input className={inputClass()} type="number" value={r.hCm} onChange={(e) => update(r.id, { hCm: Number(e.target.value) || 0 })} />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-semibold"
            onClick={() => setRows((p) => [...p, newRow()])}
          >
            Добавить строку
          </button>
        </div>

        <div className="space-y-4">
          <ResultCard title="Итого по партии">
            <RowKV k="Объём" v={`${formatMoney(result.totalCbm, 2)} м³`} strong />
            <RowKV k="Вес" v={`${formatMoney(result.totalKg, 1)} кг`} />
            {result.fillVolPct != null ? <RowKV k="Заполнение объёма" v={`${formatMoney(result.fillVolPct, 0)}%`} /> : null}
            {result.fillWtPct != null ? <RowKV k="Заполнение веса" v={`${formatMoney(result.fillWtPct, 0)}%`} /> : null}
            <p className="pt-2 text-[13.5px] leading-relaxed">{result.suggestion}</p>
          </ResultCard>
          <ResultCard title="Дополнительно">
            <RowKV k="LCL W/M (ориентир)" v={`${formatMoney(lclFreightTons, 2)}`} />
            <RowKV k="Авиа chargeable кг" v={`${formatMoney(airChargeable, 0)} кг`} />
            <p className="text-[12px] text-mist">W/M = max(м³, тонны). Авиа: max(кг, CBM×167). Уточняет перевозчик.</p>
          </ResultCard>
          <Disclaimer>Укладка и крепление уменьшают полезный объём. Цифры — для переговоров, не паспорт контейнера.</Disclaimer>
        </div>
      </div>
    </ToolPageFrame>
  )
}
