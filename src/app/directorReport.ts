import { bestBid, commissionRub, uniqueBidders, type AppLot } from './engine'
import { compareWin, matchBench } from '../content/marketBench'

export function lotWinUsd(lot: AppLot) {
  return bestBid(lot.bids)
}

export function buildDirectorReportBody(lots: AppLot[], opts: { company: string; includeMarket: boolean; includeConditions: boolean }) {
  const lines: string[] = []
  lines.push(`Отчёт wIaF · ${opts.company}`)
  lines.push(`Дата: ${new Date().toLocaleString('ru-RU')}`)
  lines.push('')
  lines.push(`Состоявшихся часов в выборке: ${lots.length}`)
  lines.push('')

  for (const lot of lots) {
    const win = lotWinUsd(lot)
    const players = uniqueBidders(lot.bids)
    lines.push(`— ${lot.code} · ${lot.from} → ${lot.to}`)
    lines.push(`  Груз: ${lot.cargo} · ${lot.kg} кг · ${lot.cbm} м³ · ${lot.mode}`)
    if (opts.includeConditions) {
      lines.push(
        `  Условия: Incoterm ${lot.incoterm || '—'}; страховка ${lot.insurance ? 'да' : 'нет'}; таможня ${lot.customs ? 'да' : 'нет'}; контейнер ${lot.container || '—'}`,
      )
      if (lot.included?.length) lines.push(`  В ставке: ${lot.included.slice(0, 6).join('; ')}${lot.included.length > 6 ? '…' : ''}`)
    }
    lines.push(`  Игроков: ${players}${win !== undefined ? ` · победа: ${win} $ · комиссия победителя ≈ ${commissionRub(win)} ₽ (1%, ≤5 000)` : ''}`)
    if (opts.includeMarket && win !== undefined) {
      const bench = matchBench({ country: lot.country, cargo: lot.cargo, mode: lot.mode, cbm: lot.cbm })
      if (bench) {
        const cmp = compareWin(win, bench)
        lines.push(
          `  Обычно такие лоты: ${cmp.low}–${cmp.high} $ (${bench.corridor}, ${bench.cargo}). Середина ≈ ${Math.round(cmp.mid)} $. Ваша победа ${cmp.vsMidPct >= 0 ? `ниже на ${cmp.vsMidPct}%` : `выше на ${Math.abs(cmp.vsMidPct)}%`} от середины.`,
        )
        lines.push(`  Заметка рынка: ${bench.note}`)
      }
    }
    lines.push('')
  }

  lines.push('Ставка часа — не договор перевозки. Стороны оформляют сделку сами.')
  lines.push('wIaF · кабинет директора')
  return lines.join('\n')
}
