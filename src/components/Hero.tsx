import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { isOpenLot, lotStatus } from '../app/engine'
import { useSession } from '../app/session'
import { useNow } from '../hooks'
import { AuctionBoard } from './AuctionBoard'
import { DeviceFrame } from './DeviceFrame'
import { HeldTicker } from './HeldTicker'
import { Magnetic, PointerStage, Tilt } from './Motion'

export function Hero() {
  const { lots } = useSession()
  const now = useNow(2000)
  const formed = lots.filter((l) => !l.isDraft).length
  const held = lots.filter((l) => lotStatus(l, now) === 'held').length
  const live = lots.filter((l) => isOpenLot(l, now)).length

  return (
    <PointerStage className="relative overflow-hidden border-b border-line bg-paper">
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="hero-spot pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 pb-8 pt-24 md:grid-cols-[0.92fr_1.08fr] md:items-center md:pb-10 md:pt-28">
        <motion.div initial={{ y: 12 }} animate={{ y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <p className="text-[12px] font-medium text-brand">Слепой аукцион · Китай → РФ · 60 минут</p>
          <h1 className="mt-2 max-w-lg text-[2rem] font-semibold leading-[1.15] tracking-tight text-ink md:text-[2.55rem]">
            Выкладываете груз — перевозчики час снижают ставку
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            Импортёру бесплатно. Комиссия только с победителя: 1%, без потолка 5 000 ₽. Состоялось, если пришли двое.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Magnetic>
              <Link
                to="/app/login?role=importer"
                className="lift-btn inline-flex rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-navy-2"
              >
                Выложить груз
              </Link>
            </Magnetic>
            <Magnetic strength={0.18}>
              <Link
                to="/app/login?role=forwarder"
                className="lift-btn inline-flex rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] font-medium hover:border-brand hover:text-brand"
              >
                Я перевозчик
              </Link>
            </Magnetic>
          </div>
          <p className="mt-3 text-[13px] text-muted">
            <Link to="/director" className="underline underline-offset-4 hover:text-ink">
              Директору: письма с итогами часов
            </Link>
            <span className="mx-2 text-line">·</span>
            <Link to="/guide" className="underline underline-offset-4 hover:text-ink">
              Гид за 10 минут
            </Link>
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-5 font-mono text-[12px]">
            <div className="stat-hover rounded-md px-1 py-1">
              <dt className="text-mist">Сформировано</dt>
              <dd className="mt-0.5 text-2xl font-semibold text-ink">{formed}</dd>
            </div>
            <div className="stat-hover rounded-md px-1 py-1">
              <dt className="text-mist">Состоялось</dt>
              <dd className="mt-0.5 text-2xl font-semibold text-ink">{held}</dd>
            </div>
            <div className="stat-hover rounded-md px-1 py-1">
              <dt className="text-mist">Сейчас</dt>
              <dd className="mt-0.5 text-2xl font-semibold text-brand">{live}</dd>
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
