import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { nav, navMore, phoneDisplay, phoneHref } from '../nav'
import { Wordmark } from './Brand'
import { Magnetic } from './Motion'

export function Header() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`border-b text-ink transition-[box-shadow,background-color] duration-200 ${scrolled ? 'border-line bg-white shadow-[0_8px_24px_-16px_rgba(10,47,68,0.35)]' : 'border-line bg-white'}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <div className="shrink-0">
          <Wordmark compact />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium ${
                  isActive ? 'text-ink underline decoration-brand decoration-2 underline-offset-[10px]' : 'text-muted hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <a href={phoneHref} className="inline-flex h-9 items-center gap-1.5 font-mono text-[12px] tabular-nums text-muted hover:text-ink">
            <Phone className="size-3.5 opacity-70" />
            {phoneDisplay}
          </a>
          <Link to="/guide" className="inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-muted hover:text-ink">
            Гид
          </Link>
          <Magnetic>
            <Link
              to="/app/register?role=importer&next=/app/importer/create&guide=1"
              className="lift-btn inline-flex h-9 items-center rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white hover:bg-navy-2"
            >
              Попробовать
            </Link>
          </Magnetic>
        </div>

        <button
          type="button"
          className="ml-auto lg:hidden"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="max-h-[min(80vh,36rem)] overflow-y-auto border-t border-line bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {[...nav, ...navMore].map((item) => (
              <NavLink key={item.to} to={item.to} className="rounded-lg px-2 py-2.5 text-[15px] hover:bg-fog" onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <a href={phoneHref} className="mt-3 flex items-center gap-2 font-mono text-[14px] tabular-nums text-muted">
            <Phone className="size-4" />
            {phoneDisplay}
          </a>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/app/register?role=importer&next=/app/importer/create&guide=1"
              className="rounded-lg bg-brand px-4 py-2.5 text-center text-[14px] font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Попробовать как заказчик
            </Link>
            <Link
              to="/app/register?role=forwarder&next=/app/forwarder/balance"
              className="rounded-lg border border-line px-4 py-2.5 text-center text-[14px]"
              onClick={() => setOpen(false)}
            >
              Попробовать как исполнитель
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
