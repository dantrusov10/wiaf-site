import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Magnetic } from './Motion'

const KEY = 'wiaf-director-digest'

export function DirectorLeadForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(() => (typeof window === 'undefined' ? false : Boolean(localStorage.getItem(KEY))))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = email.trim().toLowerCase()
    if (!v.includes('@')) return
    localStorage.setItem(KEY, JSON.stringify({ email: v, at: new Date().toISOString() }))
    setDone(true)
  }

  if (done) {
    return (
      <p className="text-[13.5px] text-ok">
        Почта сохранена в этом браузере. Когда час состоится — сюда уйдёт вилка, не обязанность закупить.
      </p>
    )
  }

  return (
    <form onSubmit={submit} className={compact ? 'flex flex-col gap-2 sm:flex-row sm:items-center' : 'grid gap-2 sm:grid-cols-[1fr_auto]'}>
      <label className="sr-only" htmlFor="director-email">
        Почта директора
      </label>
      <input
        id="director-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Почта директора, не логиста"
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[14px] outline-none focus:border-navy"
      />
      <button type="submit" className="shrink-0 rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
        Присылать итоги часов
      </button>
    </form>
  )
}

export function HomeLeadStrip() {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 lg:grid-cols-2">
        <article className="lift-card rounded-lg border border-line bg-paper p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Гид</p>
          <h2 className="mt-1 text-xl font-semibold">Первый лот за 10 минут</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Шесть шагов: маршрут, коробки, базис, слот, проверка, позвать своих. Без «экономии 20%».
          </p>
          <Magnetic className="mt-4">
            <Link to="/guide" className="lift-btn inline-flex rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
              Открыть гид
            </Link>
          </Magnetic>
        </article>
        <article className="lift-card rounded-lg border border-line bg-paper p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Директору</p>
          <h2 className="mt-1 text-xl font-semibold">Письма с итогами часов</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Собственник ставит задачу раз в год и забывает. Логист на откате кабинет не показывает. Письмо после каждого часа — факт цены, не обязанность взять победителя.
          </p>
          <div className="mt-4">
            <DirectorLeadForm />
          </div>
          <Link to="/director" className="mt-3 inline-block text-[13px] font-medium underline underline-offset-4">
            Как устроено кресло директора
          </Link>
        </article>
      </div>
    </section>
  )
}
