import { includedChecks } from '../content/included'
import { lots as publicLots, modeLabel } from '../data'
import { importerLotBids, importerLots, turkeyLots, vietnamLots } from '../demo/seed'
import type { AppLot, Ledger, Ticket, User } from './engine'
import { parseDdTime } from './engine'

export const U_IMP = 'u-imp'
export const U_FWD = 'u-fwd'
export const U_FWD2 = 'u-fwd2'
export const U_FWD3 = 'u-fwd3'

const included = includedChecks.map((c) => c.label)

export const seedUsers: User[] = [
  {
    id: U_IMP,
    inn: '7700000000',
    password: '1234',
    company: 'ООО РЛТ',
    email: 'import@rlt.local',
    phone: '+7 963 333-77-95',
    role: 'importer',
    entity: 'ooo',
    balance: 0,
    subscribed: true,
    planId: 'imp-zakupka',
    responsible: 'Трусов Д. Р.',
    directorEmail: 'director@rlt.local',
    directorPrefs: {
      email: 'director@rlt.local',
      enabled: true,
      cadence: 'each',
      includeMarket: true,
      includeConditions: true,
    },
  },
  {
    id: U_FWD,
    inn: '1234567890',
    password: '1234',
    company: 'ООО РЛТ',
    email: 'forward@rlt.local',
    phone: '+7 963 333-77-95',
    role: 'forwarder',
    entity: 'ooo',
    balance: 18500,
    subscribed: true,
    planId: 'fwd-stol',
    responsible: 'Трусов Д. Р.',
  },
  {
    id: U_FWD2,
    inn: '7701111111',
    password: '1234',
    company: 'ООО Север Логистик',
    email: 'bid@sever.local',
    phone: '+7 495 111-11-11',
    role: 'forwarder',
    entity: 'ooo',
    balance: 22000,
    subscribed: true,
    planId: 'fwd-stol',
    responsible: 'Иванов А. А.',
  },
  {
    id: U_FWD3,
    inn: '7702222222',
    password: '1234',
    company: 'ИП Карпов С. С.',
    email: 'karpov@local',
    phone: '+7 495 222-22-22',
    role: 'forwarder',
    entity: 'ip',
    balance: 9000,
    subscribed: false,
    planId: 'fwd-free',
    responsible: 'Карпов С. С.',
  },
]

function fromFeed(
  l: (typeof publicLots)[0] | (typeof turkeyLots)[0],
  country: string,
  extra?: Partial<AppLot>,
): AppLot {
  return {
    id: l.id,
    ownerId: U_IMP,
    code: l.code,
    title: `${l.code} · ${l.cargo}`,
    isDraft: false,
    archived: false,
    settled: false,
    country,
    from: l.from,
    to: l.to,
    destAddress: l.destNote,
    cargo: l.cargo,
    hs: l.hs ?? '',
    kg: l.kg,
    cbm: l.cbm,
    places: 40,
    mode: 'mode' in l ? modeLabel(l.mode) : 'Наземный',
    container: l.load === 'fcl40' ? '40HC' : 'Сборный LCL',
    insurance: false,
    customs: false,
    incoterm: l.incoterm,
    currency: 'USD',
    cargoValue: l.cargoValueRub,
    packing: l.packing,
    danger: 'Не опасный',
    ready: l.ready,
    exportDecl: l.exportDecl,
    shipperName: '',
    shipperAddress: l.originNote,
    comment: l.comment,
    startIso: l.start,
    endIso: l.end,
    included,
    createdAt: '2026-09-12T10:00:00+03:00',
    maxBidUsd: l.maxBidUsd,
    bids: [],
    ...extra,
  }
}

function fromDraft(d: (typeof importerLots)[0]): AppLot {
  const slot = parseDdTime(d.start ?? d.createdAt) ?? {
    startIso: d.createdAt,
    endIso: d.createdAt,
  }
  return {
    id: d.id,
    ownerId: U_IMP,
    code: d.title.split('·')[0]?.trim() || d.id.slice(0, 6),
    title: d.title,
    isDraft: d.status === 'draft',
    archived: Boolean(d.archived),
    settled: d.status === 'held',
    country: d.country,
    from: d.from,
    to: d.to,
    destAddress: d.destAddress,
    cargo: d.cargo,
    hs: d.hs,
    kg: d.kg,
    cbm: d.cbm,
    places: d.places,
    mode: d.mode,
    container: d.container,
    insurance: d.insurance,
    customs: d.customs,
    incoterm: d.incoterm,
    currency: d.currency,
    cargoValue: d.cargoValue,
    packing: d.packing,
    danger: d.danger,
    ready: d.ready,
    exportDecl: d.exportDecl,
    shipperName: d.shipperName,
    shipperAddress: d.shipperAddress,
    comment: d.comment,
    startIso: slot.startIso,
    endIso: slot.endIso,
    included: d.included.length ? d.included : included,
    createdAt: d.createdAt,
    maxBidUsd: d.firstUsd ?? d.winUsd ?? 20000,
    bids: [],
  }
}

const india: AppLot = {
  id: 'in-1',
  ownerId: U_IMP,
  code: 'IN-02',
  title: 'IN-02 · ткани Мумбаи',
  isDraft: false,
  archived: false,
  settled: false,
  country: 'Индия',
  from: 'Мумбаи',
  to: 'Москва',
  destAddress: 'Химки',
  cargo: 'Ткань',
  hs: '5208',
  kg: 4200,
  cbm: 26,
  places: 30,
  mode: 'Море',
  container: 'Сборный LCL',
  insurance: true,
  customs: false,
  incoterm: 'FOB',
  currency: 'USD',
  cargoValue: 38000,
  packing: 'Рулон',
  danger: 'Не опасный',
  ready: '18.09.2026',
  exportDecl: 'Платит отправитель',
  shipperName: 'Mumbai Textiles',
  shipperAddress: 'Bhiwandi',
  comment: 'нет',
  startIso: '2026-09-24T12:00:00+03:00',
  endIso: '2026-09-24T13:00:00+03:00',
  included,
  createdAt: '2026-09-10T10:00:00+03:00',
  maxBidUsd: 6400,
  bids: [],
}

function attachHistory(lots: AppLot[]): AppLot[] {
  const byId = new Map(lots.map((l) => [l.id, { ...l, bids: [...l.bids] }]))
  const cycle = [U_FWD, U_FWD2, U_FWD3]
  const seen: Record<string, number> = {}
  for (const b of importerLotBids) {
    const lot = byId.get(b.lotId)
    if (!lot) continue
    const i = seen[b.lotId] ?? 0
    seen[b.lotId] = i + 1
    lot.bids.push({ userId: cycle[i % cycle.length], amount: b.amount, at: b.at })
  }
  const live = byId.get('115')
  if (live && !live.bids.length) {
    live.bids.push({ userId: U_FWD, amount: 4200, at: '2026-09-14T10:15:00+03:00' })
  }
  const t = byId.get('t-201')
  if (t && !t.bids.length) {
    t.bids.push({ userId: U_FWD, amount: 2550, at: '2026-09-13T16:40:00+03:00' })
  }
  return [...byId.values()]
}

export function seedLots(): AppLot[] {
  const drafts = importerLots.map(fromDraft)
  const feed = [
    ...publicLots.map((l) => fromFeed(l, 'Китай')),
    ...turkeyLots.map((l) => fromFeed(l, 'Турция')),
    ...vietnamLots.map((l) => fromFeed(l, 'Вьетнам')),
    india,
  ]
  const merged = new Map<string, AppLot>()
  for (const l of [...feed, ...drafts]) merged.set(l.id, l)
  const start = new Date(Date.now() - 18 * 60 * 1000)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  merged.set('live-now', {
    id: 'live-now',
    ownerId: U_IMP,
    code: '26-44',
    title: '26-44 · трикотаж Гуанчжоу',
    isDraft: false,
    archived: false,
    settled: false,
    country: 'Китай',
    from: 'Гуанчжоу',
    to: 'Москва',
    destAddress: 'Химки, ул. Панфилова 19',
    cargo: 'Трикотаж',
    hs: '611020',
    kg: 2100,
    cbm: 16,
    places: 36,
    mode: 'Наземный',
    container: 'Сборный LCL',
    insurance: false,
    customs: false,
    incoterm: 'EXW',
    currency: 'USD',
    cargoValue: 1680000,
    packing: 'Коробка картон',
    danger: 'Не опасный',
    ready: isoToDdNow(),
    exportDecl: 'Платит отправитель',
    shipperName: 'Guangzhou Knit Co.',
    shipperAddress: 'Baiyun',
    comment: 'п/п не Алтынколь',
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    included,
    createdAt: new Date().toISOString(),
    maxBidUsd: 5200,
    bids: [
      { userId: U_FWD, amount: 3900, at: start.toISOString() },
      { userId: U_FWD2, amount: 3610, at: new Date(start.getTime() + 6 * 60 * 1000).toISOString() },
    ],
  })
  const soonStart = new Date(Date.now() + 42 * 60 * 1000)
  merged.set('live-soon', {
    id: 'live-soon',
    ownerId: U_IMP,
    code: '26-45',
    title: '26-45 · обувь Гуанчжоу',
    isDraft: false,
    archived: false,
    settled: false,
    country: 'Китай',
    from: 'Гуанчжоу',
    to: 'Москва',
    destAddress: 'Химки',
    cargo: 'Обувь',
    hs: '6403',
    kg: 3100,
    cbm: 22.8,
    places: 48,
    mode: 'Наземный',
    container: 'Сборный LCL',
    insurance: false,
    customs: true,
    incoterm: 'EXW',
    currency: 'USD',
    cargoValue: 2400000,
    packing: 'Коробка картон',
    danger: 'Не опасный',
    ready: isoToDdNow(),
    exportDecl: 'Платит отправитель',
    shipperName: 'Guangzhou Shoe Ltd',
    shipperAddress: 'Panyu',
    comment: 'таможня входит в ставку',
    startIso: soonStart.toISOString(),
    endIso: new Date(soonStart.getTime() + 60 * 60 * 1000).toISOString(),
    included,
    createdAt: new Date().toISOString(),
    maxBidUsd: 4800,
    bids: [],
  })
  return attachHistory([...merged.values()])
}

function isoToDdNow() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

export const seedTickets: Ticket[] = [
  {
    id: 'tix-1',
    userId: U_IMP,
    name: 'Трусов Д. Р.',
    email: 'import@rlt.local',
    topic: 'Предложение для wIaF',
    body: 'Слот 26-30 не состоялся: пришёл один. Можно ли перенести без новой анкеты?',
    lotId: 'd-f-1',
    at: '2026-09-05T18:10:00+03:00',
    reply: 'Да. Откройте лот и нажмите «Новый слот» — анкета сохранится.',
  },
]

export const seedLedger: Ledger[] = [
  { id: 'led-1', userId: U_FWD, amount: 15000, at: '2026-07-03T11:00:00+03:00', note: 'Пополнение' },
  { id: 'led-2', userId: U_FWD, amount: 10000, at: '2026-08-11T11:00:00+03:00', note: 'Пополнение' },
  { id: 'led-3', userId: U_FWD, amount: 5000, at: '2026-09-02T11:00:00+03:00', note: 'Пополнение' },
]
