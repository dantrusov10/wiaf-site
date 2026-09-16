export type QuoteEntry = {
  id: string
  createdAt: string
  lane: string
  amount: number
  currency: 'USD' | 'RUB'
  days: string
  fromWho: string
  incoterms: string
  note: string
}

export type RateEntry = {
  id: string
  createdAt: string
  lane: string
  buy: number
  sell: number
  currency: 'USD' | 'RUB'
  mode: string
  note: string
}

const QUOTES_KEY = 'wiaf-tool-quotes-v1'
const RATES_KEY = 'wiaf-tool-rates-v1'

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write<T>(key: string, rows: T[]) {
  localStorage.setItem(key, JSON.stringify(rows))
}

export function listQuotes(): QuoteEntry[] {
  return read<QuoteEntry>(QUOTES_KEY)
}

export function saveQuotes(rows: QuoteEntry[]) {
  write(QUOTES_KEY, rows)
}

export function listRates(): RateEntry[] {
  return read<RateEntry>(RATES_KEY)
}

export function saveRates(rows: RateEntry[]) {
  write(RATES_KEY, rows)
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
