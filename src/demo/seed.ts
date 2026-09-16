import type { Lot } from '../data'
import { includedChecks } from '../content/included'

const included = includedChecks.map((c) => c.label)

export type SeedDraft = {
  id: string
  title: string
  status: 'draft' | 'scheduled' | 'live' | 'held' | 'failed'
  archived?: boolean
  country: string
  from: string
  to: string
  destAddress: string
  cargo: string
  hs: string
  kg: number
  cbm: number
  places: number
  mode: string
  container: string
  insurance: boolean
  customs: boolean
  incoterm: string
  currency: string
  cargoValue: number
  packing: string
  danger: string
  ready: string
  exportDecl: string
  shipperName: string
  shipperAddress: string
  comment: string
  start?: string
  included: string[]
  createdAt: string
  bidders?: number
  winUsd?: number
  firstUsd?: number
  commissionRub?: number
}

function lot(p: Partial<SeedDraft> & Pick<SeedDraft, 'id' | 'title' | 'status' | 'from' | 'to' | 'cargo'>): SeedDraft {
  return {
    country: 'Китай',
    destAddress: 'Химки, ул. Панфилова 19',
    hs: '611020',
    kg: 2400,
    cbm: 18,
    places: 42,
    mode: 'Наземный',
    container: 'Сборный LCL',
    insurance: false,
    customs: false,
    incoterm: 'EXW',
    currency: 'USD',
    cargoValue: 48000,
    packing: 'Коробка картон',
    danger: 'Не опасный',
    ready: '01.09.2026',
    exportDecl: 'Платит отправитель',
    shipperName: 'Guangzhou Knit Co.',
    shipperAddress: 'Baiyun, Guangzhou',
    comment: 'нет',
    included,
    createdAt: '2026-08-20T10:00:00+03:00',
    bidders: 0,
    ...p,
  }
}

/** Демо-история ООО РЛТ как заказчика. Не прод. */
export const importerLots: SeedDraft[] = [
  lot({
    id: 'd-tpl-1',
    title: 'Шаблон · трикотаж Гуанчжоу',
    status: 'draft',
    from: 'Гуанчжоу',
    to: 'Москва',
    cargo: 'Трикотаж и футболки',
    hs: '6109, 6110',
    kg: 2100,
    cbm: 16.4,
    createdAt: '2026-08-12T09:00:00+03:00',
  }),
  lot({
    id: 'd-tpl-2',
    title: 'Шаблон · 40HC Jiaxing',
    status: 'draft',
    from: 'Jiaxing',
    to: 'Москва',
    cargo: 'Куртки',
    kg: 8200,
    cbm: 62,
    container: '40HC',
    createdAt: '2026-08-18T09:00:00+03:00',
  }),
  lot({
    id: 'd-cur-1',
    title: '26-41 · платья Shanghai',
    status: 'scheduled',
    from: 'Shanghai',
    to: 'Москва',
    cargo: 'Платья женские',
    kg: 6400,
    cbm: 41.2,
    container: '40HC',
    mode: 'ЖД',
    start: '18.09.2026 11:00',
    ready: '14.09.2026',
    cargoValue: 92000,
    createdAt: '2026-09-12T14:20:00+03:00',
  }),
  lot({
    id: 'd-cur-2',
    title: '26-42 · обувь Гуанчжоу',
    status: 'live',
    from: 'Гуанчжоу',
    to: 'Москва',
    cargo: 'Обувь',
    hs: '6403',
    kg: 3100,
    cbm: 22.8,
    start: '14.09.2026 13:00',
    bidders: 1,
    firstUsd: 4100,
    insurance: true,
    cargoValue: 64000,
    createdAt: '2026-09-11T11:00:00+03:00',
  }),
  lot({
    id: 'd-cur-3',
    title: '26-43 · текстиль Стамбул',
    status: 'scheduled',
    country: 'Турция',
    from: 'Стамбул',
    to: 'Москва',
    cargo: 'Текстиль',
    hs: '6109',
    kg: 3600,
    cbm: 21.4,
    mode: 'Авто',
    container: 'Сборный LCL',
    start: '18.09.2026 12:00',
    ready: '15.09.2026',
    cargoValue: 38000,
    shipperName: 'Istanbul Textile Ltd',
    shipperAddress: 'Bayrampaşa',
    createdAt: '2026-09-13T10:00:00+03:00',
  }),
  lot({
    id: 'd-cur-4',
    title: '26-44 · пошив Хошимин',
    status: 'scheduled',
    country: 'Вьетнам',
    from: 'Хошимин',
    to: 'Москва',
    cargo: 'Пошив',
    hs: '6204',
    kg: 2400,
    cbm: 18,
    mode: 'Море',
    start: '25.09.2026 11:00',
    ready: '20.09.2026',
    cargoValue: 52000,
    customs: true,
    createdAt: '2026-09-13T16:00:00+03:00',
  }),
  lot({
    id: 'd-cur-5',
    title: '26-45 · домашний текстиль Мумбаи',
    status: 'scheduled',
    country: 'Индия',
    from: 'Мумбаи',
    to: 'Москва',
    cargo: 'Домашний текстиль',
    hs: '6302',
    kg: 4800,
    cbm: 31,
    mode: 'Море',
    container: '40HC',
    start: '28.09.2026 10:00',
    ready: '22.09.2026',
    cargoValue: 71000,
    createdAt: '2026-09-14T09:00:00+03:00',
  }),
  lot({
    id: 'd-h-1',
    title: '26-28 · трикотаж',
    status: 'held',
    from: 'Гуанчжоу',
    to: 'Москва',
    cargo: 'Трикотаж',
    kg: 2370,
    cbm: 17.1,
    start: '02.09.2026 13:00',
    bidders: 3,
    firstUsd: 4680,
    winUsd: 3120,
    commissionRub: 2496,
    createdAt: '2026-08-28T10:00:00+03:00',
  }),
  lot({
    id: 'd-h-2',
    title: '26-29 · куртки 40HC',
    status: 'held',
    from: 'Jiaxing',
    to: 'Москва',
    cargo: 'Куртки женские',
    kg: 8510,
    cbm: 63.2,
    container: '40HC',
    start: '04.09.2026 14:00',
    bidders: 4,
    firstUsd: 12840,
    winUsd: 9740,
    commissionRub: 5000,
    createdAt: '2026-08-30T10:00:00+03:00',
  }),
  lot({
    id: 'd-h-3',
    title: '26-33 · сумки',
    status: 'held',
    from: 'Yiwu',
    to: 'Москва',
    cargo: 'Сумки и ремни',
    hs: '4202',
    kg: 1800,
    cbm: 14.6,
    start: '08.09.2026 12:00',
    bidders: 2,
    firstUsd: 3900,
    winUsd: 3410,
    commissionRub: 2728,
    createdAt: '2026-09-03T09:00:00+03:00',
  }),
  lot({
    id: 'd-h-4',
    title: '26-34 · детская одежда',
    status: 'held',
    from: 'Shanghai',
    to: 'Москва',
    cargo: 'Детская одежда',
    kg: 4200,
    cbm: 29.5,
    mode: 'ЖД',
    start: '09.09.2026 11:00',
    bidders: 3,
    firstUsd: 7210,
    winUsd: 5880,
    commissionRub: 4704,
    createdAt: '2026-09-04T09:00:00+03:00',
  }),
  lot({
    id: 'd-f-1',
    title: '26-30 · ткань',
    status: 'failed',
    from: 'Hangzhou',
    to: 'Москва',
    cargo: 'Ткань рулонами',
    kg: 5600,
    cbm: 19.4,
    start: '05.09.2026 15:00',
    bidders: 1,
    firstUsd: 5100,
    createdAt: '2026-09-01T12:00:00+03:00',
    comment: 'Пришёл один. Перевыложить.',
  }),
  lot({
    id: 'd-f-2',
    title: '26-32 · фурнитура',
    status: 'failed',
    from: 'Гуанчжоу',
    to: 'Москва',
    cargo: 'Фурнитура',
    kg: 900,
    cbm: 6.2,
    start: '07.09.2026 10:00',
    bidders: 0,
    createdAt: '2026-09-02T12:00:00+03:00',
    comment: 'Слот пустой — не звали своих.',
  }),
  lot({
    id: 'd-a-1',
    title: 'м118 · майки',
    status: 'held',
    from: 'Гуанчжоу',
    to: 'Москва',
    cargo: 'Майки',
    kg: 1980,
    cbm: 15.2,
    start: '12.08.2026 13:00',
    bidders: 2,
    firstUsd: 3550,
    winUsd: 2980,
    commissionRub: 2384,
    archived: true,
    createdAt: '2026-08-08T10:00:00+03:00',
  }),
  lot({
    id: 'd-a-2',
    title: 'м121 · 40HC',
    status: 'held',
    from: 'Ningbo',
    to: 'Москва',
    cargo: 'Верхняя одежда',
    kg: 7900,
    cbm: 61.8,
    container: '40HC',
    start: '19.08.2026 14:00',
    bidders: 3,
    firstUsd: 11900,
    winUsd: 10120,
    commissionRub: 5000,
    archived: true,
    createdAt: '2026-08-14T10:00:00+03:00',
  }),
]

export const importerLotBids = [
  { lotId: 'd-cur-2', amount: 4100, at: '2026-09-14T13:12:00+03:00' },
  { lotId: 'd-h-1', amount: 4680, at: '2026-09-02T13:08:00+03:00' },
  { lotId: 'd-h-1', amount: 3900, at: '2026-09-02T13:22:00+03:00' },
  { lotId: 'd-h-1', amount: 3120, at: '2026-09-02T13:47:00+03:00' },
  { lotId: 'd-h-2', amount: 12840, at: '2026-09-04T14:05:00+03:00' },
  { lotId: 'd-h-2', amount: 11200, at: '2026-09-04T14:18:00+03:00' },
  { lotId: 'd-h-2', amount: 10350, at: '2026-09-04T14:31:00+03:00' },
  { lotId: 'd-h-2', amount: 9740, at: '2026-09-04T14:52:00+03:00' },
  { lotId: 'd-h-3', amount: 3900, at: '2026-09-08T12:10:00+03:00' },
  { lotId: 'd-h-3', amount: 3410, at: '2026-09-08T12:40:00+03:00' },
  { lotId: 'd-h-4', amount: 7210, at: '2026-09-09T11:07:00+03:00' },
  { lotId: 'd-h-4', amount: 6400, at: '2026-09-09T11:29:00+03:00' },
  { lotId: 'd-h-4', amount: 5880, at: '2026-09-09T11:51:00+03:00' },
  { lotId: 'd-f-1', amount: 5100, at: '2026-09-05T15:20:00+03:00' },
]

export const importerMessages = [
  {
    id: 'm1',
    topic: 'Предложение для wIaF',
    body: 'Слот 26-30 не состоялся: пришёл один. Можно ли перенести без новой анкеты?',
    at: '2026-09-05T18:10:00+03:00',
  },
]

export type Deal = {
  id: string
  code: string
  from: string
  to: string
  cargo: string
  kg: number
  cbm: number
  mode: string
  myBid: number
  winBid: number
  bidders: number
  date: string
  status: 'won' | 'lost' | 'archive'
  commissionRub: number
  country: 'china' | 'turkey' | 'vietnam' | 'india'
}

export const forwarderDeals: Deal[] = [
  { id: 'w1', code: '26-28', from: 'Гуанчжоу', to: 'Москва', cargo: 'Трикотаж', kg: 2370, cbm: 17.1, mode: 'Наземный', myBid: 3120, winBid: 3120, bidders: 3, date: '02.09.2026', status: 'won', commissionRub: 2496, country: 'china' },
  { id: 'w2', code: 'м118', from: 'Гуанчжоу', to: 'Москва', cargo: 'Майки', kg: 1980, cbm: 15.2, mode: 'Наземный', myBid: 2980, winBid: 2980, bidders: 2, date: '12.08.2026', status: 'won', commissionRub: 2384, country: 'china' },
  { id: 'w3', code: 'T-09', from: 'Стамбул', to: 'Москва', cargo: 'Текстиль', kg: 4100, cbm: 24, mode: 'Авто', myBid: 2680, winBid: 2680, bidders: 3, date: '22.08.2026', status: 'won', commissionRub: 2144, country: 'turkey' },
  { id: 'w4', code: '26-22', from: 'Yiwu', to: 'Москва', cargo: 'Мелочёвка', kg: 1500, cbm: 12.4, mode: 'Наземный', myBid: 2210, winBid: 2210, bidders: 2, date: '15.08.2026', status: 'won', commissionRub: 1768, country: 'china' },
  { id: 'w5', code: '26-19', from: 'Shanghai', to: 'Москва', cargo: 'Платья', kg: 5200, cbm: 33, mode: 'ЖД', myBid: 6140, winBid: 6140, bidders: 4, date: '04.08.2026', status: 'won', commissionRub: 4912, country: 'china' },
  { id: 'l1', code: '26-29', from: 'Jiaxing', to: 'Москва', cargo: 'Куртки', kg: 8510, cbm: 63.2, mode: 'Наземный', myBid: 10350, winBid: 9740, bidders: 4, date: '04.09.2026', status: 'lost', commissionRub: 0, country: 'china' },
  { id: 'l2', code: '26-33', from: 'Yiwu', to: 'Москва', cargo: 'Сумки', kg: 1800, cbm: 14.6, mode: 'Наземный', myBid: 3900, winBid: 3410, bidders: 2, date: '08.09.2026', status: 'lost', commissionRub: 0, country: 'china' },
  { id: 'l3', code: '26-34', from: 'Shanghai', to: 'Москва', cargo: 'Детская одежда', kg: 4200, cbm: 29.5, mode: 'ЖД', myBid: 6400, winBid: 5880, bidders: 3, date: '09.09.2026', status: 'lost', commissionRub: 0, country: 'china' },
  { id: 'l4', code: 'T-11', from: 'Измир', to: 'Москва', cargo: 'Обувь', kg: 2800, cbm: 18, mode: 'Авто', myBid: 1980, winBid: 1760, bidders: 3, date: '01.09.2026', status: 'lost', commissionRub: 0, country: 'turkey' },
  { id: 'a1', code: '26-12', from: 'Гуанчжоу', to: 'Москва', cargo: 'Футболки', kg: 2200, cbm: 16, mode: 'Наземный', myBid: 3050, winBid: 3050, bidders: 2, date: '18.07.2026', status: 'archive', commissionRub: 2440, country: 'china' },
  { id: 'a2', code: '26-08', from: 'Ningbo', to: 'Москва', cargo: 'Куртки', kg: 7600, cbm: 60, mode: 'Наземный', myBid: 11100, winBid: 10840, bidders: 3, date: '02.07.2026', status: 'archive', commissionRub: 0, country: 'china' },
  { id: 'a3', code: 'T-04', from: 'Стамбул', to: 'Москва', cargo: 'Кожа', kg: 900, cbm: 8, mode: 'Авто', myBid: 1420, winBid: 1420, bidders: 2, date: '21.06.2026', status: 'archive', commissionRub: 1136, country: 'turkey' },
]

export const forwarderBids = [
  { lotId: '115', amount: 4200, at: '2026-09-14T10:15:00+03:00' },
  { lotId: 't-201', amount: 2550, at: '2026-09-13T16:40:00+03:00' },
]

export const topups = [
  { amount: 15000, at: '2026-07-03T11:00:00+03:00' },
  { amount: 10000, at: '2026-08-11T11:00:00+03:00' },
  { amount: 5000, at: '2026-09-02T11:00:00+03:00' },
]

export const turkeyLots: Lot[] = [
  {
    id: 't-201',
    code: 'T-14',
    from: 'Стамбул',
    to: 'Москва',
    cargo: 'Текстиль',
    hs: '6109',
    kg: 3600,
    cbm: 21.4,
    mode: 'land',
    load: 'lcl',
    start: '2026-09-18T12:00:00+03:00',
    end: '2026-09-18T13:00:00+03:00',
    cargoValueRub: 2100000,
    maxBidUsd: 4800,
    incoterm: 'EXW',
    packing: 'Кипа',
    comment: 'п/п не Алтынколь',
    originNote: 'Стамбул, Багджылар',
    destNote: 'Москва / Химки',
    ready: '2026-09-16',
    exportDecl: 'Платит отправитель',
    bids: 1,
  },
  {
    id: 't-202',
    code: 'T-15',
    from: 'Измир',
    to: 'Москва',
    cargo: 'Обувь',
    hs: '6403',
    kg: 2900,
    cbm: 19.1,
    mode: 'land',
    load: 'lcl',
    start: '2026-09-22T10:00:00+03:00',
    end: '2026-09-22T11:00:00+03:00',
    cargoValueRub: 1800000,
    maxBidUsd: 3900,
    incoterm: 'FCA',
    packing: 'Коробка картон',
    comment: 'забор в Измире, авто',
    originNote: 'Измир',
    destNote: 'Москва',
    ready: '2026-09-18',
    exportDecl: 'Платит импортёр',
    bids: 0,
  },
]

export const vietnamLots: Lot[] = [
  {
    id: 'v-10',
    code: 'VN-03',
    from: 'Хошимин',
    to: 'Москва',
    cargo: 'Пошив',
    kg: 2400,
    cbm: 18,
    mode: 'sea',
    load: 'lcl',
    start: '2026-09-25T11:00:00+03:00',
    end: '2026-09-25T12:00:00+03:00',
    cargoValueRub: 1500000,
    maxBidUsd: 5200,
    incoterm: 'FOB',
    packing: 'Коробка картон',
    comment: 'FOB Хошимин, сборная',
    originNote: 'Хошимин',
    destNote: 'Москва',
    ready: '2026-09-20',
    exportDecl: 'Платит отправитель',
    bids: 0,
  },
]

/** Недели: сформировано / состоялось. Масштаб как у площадки (~10/нед), не «миллионы». */
export const weekSeries = [
  { w: '21.07', formed: 9, held: 7 },
  { w: '28.07', formed: 11, held: 8 },
  { w: '04.08', formed: 10, held: 9 },
  { w: '11.08', formed: 12, held: 10 },
  { w: '18.08', formed: 13, held: 11 },
  { w: '25.08', formed: 14, held: 12 },
  { w: '01.09', formed: 15, held: 11 },
  { w: '08.09', formed: 16, held: 12 },
]

export const importerWeek = [
  { w: '21.07', lots: 1, held: 1 },
  { w: '28.07', lots: 0, held: 0 },
  { w: '04.08', lots: 2, held: 1 },
  { w: '11.08', lots: 1, held: 1 },
  { w: '18.08', lots: 1, held: 1 },
  { w: '25.08', lots: 1, held: 1 },
  { w: '01.09', lots: 3, held: 2 },
  { w: '08.09', lots: 3, held: 2 },
]

export const forwarderWeek = [
  { w: '21.07', bids: 4, won: 1 },
  { w: '28.07', bids: 3, won: 0 },
  { w: '04.08', bids: 6, won: 1 },
  { w: '11.08', bids: 5, won: 1 },
  { w: '18.08', bids: 7, won: 1 },
  { w: '25.08', bids: 4, won: 1 },
  { w: '01.09', bids: 8, won: 1 },
  { w: '08.09', bids: 6, won: 0 },
]

export const platformHeld = [
  { id: 'p1', code: '26-28', route: 'Гуанчжоу → Москва', type: 'LCL · авто', cbm: 17.1, win: 3120, n: 3, when: '02.09' },
  { id: 'p2', code: '26-29', route: 'Jiaxing → Москва', type: '40HC · авто', cbm: 63.2, win: 9740, n: 4, when: '04.09' },
  { id: 'p3', code: '26-33', route: 'Yiwu → Москва', type: 'LCL · авто', cbm: 14.6, win: 3410, n: 2, when: '08.09' },
  { id: 'p4', code: '26-34', route: 'Shanghai → Москва', type: 'LCL · ЖД', cbm: 29.5, win: 5880, n: 3, when: '09.09' },
  { id: 'p5', code: 'T-09', route: 'Стамбул → Москва', type: 'LCL · авто', cbm: 24, win: 2680, n: 3, when: '22.08' },
  { id: 'p6', code: 'м118', route: 'Гуанчжоу → Москва', type: 'LCL · авто', cbm: 15.2, win: 2980, n: 2, when: '12.08' },
]
