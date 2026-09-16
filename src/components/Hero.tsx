import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { isOpenLot, lotStatus } from '../app/engine'
import { useSession } from '../app/session'
import { moneyCopy } from '../content/money'
import { useNow } from '../hooks'
import { AuctionBoard } from './AuctionBoard'
import { DeviceFrame } from './DeviceFrame'
import { HeldTicker } from './HeldTicker'
import { Magnetic, PointerStage, Tilt } from './Motion'

export function Hero() {
  const { lots } = useSession()
  const now = useNow(2000)
  const held = lots.filter((l) => lotStatus(l, now) === 'held').length
  const live = lots.filter((l) => isOpenLot(l, now)).length

  return (
    <PointerStage className="relative overflow-hidden border-b border-line bg-paper">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="hero-spot pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 pb-10 pt-24 md:grid-cols-[0.95fr_1.05fr] md:items-center md:pb-12 md:pt-28">
        <motion.div initial={{ y: 12 }} animate={{ y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
            Слепой аукцион · 60 минут · Китай → РФ
          </p>
          <h1 className="mt-3 max-w-lg font-display text-[2.15rem] font-medium leading-[1.12] tracking-tight text-ink md:text-[2.65rem]">
            Выкладываете груз — перевозчики час снижают ставку
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">{moneyCopy.hero}</p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Magnetic>
              <Link
                to="/app/register?role=importer&next=/app/importer/create&guide=1"
                className="lift-btn inline-flex rounded-lg bg-brand px-5 py-3 text-[14px] font-semibold text-white hover:bg-navy-2"
              >
                Попробовать как заказчик
              </Link>
            </Magnetic>
            <Magnetic strength={0.18}>
              <Link
                to="/app/register?role=forwarder&next=/app/forwarder/balance"
                className="lift-btn inline-flex rounded-lg border border-line bg-white px-5 py-3 text-[14px] font-medium hover:border-brand hover:text-brand"
              >
                Попробовать как исполнитель
              </Link>
            </Magnetic>
          </div>
          <p className="mt-3 text-[13px] text-muted">
            <Link to="/guide" className="font-medium text-ink underline underline-offset-4 hover:text-brand">
              Гид: первый лот за 10 минут
            </Link>
            <span className="mx-2 text-line">·</span>
            <Link to="/how" className="underline underline-offset-4 hover:text-ink">
              Как устроен час
            </Link>
          </p>
          <dl className="mt-9 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-mist">Сейчас в ленте</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-brand">{live}</dd>
              <p className="mt-1 text-[12px] text-muted">очередь и идущие слоты</p>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-mist">Состоялось</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-ink">{held}</dd>
              <p className="mt-1 text-[12px] text-muted">часы с ≥2 исполнителями</p>
            </div>
          </dl>
        </motion.div>
        <motion.div initial={{ y: 14 }} animate={{ y: 0 }} transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <Tilt className="will-change-transform">
            <DeviceFrame title="wiaf.ru · живые слоты">
              <AuctionBoard />
            </DeviceFrame>
          </Tilt>
        </motion.div>
      </div>
      <HeldTicker lots={lots} now={now} />
    </PointerStage>
  )
}
