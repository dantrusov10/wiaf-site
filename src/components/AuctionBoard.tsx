import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { formatWhen, loadLabel, modeLabel, ruDec, ruInt, type Auction } from '../data'
import { useSlotClock } from '../hooks'
import { isOpenLot, lotStatus, toBoard } from '../app/engine'
import { useSession } from '../app/session'
import { HsChip, IncotermChip, ModeIcon, StatusChip } from './Chips'

function AuctionRow({ lot, featured }: { lot: Auction; featured?: boolean }) {
  const clock = useSlotClock(lot.start, lot.end)
  return (
    <motion.article
      layout
      className={`auction-row relative overflow-hidden rounded-lg border px-3.5 py-3 ${
        featured ? 'border-brand/40 bg-white' : 'border-line bg-white'
      }`}
    >
      <Link to={`/auctions/${lot.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-[17px] font-semibold tracking-tight text-ink">
              {lot.from}
              <span className="mx-1.5 font-sans text-brand">→</span>
              {lot.to}
            </p>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {lot.cargo}
              {lot.hs ? (
                <span className="ml-1.5">
                  <HsChip value={lot.hs} />
                </span>
              ) : null}
            </p>
          </div>
          <StatusChip tone={clock.phase === 'live' ? 'live' : clock.phase === 'queue' ? 'queue' : 'held'}>
            {clock.phase === 'live' ? `идёт ${clock.label}` : clock.label}
          </StatusChip>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-muted">
          <span>{ruDec.format(lot.cbm)} м³</span>
          <span>{ruInt.format(lot.kg)} кг</span>
          <span className="inline-flex items-center gap-1">
            <ModeIcon mode={lot.mode} />
            {modeLabel(lot.mode)} · {loadLabel(lot.load)}
          </span>
          <IncotermChip value={lot.incoterm} />
          <span>{formatWhen(lot.start)} МСК</span>
        </div>
      </Link>
    </motion.article>
  )
}

export function AuctionBoard() {
  const { lots } = useSession()
  const open = lots.filter((l) => isOpenLot(l)).sort((a, b) => a.startIso.localeCompare(b.startIso))
  const live = open.filter((l) => lotStatus(l) === 'live').length
  const rows = open.slice(0, 6).map(toBoard)

  return (
    <div id="board">
      <div className="flex items-center justify-between border-b border-line bg-fog px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="live-dot relative size-2 rounded-full bg-ok" />
          <p className="text-[13px] font-semibold tracking-wide">Живые аукционы</p>
        </div>
        <p className="clock font-mono text-[12px] text-muted">
          {live} идёт · {open.length} в ленте
        </p>
      </div>
      <div className="grid gap-2 p-3">
        {rows.length ? (
          rows.map((lot, i) => <AuctionRow key={lot.id} lot={lot} featured={i === 0} />)
        ) : (
          <p className="px-2 py-6 text-center text-[13px] text-muted">
            Сейчас нет открытых слотов.{' '}
            <Link to="/app/login?role=importer" className="underline">
              Выложить груз
            </Link>
          </p>
        )}
      </div>
      <p className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-mist">
        Слепые торги · 60 мин · до 5 ставок · шаг $1 · состоялись при ≥2
      </p>
    </div>
  )
}

