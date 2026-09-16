import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
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
  type Ledger,
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
}

const KEY = 'wiaf-local-v8'

const empty: Store = {
  sessionUserId: null,
  users: seedUsers,
  lots: seedLots(),
  tickets: seedTickets,
  ledger: seedLedger,
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(empty)
    const parsed = JSON.parse(raw) as Store
    return {
      sessionUserId: parsed.sessionUserId ?? null,
      users: parsed.users?.length ? parsed.users : seedUsers,
      lots: parsed.lots?.length ? parsed.lots : seedLots(),
      tickets: parsed.tickets ?? [],
      ledger: parsed.ledger ?? [],
    }
  } catch {
    return structuredClone(empty)
  }
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

function settle(s: Store): Store {
  const users = s.users.map((u) => ({ ...u }))
  const lots = s.lots.map((l) => ({ ...l, bids: [...l.bids] }))
  const ledger = [...s.ledger]
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
        note: `Комиссия 1% по ${lot.code}`,
      })
    }
    lot.settled = true
  }
  return { ...s, users, lots, ledger }
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
  setDirectorEmail: (email: string) => void
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
        patch((s) => ({
          ...s,
          sessionUserId: id,
          users: [
            {
              id,
              inn,
              password: input.password,
              company: input.company,
              email: input.email,
              phone: input.phone,
              role: input.role,
              entity: input.entity,
              balance: input.role === 'forwarder' ? 0 : 0,
              subscribed: false,
              responsible: input.responsible,
              directorEmail: undefined,
              checko: input.checko,
            },
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
            return { ...l, isDraft: false, archived: false, closedAt: undefined, startIso: start.toISOString(), endIso: end.toISOString() }
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
              ? { ...l, isDraft: false, archived: false, settled: false, closedAt: undefined, startIso: slot.startIso, endIso: slot.endIso, bids: [] }
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
          return `На счёте нужно ≥ ${need.toLocaleString('ru-RU')} ₽ (1% от этой ставки). Сейчас ${user.balance.toLocaleString('ru-RU')} ₽`
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
            { id: crypto.randomUUID(), userId: user.id, amount, at: new Date().toISOString(), note: `Счёт №${Math.floor(10000 + Math.random() * 89999)}` },
            ...s.ledger,
          ],
        }))
        return null
      },
      setSubscribed: (v) => {
        if (!user) return
        patch((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === user.id ? { ...u, subscribed: v } : u)),
        }))
      },
      setDirectorEmail: (email) => {
        if (!user) return
        patch((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === user.id ? { ...u, directorEmail: email.trim().toLowerCase() || undefined } : u)),
        }))
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
