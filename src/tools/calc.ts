import { containers, hsCodes, type ContainerType, type HsCode } from './data'

/** Таможенный сбор РФ — упрощённая шкала для ориентира (не актуальный приказ ФТС). */
export function customsFeeRub(customsValueRub: number): number
{
  if (customsValueRub <= 200_000) return 775
  if (customsValueRub <= 450_000) return 1550
  if (customsValueRub <= 1_200_000) return 3100
  if (customsValueRub <= 2_700_000) return 8530
  if (customsValueRub <= 4_200_000) return 12_000
  if (customsValueRub <= 5_500_000) return 15_500
  if (customsValueRub <= 7_000_000) return 20_000
  if (customsValueRub <= 8_000_000) return 23_000
  if (customsValueRub <= 9_000_000) return 25_000
  if (customsValueRub <= 10_000_000) return 27_000
  return 30_000
}

export function findHs(code: string): HsCode | undefined {
  return hsCodes.find((h) => h.code === code)
}

export type CustomsInput = {
  cifUsd: number
  usdRub: number
  dutyPct: number
  vatPct: number
}

export type CustomsResult = {
  customsValueRub: number
  dutyRub: number
  vatBaseRub: number
  vatRub: number
  feeRub: number
  totalPaymentsRub: number
}

export function calcCustoms(input: CustomsInput): CustomsResult {
  const customsValueRub = input.cifUsd * input.usdRub
  const dutyRub = customsValueRub * (input.dutyPct / 100)
  const vatBaseRub = customsValueRub + dutyRub
  const vatRub = vatBaseRub * (input.vatPct / 100)
  const feeRub = customsFeeRub(customsValueRub)
  return {
    customsValueRub,
    dutyRub,
    vatBaseRub,
    vatRub,
    feeRub,
    totalPaymentsRub: dutyRub + vatRub + feeRub,
  }
}

export type LandedInput = {
  goodsUsd: number
  freightUsd: number
  insuranceUsd: number
  brokerRub: number
  lastMileRub: number
  units: number
  usdRub: number
  dutyPct: number
  vatPct: number
}

export type LandedResult = CustomsResult & {
  goodsRub: number
  freightRub: number
  insuranceRub: number
  totalRub: number
  perUnitRub: number | null
}

export function calcLanded(input: LandedInput): LandedResult {
  const cifUsd = input.goodsUsd + input.freightUsd + input.insuranceUsd
  const customs = calcCustoms({
    cifUsd,
    usdRub: input.usdRub,
    dutyPct: input.dutyPct,
    vatPct: input.vatPct,
  })
  const goodsRub = input.goodsUsd * input.usdRub
  const freightRub = input.freightUsd * input.usdRub
  const insuranceRub = input.insuranceUsd * input.usdRub
  const totalRub =
    goodsRub + freightRub + insuranceRub + customs.totalPaymentsRub + input.brokerRub + input.lastMileRub
  return {
    ...customs,
    goodsRub,
    freightRub,
    insuranceRub,
    totalRub,
    perUnitRub: input.units > 0 ? totalRub / input.units : null,
  }
}

export type CartonRow = {
  id: string
  label: string
  lCm: number
  wCm: number
  hCm: number
  kg: number
  qty: number
}

export type CbmResult = {
  totalCbm: number
  totalKg: number
  rows: { id: string; cbm: number; kg: number }[]
  container: ContainerType | null
  fillVolPct: number | null
  fillWtPct: number | null
  fits: boolean | null
  suggestion: string
}

export function cartonCbm(lCm: number, wCm: number, hCm: number, qty: number): number {
  return ((lCm / 100) * (wCm / 100) * (hCm / 100) * qty)
}

export function calcCbm(rows: CartonRow[], containerId: string | ''): CbmResult {
  const detail = rows.map((r) => ({
    id: r.id,
    cbm: cartonCbm(r.lCm, r.wCm, r.hCm, r.qty),
    kg: r.kg * r.qty,
  }))
  const totalCbm = detail.reduce((s, r) => s + r.cbm, 0)
  const totalKg = detail.reduce((s, r) => s + r.kg, 0)
  const container = containers.find((c) => c.id === containerId) ?? null
  if (!container) {
    let suggestion = 'Укажите тип контейнера или смотрите суммарный CBM для LCL.'
    if (totalCbm > 0 && totalCbm < 15) suggestion = 'По объёму похоже на LCL / сборный. Сверьте с экспедитором.'
    else if (totalCbm >= 15 && totalCbm < 28) suggestion = 'Близко к загрузке 20′ или плотному LCL.'
    else if (totalCbm >= 28) suggestion = 'Смотрите 40′ / 40HC — сравните заполнение ниже.'
    return {
      totalCbm,
      totalKg,
      rows: detail,
      container: null,
      fillVolPct: null,
      fillWtPct: null,
      fits: null,
      suggestion,
    }
  }
  const fillVolPct = (totalCbm / container.cbm) * 100
  const fillWtPct = (totalKg / container.maxKg) * 100
  const fits = totalCbm <= container.cbm * 1.02 && totalKg <= container.maxKg
  let suggestion = fits
    ? `Влезает в ${container.name} по объёму и весу (ориентир полезного CBM ${container.cbm}).`
    : totalCbm > container.cbm
      ? `По объёму не влезает в ${container.name}. Нужен больший контейнер или меньше мест.`
      : `По весу перегруз для ${container.name}.`
  if (fits && fillVolPct < 55) suggestion += ' Заполнение низкое — возможно выгоднее LCL.'
  return { totalCbm, totalKg, rows: detail, container, fillVolPct, fillWtPct, fits, suggestion }
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function formatMoney(n: number, digits = 0): string {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n)
}
