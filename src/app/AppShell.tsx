import {
  Archive,
  Banknote,
  BookOpen,
  Calculator,
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
  X,
} from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Wordmark, Mark } from '../components/Brand'
import { useSession, type Role } from './session'

type Item = { to: string; end?: boolean; label: string; icon: ComponentType<{ className?: string }> }
type Group = { title: string; items: Item[] }

const importerGroups: Group[] = [
  {
    title: 'Работа',
    items: [
      { to: '/app/importer', end: true, label: 'Обзор', icon: LayoutDashboard },
      { to: '/app/importer/create', label: 'Новый лот', icon: FilePlus },
      { to: '/app/importer/tools', label: 'Инструменты', icon: Calculator },
      { to: '/app/importer/director', label: 'Директору', icon: Mail },
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

const forwarderGroups: Group[] = [
  {
    title: 'Стол',
    items: [
      { to: '/app/forwarder', end: true, label: 'Обзор', icon: LayoutDashboard },
      { to: '/app/forwarder/tools', label: 'Маржа и КП', icon: Calculator },
      { to: '/app/forwarder/balance', label: 'Счёт', icon: Banknote },
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
      { to: '/app/forwarder/won', label: 'Выигранные', icon: Trophy },
      { to: '/app/forwarder/lost', label: 'Проигранные', icon: Archive },
      { to: '/app/forwarder/archive', label: 'Архив', icon: Archive },
      { to: '/app/forwarder/message', label: 'Написать', icon: MessageSquare },
    ],
  },
]

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
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${
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

export function AppShell({ role }: { role: Role }) {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const groups = role === 'importer' ? importerGroups : forwarderGroups
  const balance = user?.balance ?? 0
  const isImp = role === 'importer'

  const onLogout = () => {
    logout()
    navigate('/app/login')
  }

  return (
    <div className="min-h-svh bg-paper text-ink">
      <div className="flex min-h-svh">
        <aside className="sticky top-0 hidden h-svh w-[15.5rem] shrink-0 overflow-hidden border-r border-line bg-white lg:flex lg:flex-col">
          <div className="border-b border-line px-4 py-4">
            <Wordmark compact />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
              {isImp ? 'Кабинет заказчика' : 'Кабинет исполнителя'}
            </p>
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
            <div className="flex shrink-0 items-center gap-3">
              {!isImp ? (
                <p className="hidden font-mono text-[12px] text-muted sm:block">
                  Счёт {balance.toLocaleString('ru-RU')} ₽
                  {balance < 1000 ? <span className="ml-2 text-danger">нужно ≥ 1 000</span> : null}
                </p>
              ) : (
                <p className="hidden text-[12px] text-muted sm:block">
                  {user?.directorEmail ? `директор: ${user.directorEmail}` : 'директор не указан'}
                </p>
              )}
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
                <LogOut className="size-4" />
                Выйти
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
