import { Outlet, ScrollRestoration } from 'react-router-dom'
import { CookieBanner } from './CookieBanner'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-svh bg-paper text-ink antialiased">
      <ScrollRestoration />
      <div className="fixed inset-x-0 top-0 z-50">
        <Header />
      </div>
      <Outlet />
      <Footer />
      <CookieBanner />
    </div>
  )
}
