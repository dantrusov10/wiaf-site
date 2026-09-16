import { useMemo, useState } from 'react'
import { lanes } from '../content/analytics'
import { calcLanded, formatMoney } from './calc'
import { hsCodes } from './data'
import { ToolPageFrame } from './ToolPageFrame'
import { Disclaimer, Field, inputClass, ResultCard, RowKV } from './ui'

export function LandedToolPage() {
  const [laneId, setLaneId] = useState(lanes[0].id)
  const [hs, setHs] = useState(hsCodes[0].code)
  const [goodsUsd, setGoodsUsd] = useState(28000)
  const [freightUsd, setFreightUsd] = useState(4200)
  const [insuranceUsd, setInsuranceUsd] = useState(80)
  const [brokerRub, setBrokerRub] = useState(25000)
  const [lastMileRub, setLastMileRub] = useState(35000)
  const [units, setUnits] = useState(4000)
  const [usdRub, setUsdRub] = useState(92)
  const [tab, setTab] = useState<'full' | 'customs'>('full')

  const lane = lanes.find((l) => l.id === laneId) ?? lanes[0]
  const selected = hsCodes.find((h) => h.code === hs) ?? hsCodes[0]
  const result = useMemo(
    () =>
      calcLanded({
        goodsUsd,
        freightUsd,
        insuranceUsd,
        brokerRub,
        lastMileRub,
        units,
        usdRub,
        dutyPct: selected.dutyPct,
        vatPct: selected.vatPct,
      }),
    [goodsUsd, freightUsd, insuranceUsd, brokerRub, lastMileRub, units, usdRub, selected],
  )

  const delta = freightUsd - lane.medianWin
  const deltaPct = lane.medianWin > 0 ? (delta / lane.medianWin) * 100 : 0

  return (
    <ToolPageFrame
      slug="landed"
      title="Партия на складе"
      dek="Не голый Excel: себестоимость + блок таможни + сравнение вашего фрахта с медианой состоявшихся слотов wIaF по коридору."
      usp={
        <p>
          Решение «брать партию или нет». Фрахт из чата сравнивается с тем, что реально выигрывали на площадке (медиана победы по коридору) — без обещания «экономии %».
        </p>
      }
    >
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={`rounded-full border px-3 py-1 text-[12px] ${tab === 'full' ? 'border-brand bg-brand/10' : 'border-line bg-white'}`}
          onClick={() => setTab('full')}
        >
          Полная себестоимость
        </button>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 text-[12px] ${tab === 'customs' ? 'border-brand bg-brand/10' : 'border-line bg-white'}`}
          onClick={() => setTab('customs')}
        >
          Только таможня
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-line bg-white p-5">
          <Field
            label="Коридор площадки"
            tip="Берём медиану победы с публичной аналитики wIaF по этому коридору — как ориентир рынка слотов, не прайс линии."
          >
            <select
              className={inputClass()}
              value={laneId}
              onChange={(e) => {
                const id = e.target.value
                setLaneId(id)
                const L = lanes.find((x) => x.id === id)
                if (L) setFreightUsd(L.medianWin)
              }}
            >
              {lanes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.from} → {l.to} · {l.type} · медиана ${l.medianWin}
                </option>
              ))}
            </select>
          </Field>
          <p className="text-[12px] text-mist">{lane.note}</p>

          <Field label="Код ТН ВЭД" tip="От кода зависят ставка пошлины и НДС. Демо-набор под одежду/потреб; точный код даёт брокер.">
            <select className={inputClass()} value={hs} onChange={(e) => setHs(e.target.value)}>
              {hsCodes.map((h) => (
                <option key={h.code} value={h.code}>
                  {h.code} — {h.name} (пошлина {h.dutyPct}%)
                </option>
              ))}
            </select>
          </Field>

          {tab === 'full' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Товар, USD" tip="Сумма по инвойсу за партию в долларах.">
                <input className={inputClass()} type="number" value={goodsUsd} onChange={(e) => setGoodsUsd(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Ваш фрахт, USD" tip="Цифра из WhatsApp/КП. Можно подставить медиану коридора кнопкой выбора выше.">
                <input className={inputClass()} type="number" value={freightUsd} onChange={(e) => setFreightUsd(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Страховка, USD" tip="Если страхуете отдельно. При CIF часто уже у продавца — тогда 0.">
                <input className={inputClass()} type="number" value={insuranceUsd} onChange={(e) => setInsuranceUsd(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Курс USD/RUB" tip="Курс для перевода в рубли. Позже можно подтянуть ЦБ; сейчас вручную.">
                <input className={inputClass()} type="number" step={0.1} value={usdRub} onChange={(e) => setUsdRub(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Брокер, ₽" tip="Ориентир оплаты таможенного брокера.">
                <input className={inputClass()} type="number" value={brokerRub} onChange={(e) => setBrokerRub(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Довоз по РФ, ₽" tip="От СВХ/ТЛЦ до вашего склада.">
                <input className={inputClass()} type="number" value={lastMileRub} onChange={(e) => setLastMileRub(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Единиц в партии" tip="Чтобы увидеть рубль на штуку для розницы.">
                <input className={inputClass()} type="number" value={units} onChange={(e) => setUnits(Number(e.target.value) || 0)} />
              </Field>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CIF, USD" tip="Товар + фрахт + страховка до согласованной точки — база для пошлины/НДС в упрощённой модели.">
                <input
                  className={inputClass()}
                  type="number"
                  value={goodsUsd + freightUsd + insuranceUsd}
                  onChange={(e) => {
                    const cif = Number(e.target.value) || 0
                    setGoodsUsd(Math.max(0, cif - freightUsd - insuranceUsd))
                  }}
                />
              </Field>
              <Field label="Курс USD/RUB" tip="Для перевода таможенной стоимости в рубли.">
                <input className={inputClass()} type="number" step={0.1} value={usdRub} onChange={(e) => setUsdRub(Number(e.target.value) || 0)} />
              </Field>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ResultCard title="Фрахт vs слоты wIaF">
            <RowKV k="Медиана победы коридора" v={`$${formatMoney(lane.medianWin)}`} />
            <RowKV k="Состоявшихся слотов" v={String(lane.held)} />
            <RowKV k="Ваш фрахт" v={`$${formatMoney(freightUsd)}`} strong />
            <RowKV
              k="Разница"
              v={`${delta >= 0 ? '+' : ''}$${formatMoney(delta)} (${formatMoney(deltaPct, 0)}%)`}
            />
            <p className="text-[12.5px] text-muted">
              {delta > lane.medianWin * 0.15
                ? 'Ваш фрахт заметно выше медианы слотов — имеет смысл позвать 2–3 своих на час или спросить, что не входит в КП.'
                : delta < -lane.medianWin * 0.1
                  ? 'Ниже медианы: проверьте, всё ли входит (THC, довоз) — иногда «дешево» без кусков пути.'
                  : 'Близко к медиане коридора на площадке.'}
            </p>
          </ResultCard>

          <ResultCard title={tab === 'full' ? 'На складе в РФ' : 'Таможенные платежи'}>
            {tab === 'full' ? (
              <>
                <RowKV k="Товар" v={`${formatMoney(result.goodsRub)} ₽`} />
                <RowKV k="Фрахт" v={`${formatMoney(result.freightRub)} ₽`} />
                <RowKV k="Страховка" v={`${formatMoney(result.insuranceRub)} ₽`} />
              </>
            ) : null}
            <RowKV k={`Пошлина ${selected.dutyPct}%`} v={`${formatMoney(result.dutyRub)} ₽`} />
            <RowKV k={`НДС ${selected.vatPct}%`} v={`${formatMoney(result.vatRub)} ₽`} />
            <RowKV k="Сбор (ориентир)" v={`${formatMoney(result.feeRub)} ₽`} />
            {tab === 'full' ? (
              <>
                <RowKV k="Брокер + довоз" v={`${formatMoney(brokerRub + lastMileRub)} ₽`} />
                <RowKV k="Всего" v={`${formatMoney(result.totalRub)} ₽`} strong />
                {result.perUnitRub != null ? <RowKV k="На единицу" v={`${formatMoney(result.perUnitRub, 2)} ₽`} strong /> : null}
              </>
            ) : (
              <RowKV k="Всего платежей" v={`${formatMoney(result.totalPaymentsRub)} ₽`} strong />
            )}
          </ResultCard>
          <Disclaimer>
            Таможня: упрощённая модель (пошлина % + НДС + шкала сбора). Не замена брокеру и классификатору ФТС. Медиана слотов — факт торгов wIaF, не индекс SCFI.
          </Disclaimer>
        </div>
      </div>
    </ToolPageFrame>
  )
}
