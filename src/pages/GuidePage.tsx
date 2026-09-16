import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Magnetic } from '../components/Motion'
import { PageHero } from '../components/PageHero'

const KEY = 'wiaf-guide-ticks'

const steps = [
  {
    min: '0:00',
    t: 'Маршрут и базис',
    d: 'Откуда, куда, адрес в РФ, один завод. EXW или FOB — иначе экспедиторы считают разную работу.',
    fields: [
      ['Откуда', 'Гуанчжоу'],
      ['Куда', 'Москва · Химки'],
      ['Базис', 'EXW'],
      ['Отправитель', 'название фабрики, не «несколько на первом экране»'],
    ],
  },
  {
    min: '1:30',
    t: 'Коробки, кг, м³',
    d: 'Места × Д×Ш×В. Одежда 15–65 м³ — наш размер. Ноль в стоимости груза экспедитору нечем оценить риск.',
    fields: [
      ['Груз', 'Трикотаж'],
      ['ТН ВЭД', '611020'],
      ['Мест / кг / м³', '40 · 15 000 · 28'],
      ['Стоимость груза', 'цифра, не 0'],
    ],
  },
  {
    min: '4:00',
    t: 'Что входит в ставку',
    d: 'Таможня и страховка — галочки, только если они в цене. Иначе потом «а это отдельно».',
    fields: [
      ['Транспорт', 'Наземный / ЖД'],
      ['Загрузка', 'Сборный или 40HC'],
      ['Страховка / ТО', 'только если платит ставка'],
    ],
  },
  {
    min: '6:00',
    t: 'Слот: дата и час',
    d: 'Формат день.месяц.год. Торги 60 минут. Состоялись, только если ставки поставили двое.',
    fields: [
      ['Готовность', '16.09.2026'],
      ['Час торгов', '13:00 МСК'],
      ['Длительность', 'ровно 60 минут'],
    ],
  },
  {
    min: '7:30',
    t: 'Проверить, не сразу в эфир',
    d: 'Кнопка «Проверить» собирает карточку. Публикация — второй шаг. Шаблон можно сохранить.',
    fields: [
      ['Сначала', 'Проверить'],
      ['Потом', 'Поставить в очередь'],
      ['Или', 'Сохранить шаблон'],
    ],
  },
  {
    min: '8:30',
    t: 'Позвать своих трёх',
    d: 'Ссылку на слот — экспедиторам, с которыми уже возили. Без своих час часто пустой. Площадка не холод.',
    fields: [
      ['Кому', 'трое из WhatsApp'],
      ['Текст', '«ставки сюда, час с … до …»'],
      ['Зачем', '≥ 2 игрока, иначе не состоялось'],
    ],
  },
]

function loadTicks(): boolean[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as boolean[]) : []
    return steps.map((_, i) => Boolean(arr[i]))
  } catch {
    return steps.map(() => false)
  }
}

export function GuidePage() {
  const [open, setOpen] = useState(0)
  const [ticks, setTicks] = useState<boolean[]>(loadTicks)
  const done = ticks.filter(Boolean).length
  const step = steps[open]

  const toggle = (i: number) => {
    setTicks((prev) => {
      const next = prev.map((v, idx) => (idx === i ? !v : v))
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <main>
      <PageHero
        kicker="Гид · 10 минут"
        title="Первый лот: от маршрута до «ставки сюда»"
        dek="Не презентация холдинга. Шесть шагов с полями, как в кабинете. Импортёру бесплатно. Процент экономии не обещаем."
      />

      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <p className="font-mono text-[12px] text-mist">
            Отмечено {done} / {steps.length}
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-fog">
            <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${(done / steps.length) * 100}%` }} />
          </div>
          <Magnetic>
            <Link to="/app/login?role=importer" className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-navy-2">
              Открыть кабинет и выложить
            </Link>
          </Magnetic>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[18rem_1fr]">
        <ol className="space-y-1">
          {steps.map((s, i) => (
            <li key={s.t}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  open === i ? 'bg-white ring-1 ring-brand' : 'hover:bg-white'
                }`}
              >
                <span className="w-10 shrink-0 font-mono text-[11px] text-mist">{s.min}</span>
                <span className="flex-1 text-[13.5px] font-medium">{s.t}</span>
                <input
                  type="checkbox"
                  checked={ticks[i]}
                  onChange={() => toggle(i)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Сделано: ${s.t}`}
                />
              </button>
            </li>
          ))}
        </ol>

        <div>
          <article className="rounded-lg border border-line bg-white p-6">
            <p className="font-mono text-[11px] text-brand">
              {step.min} · шаг {open + 1} из {steps.length}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{step.t}</h2>
            <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-muted">{step.d}</p>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {step.fields.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5 text-[13.5px]">
                  <dt className="text-mist">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {open > 0 ? (
                <button type="button" className="rounded-lg border border-line px-3 py-2 text-[13px]" onClick={() => setOpen((n) => n - 1)}>
                  Назад
                </button>
              ) : null}
              {open < steps.length - 1 ? (
                <button
                  type="button"
                  className="rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white"
                  onClick={() => setOpen((n) => n + 1)}
                >
                  Дальше
                </button>
              ) : (
                <Link
                  to="/app/register?role=importer&next=/app/importer/create&guide=1"
                  className="rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white"
                >
                  Зарегистрироваться и выложить
                </Link>
              )}
              <Link
                to="/app/importer/create?guide=1"
                className="rounded-lg border border-line px-3 py-2 text-[13px] font-semibold"
              >
                Уже вошёл — форма с префиллом
              </Link>
            </div>
          </article>

          <aside className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-[13px] font-semibold">Если не позвать своих</p>
              <p className="mt-1 text-[13px] text-muted">Один игрок или ноль — час не состоялся. Письмо директору всё равно уйдёт: «пусто».</p>
              <Link to="/help/svoi-troe" className="mt-2 inline-block text-[13px] text-brand hover:underline">
                Лайфхак
              </Link>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-[13px] font-semibold">Директор — в кабинете</p>
              <p className="mt-1 text-[13px] text-muted">После входа: «Смотреть как» → Директор. Не отдельная регистрация.</p>
              <Link to="/director" className="mt-2 inline-block text-[13px] text-brand hover:underline">
                Как открыть
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
