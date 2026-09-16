import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field, inputClass, Panel } from './ui'

const empty = {
  slug: '',
  title: '',
  dek: '',
  published: new Date().toISOString().slice(0, 10),
  topics: 'одежда, таможня',
  sourceName: '',
  sourceUrl: '',
  sourceDate: '',
  why: '',
  p1: '',
  p2: '',
  p3: '',
  auctionNote: '',
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

export function NewsDeskPage() {
  const [form, setForm] = useState(empty)
  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const ts = useMemo(() => {
    const slug = form.slug || slugify(form.title) || 'slug'
    const topics = form.topics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const paragraphs = [form.p1, form.p2, form.p3].map((p) => p.trim()).filter(Boolean)
    const obj = {
      slug,
      title: form.title,
      dek: form.dek,
      published: form.published,
      topics,
      source: { name: form.sourceName, url: form.sourceUrl, date: form.sourceDate },
      why: form.why,
      paragraphs,
      auctionNote: form.auctionNote,
    }
    return JSON.stringify(obj, null, 2)
  }, [form])

  const copy = async () => {
    await navigator.clipboard.writeText(ts)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-10">
      <div>
        <p className="font-mono text-[11px] text-mist">Локально · не прод</p>
        <h1 className="text-2xl font-semibold">Стол дайджеста</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Чужую статью не вставляем. Сначала{' '}
          <code className="font-mono text-[12px]">npm run news</code> в папке alt-site — RSS отфильтрует
          факты. Сюда: ссылка, дата, три своих абзаца и блок «что в лоте». Готовый JSON копируете в{' '}
          <code className="font-mono text-[12px]">src/content/news.ts</code>.
        </p>
        <Link to="/news" className="mt-2 inline-block text-[13px] underline">
          Как это выглядит на сайте
        </Link>
      </div>

      <Panel title="Факт">
        <div className="grid gap-3">
          <Field label="URL источника">
            <input className={inputClass} value={form.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Имя источника">
              <input className={inputClass} value={form.sourceName} onChange={(e) => set('sourceName', e.target.value)} />
            </Field>
            <Field label="Дата факта">
              <input className={inputClass} value={form.sourceDate} onChange={(e) => set('sourceDate', e.target.value)} />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Свой текст">
        <div className="grid gap-3">
          <Field label="Заголовок wIaF" hint="Не копировать заголовок источника">
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Slug">
            <input className={inputClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="авто из заголовка" />
          </Field>
          <Field label="Подзаголовок">
            <input className={inputClass} value={form.dek} onChange={(e) => set('dek', e.target.value)} />
          </Field>
          <Field label="Теги" hint="через запятую">
            <input className={inputClass} value={form.topics} onChange={(e) => set('topics', e.target.value)} />
          </Field>
          <Field label="Почему это нам">
            <textarea className={`${inputClass} min-h-20`} value={form.why} onChange={(e) => set('why', e.target.value)} />
          </Field>
          <Field label="Абзац 1">
            <textarea className={`${inputClass} min-h-24`} value={form.p1} onChange={(e) => set('p1', e.target.value)} />
          </Field>
          <Field label="Абзац 2">
            <textarea className={`${inputClass} min-h-24`} value={form.p2} onChange={(e) => set('p2', e.target.value)} />
          </Field>
          <Field label="Абзац 3">
            <textarea className={`${inputClass} min-h-24`} value={form.p3} onChange={(e) => set('p3', e.target.value)} />
          </Field>
          <Field label="Что менять в лоте">
            <textarea className={`${inputClass} min-h-20`} value={form.auctionNote} onChange={(e) => set('auctionNote', e.target.value)} />
          </Field>
        </div>
      </Panel>

      <Panel
        title="JSON в news.ts"
        action={
          <button type="button" className="text-[13px] underline" onClick={() => void copy()}>
            Копировать
          </button>
        }
      >
        <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-muted">{ts}</pre>
      </Panel>
    </div>
  )
}
