import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { articles, formatArticleDate } from '../content/articles'
import { fetchCbrRates, type CbrRate } from '../content/cbr'
import { moneyCopy } from '../content/money'
import { compareWin, matchBench } from '../content/marketBench'
import { ruInt } from '../data'
import { useNow } from '../hooks'
import { buildDirectorReportBody, lotWinUsd } from './directorReport'
import { lotStatus, uniqueBidders, type AppLot, type OrgRole } from './engine'
import { useSession } from './session'
import { Field, inputClass, Panel } from './ui'

function useDirectorBase() {
  const { pathname } = useLocation()
  return pathname.includes('/app/forwarder/') ? '/app/forwarder/director' : '/app/importer/director'
}

function orgLots(lots: AppLot[], ownerId: string | undefined, role: 'importer' | 'forwarder' | undefined) {
  if (role === 'forwarder') {
    return lots.filter((d) => !d.isDraft && d.bids.some((b) => b.userId === ownerId))
  }
  return lots.filter((d) => d.ownerId === ownerId && !d.isDraft)
}

export function DirectorLayout() {
  const base = useDirectorBase()
  const isFwd = base.includes('forwarder')
  const subNav = [
    { to: base, end: true, label: 'Сводка' },
    { to: `${base}/reports`, label: 'Отчёты' },
    { to: `${base}/activity`, label: 'Журнал' },
    { to: `${base}/team`, label: 'Команда' },
    { to: `${base}/articles`, label: 'Статьи' },
    { to: `${base}/rates`, label: 'Курсы ЦБ' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
          {isFwd ? 'Кабинет руководителя исполнителя' : 'Кабинет директора заказчика'}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Сводка, журнал действий и команда</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] text-muted">
          {isFwd
            ? 'Кто ставил, когда пополняли счёт, состав стола. Роли: owner / director / manager / employee.'
            : 'Кто публиковал лоты, смена тарифа, сотрудники. Роли: owner / director / manager / employee.'}{' '}
          {moneyCopy.freeReg}.
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
  const { user, lots, activity, team } = useSession()
  const now = useNow(2000)
  const base = useDirectorBase()
  const isFwd = user?.role === 'forwarder'
  const scoped = orgLots(lots, user?.id, user?.role)
  const held = isFwd
    ? scoped.filter((d) => lotStatus(d, now) === 'held')
    : heldLots(lots, user?.id, now)
  const failed = isFwd
    ? []
    : lots.filter((d) => d.ownerId === user?.id && !d.isDraft && lotStatus(d, now) === 'failed')
  const wins = held.map((l) => lotWinUsd(l)).filter((x): x is number => x !== undefined)
  const avgWin = wins.length ? Math.round(wins.reduce((a, b) => a + b, 0) / wins.length) : 0
  const belowMid = held.filter((l) => {
    const w = lotWinUsd(l)
    if (w === undefined) return false
    const b = matchBench({ country: l.country, cargo: l.cargo, mode: l.mode, cbm: l.cbm })
    return b ? compareWin(w, b).vsMidPct > 0 : false
  }).length
  const myTeam = team.filter((t) => t.orgUserId === user?.id && t.active)
  const recent = activity.filter((a) => a.orgUserId === user?.id).slice(0, 5)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={isFwd ? 'Участия (held)' : 'Состоялось'} value={String(held.length)} hint={isFwd ? 'лоты с вашей ставкой' : 'часов с ≥2 игроками'} />
        <Stat label={isFwd ? 'Команда' : 'Не состоялось'} value={isFwd ? String(myTeam.length) : String(failed.length)} hint={isFwd ? 'активных сотрудников' : 'плотность / пустые слоты'} />
        <Stat label="Средняя победа" value={avgWin ? `${ruInt.format(avgWin)} $` : '—'} hint="по часам" />
        <Stat label="Ниже рынка" value={String(belowMid)} hint="побед ниже середины полосы" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Последние действия">
          {recent.length === 0 ? (
            <p className="text-[13.5px] text-muted">Пока пусто.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((a) => (
                <li key={a.id} className="rounded-lg border border-line/70 bg-fog/40 px-3 py-2 text-[13px]">
                  <span className="font-semibold text-ink">{a.action}</span>
                  <span className="text-muted"> · {a.actorName}</span>
                  <p className="mt-0.5 text-[12px] text-mist">{a.detail}</p>
                  <p className="font-mono text-[10px] text-mist">{new Date(a.at).toLocaleString('ru-RU')}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to={`${base}/activity`} className="mt-3 inline-block text-[13px] font-semibold text-brand underline">
            Весь журнал
          </Link>
        </Panel>
        <Panel title="Команда">
          <ul className="space-y-1.5 text-[13px]">
            {myTeam.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 border-b border-line/60 py-1.5">
                <span>
                  <span className="font-medium">{m.name}</span>
                  <span className="ml-2 font-mono text-[11px] text-mist">{m.orgRole}</span>
                </span>
                <span className="text-[12px] text-muted">{m.email}</span>
              </li>
            ))}
          </ul>
          <Link to={`${base}/team`} className="mt-3 inline-block text-[13px] font-semibold text-brand underline">
            Настройки сотрудников
          </Link>
        </Panel>
      </div>

      {!isFwd ? (
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
      ) : (
        <Panel title="Участия стола">
          {held.length === 0 ? (
            <p className="text-[13.5px] text-muted">Пока нет состоявшихся часов с вашими ставками.</p>
          ) : (
            <ul className="space-y-2 text-[13px]">
              {held.slice(0, 8).map((lot) => {
                const mine = lot.bids.filter((b) => b.userId === user?.id).sort((a, b) => a.amount - b.amount)[0]
                return (
                  <li key={lot.id} className="flex justify-between gap-3 border-b border-line/60 py-2">
                    <Link to={`/app/forwarder/lots/${lot.id}`} className="font-semibold text-brand underline">
                      {lot.code}
                    </Link>
                    <span className="text-muted">
                      {lot.from} → {lot.to}
                    </span>
                    <span className="tabular-nums font-medium">{mine ? `${ruInt.format(mine.amount)} $` : '—'}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      )}

      <Panel title="Почта директора">
        <p className="text-[13.5px] text-muted">
          {user?.directorEmail || user?.directorPrefs?.email
            ? `Письма: ${user.directorPrefs?.email || user.directorEmail}`
            : 'Почта не задана — настройте в разделе «Отчёты».'}{' '}
          <Link to={`${base}/reports`} className="font-semibold text-brand underline">
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
  const base = useDirectorBase()
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] text-muted">Подраздел «Статьи» — короткие материалы для собственника и закупки.</p>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link to={`${base}/articles/${a.slug}`} className="block px-4 py-3 hover:bg-fog/50">
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
  const base = useDirectorBase()
  const { slug } = useParams()
  const one = articles.find((a) => a.slug === slug)
  if (!one) {
    return (
      <p className="text-[13.5px] text-muted">
        Статья не найдена.{' '}
        <Link to={`${base}/articles`} className="text-brand underline">
          К списку
        </Link>
      </p>
    )
  }
  return (
    <article className="space-y-4">
      <Link to={`${base}/articles`} className="text-[13px] text-brand hover:underline">
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

const roleLabel: Record<OrgRole, string> = {
  owner: 'Owner',
  director: 'Директор',
  manager: 'Руководитель',
  employee: 'Сотрудник',
}

export function DirectorActivity() {
  const { user, activity } = useSession()
  const rows = activity.filter((a) => a.orgUserId === user?.id)

  return (
    <Panel title="Журнал действий">
      <p className="mb-3 text-[13px] text-muted">
        Кто что когда сделал в кабинете компании: лоты, ставки, тариф, команда, отчёты. Директор видит полную ленту.
      </p>
      {rows.length === 0 ? (
        <p className="text-[13.5px] text-muted">Пока нет записей.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-mist">
                <th className="py-2 pr-2 font-medium">Когда</th>
                <th className="py-2 pr-2 font-medium">Кто</th>
                <th className="py-2 pr-2 font-medium">Действие</th>
                <th className="py-2 font-medium">Детали</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-line/70 align-top">
                  <td className="py-2 pr-2 font-mono text-[11px] text-mist whitespace-nowrap">
                    {new Date(a.at).toLocaleString('ru-RU')}
                  </td>
                  <td className="py-2 pr-2 font-medium">{a.actorName}</td>
                  <td className="py-2 pr-2">{a.action}</td>
                  <td className="py-2 text-muted">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

export function DirectorTeam() {
  const { user, team, addTeamMember, removeTeamMember, setTeamMemberActive } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [orgRole, setOrgRole] = useState<OrgRole>('employee')
  const [err, setErr] = useState<string | null>(null)
  const rows = team.filter((t) => t.orgUserId === user?.id)
  const canEdit = user?.orgRole !== 'employee'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = addTeamMember({ name, email, orgRole })
    if (msg) {
      setErr(msg)
      return
    }
    setErr(null)
    setName('')
    setEmail('')
    setOrgRole('employee')
  }

  return (
    <div className="space-y-5">
      <Panel title="Ролевая модель">
        <ul className="grid gap-2 text-[13px] text-muted sm:grid-cols-2">
          <li>
            <span className="font-semibold text-ink">Owner</span> — полный доступ, нельзя удалить.
          </li>
          <li>
            <span className="font-semibold text-ink">Директор</span> — сводка, журнал, отчёты, команда.
          </li>
          <li>
            <span className="font-semibold text-ink">Руководитель</span> — операционка и журнал без удаления owner.
          </li>
          <li>
            <span className="font-semibold text-ink">Сотрудник</span> — рабочий кабинет, без настроек команды.
          </li>
        </ul>
      </Panel>

      <Panel title="Сотрудники">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-mist">
                <th className="py-2 pr-2 font-medium">Имя</th>
                <th className="py-2 pr-2 font-medium">E-mail</th>
                <th className="py-2 pr-2 font-medium">Роль</th>
                <th className="py-2 pr-2 font-medium">Статус</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-b border-line/70">
                  <td className="py-2 pr-2 font-medium">{m.name}</td>
                  <td className="py-2 pr-2 text-muted">{m.email}</td>
                  <td className="py-2 pr-2 font-mono text-[12px]">{roleLabel[m.orgRole]}</td>
                  <td className="py-2 pr-2">{m.active ? 'активен' : 'выкл'}</td>
                  <td className="py-2 text-right">
                    {canEdit && m.orgRole !== 'owner' ? (
                      <span className="inline-flex gap-2">
                        <button
                          type="button"
                          className="text-[12px] underline"
                          onClick={() => setTeamMemberActive(m.id, !m.active)}
                        >
                          {m.active ? 'откл.' : 'вкл.'}
                        </button>
                        <button type="button" className="text-[12px] text-danger underline" onClick={() => removeTeamMember(m.id)}>
                          удалить
                        </button>
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {canEdit ? (
        <Panel title="Добавить сотрудника">
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <Field label="ФИО">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="E-mail">
              <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Роль">
              <select className={inputClass} value={orgRole} onChange={(e) => setOrgRole(e.target.value as OrgRole)}>
                <option value="director">Директор</option>
                <option value="manager">Руководитель</option>
                <option value="employee">Сотрудник</option>
              </select>
            </Field>
            <div className="flex items-end">
              <button type="submit" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
                Добавить
              </button>
            </div>
            {err ? <p className="sm:col-span-2 text-[13px] text-danger">{err}</p> : null}
          </form>
        </Panel>
      ) : (
        <p className="text-[13px] text-muted">У роли employee нет права менять команду.</p>
      )}
    </div>
  )
}