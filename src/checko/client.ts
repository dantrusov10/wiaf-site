import type { CheckoReport } from './types'

export async function fetchCheckoLookup(inn: string): Promise<CheckoReport> {
  const res = await fetch(`/api/checko/lookup?inn=${encodeURIComponent(inn.replace(/\D/g, ''))}`)
  const data = (await res.json()) as CheckoReport
  return data
}
