import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { articles, formatArticleDate } from '../content/articles'
import { fetchCbrRates, type CbrRate } from '../content/cbr'
import { moneyCopy } from '../content/money'
import { compareWin, matchBench } from '../content/marketBench'
import { ruInt } from '../data'
import { useNow } from '../hooks'
import { buildDirectorReportBody, lotWinUsd } from './directorReport'
import { lotStatus, uniqueBidders, type AppLot } from './engine'
import { useSession } from './session'
import { Field, inputClass, Panel } from './ui'

const subNav = [
  { to: '/app/importer/director', end: true, label: 'Сводка' },
  { to: '/app/importer/director/reports', label: 'Отчёты' },
  { to: '/app/importer/director/articles', label: 'Статьи' },
  { to: '/app/importer/director/rates', label: 'Курсы ЦБ' },
]

export function DirectorLayout() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">Кабинет директора</p>
        <h1 className="mt-1 text-2xl font-semibold">Сводная аналитика и отчёты</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] text-muted">
          Общая картина по состоявшимся часам, сравнение с типичными ставками, автоотправка писем. {moneyCopy.freeReg}.
        </p>
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-line pb-px">
        {subNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-t-lg px-3 py-2 text-[13px] font-medium ${isActive ? 'bg-white text-brand shadow-[inset_0_-2px_0_0_var(--color-brand)]' : 'text-muted hover:text-ink'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}

function heldLots(lots: AppLot[], ownerId: string | undefined, now: number) {
  return lots.filter((d) => d.ownerId === ownerId && !d.isDraft && lotStatus(d, now) === 'held')
}

export function DirectorDashboard() {
  const { user, lots } = useSession()
  const now = useNow(2000)
  const held = heldLots(lots, user?.id, now)
  const failed = lots.filter((d) => d.ownerId === user?.id && !d.isDraft && lotStatus(d, now) === 'failed')
  const wins = held.map((l) => lotWinUsd(l)).filter((x): x is number => x !== undefined)
  const avgWin = wins.length ? Math.round(wins.reduce((a, b) => a + b, 0) / wins.length) : 0
  const belowMid = held.filter((l) => {
    const w = lotWinUsd(l)
    if (w === undefined) return false
    const b = matchBench({ country: l.country, cargo: l.cargo, mode: l.mode, cbm: l.cbm })
    return b ? compareWin(w, b).vsMidPct > 0 : false
  }).length

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Состоялось" value={String(held.length)} hint="часов с ≥2 игроками" />
        <Stat label="Не состоялось" value={String(failed.length)} hint="плотность / пустые слоты" />
        <Stat label="Средняя победа" value={avgWin ? `${ruInt.format(avgWin)} $` : '—'} hint="по вашим часам" />
        <Stat label="Ниже рынка" value={String(belowMid)} hint="побед ниже середины полосы" />
      </div>

      <Panel title="Сравнение с типичными аукционами">
        <p className="mb-3 text-[13px] text-muted">
          Для каждого состоявшегося часа — полоса «как обычно играют» похожие лоты (коридор, груз, м³) и ваша победа.
        </p>
        {held.length === 0 ? (
          <p className="text-[13.5px] text-muted">Пока нет состоявшихся часов.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-mist">
                  <th className="py-2 pr-2 font-medium">Лот</th>
                  <th className="py-2 pr-2 font-medium">Условия</th>
                  <th className="py-2 pr-2 font-medium">Победа</th>
                  <th className="py-2 pr-2 font-medium">Обычно</th>
                  <th className="py-2 font-medium">vs середина</th>
                </tr>
              </thead>
              <tbody>
                {held.map((lot) => {
                  const win = lotWinUsd(lot) ?? 0
                  const bench = matchBench({
                    country: lot.country,
                    cargo: lot.cargo,
                    mode: lot.mode,
                    cbm: lot.cbm,
                  })
                  const cmp = bench ? compareWin(win, bench) : null
                  return (
                    <tr key={lot.id} className="border-b border-line/70 align-top">
                      <td className="py-2.5 pr-2">
                        <Link to={`/app/importer/lots/${lot.id}`} className="font-semibold text-brand hover:underline">
                          {lot.code}
                        </Link>
                        <span className="mt-0.5 block text-[12px] text-mist">
                          {lot.from} → {lot.to} · {uniqueBidders(lot.bids)} игр.
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-muted">
                        {lot.cargo}, {lot.cbm} м³, {lot.mode}
                        <span className="mt-0.5 block text-[12px]">
                          {lot.incoterm || '—'} · страх. {lot.insurance ? 'да' : 'нет'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 font-semibold tabular-nums">{ruInt.format(win)} $</td>
                      <td className="py-2.5 pr-2 tabular-nums text-muted">
                        {cmp ? `${ruInt.format(cmp.low)}–${ruInt.format(cmp.high)} $` : '—'}
                        {bench ? <span className="mt-0.5 block text-[11px] text-mist">{bench.note}</span> : null}
                      </td>
                      <td className="py-2.5">
                        {cmp ? (
                          <span className={cmp.vsMidPct >= 0 ? 'font-medium text-ok' : 'font-medium text-danger'}>
                            {cmp.vsMidPct >= 0 ? `−${cmp.vsMidPct}%` : `+${Math.abs(cmp.vsMidPct)}%`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Почта директора">
        <p className="text-[13.5px] text-muted">
          {user?.directorEmail || user?.directorPrefs?.email
            ? `Письма: ${user.directorPrefs?.email || user.directorEmail}`
            : 'Почта не задана — настройте в разделе «Отчёты».'}{' '}
          <Link to="/app/importer/director/reports" className="font-semibold text-brand underline">
            Автоотправка
          </Link>
        </p>
      </Panel>
    </div>
  )
}

export function DirectorReports() {
  const { user, lots, setDirectorPrefs, sendDirectorReport, directorReports } = useSession()
  const now = useNow(2000)
  const held = heldLots(lots, user?.id, now)
  const prefs = user?.directorPrefs
  const [email, setEmail] = useState(prefs?.email || user?.directorEmail || '')
  const [enabled, setEnabled] = useState(prefs?.enabled ?? false)
  const [cadence, setCadence] = useState(prefs?.cadence ?? 'each')
  const [includeMarket, setIncludeMarket] = useState(prefs?.includeMarket ?? true)
  const [includeConditions, setIncludeConditions] = useState(prefs?.includeConditions ?? true)
  const [flash, setFlash] = useState<string | null>(null)
  const mineReports = directorReports.filter((r) => r.ownerId === user?.id)

  const preview = useMemo(
    () =>
      buildDirectorReportBody(held.slice(0, 5), {
        company: user?.company ?? 'Компания',
        includeMarket,
        includeConditions,
      }),
    [held, user?.company, includeMarket, includeConditions],
  )

  return (
    <div className="space-y-5">
      <Panel title="Автоматическая отправка">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setDirectorPrefs({
              email: email.trim().toLowerCase(),
              enabled,
              cadence,
              includeMarket,
              includeConditions,
            })
            setFlash('Настройки сохранены')
          }}
        >
          <Field label="E-mail директора">
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <label className="flex items-center gap-2 text-[13.5px]">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Включить автоотправку
          </label>
          <Field label="Когда слать">
            <select
              className={inputClass}
              value={cadence}
              onChange={(e) => setCadence(e.target.value as 'each' | 'weekly' | 'manual')}
            >
              <option value="each">После каждого состоявшегося часа</option>
              <option value="weekly">Раз в неделю (сводка)</option>
              <option value="manual">Только вручную</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-[13.5px]">
            <input type="checkbox" checked={includeConditions} onChange={(e) => setIncludeConditions(e.target.checked)} />
            Условия лота (Incoterm, страховка, состав ставки)
          </label>
          <label className="flex items-center gap-2 text-[13.5px]">
            <input type="checkbox" checked={includeMarket} onChange={(e) => setIncludeMarket(e.target.checked)} />
            Сравнение с типичными ставками похожих аукционов
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-navy-2">
              Сохранить
            </button>
            <button
              type="button"
              className="rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-semibold hover:bg-fog"
              onClick={() => {
                const msg = sendDirectorReport(held.map((l) => l.id), { openMail: true })
                setFlash(msg)
              }}
            >
              Отправить сейчас
            </button>
          </div>
          {flash ? <p className="text-[13px] text-ok">{flash}</p> : null}
          <p className="text-[12.5px] text-mist">
            «Отправить сейчас» открывает почтовый клиент (mailto) с телом отчёта и сохраняет копию в журнал ниже.
          </p>
        </form>
      </Panel>

      <Panel title="Превью письма">
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-fog/60 p-3 text-[12px] leading-relaxed text-ink">
          {preview}
        </pre>
      </Panel>

      <Panel title="Журнал отправленных">
        {mineReports.length === 0 ? (
          <p className="text-[13.5px] text-muted">Пока пусто — нажмите «Отправить сейчас» или дождитесь автоотправки после часа.</p>
        ) : (
          <ul className="space-y-3">
            {mineReports.map((r) => (
              <li key={r.id} className="rounded-lg border border-line p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold">{r.subject}</p>
                  <p className="font-mono text-[11px] text-mist">{new Date(r.at).toLocaleString('ru-RU')}</p>
                </div>
                <p className="mt-1 text-[12.5px] text-muted">
                  → {r.to} · {r.channel} · лотов: {r.lotIds.length}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-[12.5px] text-brand">Текст</summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11.5px] text-ink">{r.body}</pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

export function DirectorArticles() {
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] text-muted">Подраздел «Статьи» — короткие материалы для собственника и закупки.</p>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link to={`/app/importer/director/articles/${a.slug}`} className="block px-4 py-3 hover:bg-fog/50">
              <p className="text-[14px] font-semibold text-ink">{a.title}</p>
              <p className="mt-0.5 text-[13px] text-muted">{a.dek}</p>
              <p className="mt-1 font-mono text-[10px] text-mist">
                {formatArticleDate(a.published)} · {a.category} · {a.tags.join(' · ')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DirectorArticle() {
  const { slug } = useParams()
  const one = articles.find((a) => a.slug === slug)
  if (!one) {
    return (
      <p className="text-[13.5px] text-muted">
        Статья не найдена.{' '}
        <Link to="/app/importer/director/articles" className="text-brand underline">
          К списку
        </Link>
      </p>
    )
  }
  return (
    <article className="space-y-4">
      <Link to="/app/importer/director/articles" className="text-[13px] text-brand hover:underline">
        ← Все статьи
      </Link>
      <div>
        <p className="font-mono text-[10px] text-mist">
          {formatArticleDate(one.published)} · {one.category} · {one.readMinutes} мин
        </p>
        <h2 className="mt-1 text-xl font-semibold">{one.title}</h2>
        <p className="mt-1 text-[14px] text-muted">{one.dek}</p>
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-ink">
        {one.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </article>
  )
}

export function DirectorRates() {
  const [date, setDate] = useState('')
  const [rates, setRates] = useState<CbrRate[]>([])
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const r = await fetchCbrRates()
      if (cancelled) return
      setDate(r.date)
      setRates(r.rates)
      setLive(r.live)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4">
      <Panel title="Курсы Банка России">
        <p className="mb-3 text-[13px] text-muted">
          Ставки на wIaF в долларах, комиссия в рублях ({moneyCopy.commissionShort}). Курс — справочник, не курс сделки.
        </p>
        {loading ? (
          <p className="text-[13px] text-mist">Загрузка…</p>
        ) : (
          <>
            <p className="mb-2 font-mono text-[11px] text-mist">
              Дата: {date} · {live ? 'живой XML cbr.ru' : 'снимок макета (CORS/сеть)'}
            </p>
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-line text-mist">
                  <th className="py-2 font-medium">Код</th>
                  <th className="py-2 font-medium">Валюта</th>
                  <th className="py-2 font-medium">Номинал</th>
                  <th className="py-2 font-medium">₽</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.code} className="border-b border-line/70">
                    <td className="py-2 font-mono font-semibold">{r.code}</td>
                    <td className="py-2 text-muted">{r.name}</td>
                    <td className="py-2 tabular-nums">{r.nominal}</td>
                    <td className="py-2 font-semibold tabular-nums">{r.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Panel>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-[11px] uppercase tracking-wide text-mist">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-[12px] text-muted">{hint}</p>
    </div>
  )
}