/** Ориентиры «как обычно играют» похожие лоты — для дашборда директора. */

export type MarketBench = {
  key: string
  corridor: string
  cargo: string
  mode: string
  cbmFrom: number
  cbmTo: number
  typicalLowUsd: number
  typicalHighUsd: number
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
    note: 'Реже в ленте; ориентир шире',
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
    if (input.cbm < b.cbmFrom - 5 || input.cbm > b.cbmTo + 10) return false
    return true
  })
  const scored = pool
    .map((b) => {
      let s = 0
      if (mode.includes('жд') && b.mode.includes('ЖД')) s += 3
      if (mode.includes('авто') && b.mode.includes('Авто')) s += 3
      if (mode.includes('зем') && b.mode.includes('зем')) s += 2
      if (cargo.includes('курт') && b.cargo.includes('Курт')) s += 4
      if ((cargo.includes('трик') || cargo.includes('майк') || cargo.includes('футб')) && b.cargo.includes('Трикот'))
        s += 4
      if (cargo.includes('обув') && b.cargo.includes('обув')) s += 4
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
