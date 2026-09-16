/** Ориентиры «как обычно играют» похожие лоты — подсказки + дашборд директора. */

export type MarketBench = {
  key: string
  corridor: string
  cargo: string
  mode: string
  cbmFrom: number
  cbmTo: number
  typicalLowUsd: number
  typicalHighUsd: number
  /** Типичный $/м³ в середине вилки — для быстрых советов */
  usdPerCbmHint: number
  note: string
}

export const marketBenches: MarketBench[] = [
  {
    key: 'cn-msk-knit-lcl',
    corridor: 'Китай → Москва',
    cargo: 'Трикотаж / одежда',
    mode: 'Наземный',
    cbmFrom: 12,
    cbmTo: 35,
    typicalLowUsd: 2800,
    typicalHighUsd: 4200,
    usdPerCbmHint: 160,
    note: 'Сборные 15–35 м³, WhatsApp-прайсы без фиксации условий',
  },
  {
    key: 'cn-msk-outer-lcl',
    corridor: 'Китай → Москва',
    cargo: 'Куртки / верх',
    mode: 'Наземный',
    cbmFrom: 40,
    cbmTo: 65,
    typicalLowUsd: 8500,
    typicalHighUsd: 12000,
    usdPerCbmHint: 190,
    note: 'Крупнее сборной; часто сравнивают с «половиной контейнера»',
  },
  {
    key: 'cn-msk-rail',
    corridor: 'Китай → Москва',
    cargo: 'Одежда',
    mode: 'ЖД',
    cbmFrom: 20,
    cbmTo: 40,
    typicalLowUsd: 5200,
    typicalHighUsd: 7800,
    usdPerCbmHint: 210,
    note: 'ЖД-срез рынка на дату; не оферта wIaF',
  },
  {
    key: 'tr-msk-tex',
    corridor: 'Турция → Москва',
    cargo: 'Текстиль / обувь',
    mode: 'Авто',
    cbmFrom: 10,
    cbmTo: 25,
    typicalLowUsd: 1600,
    typicalHighUsd: 2800,
    usdPerCbmHint: 110,
    note: 'Авто через границу, короче плечо чем Китай',
  },
  {
    key: 'vn-msk-soft',
    corridor: 'Вьетнам → Москва',
    cargo: 'Лёгкий опт',
    mode: 'Море+ЖД',
    cbmFrom: 15,
    cbmTo: 40,
    typicalLowUsd: 3800,
    typicalHighUsd: 5600,
    usdPerCbmHint: 175,
    note: 'Реже в ленте; ориентир шире',
  },
  {
    key: 'in-msk-tex',
    corridor: 'Индия → Москва',
    cargo: 'Ткань / текстиль',
    mode: 'Море',
    cbmFrom: 15,
    cbmTo: 35,
    typicalLowUsd: 3200,
    typicalHighUsd: 5200,
    usdPerCbmHint: 165,
    note: 'FOB/море, плечо длиннее Турции',
  },
]

export function matchBench(input: {
  country: string
  cargo: string
  mode: string
  cbm: number
}): MarketBench | undefined {
  const c = input.country.toLowerCase()
  const cargo = input.cargo.toLowerCase()
  const mode = input.mode.toLowerCase()
  const pool = marketBenches.filter((b) => {
    if (c.includes('кита') && !b.corridor.startsWith('Китай')) return false
    if (c.includes('тур') && !b.corridor.startsWith('Турция')) return false
    if (c.includes('вьет') && !b.corridor.startsWith('Вьетнам')) return false
    if (c.includes('инд') && !b.corridor.startsWith('Индия')) return false
    if (input.cbm > 0 && (input.cbm < b.cbmFrom - 8 || input.cbm > b.cbmTo + 15)) return false
    return true
  })
  const scored = pool
    .map((b) => {
      let s = 0
      if (mode.includes('жд') && b.mode.includes('ЖД')) s += 3
      if ((mode.includes('авто') || mode.includes('зем')) && (b.mode.includes('Авто') || b.mode.includes('зем'))) s += 2
      if (mode.includes('море') && b.mode.includes('Море')) s += 3
      if (cargo.includes('курт') && b.cargo.includes('Курт')) s += 4
      if ((cargo.includes('трик') || cargo.includes('майк') || cargo.includes('футб') || cargo.includes('одежд')) && b.cargo.includes('Трикот'))
        s += 4
      if ((cargo.includes('обув') || cargo.includes('текстил')) && (b.cargo.includes('обув') || b.cargo.includes('Текстил')))
        s += 4
      if ((cargo.includes('ткан') || cargo.includes('пошив')) && (b.cargo.includes('Ткан') || b.cargo.includes('опт'))) s += 3
      return { b, s }
    })
    .sort((a, x) => x.s - a.s)
  return scored[0]?.b ?? pool[0]
}

export function compareWin(winUsd: number, bench: MarketBench) {
  const mid = (bench.typicalLowUsd + bench.typicalHighUsd) / 2
  const vsMidPct = Math.round(((mid - winUsd) / mid) * 100)
  const inBand = winUsd >= bench.typicalLowUsd && winUsd <= bench.typicalHighUsd
  return { mid, vsMidPct, inBand, low: bench.typicalLowUsd, high: bench.typicalHighUsd }
}

/** Оценка «цена / объём» vs ориентир рынка */
export function estimateFairUsd(input: {
  country: string
  cargo: string
  mode: string
  cbm: number
  customs?: boolean
  insurance?: boolean
}) {
  const bench = matchBench(input)
  if (!bench) {
    const base = Math.max(1200, Math.round(input.cbm * 140))
    return { mid: base, low: Math.round(base * 0.78), high: Math.round(base * 1.28), bench: undefined as MarketBench | undefined, extras: 0 }
  }
  let mid = (bench.typicalLowUsd + bench.typicalHighUsd) / 2
  // масштабируем по CBM относительно середины бенча
  const midCbm = (bench.cbmFrom + bench.cbmTo) / 2
  if (input.cbm > 0 && midCbm > 0) {
    const ratio = input.cbm / midCbm
    mid = Math.round(mid * (0.55 + 0.45 * ratio))
  }
  let extras = 0
  if (input.customs) extras += Math.round(mid * 0.12)
  if (input.insurance) extras += Math.round(mid * 0.04)
  const fair = mid + extras
  return {
    mid: fair,
    low: Math.round(fair * 0.82),
    high: Math.round(fair * 1.18),
    bench,
    extras,
  }
}
