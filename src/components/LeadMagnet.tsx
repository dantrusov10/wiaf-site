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
        Почта сохранена. После часа придёт итог: сколько игроков и какая минимальная ставка. Это не обязанность купить.
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
        placeholder="Почта директора"
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-navy"
      />
      <button type="submit" className="shrink-0 rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
        Присылать итоги
      </button>
    </form>
  )
}

export function TryCtaButtons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Link to="/app/register?role=importer" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
        Попробовать как заказчик
      </Link>
      <Link to="/app/register?role=forwarder" className="rounded-lg border border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-ink hover:border-brand">
        Попробовать как исполнитель
      </Link>
    </div>
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
            По шагам: откуда и куда, объём, что входит в цену, дата часа и кого позвать.
          </p>
          <Magnetic className="mt-4">
            <Link to="/guide" className="lift-btn inline-flex rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-2">
              Открыть гид
            </Link>
          </Magnetic>
        </article>
        <article className="lift-card rounded-lg border border-line bg-paper p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Регистрация</p>
          <h2 className="mt-1 text-xl font-semibold">Аккаунт бесплатный</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Заказчик выкладывает груз без абонентской платы. Исполнителю для ставок нужен счёт от 1 000 ₽.
          </p>
          <div className="mt-4">
            <TryCtaButtons />
          </div>
        </article>
      </div>
    </section>
  )
}

export function PageLeadCta({
  variant = 'try',
}: {
  variant?: 'guide' | 'director' | 'pricing' | 'forwarder' | 'importer' | 'article' | 'try' | 'how'
}) {
  if (variant === 'pricing') {
    return (
      <section className="border-t border-line bg-navy text-paper">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="font-mono text-[10px] uppercase tracking-wide text-brand-2">Регистрация</p>
          <h2 className="mt-1 text-2xl font-semibold">Начните без оплаты за вход</h2>
          <p className="mt-2 max-w-2xl text-[14.5px] text-fog">
            Сами торги не требуют подписки. Заказчик — бесплатно. Исполнитель — счёт от 1 000 ₽.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/app/register?role=importer" className="rounded-lg bg-brand px-5 py-3 text-[13px] font-semibold text-white">
              Попробовать как заказчик
            </Link>
            <Link to="/app/register?role=forwarder" className="rounded-lg border border-white/35 px-5 py-3 text-[13px] font-semibold text-white">
              Попробовать как исполнитель
            </Link>
            <Link to="/app/login" className="rounded-lg px-5 py-3 text-[13px] font-semibold text-fog underline">
              Уже есть аккаунт
            </Link>
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
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Исполнителю</p>
            <h2 className="mt-1 text-2xl font-semibold">Зарегистрируйтесь и откройте ленту</h2>
            <p className="mt-2 text-[14.5px] text-muted">Регистрация бесплатна. Чтобы ставить — на счёте от 1 000 ₽.</p>
          </div>
          <TryCtaButtons />
        </div>
      </section>
    )
  }

  if (variant === 'importer') {
    return (
      <section className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Заказчику</p>
            <h2 className="mt-1 text-2xl font-semibold">Выложите первый груз бесплатно</h2>
            <p className="mt-2 text-[14.5px] text-muted">Час на понижение ставки. Побеждает наименьшая. Договор стороны пишут сами.</p>
          </div>
          <TryCtaButtons />
        </div>
      </section>
    )
  }

  return (
    <section className="border-t border-line bg-fog/50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Регистрация</p>
            <h2 className="mt-1 text-2xl font-semibold">Зарегистрируйтесь и проведите первый час</h2>
            <p className="mt-2 max-w-lg text-[14.5px] text-muted">
              Заказчик выкладывает условия. Перевозчики час снижают ставку. Платные калькуляторы — отдельно, если понадобятся.
            </p>
          </div>
          <div className="mt-5 md:mt-0">
            <TryCtaButtons />
          </div>
        </div>
      </div>
    </section>
  )
}

export function InlineTryMagnet() {
  return (
    <aside className="my-10 rounded-2xl border-2 border-brand bg-white p-5 shadow-sm md:p-6">
      <p className="font-mono text-[10px] uppercase tracking-wide text-brand">Попробовать</p>
      <h3 className="mt-1 text-lg font-semibold text-ink">Зарегистрируйтесь и проведите первый час</h3>
      <p className="mt-2 text-[14px] text-muted">
        Заказчик описывает перевозку. Исполнители снижают ставку вслепую. Комиссия только с победителя.
      </p>
      <TryCtaButtons className="mt-4" />
    </aside>
  )
}

export function FooterLeadStrip() {
  return (
    <div className="border-b border-white/10 bg-navy-2/50">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand-2">Регистрация</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Зарегистрируйтесь и попробуйте</h2>
            <p className="mt-2 max-w-xl text-[13.5px] text-fog">
              Аккаунт заказчика или исполнителя — бесплатно. Сами торги без абонентской платы.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/app/register?role=importer" className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white">
              Попробовать как заказчик
            </Link>
            <Link to="/app/register?role=forwarder" className="rounded-lg border border-white/30 px-4 py-2.5 text-[13px] font-semibold text-white">
              Попробовать как исполнитель
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
