export const snapshot = {
  asOf: '2026-09-14',
  formed: 116,
  held: 96,
  live: 4,
  heldShare: 83,
}

export const lanes = [
  {
    id: 'can-mow-lcl',
    from: 'Гуанчжоу',
    to: 'Москва',
    type: 'LCL · авто',
    lots: 41,
    held: 34,
    medianWin: 3120,
    medianN: 3,
    typicalCbm: '15–22 м³',
    note: 'Основной коридор площадки. Одежда и трикотаж, EXW, картон.',
  },
  {
    id: 'jia-mow-40',
    from: 'Jiaxing',
    to: 'Москва',
    type: '40HC · авто',
    lots: 18,
    held: 15,
    medianWin: 9740,
    medianN: 4,
    typicalCbm: '60–65 м³',
    note: 'Куртки и верх. Сравнивать с LCL бессмысленно: другой объём и ставка.',
  },
  {
    id: 'sha-mow-rail',
    from: 'Shanghai',
    to: 'Москва',
    type: 'LCL · ЖД',
    lots: 12,
    held: 9,
    medianWin: 5880,
    medianN: 3,
    typicalCbm: '28–35 м³',
    note: 'Платья и детская одежда. В ТЗ часто «не через Казахстан».',
  },
  {
    id: 'yiw-mow-lcl',
    from: 'Yiwu',
    to: 'Москва',
    type: 'LCL · авто',
    lots: 9,
    held: 7,
    medianWin: 3410,
    medianN: 2,
    typicalCbm: '12–16 м³',
    note: 'Сумки, мелочь. Двое игроков — нижняя граница «состоялось».',
  },
  {
    id: 'ist-mow-lcl',
    from: 'Стамбул',
    to: 'Москва',
    type: 'LCL · авто',
    lots: 6,
    held: 5,
    medianWin: 2680,
    medianN: 3,
    typicalCbm: '18–24 м³',
    note: 'Текстиль. В ленте реже Китая: пул экспедиторов меньше.',
  },
]

export const bidderMix = [
  { n: '0', lots: 11, share: 9, meaning: 'Слот пустой. Обычно своих не звали.' },
  { n: '1', lots: 9, share: 8, meaning: 'Не состоялся по правилу ≥2.' },
  { n: '2', lots: 38, share: 33, meaning: 'Минимум. Цена есть, торг короткий.' },
  { n: '3', lots: 41, share: 35, meaning: 'Типичный состоявшийся час.' },
  { n: '4–5', lots: 17, share: 15, meaning: 'Плотный слот. Чаще на 40HC.' },
]

export const includedSplit = [
  { label: 'Только перевозка', share: 71 },
  { label: 'Перевозка + страховка', share: 14 },
  { label: 'Перевозка + таможня', share: 9 },
  { label: 'Перевозка + маркировка', share: 6 },
]

export const rulesOfRead = [
  'Цифра победы — ставка по условиям лота, не «рынок Китай–Москва».',
  'LCL 17 м³ и 40HC 63 м³ на одной полке не сравниваем.',
  'Индекса фрахта у wIaF нет: нет контрактной панели 700 shippers.',
  'Пустой слот в аналитике важнее красивой средней: его надо перевыложить, а не усреднить.',
]
