import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { smartBidHints } from '../content/lotHints'
import { ruInt } from '../data'
import { useNow } from '../hooks'
import { Pressable } from '../components/Motion'
import { ThemeIcon } from '../components/ThemeIcon'
import { commissionRub, holdForBidRub, lotStatus, REG_BALANCE_MIN, uniqueBidders, type AppLot } from './engine'
import { useSession } from './session'
import { inputClass } from './ui'

export function BidBox({ lot, compact }: { lot: AppLot; compact?: boolean }) {
  const { user, addBid } = useSession()
  const now = useNow(1000)
  const mine = lot.bids.filter((b) => b.userId === user?.id).sort((a, b) => b.at.localeCompare(a.at))
  const left = 5 - mine.length
  const last = mine[0]?.amount
  const step = lot.bidStepUsd && lot.bidStepUsd > 0 ? lot.bidStepUsd : 1
  const max = last !== undefined ? last - step : lot.maxBidUsd
  const [amount, setAmount] = useState(String(Math.min(max, lot.maxBidUsd)))
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const balance = user?.balance ?? 0
  const bidUsd = Number(amount)
  const needHold = useMemo(
    () => (Number.isFinite(bidUsd) && bidUsd > 0 ? holdForBidRub(bidUsd) : REG_BALANCE_MIN),
    [bidUsd],
  )
  const feePreview = useMemo(
    () => (Number.isFinite(bidUsd) && bidUsd > 0 ? commissionRub(bidUsd) : 0),
    [bidUsd],
  )
  const smart = Boolean(user?.subscribed || (user?.planId && user.planId !== 'fwd-free'))
  const hints = useMemo(
    () =>
      smart
        ? smartBidHints({
            bidUsd: Number.isFinite(bidUsd) ? bidUsd : 0,
            maxBidUsd: lot.maxBidUsd,
            lastBid: last,
            step,
            balance,
            needHold,
            feePreview,
            left,
            cbm: lot.cbm,
            kg: lot.kg,
            mode: lot.mode,
            country: lot.country,
            cargo: lot.cargo,
            playersOnLot: uniqueBidders(lot.bids),
            insurance: lot.insurance,
            customs: lot.customs,
            incoterm: lot.incoterm,
          })
        : [],
    [smart, bidUsd, lot, last, step, balance, needHold, feePreview, left],
  )
  const locked = !user || user.role !== 'forwarder' || balance < needHold
  const st = lotStatus(lot, now)
  const closed = st === 'held' || st === 'failed' || st === 'archived' || lot.isDraft

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setOk(null)
    const n = Number(amount)
    if (!Number.isFinite(n) || n <= 0) {
      setErr('Укажите ставку в USD')
      return
    }
    const fail = addBid(lot.id, n)
    if (fail) {
      setErr(fail)
      return
    }
    setErr(null)
    setOk(`Ставка ${ruInt.format(n)} $ сохранена. Видна заказчику без вашего имени.`)
  }

  if (!user || user.role !== 'forwarder') {
    return (
      <div className={`rounded-xl border border-line bg-fog/40 ${compact ? 'p-3' : 'p-4'}`}>
        <p className="text-[13px] text-muted">Чтобы ставить, войдите как исполнитель.</p>
        <Link to="/app/login?role=forwarder" className="mt-2 inline-block text-[13px] font-semibold underline">
          Вход исполнителя
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={`rounded-xl border border-line bg-fog/40 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold">
          Ставка в USD · шаг ${step} · до 5 попыток
        </p>
        <ThemeIcon id="hold" size={40} />
      </div>
      {locked ? (
        <p className="mt-2 text-[13px] text-danger">
          На счёте нужно от {ruInt.format(needHold)} ₽ (1% от этой ставки
          {feePreview ? `, ≈ ${ruInt.format(feePreview)} ₽` : ''}). Сейчас {ruInt.format(balance)} ₽.{' '}
          <Link to="/app/forwarder/balance" className="underline underline-offset-4">
            Пополнить
          </Link>
        </p>
      ) : (
        <p className="mt-2 text-[12px] text-mist">
          На счёте под эту ставку: {ruInt.format(needHold)} ₽ · если выиграете — комиссия 1% ≈ {ruInt.format(feePreview)} ₽
          (не более 5 000 ₽)
        </p>
      )}
      {closed ? <p className="mt-2 text-[13px] text-muted">Лот закрыт или это шаблон — ставить нельзя.</p> : null}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="min-w-[140px] flex-1">
          <span className="text-[11px] text-mist">Ваша ставка, $</span>
          <input
            className={`${inputClass} mt-1`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={left <= 0 || closed}
          />
        </label>
        <Pressable
          type="submit"
          disabled={locked || left <= 0 || closed}
          className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-navy-2 disabled:opacity-40"
        >
          Поставить
        </Pressable>
      </div>
      <p className="mt-2 font-mono text-[11px] text-mist">
        Осталось {left} из 5 · максимум {ruInt.format(lot.maxBidUsd)} ${' '}
        {last !== undefined ? `· ваша последняя ${ruInt.format(last)} $` : '· своей ставки ещё нет'}
      </p>
      {hints.length ? (
        <ul className="mt-3 space-y-1.5 border-t border-line/80 pt-3">
          {hints.map((h) => (
            <li key={h.id} className="text-[12px] leading-snug">
              <span
                className={`font-semibold ${h.tone === 'warn' ? 'text-danger' : h.tone === 'ok' ? 'text-ok' : 'text-ink'}`}
              >
                {h.title}.
              </span>{' '}
              <span className="text-muted">{h.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {err ? <p className="mt-2 text-[13px] text-danger">{err}</p> : null}
      {ok ? <p className="mt-2 text-[13px] text-ok">{ok}</p> : null}
    </form>
  )
}
