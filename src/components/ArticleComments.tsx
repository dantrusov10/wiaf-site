import { useEffect, useState } from 'react'

export type ArticleComment = {
  id: string
  slug: string
  name: string
  text: string
  at: string
}

const KEY = 'wiaf-article-comments-v1'

function readAll(): ArticleComment[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as ArticleComment[]
  } catch {
    return []
  }
}

function writeAll(list: ArticleComment[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 500)))
}

export function ArticleComments({ slug }: { slug: string }) {
  const [items, setItems] = useState<ArticleComment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setItems(readAll().filter((c) => c.slug === slug).sort((a, b) => b.at.localeCompare(a.at)))
  }, [slug])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    const t = text.trim()
    if (n.length < 2) {
      setErr('Укажите имя')
      return
    }
    if (t.length < 3) {
      setErr('Напишите комментарий')
      return
    }
    const next: ArticleComment = {
      id: crypto.randomUUID(),
      slug,
      name: n,
      text: t,
      at: new Date().toISOString(),
    }
    const all = [next, ...readAll()]
    writeAll(all)
    setItems(all.filter((c) => c.slug === slug))
    setText('')
    setErr(null)
  }

  return (
    <section className="mt-12 border-t border-line pt-10">
      <h2 className="text-xl font-semibold">Комментарии</h2>
      <p className="mt-1 text-[13.5px] text-muted">Обсуждение материала. Хранится в этом браузере (макет без бэка).</p>

      <form onSubmit={submit} className="mt-5 space-y-3 rounded-2xl border border-line bg-white p-4 md:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[12px] font-medium text-muted">
            Имя
            <input
              className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-[14px] outline-none focus:border-brand"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться"
              required
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white sm:w-auto">
              Отправить
            </button>
          </div>
        </div>
        <label className="block text-[12px] font-medium text-muted">
          Комментарий
          <textarea
            className="mt-1 min-h-[96px] w-full rounded-lg border border-line px-3 py-2.5 text-[14px] outline-none focus:border-brand"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вопрос по тарифу, директору, механике часа…"
            required
          />
        </label>
        {err ? <p className="text-[13px] text-danger">{err}</p> : null}
      </form>

      <ul className="mt-6 space-y-3">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-line bg-fog/40 px-4 py-6 text-center text-[13.5px] text-muted">
            Пока нет комментариев — будьте первым.
          </li>
        ) : (
          items.map((c) => (
            <li key={c.id} className="rounded-xl border border-line bg-white px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[14px] font-semibold">{c.name}</p>
                <p className="font-mono text-[11px] text-mist">{new Date(c.at).toLocaleString('ru-RU')}</p>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{c.text}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
