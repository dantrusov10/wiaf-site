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

/** Компактный лидмагнит внизу страниц сайта. */
export function PageLeadCta({
  variant = 'guide',
}: {
  variant?: 'guide' | 'director' | 'pricing' | 'forwarder' | 'importer'
}) {
  if (variant === 'director') {
    return (
      <section className="border-t border-line bg-fog/50">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="rounded-2xl border border-line bg-white p-6 md:flex md:items-end md:justify-between md:gap-8">
            <div className="max-w-xl">
              <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Лидмагнит</p>
              <h2 className="mt-1 text-xl font-semibold">Итоги часа на почту директора</h2>
              <p className="mt-2 text-[14px] text-muted">Без входа в ЛК — вилка после состоявшегося слота.</p>
            </div>
            <div className="mt-4 min-w-[280px] flex-1 md:mt-0">
              <DirectorLeadForm compact />
            </div>
          </div>
        </div>
      </section>
    )
  }
  if (variant === 'pricing') {
    return (
      <section className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Тарифы</p>
            <h2 className="mt-1 text-xl font-semibold">Free = торг. Инструменты — в подписке</h2>
            <p className="mt-1 text-[14px] text-muted">Аукцион не запираем. Журнал, КП и подсказки — с платного яруса.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/pricing" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
              Смотреть тарифы
            </Link>
            <Link to="/app/register?role=importer" className="rounded-lg border border-line px-4 py-2.5 text-[13px] font-semibold">
              Регистрация заказчика
            </Link>
          </div>
        </div>
      </section>
    )
  }
  if (variant === 'forwarder') {
    return (
      <section className="border-t border-line bg-fog/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Исполнителю</p>
            <h2 className="mt-1 text-xl font-semibold">Стол + маржа + умные подсказки</h2>
            <p className="mt-1 text-[14px] text-muted">Регистрация бесплатна. Ставки — при балансе от 1 000 ₽.</p>
          </div>
          <Link to="/app/register?role=forwarder" className="rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white">
            Стать исполнителем
          </Link>
        </div>
      </section>
    )
  }
  if (variant === 'importer') {
    return (
      <section className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Заказчику</p>
            <h2 className="mt-1 text-xl font-semibold">Выложить первый лот бесплатно</h2>
            <p className="mt-1 text-[14px] text-muted">Час на понижение. Победитель = минимум. Договор — сами.</p>
          </div>
          <Link to="/app/register?role=importer" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
            Создать аккаунт
          </Link>
        </div>
      </section>
    )
  }
  return (
    <section className="border-t border-line bg-fog/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Гид</p>
          <h2 className="mt-1 text-xl font-semibold">Не знаете с чего начать?</h2>
          <p className="mt-1 text-[14px] text-muted">Короткий сценарий первого лота — 10 минут.</p>
        </div>
        <Link to="/guide" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
          Открыть гид
        </Link>
      </div>
    </section>
  )
}

export function FooterLeadStrip() {
  return (
    <div className="border-t border-white/10 bg-navy-2/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-[13px] text-fog">
        <span>Письма директору · гид · тарифы Free/Pro</span>
        <div className="flex flex-wrap gap-3">
          <Link to="/director" className="underline hover:text-white">
            Директору
          </Link>
          <Link to="/guide" className="underline hover:text-white">
            Гид
          </Link>
          <Link to="/pricing" className="underline hover:text-white">
            Тарифы
          </Link>
        </div>
      </div>
    </div>
  )
}
