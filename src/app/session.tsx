import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { buildDirectorReportBody } from './directorReport'
import {
  bestBid,
  commissionRub,
  holdForBidRub,
  lotStatus,
  parseSlot,
  REG_BALANCE_MIN,
  TOPUP_MIN,
  winnerId,
  type AppLot,
  type DirectorPrefs,
  type DirectorReport,
  type Ledger,
  type PlanId,
  type Role,
  type Ticket,
  type User,
} from './engine'
import { seedLedger, seedLots, seedTickets, seedUsers } from './seedStore'

export type { AppLot, Role, Ticket, User }
export type Draft = AppLot

type Store = {
  sessionUserId: string | null
  users: User[]
  lots: AppLot[]
  tickets: Ticket[]
  ledger: Ledger[]
  directorReports: DirectorReport[]
}

const KEY = 'wiaf-local-v10'

function defaultPlan(role: Role, subscribed: boolean): PlanId {
  if (role === 'importer') return subscribed ? 'imp-zakupka' : 'imp-free'
  return subscribed ? 'fwd-stol' : 'fwd-free'
}

function migrateUser(u: User): User {
  const planId = u.planId ?? defaultPlan(u.role, u.subscribed)
  const subscribed = planId !== 'imp-free' && planId !== 'fwd-free'
  return {
    ...u,
    planId,
    subscribed,
    directorPrefs: u.directorPrefs ?? {
      email: u.directorEmail ?? '',
      enabled: false,
      cadence: 'manual',
      includeMarket: true,
      includeConditions: true,
    },
  }
}

const empty: Store = {
  sessionUserId: null,
  users: seedUsers,
  lots: seedLots(),
  tickets: seedTickets,
  ledger: seedLedger,
  directorReports: [],
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(empty)
    const parsed = JSON.parse(raw) as Partial<Store>
    return {
      sessionUserId: parsed.sessionUserId ?? null,
      users: (parsed.users?.length ? parsed.users : seedUsers).map(migrateUser),
      lots: parsed.lots?.length ? parsed.lots : seedLots(),
      tickets: parsed.tickets ?? [],
      ledger: parsed.ledger ?? [],
      directorReports: parsed.directorReports ?? [],
    }
  } catch {
    return structuredClone(empty)
  }
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

function pushDirectorMail(
  s: Store,
  owner: User,
  lotIds: string[],
  openMail: boolean,
): { store: Store; message: string } {
  const prefs = owner.directorPrefs
  const to = (prefs?.email || owner.directorEmail || '').trim().toLowerCase()
  if (!to) return { store: s, message: 'Укажите e-mail директора' }
  const lots = s.lots.filter((l) => lotIds.includes(l.id))
  if (!lots.length) return { store: s, message: 'Нет лотов для отчёта' }
  const subject = `wIaF · отчёт по ${lots.length} час(ам) · ${owner.company}`
  const body = buildDirectorReportBody(lots, {
    company: owner.company,
    includeMarket: prefs?.includeMarket ?? true,
    includeConditions: prefs?.includeConditions ?? true,
  })
  const report: DirectorReport = {
    id: crypto.randomUUID(),
    ownerId: owner.id,
    to,
    subject,
    body,
    at: new Date().toISOString(),
    lotIds,
    channel: openMail ? 'mailto' : 'inbox',
  }
  if (openMail && typeof window !== 'undefined') {
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  return {
    store: { ...s, directorReports: [report, ...s.directorReports] },
    message: openMail ? `Отчёт открыт в почте → ${to}` : `Отчёт сохранён → ${to}`,
  }
}

function settle(s: Store): Store {
  const users = s.users.map((u) => ({ ...u }))
  const lots = s.lots.map((l) => ({ ...l, bids: [...l.bids] }))
  const ledger = [...s.ledger]
  let directorReports = [...s.directorReports]
  const autoLotByOwner = new Map<string, string[]>()

  for (const lot of lots) {
    if (lot.settled) continue
    if (lotStatus(lot) !== 'held') continue
    const winUser = winnerId(lot.bids)
    const winUsd = bestBid(lot.bids)
    if (!winUser || winUsd === undefined) continue
    const fee = commissionRub(winUsd)
    const u = users.find((x) => x.id === winUser)
    if (u) {
      u.balance = Math.max(0, u.balance - fee)
      ledger.unshift({
        id: crypto.randomUUID(),
        userId: u.id,
        amount: -fee,
        at: new Date().toISOString(),
        note: `Комиссия 1% (≤5 000 ₽) по ${lot.code}`,
      })
    }
    lot.settled = true
    const owner = users.find((x) => x.id === lot.ownerId)
    if (owner?.directorPrefs?.enabled && owner.directorPrefs.cadence === 'each') {
      const list = autoLotByOwner.get(owner.id) ?? []
      list.push(lot.id)
      autoLotByOwner.set(owner.id, list)
    }
  }

  let next: Store = { ...s, users, lots, ledger, directorReports }
  for (const [ownerId, lotIds] of autoLotByOwner) {
    const owner = users.find((x) => x.id === ownerId)
    if (!owner) continue
    const r = pushDirectorMail(next, owner, lotIds, false)
    next = r.store
    directorReports = next.directorReports
  }
  return next
}

type RegisterInput = {
  inn: string
  password: string
  company: string
  email: string
  phone: string
  role: Role
  entity: 'ooo' | 'ip'
  responsible: string
  checko?: User['checko']
}

type Ctx = Store & {
  user: User | null
  login: (inn: string, password: string) => string | null
  logout: () => void
  register: (input: RegisterInput) => string | null
  saveLot: (lot: AppLot) => void
  removeLot: (id: string) => string | null
  startNow: (id: string) => void
  finishNow: (id: string) => void
  archiveLot: (id: string) => void
  newSlot: (id: string, date: string, time: string) => string | null
  addBid: (lotId: string, amount: number) => string | null
  topup: (amount: number) => string | null
  setSubscribed: (v: boolean) => void
  setPlan: (planId: PlanId) => void
  setDirectorEmail: (email: string) => void
  setDirectorPrefs: (prefs: DirectorPrefs) => void
  sendDirectorReport: (lotIds: string[], opts?: { openMail?: boolean }) => string
  addTicket: (t: Omit<Ticket, 'id' | 'at'>) => void
  resetDemo: () => void
}

const SessionCtx = createContext<Ctx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => (typeof window === 'undefined' ? structuredClone(empty) : read()))

  const patch = (fn: (s: Store) => Store) => {
    setStore((prev) => {
      const next = settle(fn(prev))
      write(next)
      return next
    })
  }

  const user = store.users.find((u) => u.id === store.sessionUserId) ?? null

  const value = useMemo<Ctx>(
    () => ({
      ...store,
      user,
      login: (inn, password) => {
        const found = store.users.find((u) => u.inn === inn.replace(/\s/g, '') && u.password === password)
        if (!found) return 'Неверный ИНН или пароль'
        patch((s) => ({ ...s, sessionUserId: found.id }))
        return null
      },
      logout: () => patch((s) => ({ ...s, sessionUserId: null })),
      register: (input) => {
        const inn = input.inn.replace(/\s/g, '')
        if (inn.length < 10) return 'ИНН: 10 или 12 цифр'
        if (input.password.length < 4) return 'Пароль минимум 4 символа'
        if (store.users.some((u) => u.inn === inn && u.role === input.role)) {
          return 'Этот ИНН уже зарегистрирован в этой роли'
        }
        const id = crypto.randomUUID()
        const planId = defaultPlan(input.role, false)
        patch((s) => ({
          ...s,
          sessionUserId: id,
          users: [
            migrateUser({
              id,
              inn,
              password: input.password,
              company: input.company,
              email: input.email,
              phone: input.phone,
              role: input.role,
              entity: input.entity,
              balance: 0,
              subscribed: false,
              planId,
              responsible: input.responsible,
              directorEmail: undefined,
              checko: input.checko,
            }),
            ...s.users,
          ],
        }))
        return null
      },
      saveLot: (lot) =>
        patch((s) => ({
          ...s,
          lots: s.lots.some((l) => l.id === lot.id) ? s.lots.map((l) => (l.id === lot.id ? lot : l)) : [lot, ...s.lots],
        })),
      removeLot: (id) => {
        const lot = store.lots.find((l) => l.id === id)
        if (!lot) return 'Лот не найден'
        if (!lot.isDraft) return 'Удалить можно только шаблон'
        patch((s) => ({ ...s, lots: s.lots.filter((l) => l.id !== id) }))
        return null
      },
      startNow: (id) =>
        patch((s) => ({
          ...s,
          lots: s.lots.map((l) => {
            if (l.id !== id) return l
            const start = new Date()
            const end = new Date(start.getTime() + 60 * 60 * 1000)
            return {
              ...l,
              isDraft: false,
              archived: false,
              closedAt: undefined,
              startIso: start.toISOString(),
              endIso: end.toISOString(),
            }
          }),
        })),
      finishNow: (id) =>
        patch((s) => ({
          ...s,
          lots: s.lots.map((l) => (l.id === id ? { ...l, closedAt: new Date().toISOString() } : l)),
        })),
      archiveLot: (id) =>
        patch((s) => ({
          ...s,
          lots: s.lots.map((l) => (l.id === id ? { ...l, archived: true } : l)),
        })),
      newSlot: (id, date, time) => {
        const slot = parseSlot(date, time)
        if (!slot) return 'Дата слота — дд.мм.гггг и час чч:мм'
        patch((s) => ({
          ...s,
          lots: s.lots.map((l) =>
            l.id === id
              ? {
                  ...l,
                  isDraft: false,
                  archived: false,
                  settled: false,
                  closedAt: undefined,
                  startIso: slot.startIso,
                  endIso: slot.endIso,
                  bids: [],
                }
              : l,
          ),
        }))
        return null
      },
      addBid: (lotId, amount) => {
        if (!user || user.role !== 'forwarder') return 'Нужен вход исполнителя'
        if (user.balance < REG_BALANCE_MIN) {
          return `Сначала положите на счёт от ${REG_BALANCE_MIN.toLocaleString('ru-RU')} ₽ (активация)`
        }
        const need = holdForBidRub(amount)
        if (user.balance < need) {
          return `На счёте нужно ≥ ${need.toLocaleString('ru-RU')} ₽ (холд 1%, ≤5 000). Сейчас ${user.balance.toLocaleString('ru-RU')} ₽`
        }
        const lot = store.lots.find((l) => l.id === lotId)
        if (!lot || lot.isDraft || lot.archived) return 'Лот недоступен'
        const st = lotStatus(lot)
        if (st === 'held' || st === 'failed' || st === 'archived') return 'Слот уже закрыт'
        if (lot.ownerId === user.id) return 'Нельзя ставить на свой лот'
        const mine = lot.bids.filter((b) => b.userId === user.id)
        if (mine.length >= 5) return 'Уже 5 ставок по этому лоту'
        const last = [...mine].sort((a, b) => b.at.localeCompare(a.at))[0]?.amount
        if (last !== undefined && amount >= last) return 'Новая ставка должна быть ниже предыдущей (шаг $1)'
        if (amount > lot.maxBidUsd) return `Не выше максимума ${lot.maxBidUsd} $`
        if (amount <= 0) return 'Укажите ставку в USD'
        const step = lot.bidStepUsd && lot.bidStepUsd > 0 ? lot.bidStepUsd : 1
        if (last !== undefined && last - amount < step) {
          return `Шаг снижения минимум ${step} $`
        }
        patch((s) => ({
          ...s,
          lots: s.lots.map((l) =>
            l.id === lotId
              ? { ...l, bids: [{ userId: user.id, amount, at: new Date().toISOString() }, ...l.bids] }
              : l,
          ),
        }))
        return null
      },
      topup: (amount) => {
        if (!user || user.role !== 'forwarder') return 'Нужен вход исполнителя'
        if (amount < TOPUP_MIN) return `Минимум пополнения ${TOPUP_MIN.toLocaleString('ru-RU')} ₽`
        patch((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === user.id ? { ...u, balance: u.balance + amount } : u)),
          ledger: [
            {
              id: crypto.randomUUID(),
              userId: user.id,
              amount,
              at: new Date().toISOString(),
              note: `Счёт №${Math.floor(10000 + Math.random() * 89999)}`,
            },
            ...s.ledger,
          ],
        }))
        return null
      },
      setSubscribed: (v) => {
        if (!user) return
        const planId = defaultPlan(user.role, v)
        patch((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === user.id ? { ...u, subscribed: v, planId } : u)),
        }))
      },
      setPlan: (planId) => {
        if (!user) return
        const subscribed = planId !== 'imp-free' && planId !== 'fwd-free'
        patch((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === user.id ? { ...u, planId, subscribed } : u)),
        }))
      },
      setDirectorEmail: (email) => {
        if (!user) return
        const e = email.trim().toLowerCase() || undefined
        patch((s) => ({
          ...s,
          users: s.users.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  directorEmail: e,
                  directorPrefs: { ...(u.directorPrefs ?? migrateUser(u).directorPrefs!), email: e ?? '' },
                }
              : u,
          ),
        }))
      },
      setDirectorPrefs: (prefs) => {
        if (!user) return
        patch((s) => ({
          ...s,
          users: s.users.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  directorEmail: prefs.email || u.directorEmail,
                  directorPrefs: prefs,
                }
              : u,
          ),
        }))
      },
      sendDirectorReport: (lotIds, opts) => {
        if (!user) return 'Нужен вход'
        let message = 'Ошибка'
        patch((s) => {
          const owner = s.users.find((u) => u.id === user.id)
          if (!owner) return s
          const r = pushDirectorMail(s, owner, lotIds, opts?.openMail ?? true)
          message = r.message
          return r.store
        })
        return message
      },
      addTicket: (t) =>
        patch((s) => ({
          ...s,
          tickets: [
            {
              ...t,
              id: crypto.randomUUID(),
              at: new Date().toISOString(),
              reply: 'Принято. Ответ в этом кабинете, не на почту сервера — бэка нет.',
            },
            ...s.tickets,
          ],
        })),
      resetDemo: () => patch(() => ({ ...structuredClone(empty), sessionUserId: store.sessionUserId })),
    }),
    [store, user],
  )

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>
}

export function useSession() {
  const ctx = useContext(SessionCtx)
  if (!ctx) throw new Error('useSession')
  return ctx
}

export function useUserBalance() {
  const { user } = useSession()
  return user?.balance ?? 0
}
