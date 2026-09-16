import { useState } from 'react'
import { Field, inputClass, Panel } from './ui'
import { useSession } from './session'

export function MessageForm({ who }: { who: 'заказчика' | 'экспедитора' }) {
  const { user, tickets, addTicket } = useSession()
  const [topic, setTopic] = useState(`Предложение для wIaF`)
  const [lotId, setLotId] = useState('')
  const [body, setBody] = useState('')
  const [ok, setOk] = useState(false)
  const mine = tickets.filter((t) => t.userId === user?.id)

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    addTicket({
      userId: user?.id,
      name: user?.responsible ?? user?.company ?? 'Гость',
      email: user?.email ?? '',
      topic,
      body,
      lotId: lotId || undefined,
    })
    setBody('')
    setOk(true)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Panel title="Сообщение">
        <p className="mb-4 text-[14px] text-muted">
          Жалоба {who} или предложение. Ответ появится в этом списке — сервера нет, почта не уходит.
        </p>
        <form className="grid gap-3" onSubmit={send}>
          <Field label="Тема">
            <select className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option>Жалоба от {who}</option>
              <option>Предложение для wIaF</option>
            </select>
          </Field>
          <Field label="ID аукциона" hint="Необязательно">
            <input className={inputClass} value={lotId} onChange={(e) => setLotId(e.target.value)} placeholder="115" />
          </Field>
          <Field label="Текст">
            <textarea className={`${inputClass} min-h-28`} value={body} onChange={(e) => setBody(e.target.value)} required />
          </Field>
          <button type="submit" className="w-fit rounded-full bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white">
            Отправить
          </button>
          {ok ? <p className="text-[13px] text-ok">Принято. Ответ ниже в ленте.</p> : null}
        </form>
      </Panel>
      {mine.length ? (
        <Panel title="Обращения">
          <ul className="space-y-3 text-[14px]">
            {mine.map((m) => (
              <li key={m.id} className="rounded-xl border border-line p-3">
                <p className="font-semibold">{m.topic}</p>
                <p className="mt-1 text-muted">{m.body}</p>
                {m.reply ? <p className="mt-2 text-[13px] text-ok">{m.reply}</p> : null}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  )
}
