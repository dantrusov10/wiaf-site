export type Mode = "land" | "rail" | "air" | "sea"
export type LoadType = "fcl40" | "lcl"

export type Lot = {
  id: string
  code: string
  from: string
  to: string
  destCityExtra?: string
  cargo: string
  hs?: string
  kg: number
  cbm: number
  mode: Mode
  load: LoadType
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

/** Живая лента с ЛК исполнителя 14.09.2026 — без выдуманных лотов. */
export const lots: Lot[] = [
  {
    id: "115",
    code: "26-37",
    from: "Гуанчжоу",
    to: "Москва",
    cargo: "Трикотаж и одежда",
    hs: "611020, 620462",
    kg: 2374,
    cbm: 17.023,
    mode: "land",
    load: "lcl",
    start: "2026-09-16T13:00:00+03:00",
    end: "2026-09-16T14:00:00+03:00",
    cargoValueRub: 1890000,
    maxBidUsd: 68092,
    incoterm: "EXW",
    packing: "Коробка картон",
    comment: "п/п не Алтынколь",
    originNote: "Адрес завода в карточке лота (полный — у исполнителя после входа)",
    destNote: "Москва / Химки",
    ready: "2026-09-14",
    exportDecl: "Платит отправитель",
    bids: 0,
  },
  {
    id: "116",
    code: "26-38",
    from: "Jiaxing",
    to: "Москва",
    destCityExtra: "Химки",
    cargo: "Куртки женские",
    kg: 8621,
    cbm: 63.5,
    mode: "land",
    load: "fcl40",
    start: "2026-09-16T14:00:00+03:00",
    end: "2026-09-16T15:00:00+03:00",
    cargoValueRub: 6400000,
    maxBidUsd: 254000,
    incoterm: "EXW",
    packing: "Коробка картон",
    comment: "п/п не Алтынколь",
    originNote: "Точный адрес отправителя — в полной карточке",
    destNote: "Химки",
    ready: "2026-09-14",
    exportDecl: "Платит отправитель",
    bids: 0,
  },
  {
    id: "114",
    code: "м127",
    from: "Гуанчжоу",
    to: "Москва",
    cargo: "Трикотаж и одежда",
    hs: "611020, 620462",
    kg: 2705,
    cbm: 18.12,
    mode: "land",
    load: "lcl",
    start: "2026-09-21T11:00:00+03:00",
    end: "2026-09-21T12:00:00+03:00",
    cargoValueRub: 2140000,
    maxBidUsd: 72480,
    incoterm: "EXW",
    packing: "Коробка картон",
    comment: "не через Казахстан",
    originNote: "Гуанчжоу",
    destNote: "Москва",
    ready: "2026-09-14",
    exportDecl: "Платит отправитель",
    bids: 0,
  },
  {
    id: "113",
    code: "ETA/26-31",
    from: "Shanghai",
    to: "Москва",
    cargo: "Платья женские",
    kg: 8701,
    cbm: 64.5,
    mode: "rail",
    load: "fcl40",
    start: "2026-09-21T11:00:00+03:00",
    end: "2026-09-21T12:00:00+03:00",
    cargoValueRub: 7200000,
    maxBidUsd: 258000,
    incoterm: "EXW",
    packing: "Коробка картон",
    comment: "п/п не Казахстан",
    originNote: "Shanghai",
    destNote: "Москва",
    ready: "2026-09-14",
    exportDecl: "Платит отправитель",
    bids: 0,
  },
]

export const stats = {
  formed: 116,
  held: 96,
  live: 4,
}

export const prod = {
  sellerLogin: "https://wiaf.ru/Seller/Seller_login.php",
  sellerOOO: "https://wiaf.ru/Seller/Captcha/Seller_ca_OOO.php",
  sellerIP: "https://wiaf.ru/Seller/Captcha/Seller_ca_IP.php",
  buyerLogin: "https://wiaf.ru/BUYER/Buyer_login.php",
  buyerOOO: "https://wiaf.ru/BUYER/Captcha/Buyer_ca_OOO.php",
  buyerIP: "https://wiaf.ru/BUYER/Captcha/Buyer_ca_IP.php",
  rules: "https://wiaf.ru/pravila1-1-1-1.php",
}

export const ruInt = new Intl.NumberFormat("ru-RU")
export const ruDec = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 })

export function getLot(id: string) {
  return lots.find((l) => l.id === id)
}

export function modeLabel(mode: Lot["mode"]) {
  if (mode === "rail") return "ЖД"
  if (mode === "air") return "Авиа"
  if (mode === "sea") return "Море"
  return "Наземный"
}

export function loadLabel(load: LoadType) {
  return load === "fcl40" ? "FCL 40HC" : "Сборный"
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date(iso))
}

/** @deprecated use lots */
export const auctions = lots
export type Auction = Lot
