import {
  Archive,
  Banknote,
  BookOpen,
  Calculator,
  CreditCard,
  FilePlus,
  Gavel,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Scale,
  Trophy,
  Users,
  X,
  LineChart,
  ScrollText,
  Eye,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Wordmark, Mark } from '../components/Brand'
import { ThemeIcon } from '../components/ThemeIcon'
import type { OrgRole } from './engine'
import { useSession, type Role } from './session'

type Item = { to: string; end?: boolean; label: string; icon: ComponentType<{ className?: string }> }
type Group = { title: string; items: Item[] }

const orgRoleLabel: Record<OrgRole, string> = {
  owner: 'Owner',
  director: 'Директор',
  manager: 'Руководитель',
  employee: 'Сотрудник',
}

function importerOps(): Group[] {
  return [
    {
      title: 'Работа',
      items: [
        { to: '/app/importer', end: true, label: 'Обзор', icon: LayoutDashboard },
        { to: '/app/importer/create', label: 'Новый лот', icon: FilePlus },
        { to: '/app/importer/tools', label: 'Инструменты', icon: Calculator },
        { to: '/app/importer/plan', label: 'Подписка', icon: CreditCard },
        { to: '/rates', label: 'Курсы ЦБ', icon: LineChart },
        { to: '/help', label: 'База', icon: BookOpen },
      ],
    },
    {
      title: 'Слоты',
      items: [
        { to: '/app/importer/current', label: 'Текущие', icon: Scale },
        { to: '/app/importer/held', label: 'Состоялись', icon: Trophy },
        { to: '/app/importer/failed', label: 'Не состоялись', icon: Archive },
        { to: '/app/importer/templates', label: 'Шаблоны', icon: Inbox },
        { to: '/app/importer/bids', label: 'Ставки на мои', icon: Gavel },
        { to: '/app/importer/archive', label: 'Архив', icon: Archive },
      ],
    },
    {
      title: 'Связь',
      items: [{ to: '/app/importer/message', label: 'Написать', icon: MessageSquare }],
    },
  ]
}

function forwarderOps(): Group[] {
  return [
    {
      title: 'Стол',
      items: [
        { to: '/app/forwarder', end: true, label: 'Обзор', icon: LayoutDashboard },
        { to: '/app/forwarder/tools', label: 'Маржа и КП', icon: Calculator },
        { to: '/app/forwarder/plan', label: 'Подписка', icon: CreditCard },
        { to: '/app/forwarder/balance', label: 'Счёт', icon: Banknote },
        { to: '/rates', label: 'Курсы ЦБ', icon: LineChart },
        { to: '/help', label: 'База', icon: BookOpen },
      ],
    },
    {
      title: 'Лента',
      items: [
        { to: '/app/forwarder/china', label: 'Китай', icon: Scale },
        { to: '/app/forwarder/turkey', label: 'Турция', icon: Inbox },
        { to: '/app/forwarder/vietnam', label: 'Вьетнам', icon: Inbox },
        { to: '/app/forwarder/india', label: 'Индия', icon: Inbox },
      ],
    },
    {
      title: 'Сделки',
      items: [
        { to: '/app/forwarder/history', label: 'История', icon: Trophy },
        { to: '/app/forwarder/won', label: 'Выигранные', icon: Trophy },
        { to: '/app/forwarder/lost', label: 'Проигранные', icon: Archive },
        { to: '/app/forwarder/archive', label: 'Архив', icon: Archive },
        { to: '/app/forwarder/message', label: 'Написать', icon: MessageSquare },
      ],
    },
  ]
}

function directorMenu(role: Role): Group[] {
  const base = role === 'importer' ? '/app/importer/director' : '/app/forwarder/director'
  return [
    {
      title: 'Управление',
      items: [
        { to: base, end: true, label: 'Сводка', icon: LayoutDashboard },
        { to: `${base}/reports`, label: 'Отчёты', icon: Mail },
        { to: `${base}/activity`, label: 'Журнал', icon: ScrollText },
        { to: `${base}/team`, label: 'Команда', icon: Users },
        { to: `${base}/rates`, label: 'Курсы ЦБ', icon: LineChart },
      ],
    },
  ]
}

function filterOpsForRole(groups: Group[], orgRole: OrgRole): Group[] {
  if (orgRole === 'employee') {
    return groups.map((g) => ({
      ...g,
      items: g.items.filter((it) => !it.to.includes('/plan')),
    }))
  }
  return groups
}

function menuFor(role: Role, orgRole: OrgRole): Group[] {
  if (orgRole === 'director' || orgRole === 'owner') {
    // owner/director: кабинет управления (не пункт внутри операционки)
    return directorMenu(role)
  }
  if (orgRole === 'manager') {
    const ops = role === 'importer' ? importerOps() : forwarderOps()
    const base = role === 'importer' ? '/app/importer/director' : '/app/forwarder/director'
    return [
      ...filterOpsForRole(ops, orgRole),
      {
        title: 'Контроль',
        items: [
          { to: `${base}/activity`, label: 'Журнал', icon: ScrollText },
          { to: base, end: true, label: 'Сводка', icon: LayoutDashboard },
        ],
      },
    ]
  }
  return filterOpsForRole(role === 'importer' ? importerOps() : forwarderOps(), orgRole)
}

function SideNav({ groups, onPick }: { groups: Group[]; onPick?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-2">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">{g.title}</p>
          <div className="flex flex-col gap-0.5">
            {g.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onPick}
                className={({ isActive }) =>
                  `nav-magnetic flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${
                    isActive ? 'bg-brand text-white' : 'text-muted hover:bg-fog hover:text-ink'
                  }`
                }
              >
                <item.icon className="size-4 shrink-0 opacity-80" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

function ViewAsSwitch({ role }: { role: Role }) {
  const { effectiveOrgRole, availableOrgRoles, setViewAsOrgRole } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const pick = (r: OrgRole) => {
    setViewAsOrgRole(r)
    setOpen(false)
    if (r === 'director' || r === 'owner') {
      navigate(role === 'importer' ? '/app/importer/director' : '/app/forwarder/director')
    } else {
      navigate(role === 'importer' ? '/app/importer' : '/app/forwarder')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-fog/60 px-2.5 py-1.5 text-[12px] font-medium text-ink hover:border-brand"
      >
        <Eye className="size-3.5 text-brand" />
        <span className="hidden sm:inline">Смотреть как</span>
        <span className="font-semibold">{orgRoleLabel[effectiveOrgRole]}</span>
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Закрыть" onClick={() => setOpen(false)} />
          <ul className="absolute right-0 z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg">
            <li className="px-3 py-1.5 font-mono text-[10px] uppercase text-mist">Режим доступа</li>
            {availableOrgRoles.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-fog ${
                    r === effectiveOrgRole ? 'font-semibold text-brand' : 'text-ink'
                  }`}
                >
                  {orgRoleLabel[r]}
                  {r === effectiveOrgRole ? <span className="text-[10px] text-mist">сейчас</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

/** Редирект с запрещённых разделов при текущей орг-роли. */
function OrgAccessGuard({ role }: { role: Role }) {
  const { effectiveOrgRole } = useSession()
  const { pathname } = useLocation()
  const directorBase = role === 'importer' ? '/app/importer/director' : '/app/forwarder/director'
  const home = role === 'importer' ? '/app/importer' : '/app/forwarder'

  const onDirectorPath = pathname.startsWith(directorBase)
  const onTeam = pathname.includes('/team')
  const onReports = pathname.includes('/reports')

  if ((effectiveOrgRole === 'employee' || effectiveOrgRole === 'manager') && onDirectorPath) {
    if (effectiveOrgRole === 'employee') return <Navigate to={home} replace />
    // manager: только сводка и журнал
    if (onTeam || onReports || pathname.includes('/articles')) {
      return <Navigate to={`${directorBase}/activity`} replace />
    }
  }
  if ((effectiveOrgRole === 'director' || effectiveOrgRole === 'owner') && !onDirectorPath) {
    // не форсируем редирект с операционки — пользователь мог перейти по прямой ссылке;
    // меню уже директорское, но если открыли /create — пусть остаётся? User wants menu change.
    // Soft: only redirect home ops when landing on main ops after switch (handled in ViewAsSwitch).
  }
  return null
}

export function AppShell({ role }: { role: Role }) {
  const { user, logout, effectiveOrgRole } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const groups = useMemo(() => menuFor(role, effectiveOrgRole), [role, effectiveOrgRole])
  const balance = user?.balance ?? 0
  const isImp = role === 'importer'
  const isDirectorLens = effectiveOrgRole === 'director' || effectiveOrgRole === 'owner'

  const onLogout = () => {
    logout()
    navigate('/app/login')
  }

  useEffect(() => {
    // при смене на employee уводим с team/reports если остались
  }, [effectiveOrgRole])

  return (
    <div className="min-h-svh bg-paper text-ink">
      <OrgAccessGuard role={role} />
      <div className="flex min-h-svh">
        <aside className="sticky top-0 hidden h-svh w-[15.5rem] shrink-0 overflow-hidden border-r border-line bg-white lg:flex lg:flex-col">
          <div className="border-b border-line px-4 py-4">
            <Wordmark compact />
            <div className="mt-3 flex items-center gap-2">
              <ThemeIcon id={isDirectorLens ? 'director' : isImp ? 'auction' : 'hold'} size={40} />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                  {isDirectorLens ? 'Режим управления' : isImp ? 'Кабинет заказчика' : 'Кабинет исполнителя'}
                </p>
                <p className="text-[11px] font-medium text-brand">{orgRoleLabel[effectiveOrgRole]}</p>
              </div>
            </div>
          </div>
          <SideNav groups={groups} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Меню">
                <Menu className="size-5" />
              </button>
              <Mark className="size-9 shrink-0 lg:hidden" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{user?.company}</p>
                <p className="font-mono text-[11px] text-mist">ИНН {user?.inn}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ViewAsSwitch role={role} />
              {!isImp && !isDirectorLens ? (
                <p className="hidden font-mono text-[12px] text-muted md:block">
                  Счёт {balance.toLocaleString('ru-RU')} ₽
                </p>
              ) : null}
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          </header>
          <main className="flex-1 px-4 py-5 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-navy/40" aria-label="Закрыть" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <Wordmark compact />
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть меню">
                <X className="size-5" />
              </button>
            </div>
            <div className="border-b border-line px-3 py-2">
              <ViewAsSwitch role={role} />
            </div>
            <SideNav groups={groups} onPick={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function Guard({ role }: { role: Role }) {
  const { user } = useSession()
  if (!user) return <Navigate to="/app/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === 'importer' ? '/app/importer' : '/app/forwarder'} replace />
  }
  return <AppShell role={role} />
}
