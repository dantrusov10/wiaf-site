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
        Почта сохранена. После состоявшегося часа сюда уйдёт вилка — не обязанность закупить.
      </p>
    )
  }

  return (
    <form
      onSubmit={submit}
      className={compact ? 'flex flex-col gap-2 sm:flex-row sm:items-center' : 'grid gap-2 sm:grid-cols-[1fr_auto]'}
    >
      <label className="sr-only" htmlFor="director-email-lead">
        Почта директора
      </label>
      <input
        id="director-email-lead"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Почта директора, не логиста"
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-navy"
      />
      <button type="submit" className="shrink-0 rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
        Присылать итоги
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
            Шесть шагов: маршрут, коробки, базис, слот, проверка, позвать своих.
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
            Факт цены после часа — без входа в кабинет логиста.
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

/** Явный лидмагнит-блок для страниц сайта. */
export function PageLeadCta({
  variant = 'guide',
}: {
  variant?: 'guide' | 'director' | 'pricing' | 'forwarder' | 'importer' | 'article'
}) {
  if (variant === 'director' || variant === 'article') {
    return (
      <section className="border-t border-line bg-fog/60">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm md:grid md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-8 md:p-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Лидмагнит · директору</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Итоги часа на почту</h2>
              <p className="mt-2 max-w-md text-[14.5px] text-muted">
                Собственник не сидит в ЛК. После состоявшегося слота — вилка и условия, без обязанности взять победителя.
              </p>
              <Link to="/director" className="mt-3 inline-block text-[13px] font-semibold text-brand underline">
                Как устроено →
              </Link>
            </div>
            <div className="mt-5 md:mt-0">
              <DirectorLeadForm />
            </div>
          </div>
        </div>
      </section>
    )
  }
  if (variant === 'pricing') {
    return (
      <section className="border-t border-line bg-navy text-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-brand-2">Лидмагнит · тарифы</p>
              <h2 className="mt-1 text-2xl font-semibold">Free = торг. Инструменты — в подписке</h2>
              <p className="mt-2 max-w-xl text-[14.5px] text-fog">
                Аукцион не запираем. Журнал, КП и умные подсказки открываются с «Закупки» / «Стола». Пилот — после регистрации.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/app/register?role=importer" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
                Заказчик · регистрация
              </Link>
              <Link to="/app/register?role=forwarder" className="rounded-lg border border-white/30 px-4 py-2.5 text-[13px] font-semibold text-white">
                Исполнитель
              </Link>
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-white/15 bg-white/5 p-5">
            <p className="mb-3 text-[14px] text-fog">Или итоги часов директору — без входа в ЛК:</p>
            <DirectorLeadForm compact />
          </div>
        </div>
      </section>
    )
  }
  if (variant === 'forwarder') {
    return (
      <section className="border-t border-line bg-fog/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Лидмагнит · исполнителю</p>
            <h2 className="mt-1 text-2xl font-semibold">Стол + маржа + подсказки</h2>
            <p className="mt-2 text-[14.5px] text-muted">Регистрация бесплатна. Ставки — при балансе от 1 000 ₽.</p>
          </div>
          <Link to="/app/register?role=forwarder" className="rounded-lg bg-navy px-5 py-3 text-[13px] font-semibold text-white">
            Стать исполнителем
          </Link>
        </div>
      </section>
    )
  }
  if (variant === 'importer') {
    return (
      <section className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Лидмагнит · заказчику</p>
            <h2 className="mt-1 text-2xl font-semibold">Первый лот — бесплатно</h2>
            <p className="mt-2 text-[14.5px] text-muted">Час на понижение. Победитель = минимум. Договор — сами.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/app/register?role=importer" className="rounded-lg bg-brand px-5 py-3 text-[13px] font-semibold text-white">
              Создать аккаунт
            </Link>
            <Link to="/guide" className="rounded-lg border border-line px-5 py-3 text-[13px] font-semibold">
              Гид за 10 минут
            </Link>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="border-t border-line bg-fog/50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-2xl border border-line bg-white p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Лидмагнит · гид</p>
            <h2 className="mt-1 text-2xl font-semibold">Не знаете с чего начать?</h2>
            <p className="mt-2 max-w-lg text-[14.5px] text-muted">Короткий сценарий первого лота — около 10 минут.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 md:mt-0">
            <Link to="/guide" className="rounded-lg bg-brand px-5 py-3 text-[13px] font-semibold text-white">
              Открыть гид
            </Link>
            <Link to="/director" className="rounded-lg border border-line px-5 py-3 text-[13px] font-semibold">
              Директору
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Крупный блок в подвале сайта. */
export function FooterLeadStrip() {
  return (
    <div className="border-b border-white/10 bg-navy-2/50">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand-2">Подвал · лидмагнит</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Итоги часов директору + быстрый вход</h2>
            <p className="mt-2 text-[13.5px] text-fog">
              Письмо после состоявшегося слота · гид первого лота · тарифы Free / подписка
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-[13px]">
              <Link to="/guide" className="underline hover:text-white">
                Гид
              </Link>
              <Link to="/pricing" className="underline hover:text-white">
                Тарифы
              </Link>
              <Link to="/director" className="underline hover:text-white">
                Как устроено
              </Link>
            </div>
          </div>
          <DirectorLeadForm compact />
        </div>
      </div>
    </div>
  )
}
