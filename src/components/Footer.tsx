import { Link } from 'react-router-dom'
import { prod } from '../data'
import { phoneDisplay, phoneHref } from '../nav'
import { Wordmark } from './Brand'

const links = [
  { to: '/auctions', label: 'Аукционы' },
  { to: '/help', label: 'База' },
  { to: '/guide', label: 'Гид' },
  { to: '/director', label: 'Директору' },
  { to: '/rules', label: 'Правила' },
  { to: '/privacy', label: 'Конфиденциальность' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-5">
        <Wordmark light compact />
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-fog">
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-white">
              {item.label}
            </Link>
          ))}
          <a href={prod.rules} className="hover:text-white">
            Правила на wiaf.ru
          </a>
        </nav>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[12px] text-mist">
          <a href={phoneHref} className="hover:text-white">
            {phoneDisplay}
          </a>
          <a href="mailto:info@wiaf.ru" className="hover:text-white">
            info@wiaf.ru
          </a>
          <span>© 2026 ООО «ВИАФ»</span>
        </div>
      </div>
    </footer>
  )
}
