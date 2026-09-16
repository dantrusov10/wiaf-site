/** Контракт /api/checko/lookup — полная раскладка с тонами. */

export type CheckoLight = 'green' | 'yellow' | 'red' | 'unknown' | 'demo'

/** ok = хорошо · warn = подозрительно · bad = плохо · neutral = факт без оценки */
export type CheckoTone = 'ok' | 'warn' | 'bad' | 'neutral'

export type CheckoFlag = {
  id: string
  level: 'ok' | 'warn' | 'bad'
  title: string
  detail?: string
}

export type CheckoRow = {
  label: string
  value: string
  tone: CheckoTone
  /** Короткая подпись оценки */
  toneHint?: string
}

export type CheckoShelf = {
  id: string
  title: string
  /** Сводка полки: худший тон внутри */
  tone: CheckoTone
  rows: CheckoRow[]
}

export type CheckoReport = {
  ok: boolean
  error?: string
  inn: string
  kind: 'company' | 'entrepreneur' | 'demo'
  light: CheckoLight
  lightLabel: string
  canRegister: boolean
  registerHint?: string
  companyShort: string
  companyFull: string
  statusName: string
  registeredAt?: string
  director?: string
  address?: string
  flags: CheckoFlag[]
  /** Счётчики для легенды */
  counts: { ok: number; warn: number; bad: number; neutral: number }
  shelves: CheckoShelf[]
  meta?: { todayRequestCount?: number; balance?: number }
  checkedAt: string
}

export const DEMO_INNS = new Set(['7700000000', '1234567890', '7701111111', '7702222222'])

export function isValidInnFormat(inn: string): boolean {
  const d = inn.replace(/\D/g, '')
  return d.length === 10 || d.length === 12
}
