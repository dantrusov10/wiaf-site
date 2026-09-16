import { Link, useParams } from 'react-router-dom'
import { BidBox } from '../app/BidBox'
import { isOpenLot, loadFromContainer, lotStatus, modeEnum, statusRu } from '../app/engine'
import { useSession } from '../app/session'
import { PageHero } from '../components/PageHero'
import { excludedNotes, includedChecks } from '../content/included'
import { formatWhen, loadLabel, modeLabel, ruDec, ruInt } from '../data'
import { useNow } from '../hooks'

export function AuctionLotPage() {
  const { id } = useParams()
  const { lots, user } = useSession()
  const now = useNow(1000)
  const lot = lots.find((l) => l.id === id && !l.isDraft)

  if (!lot) {
    return (
      <main>
        <PageHero kicker="Лот" title="Такого лота нет" dek="Проверьте ленту — слот мог закрыться или это шаблон." />
        <div className="mx-auto max-w-6xl px-5 py-14">
          <Link to="/auctions" className="rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white">
            К ленте
          </Link>
        </div>
      </main>
    )
  }

  const st = lotStatus(lot, now)

  return (
    <main>
      <PageHero
        kicker={`${lot.code} · ${statusRu(st)}`}
        title={`${lot.from} → ${lot.to}`}
        dek={`${lot.cargo}. Чтобы дать ставку, нужен вход исполнителя и на счёте ≥ 1% от вашей цифры.`}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {lot.cargoValue === 0 ? (
            <p className="rounded-2xl border border-brand/30 bg-white px-4 py-3 text-[14px] text-brand">
              Стоимость груза 0 — для оценки риска этого мало.
            </p>
          ) : null}
          <dl className="grid gap-4 rounded-2xl border border-line bg-white p-6 text-[15px] sm:grid-cols-2">
            <div>
              <dt className="text-[12px] text-mist">Слот МСК</dt>
              <dd>
                {formatWhen(lot.startIso)} — {formatWhen(lot.endIso)}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-mist">Тип</dt>
              <dd>
                {loadLabel(loadFromContainer(lot.container))} · {modeLabel(modeEnum(lot.mode))}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-mist">Объём / масса</dt>
              <dd>
                {ruDec.format(lot.cbm)} м³ · {ruInt.format(lot.kg)} кг
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-mist">Инкотермс</dt>
              <dd>{lot.incoterm}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-mist">Упаковка</dt>
              <dd>{lot.packing}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-mist">Комментарий</dt>
              <dd>{lot.comment}</dd>
            </div>
          </dl>
          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl font-medium">Что входит в ставку «за всё»</h2>
            <ul className="mt-3 space-y-2 text-[14.5px] text-muted">
              {includedChecks.map((c) => (
                <li key={c.id}>— {c.label}</li>
              ))}
            </ul>
            <ul className="mt-4 space-y-1.5 text-[13.5px] text-mist">
              {excludedNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="h-fit space-y-3 rounded-2xl border border-line bg-white p-6">
          <p className="font-display text-2xl font-medium">Участвовать</p>
          {user?.role === 'forwarder' && isOpenLot(lot, now) ? (
            <BidBox lot={lot} />
          ) : (
            <>
              <p className="text-[14.5px] leading-relaxed text-muted">
                Ставка пишется в этот же лот. Заказчик увидит сумму без вашего имени.
              </p>
              <Link
                to={`/app/login?role=forwarder`}
                className="inline-flex rounded-full bg-navy px-4 py-2 text-[13.5px] font-semibold text-white"
              >
                Войти исполнителем
              </Link>
            </>
          )}
          {user?.role === 'forwarder' ? (
            <Link to={`/app/forwarder/lots/${lot.id}`} className="block text-[13px] underline underline-offset-4">
              Полная карточка в кабинете
            </Link>
          ) : null}
        </aside>
      </div>
    </main>
  )
}
