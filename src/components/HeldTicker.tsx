import { bestBid, lotStatus, uniqueBidders, type AppLot } from '../app/engine'
import { ruInt } from '../data'

export function HeldTicker({ lots, now }: { lots: AppLot[]; now: number }) {
  const held = lots.filter((l) => lotStatus(l, now) === 'held' && !l.isDraft)
  if (!held.length) return null
  const items = [...held, ...held].map((lot, i) => {
    const win = bestBid(lot.bids)
    return (
      <span key={`${lot.id}-${i}`} className="mx-6 inline-flex items-center gap-3 font-mono text-[12px] text-muted">
        <span className="text-brand">{lot.code}</span>
        <span>
          {lot.from} → {lot.to}
        </span>
        <span>${ruInt.format(win ?? 0)}</span>
        <span className="text-mist">{uniqueBidders(lot.bids)} игр.</span>
      </span>
    )
  })

  return (
    <div className="overflow-hidden border-t border-line bg-white">
      <div className="ticker-track flex w-max py-2.5">{items}</div>
    </div>
  )
}
