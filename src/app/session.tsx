import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { buildDirectorReportBody } from './directorReport'
import { seedActivity, seedLedger, seedLots, seedTeam, seedTickets, seedUsers } from './seedStore'
import {
  bestBid,
  commissionRub,
  holdForBidRub,
  lotStatus,
  parseSlot,
  REG_BALANCE_MIN,
  TOPUP_MIN,
  winnerId,
  type ActivityEvent,
  type AppLot,
  type DirectorPrefs,
  type DirectorReport,
  type Ledger,
  type OrgRole,
  type PlanId,
  type Role,
  type TeamMember,
  type Ticket,
  type User,
} from './engine'

export type { AppLot, Role, Ticket, User }
export type Draft = AppLot

type Store = {
  sessionUserId: string | null
  /** Режим просмотра ЛК: какая орг-роль сейчас «надета». */
  viewAsOrgRole: OrgRole | null
  users: User[]
  lots: AppLot[]
  tickets: Ticket[]
  ledger: Ledger[]
  directorReports: DirectorReport[]
  team: TeamMember[]
  activity: ActivityEvent[]
}

const KEY = 'wiaf-local-v12'

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
    orgRole: u.orgRole ?? 'owner',
    directorPrefs: u.directorPrefs ?? {
      email: u.directorEmail ?? '',
      enabled: false,
      cadence: 'manual',
      includeMarket: true,
      includeConditions: true,
    },
  }
}

function pushActivity(
  s: Store,
  actor: User,
  action: string,
  detail: string,
  lotId?: string,
): Store {
  const ev: ActivityEvent = {
    id: crypto.randomUUID(),
    orgUserId: actor.id,
    actorId: actor.id,
    actorName: actor.responsible || actor.company,
    role: actor.role,
    action,
    detail,
    at: new Date().toISOString(),
    lotId,
  }
  return { ...s, activity: [ev, ...s.activity].slice(0, 400) }
}

const empty: Store = {
  sessionUserId: null,
  viewAsOrgRole: null,
  users: seedUsers,
  lots: seedLots(),
  tickets: seedTickets,
  ledger: seedLedger,
  directorReports: [],
  team: seedTeam,
  activity: seedActivity,
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(empty)
    const parsed = JSON.parse(raw) as Partial<Store>
    return {
      sessionUserId: parsed.sessionUserId ?? null,
      viewAsOrgRole: parsed.viewAsOrgRole ?? null,
      users: (parsed.users?.length ? parsed.users : seedUsers).map(migrateUser),
      lots: parsed.lots?.length ? parsed.lots : seedLots(),
      tickets: parsed.tickets ?? [],
      ledger: parsed.ledger ?? [],
      directorReports: parsed.directorReports ?? [],
      team: parsed.team?.length ? parsed.team : seedTeam,
      activity: parsed.activity?.length ? parsed.activity : seedActivity,
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
  /** Эффективная орг-роль: viewAs или родная роль пользователя. */
  effectiveOrgRole: OrgRole
  /** Роли, доступные для переключения (из команды + родная). */
  availableOrgRoles: OrgRole[]
  setViewAsOrgRole: (role: OrgRole) => void
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
  addTeamMember: (input: { name: string; email: string; orgRole: OrgRole }) => string | null
  removeTeamMember: (id: string) => string | null
  setTeamMemberActive: (id: string, active: boolean) => string | null
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

  const availableOrgRoles = useMemo<OrgRole[]>(() => {
    if (!user) return []
    const fromTeam = store.team.filter((t) => t.orgUserId === user.id && t.active).map((t) => t.orgRole)
    const set = new Set<OrgRole>([user.orgRole ?? 'owner', ...fromTeam])
    // owner всегда может примерить все уровни
    if ((user.orgRole ?? 'owner') === 'owner' || (user.orgRole ?? 'owner') === 'director') {
      ;(['owner', 'director', 'manager', 'employee'] as OrgRole[]).forEach((r) => set.add(r))
    }
    const order: OrgRole[] = ['owner', 'director', 'manager', 'employee']
    return order.filter((r) => set.has(r))
  }, [user, store.team])

  const effectiveOrgRole: OrgRole =
    (store.viewAsOrgRole && availableOrgRoles.includes(store.viewAsOrgRole)
      ? store.viewAsOrgRole
      : user?.orgRole) ?? 'owner'

  const value = useMemo<Ctx>(
    () => ({
      ...store,
      user,
      effectiveOrgRole,
      availableOrgRoles,
      setViewAsOrgRole: (role) => {
        if (!user) return
        if (!availableOrgRoles.includes(role)) return
        patch((s) => ({ ...s, viewAsOrgRole: role }))
      },
      login: (inn, password) => {
        const found = store.users.find((u) => u.inn === inn.replace(/\s/g, '') && u.password === password)
        if (!found) return 'Неверный ИНН или пароль'
        patch((s) => ({
          ...s,
          sessionUserId: found.id,
          // Owner по умолчанию в операционке; «директор» — явное переключение
          viewAsOrgRole: (found.orgRole ?? 'owner') === 'owner' ? 'manager' : (found.orgRole ?? 'owner'),
        }))
        return null
      },
      logout: () => patch((s) => ({ ...s, sessionUserId: null, viewAsOrgRole: null })),
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
              orgRole: 'owner',
              responsible: input.responsible,
              directorEmail: undefined,
              checko: input.checko,
            }),
            ...s.users,
          ],
          team: [
            {
              id: crypto.randomUUID(),
              orgUserId: id,
              name: input.responsible,
              email: input.email,
              orgRole: 'owner',
              active: true,
              createdAt: new Date().toISOString(),
            },
            ...s.team,
          ],
          activity: [
            {
              id: crypto.randomUUID(),
              orgUserId: id,
              actorId: id,
              actorName: input.responsible,
              role: input.role,
              action: 'Регистрация',
              detail: `${input.company} · ${input.role === 'importer' ? 'заказчик' : 'исполнитель'}`,
              at: new Date().toISOString(),
            },
            ...s.activity,
          ],
        }))
        return null
      },
      saveLot: (lot) =>
        patch((s) => {
          const exists = s.lots.some((l) => l.id === lot.id)
          let next = {
            ...s,
            lots: exists ? s.lots.map((l) => (l.id === lot.id ? lot : l)) : [lot, ...s.lots],
          }
          const actor = s.users.find((u) => u.id === s.sessionUserId)
          if (actor) {
            next = pushActivity(
              next,
              actor,
              exists ? (lot.isDraft ? 'Шаблон обновлён' : 'Лот обновлён') : lot.isDraft ? 'Шаблон создан' : 'Лот опубликован',
              `${lot.code} · ${lot.from} → ${lot.to}`,
              lot.id,
            )
          }
          return next
        }),
      removeLot: (id) => {
        const lot = store.lots.find((l) => l.id === id)
        if (!lot) return 'Лот не найден'
        if (!lot.isDraft) return 'Удалить можно только шаблон'
        patch((s) => {
          let next = { ...s, lots: s.lots.filter((l) => l.id !== id) }
          if (user) next = pushActivity(next, user, 'Шаблон удалён', lot.code, lot.id)
          return next
        })
        return null
      },
      startNow: (id) =>
        patch((s) => {
          let next = {
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
          }
          const lot = next.lots.find((l) => l.id === id)
          const actor = s.users.find((u) => u.id === s.sessionUserId)
          if (actor && lot) next = pushActivity(next, actor, 'Слот запущен сейчас', lot.code, id)
          return next
        }),
      finishNow: (id) =>
        patch((s) => {
          let next = {
            ...s,
            lots: s.lots.map((l) => (l.id === id ? { ...l, closedAt: new Date().toISOString() } : l)),
          }
          const lot = next.lots.find((l) => l.id === id)
          const actor = s.users.find((u) => u.id === s.sessionUserId)
          if (actor && lot) next = pushActivity(next, actor, 'Слот закрыт вручную', lot.code, id)
          return next
        }),
      archiveLot: (id) =>
        patch((s) => {
          let next = {
            ...s,
            lots: s.lots.map((l) => (l.id === id ? { ...l, archived: true } : l)),
          }
          const lot = next.lots.find((l) => l.id === id)
          const actor = s.users.find((u) => u.id === s.sessionUserId)
          if (actor && lot) next = pushActivity(next, actor, 'Лот в архив', lot.code, id)
          return next
        }),
      newSlot: (id, date, time) => {
        const slot = parseSlot(date, time)
        if (!slot) return 'Дата слота — дд.мм.гггг и час чч:мм'
        patch((s) => {
          let next = {
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
          }
          const lot = next.lots.find((l) => l.id === id)
          const actor = s.users.find((u) => u.id === s.sessionUserId)
          if (actor && lot) next = pushActivity(next, actor, 'Новый слот', `${lot.code} · ${date} ${time}`, id)
          return next
        })
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
        patch((s) => {
          let next = {
            ...s,
            lots: s.lots.map((l) =>
              l.id === lotId
                ? { ...l, bids: [{ userId: user.id, amount, at: new Date().toISOString() }, ...l.bids] }
                : l,
            ),
          }
          next = pushActivity(next, user, 'Ставка', `${lot.code} · ${amount} $`, lotId)
          return next
        })
        return null
      },
      topup: (amount) => {
        if (!user || user.role !== 'forwarder') return 'Нужен вход исполнителя'
        if (amount < TOPUP_MIN) return `Минимум пополнения ${TOPUP_MIN.toLocaleString('ru-RU')} ₽`
        patch((s) => {
          let next = {
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
          }
          next = pushActivity(next, user, 'Пополнение счёта', `+${amount.toLocaleString('ru-RU')} ₽`)
          return next
        })
        return null
      },
      setSubscribed: (v) => {
        if (!user) return
        const planId = defaultPlan(user.role, v)
        patch((s) => {
          let next = {
            ...s,
            users: s.users.map((u) => (u.id === user.id ? { ...u, subscribed: v, planId } : u)),
          }
          next = pushActivity(next, user, 'Тариф изменён', v ? 'Подписка включена' : 'Free')
          return next
        })
      },
      setPlan: (planId) => {
        if (!user) return
        const subscribed = planId !== 'imp-free' && planId !== 'fwd-free'
        patch((s) => {
          let next = {
            ...s,
            users: s.users.map((u) => (u.id === user.id ? { ...u, planId, subscribed } : u)),
          }
          next = pushActivity(next, user, 'Тариф изменён', planId)
          return next
        })
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
        patch((s) => {
          let next = {
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
          }
          next = pushActivity(next, user, 'Настройки отчётов', prefs.enabled ? `вкл · ${prefs.cadence}` : 'выкл')
          return next
        })
      },
      sendDirectorReport: (lotIds, opts) => {
        if (!user) return 'Нужен вход'
        let message = 'Ошибка'
        patch((s) => {
          const owner = s.users.find((u) => u.id === user.id)
          if (!owner) return s
          const r = pushDirectorMail(s, owner, lotIds, opts?.openMail ?? true)
          message = r.message
          return pushActivity(r.store, owner, 'Отчёт директору', message)
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
      addTeamMember: (input) => {
        if (!user) return 'Нужен вход'
        const lens = store.viewAsOrgRole ?? user.orgRole ?? 'owner'
        if (lens === 'employee' || lens === 'manager') return 'Нет права добавлять сотрудников'
        const name = input.name.trim()
        const email = input.email.trim().toLowerCase()
        if (!name || !email.includes('@')) return 'Имя и e-mail обязательны'
        if (input.orgRole === 'owner') return 'Owner уже есть — выберите director / manager / employee'
        patch((s) => {
          let next = {
            ...s,
            team: [
              {
                id: crypto.randomUUID(),
                orgUserId: user.id,
                name,
                email,
                orgRole: input.orgRole,
                active: true,
                createdAt: new Date().toISOString(),
              },
              ...s.team,
            ],
          }
          next = pushActivity(next, user, 'Сотрудник добавлен', `${name} · ${input.orgRole}`)
          return next
        })
        return null
      },
      removeTeamMember: (id) => {
        if (!user) return 'Нужен вход'
        const lens = store.viewAsOrgRole ?? user.orgRole ?? 'owner'
        if (lens === 'employee' || lens === 'manager') return 'Нет права удалять'
        const m = store.team.find((t) => t.id === id && t.orgUserId === user.id)
        if (!m) return 'Сотрудник не найден'
        if (m.orgRole === 'owner') return 'Owner удалить нельзя'
        patch((s) => {
          let next = { ...s, team: s.team.filter((t) => t.id !== id) }
          next = pushActivity(next, user, 'Сотрудник удалён', m.name)
          return next
        })
        return null
      },
      setTeamMemberActive: (id, active) => {
        if (!user) return 'Нужен вход'
        const lens = store.viewAsOrgRole ?? user.orgRole ?? 'owner'
        if (lens === 'employee' || lens === 'manager') return 'Нет права'
        const m = store.team.find((t) => t.id === id && t.orgUserId === user.id)
        if (!m) return 'Сотрудник не найден'
        if (m.orgRole === 'owner') return 'Owner нельзя отключить'
        patch((s) => {
          let next = {
            ...s,
            team: s.team.map((t) => (t.id === id ? { ...t, active } : t)),
          }
          next = pushActivity(next, user, active ? 'Сотрудник включён' : 'Сотрудник отключён', m.name)
          return next
        })
        return null
      },
      resetDemo: () => patch(() => ({ ...structuredClone(empty), sessionUserId: store.sessionUserId, viewAsOrgRole: store.viewAsOrgRole })),
    }),
    [store, user, effectiveOrgRole, availableOrgRoles],
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
