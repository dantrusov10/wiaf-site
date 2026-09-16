import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const KEY = 'wiaf_cookie_ok'

export function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === '1') return
    } catch {
      return
    }
    setOpen(true)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-navy text-paper"
      role="dialog"
      aria-label="Согласие на метрику"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <p className="max-w-2xl text-[13px] leading-relaxed text-fog">
          Считаем, как пользуются площадкой, чтобы чинить трение в кабинете. Продолжая, вы соглашаетесь.{' '}
          <Link to="/privacy" className="underline underline-offset-4">
            Конфиденциальность
          </Link>
        </p>
        <button
          type="button"
          className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white"
          onClick={() => {
            try {
              localStorage.setItem(KEY, '1')
            } catch {
              /* ignore */
            }
            setOpen(false)
          }}
        >
          Согласен
        </button>
      </div>
    </div>
  )
}
