import { useState } from 'react'
import { useSession } from '../app/session'
import { Field, inputClass } from '../app/ui'
import { PageHero } from '../components/PageHero'

export function ContactsPage() {
  const { addTicket } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('Вопрос с сайта')
  const [body, setBody] = useState('')
  const [ok, setOk] = useState(false)

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    addTicket({ name, email, topic, body })
    setBody('')
    setOk(true)
  }

  return (
    <main>
      <PageHero kicker="Связь" title="Телефон, почта и форма" dek="Форма сохраняется в этом браузере. Кабинеты — здесь же, без прода." />
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 lg:grid-cols-2">
        <ul className="space-y-4 font-mono text-[15px]">
          <li>
            <a href="tel:+79067000180" className="text-2xl font-display font-medium text-ink">
              +7 906 700-01-80
            </a>
          </li>
          <li>
            <a href="mailto:info@wiaf.ru" className="underline underline-offset-4">
              info@wiaf.ru
            </a>
          </li>
          <li className="text-muted">ООО «ВИАФ», МО, м.о. Чехов, п. Любучаны</li>
        </ul>
        <form className="space-y-3 rounded-2xl border border-line bg-white p-6" onSubmit={send}>
          <Field label="Имя">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Почта">
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Тема">
            <input className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </Field>
          <Field label="Сообщение">
            <textarea className={`${inputClass} min-h-28`} value={body} onChange={(e) => setBody(e.target.value)} required />
          </Field>
          <button type="submit" className="rounded-full bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white">
            Отправить
          </button>
          {ok ? <p className="text-[13px] text-ok">Принято. Сохранено в этом браузере.</p> : null}
        </form>
      </div>
    </main>
  )
}
