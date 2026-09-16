export type Role = 'importer' | 'forwarder'
export type LotStatus = 'draft' | 'scheduled' | 'live' | 'held' | 'failed' | 'archived'

export type Bid = {
  userId: string
  amount: number
  at: string
}

export type AppLot = {
  id: string
  ownerId: string
  code: string
  title: string
  isDraft: boolean
  archived: boolean
  settled: boolean
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
  startIso: string
  endIso: string
  closedAt?: string
  included: string[]
  createdAt: string
  maxBidUsd: number
  bids: Bid[]
}

export type User = {
  id: string
  inn: string
  password: string
  company: string
  email: string
  phone: string
  role: Role
  entity: 'ooo' | 'ip'
  balance: number
  subscribed: boolean
  responsible: string
  /** Почта директора / собственника — отдельно от логина логиста. */
  directorEmail?: string
  /** Снимок Checko на момент регистрации (если был). */
  checko?: {
    light: string
    lightLabel: string
    statusName: string
    companyFull: string
    checkedAt: string
    kind: string
  }
}

export type Ticket = {
  id: string
  userId?: string
  name: string
  email: string
  topic: string
  body: string
  lotId?: string
  at: string
  reply?: string
}

export type Ledger = {
  id: string
  userId: string
  amount: number
  at: string
  note: string
}

export const RUB_PER_USD = 80

/** Минимум на счёте исполнителя после регистрации / для «живого» кабинета */
export const REG_BALANCE_MIN = 1000

/** Минимум одного пополнения на localhost */
export const TOPUP_MIN = 1000

export function uniqueBidders(bids: Bid[]) {
  return new Set(bids.map((b) => b.userId)).size
}

export function bestBid(bids: Bid[]) {
  if (!bids.length) return undefined
  return Math.min(...bids.map((b) => b.amount))
}

export function firstBid(bids: Bid[]) {
  if (!bids.length) return undefined
  return [...bids].sort((a, b) => a.at.localeCompare(b.at))[0]?.amount
}

export function winnerId(bids: Bid[]) {
  if (uniqueBidders(bids) < 2) return undefined
  const min = bestBid(bids)
  if (min === undefined) return undefined
  const hit = [...bids].filter((b) => b.amount === min).sort((a, b) => a.at.localeCompare(b.at))[0]
  return hit?.userId
}

/** 1% от ставки в USD → ₽. Без потолка 5 000 ₽. */
export function commissionRub(winUsd: number) {
  return Math.max(0, Math.round(winUsd * 0.01 * RUB_PER_USD))
}

/** Сколько должно лежать на счёте, чтобы поставить эту ставку (холд под комиссию). */
export function holdForBidRub(bidUsd: number) {
  return Math.max(REG_BALANCE_MIN, commissionRub(bidUsd))
}

/** Внутренняя нарезка: доля комиссии в копилку процедуры (не второй прайс). */
export function fundShareRub(feeRub: number) {
  return Math.round(feeRub * 0.3)
}

export function lotStatus(lot: AppLot, now = Date.now()): LotStatus {
  if (lot.isDraft) return 'draft'
  if (lot.archived) return 'archived'
  if (lot.closedAt) return uniqueBidders(lot.bids) >= 2 ? 'held' : 'failed'
  const start = new Date(lot.startIso).getTime()
  const end = new Date(lot.endIso).getTime()
  if (now < start) return 'scheduled'
  if (now < end) return 'live'
  return uniqueBidders(lot.bids) >= 2 ? 'held' : 'failed'
}

export function countryKey(country: string) {
  const c = country.toLowerCase()
  if (c.includes('кита')) return 'china'
  if (c.includes('тур')) return 'turkey'
  if (c.includes('вьет')) return 'vietnam'
  if (c.includes('инд')) return 'india'
  if (c.includes('экспорт')) return 'export'
  return 'other'
}

export function modeEnum(mode: string): 'land' | 'rail' | 'air' | 'sea' {
  const m = mode.toLowerCase()
  if (m.includes('жд')) return 'rail'
  if (m.includes('авиа')) return 'air'
  if (m.includes('море')) return 'sea'
  return 'land'
}

export function loadFromContainer(container: string): 'fcl40' | 'lcl' {
  return /40/.test(container) ? 'fcl40' : 'lcl'
}

export function slotLabel(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function parseSlot(date: string, time: string) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date.trim())
  const t = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!m || !t) return null
  const startIso = `${m[3]}-${m[2]}-${m[1]}T${t[1].padStart(2, '0')}:${t[2]}:00+03:00`
  const end = new Date(startIso)
  end.setHours(end.getHours() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  const endIso = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}:00+03:00`
  return { startIso, endIso }
}

export function parseDdTime(s: string) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/.exec(s.trim())
  if (!m) return null
  return parseSlot(`${m[1]}.${m[2]}.${m[3]}`, `${m[4] ?? '13'}:${m[5] ?? '00'}`)
}

export function statusRu(st: LotStatus) {
  if (st === 'draft') return 'шаблон'
  if (st === 'scheduled') return 'очередь'
  if (st === 'live') return 'идёт'
  if (st === 'held') return 'состоялся'
  if (st === 'failed') return 'не состоялся'
  return 'архив'
}

export function isOpenLot(lot: AppLot, now = Date.now()) {
  const st = lotStatus(lot, now)
  return st === 'scheduled' || st === 'live'
}

export type BoardLot = {
  id: string
  code: string
  from: string
  to: string
  cargo: string
  hs: string
  kg: number
  cbm: number
  mode: 'land' | 'rail' | 'air' | 'sea'
  load: 'fcl40' | 'lcl'
  start: string
  end: string
  cargoValueRub: number
  maxBidUsd: number
  incoterm: string
  packing: string
  comment: string
  originNote: string
  destNote: string
  ready: string
  exportDecl: string
  bids: number
}

export function toBoard(lot: AppLot): BoardLot {
  return {
    id: lot.id,
    code: lot.code,
    from: lot.from,
    to: lot.to,
    cargo: lot.cargo,
    hs: lot.hs,
    kg: lot.kg,
    cbm: lot.cbm,
    mode: modeEnum(lot.mode),
    load: loadFromContainer(lot.container),
    start: lot.startIso,
    end: lot.endIso,
    cargoValueRub: lot.cargoValue,
    maxBidUsd: lot.maxBidUsd,
    incoterm: lot.incoterm,
    packing: lot.packing,
    comment: lot.comment,
    originNote: lot.shipperAddress || lot.shipperName,
    destNote: lot.destAddress,
    ready: lot.ready,
    exportDecl: lot.exportDecl,
    bids: lot.bids.length,
  }
}

export function isoToDd(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

export function isoToHm(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
