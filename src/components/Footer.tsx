import { Link } from 'react-router-dom'
import { phoneDisplay, phoneHref } from '../nav'
import { Wordmark } from './Brand'
import { FooterLeadStrip } from './LeadMagnet'

const links = [
  { to: '/auctions', label: 'Аукционы' },
  { to: '/articles', label: 'Блог' },
  { to: '/pricing', label: 'Тарифы' },
  { to: '/guide', label: 'Гид' },
  { to: '/rates', label: 'Курсы ЦБ' },
  { to: '/rules', label: 'Правила' },
  { to: '/privacy', label: 'Конфиденциальность' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy text-paper">
      <FooterLeadStrip />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-5">
        <Wordmark light compact />
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-fog">
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-white">
              {item.label}
            </Link>
          ))}
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
