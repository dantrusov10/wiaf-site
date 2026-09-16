import type { CheckoFlag, CheckoLight, CheckoReport, CheckoRow, CheckoShelf, CheckoTone } from '../src/checko/types.ts'
import { DEMO_INNS } from '../src/checko/types.ts'

type AnyRec = Record<string, unknown>

function asRec(v: unknown): AnyRec | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as AnyRec) : null
}

function str(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function money(n: unknown): string {
  const x = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(x)) return '—'
  return `${x.toLocaleString('ru-RU')} ₽`
}

function worse(a: CheckoTone, b: CheckoTone): CheckoTone {
  const rank: Record<CheckoTone, number> = { bad: 3, warn: 2, ok: 1, neutral: 0 }
  return rank[a] >= rank[b] ? a : b
}

function shelfTone(rows: CheckoRow[]): CheckoTone {
  return rows.reduce<CheckoTone>((acc, r) => worse(acc, r.tone), 'neutral')
}

function countTones(shelves: CheckoShelf[]) {
  const counts = { ok: 0, warn: 0, bad: 0, neutral: 0 }
  for (const s of shelves) for (const r of s.rows) counts[r.tone] += 1
  return counts
}

/** Ключи, где true = плохо / подозрительно */
const BAD_IF_TRUE = new Set([
  'Недост',
  'МассРуковод',
  'МассУчред',
  'ДисквЛицо',
  'ДисквЛица',
  'НедобПост',
  'НелегалФин',
  'Санкции',
  'СанкцУчр',
  'Недобросов',
  'Банкрот',
  'Ликвидация',
])

const WARN_IF_TRUE = new Set(['МассАдрес'])

function toneFor(key: string, value: unknown, path: string): { tone: CheckoTone; hint?: string } {
  const full = `${path}.${key}`

  if (key === 'Наим' && /Статус/i.test(path)) {
    const t = str(value)
    if (/действует/i.test(t)) return { tone: 'ok', hint: 'хорошо' }
    if (t) return { tone: 'bad', hint: 'плохо — не действует' }
  }

  if (typeof value === 'boolean') {
    if (BAD_IF_TRUE.has(key)) {
      return value
        ? { tone: 'bad', hint: 'плохо' }
        : { tone: 'ok', hint: 'хорошо — признака нет' }
    }
    if (WARN_IF_TRUE.has(key) || key.startsWith('Масс')) {
      return value
        ? { tone: 'warn', hint: 'подозрительно' }
        : { tone: 'ok', hint: 'хорошо — признака нет' }
    }
    return { tone: 'neutral' }
  }

  if (key === 'МассАдрес' && Array.isArray(value)) {
    return value.length
      ? { tone: 'warn', hint: `подозрительно — ${value.length} связей` }
      : { tone: 'ok', hint: 'хорошо' }
  }

  if (/ДатаРег|ДатаОГРН/.test(key) && typeof value === 'string') {
    const age = (Date.now() - new Date(value).getTime()) / 86400000
    if (Number.isFinite(age) && age < 90) return { tone: 'warn', hint: 'подозрительно — младше 90 дней' }
    if (Number.isFinite(age) && age < 365) return { tone: 'warn', hint: 'моложе года' }
  }

  if (/СумНедоим|Недоим/.test(key) && (typeof value === 'number' ? value > 0 : false)) {
    return { tone: 'bad', hint: 'плохо — недоимка' }
  }

  // Счётчики арбитража / ФССП
  if (
    typeof value === 'number' &&
    value > 0 &&
    (/Ответчик|Истец|Всего|Сумм|дел|произв|ФССП|Исп/i.test(key) || /legal|enforc|case/i.test(full))
  ) {
    return { tone: 'warn', hint: 'подозрительно — есть дела/суммы' }
  }

  return { tone: 'neutral' }
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'да' : 'нет'
  if (typeof v === 'number') return Number.isFinite(v) ? v.toLocaleString('ru-RU') : String(v)
  if (typeof v === 'string') return v
  if (Array.isArray(v)) {
    if (!v.length) return 'пусто'
    if (v.every((x) => typeof x !== 'object' || x === null)) return v.map((x) => formatValue(x)).join(', ')
    return `[${v.length}]`
  }
  return '…'
}

/** Рекурсивно — все поля объекта в строки с тоном. */
function flattenRows(obj: unknown, path: string, out: CheckoRow[], depth = 0) {
  if (depth > 8) return
  if (obj === null || obj === undefined) {
    out.push({ label: path || 'значение', value: '—', tone: 'neutral' })
    return
  }
  if (typeof obj !== 'object') {
    const key = path.split('.').pop() || path
    const { tone, hint } = toneFor(key, obj, path)
    out.push({ label: path, value: formatValue(obj), tone, toneHint: hint })
    return
  }
  if (Array.isArray(obj)) {
    if (!obj.length) {
      const key = path.split('.').pop() || path
      const emptyTone: CheckoTone =
        BAD_IF_TRUE.has(key) || WARN_IF_TRUE.has(key) || key.startsWith('Масс') || /Санкц|Дискв|Недоб|ЕФРСБ|Лиценз/.test(key)
          ? 'ok'
          : 'neutral'
      out.push({
        label: path,
        value: 'пусто',
        tone: emptyTone,
        toneHint: emptyTone === 'ok' ? 'хорошо — список пуст' : undefined,
      })
      return
    }
    obj.forEach((item, i) => {
      if (item && typeof item === 'object') flattenRows(item, `${path}[${i}]`, out, depth + 1)
      else {
        const { tone, hint } = toneFor(`[${i}]`, item, path)
        out.push({ label: `${path}[${i}]`, value: formatValue(item), tone, toneHint: hint })
      }
    })
    return
  }

  const rec = obj as AnyRec
  for (const [k, v] of Object.entries(rec)) {
    const next = path ? `${path} · ${k}` : k
    if (v && typeof v === 'object') {
      if (Array.isArray(v) && v.length && v.every((x) => typeof x !== 'object' || x === null)) {
        const { tone, hint } = toneFor(k, v, path)
        out.push({ label: next, value: formatValue(v), tone, toneHint: hint })
      } else if (Array.isArray(v) && !v.length) {
        const emptyTone: CheckoTone =
          BAD_IF_TRUE.has(k) || WARN_IF_TRUE.has(k) || k.startsWith('Масс') || /Санкц|Дискв|Недоб|ЕФРСБ/.test(k)
            ? 'ok'
            : 'neutral'
        out.push({
          label: next,
          value: 'пусто',
          tone: emptyTone,
          toneHint: emptyTone === 'ok' ? 'хорошо — список пуст' : undefined,
        })
      } else if (!Array.isArray(v) && Object.keys(v as object).length === 0) {
        out.push({ label: next, value: 'пусто', tone: 'neutral' })
      } else {
        flattenRows(v, next, out, depth + 1)
      }
    } else {
      const { tone, hint } = toneFor(k, v, path)
      let display = formatValue(v)
      if ((k === 'Сумма' || /Сумм|Номинал|Кап/.test(k)) && typeof v === 'number') display = money(v)
      out.push({ label: next, value: display, tone, toneHint: hint })
    }
  }
}

function shelfFromObject(id: string, title: string, data: unknown): CheckoShelf {
  const rows: CheckoRow[] = []
  flattenRows(data, '', rows)
  // убрать пустой префикс « · »
  const cleaned = rows.map((r) => ({
    ...r,
    label: r.label.replace(/^\s·\s/, '').replace(/^ · /, '') || title,
  }))
  return { id, title, tone: shelfTone(cleaned), rows: cleaned.length ? cleaned : [{ label: title, value: 'нет данных', tone: 'neutral' }] }
}

function riskShelf(d: AnyRec): CheckoShelf {
  const keys: { key: string; title: string; badLevel: 'bad' | 'warn' }[] = [
    { key: 'НедобПост', title: 'Недобросовестный поставщик (РНП)', badLevel: 'bad' },
    { key: 'ДисквЛица', title: 'Дисквалифицированные лица', badLevel: 'bad' },
    { key: 'МассРуковод', title: 'Массовый руководитель (флаг компании)', badLevel: 'warn' },
    { key: 'МассУчред', title: 'Массовый учредитель (флаг компании)', badLevel: 'warn' },
    { key: 'НелегалФин', title: 'Нелегальное финансирование', badLevel: 'bad' },
    { key: 'Санкции', title: 'Санкции', badLevel: 'bad' },
    { key: 'СанкцУчр', title: 'Санкции у учредителей', badLevel: 'bad' },
  ]
  const rows: CheckoRow[] = keys.map(({ key, title, badLevel }) => {
    const v = d[key]
    if (v === true) return { label: title, value: 'да', tone: badLevel, toneHint: badLevel === 'bad' ? 'плохо' : 'подозрительно' }
    if (v === false) return { label: title, value: 'нет', tone: 'ok', toneHint: 'хорошо' }
    return { label: title, value: v === undefined ? 'нет в ответе' : formatValue(v), tone: 'neutral' }
  })

  const addr = asRec(d['ЮрАдрес'])
  if (addr) {
    rows.push(
      addr['Недост'] === true
        ? { label: 'Недостоверный юрадрес', value: 'да', tone: 'bad', toneHint: 'плохо' }
        : { label: 'Недостоверный юрадрес', value: 'нет', tone: 'ok', toneHint: 'хорошо' },
    )
    const mass = addr['МассАдрес']
    if (Array.isArray(mass) && mass.length) {
      rows.push({
        label: 'Массовый адрес (связанные ОГРН)',
        value: mass.map(str).join(', '),
        tone: 'warn',
        toneHint: 'подозрительно',
      })
    } else {
      rows.push({ label: 'Массовый адрес', value: 'нет списка', tone: 'ok', toneHint: 'хорошо' })
    }
  }

  const status = asRec(d['Статус'])
  const statusName = str(status?.['Наим'])
  const active = str(status?.['Код']) === '001' || /действует/i.test(statusName)
  rows.unshift({
    label: 'Статус ЕГРЮЛ',
    value: statusName || '—',
    tone: active ? 'ok' : 'bad',
    toneHint: active ? 'хорошо' : 'плохо',
  })

  const reg = str(d['ДатаРег'])
  if (reg) {
    const age = (Date.now() - new Date(reg).getTime()) / 86400000
    rows.push({
      label: 'Возраст компании',
      value: `${reg} · ${Math.floor(age)} дн.`,
      tone: age < 90 ? 'warn' : age < 365 ? 'warn' : 'ok',
      toneHint: age < 90 ? 'подозрительно — младше 90 дней' : age < 365 ? 'моложе года' : 'ок',
    })
  }

  return { id: 'risks', title: 'Светофор рисков (сводка)', tone: shelfTone(rows), rows }
}

function scoreFromFlags(flags: CheckoFlag[], active: boolean): {
  light: CheckoLight
  lightLabel: string
  canRegister: boolean
  hint?: string
} {
  const hasBad = flags.some((f) => f.level === 'bad') || !active
  const hasWarn = flags.some((f) => f.level === 'warn')
  if (hasBad) {
    return {
      light: 'red',
      lightLabel: 'Красный — существенные риски / не действует',
      canRegister: false,
      hint: !active ? 'Статус не «Действует»' : 'Есть критические факторы',
    }
  }
  if (hasWarn) {
    return {
      light: 'yellow',
      lightLabel: 'Жёлтый — есть подозрительные признаки',
      canRegister: true,
      hint: 'Можно регистрировать, но смотрите жёлтые строки',
    }
  }
  return {
    light: 'green',
    lightLabel: 'Зелёный — явных стоп-факторов нет',
    canRegister: true,
  }
}

function buildFlags(d: AnyRec): { flags: CheckoFlag[]; active: boolean } {
  const flags: CheckoFlag[] = []
  const status = asRec(d['Статус'])
  const statusName = str(status?.['Наим']) || 'неизвестно'
  const active = str(status?.['Код']) === '001' || /действует/i.test(statusName)
  flags.push({
    id: 'status',
    level: active ? 'ok' : 'bad',
    title: active ? 'Статус: действует' : 'Не действует',
    detail: statusName,
  })

  const risk = riskShelf(d)
  for (const r of risk.rows) {
    if (r.tone === 'bad') flags.push({ id: `b-${r.label}`, level: 'bad', title: r.label, detail: r.value })
    if (r.tone === 'warn') flags.push({ id: `w-${r.label}`, level: 'warn', title: r.label, detail: r.value })
  }

  const leaders = Array.isArray(d['Руковод']) ? d['Руковод'] : []
  for (const raw of leaders) {
    const p = asRec(raw)
    if (!p) continue
    if (p['ДисквЛицо'] === true) flags.push({ id: 'dir-d', level: 'bad', title: 'Руководитель дисквалифицирован', detail: str(p['ФИО']) })
    if (p['МассРуковод'] === true) flags.push({ id: 'dir-m', level: 'warn', title: 'Массовый руководитель', detail: str(p['ФИО']) })
    if (p['Недост'] === true) flags.push({ id: 'dir-n', level: 'warn', title: 'Недостоверные сведения о руководителе', detail: str(p['ФИО']) })
  }

  return { flags, active }
}

function demoReport(inn: string): CheckoReport {
  const shelves: CheckoShelf[] = [
    {
      id: 'demo',
      title: 'Демо localhost',
      tone: 'ok',
      rows: [
        { label: 'ИНН', value: inn, tone: 'neutral' },
        { label: 'Источник', value: 'seedStore · Checko не вызывали', tone: 'ok', toneHint: 'хорошо для теста' },
      ],
    },
  ]
  return {
    ok: true,
    inn,
    kind: 'demo',
    light: 'demo',
    lightLabel: 'Тестовый ИНН localhost',
    canRegister: true,
    registerHint: 'Демо: без расхода лимита Checko. Seed-учётки на месте.',
    companyShort: 'Демо-компания',
    companyFull: 'Тестовая учётка localhost',
    statusName: 'Демо',
    flags: [{ id: 'demo', level: 'ok', title: 'Локальный тестовый ИНН' }],
    counts: countTones(shelves),
    shelves,
    checkedAt: new Date().toISOString(),
  }
}

async function checkoGet(apiKey: string, path: string, inn: string): Promise<AnyRec | null> {
  const url = `https://api.checko.ru/v2/${path}?key=${encodeURIComponent(apiKey)}&inn=${encodeURIComponent(inn)}&limit=50`
  const res = await fetch(url)
  if (!res.ok) return null
  return (await res.json()) as AnyRec
}

const TOP_LEVEL_SHELF_TITLES: Record<string, string> = {
  ОГРН: 'Идентификаторы',
  ИНН: 'Идентификаторы',
  КПП: 'Идентификаторы',
  ОКПО: 'Идентификаторы',
  ДатаРег: 'Идентификаторы',
  ДатаОГРН: 'Идентификаторы',
  НаимСокр: 'Идентификаторы',
  НаимАнгл: 'Идентификаторы',
  НаимПолн: 'Идентификаторы',
  Статус: 'Статус',
  Регион: 'Адрес',
  ЮрАдрес: 'Адрес',
  ОКВЭД: 'Деятельность',
  ОКВЭДДоп: 'Деятельность',
  ОКОПФ: 'Классификаторы',
  ОКФС: 'Классификаторы',
  ОКОГУ: 'Классификаторы',
  ОКАТО: 'Классификаторы',
  ОКТМО: 'Классификаторы',
  РегФНС: 'ФНС / фонды',
  ТекФНС: 'ФНС / фонды',
  РегПФР: 'ФНС / фонды',
  РегФСС: 'ФНС / фонды',
  УстКап: 'Капитал',
  УпрОрг: 'Управление',
  Руковод: 'Руководство',
  Учред: 'Учредители',
  СвязУпрОрг: 'Связи',
  СвязУчред: 'Связи',
  ДержРеестрАО: 'Прочее',
  Лиценз: 'Лицензии',
  ТоварЗнак: 'Товарные знаки',
  Подразд: 'Подразделения',
  Правопредш: 'Правопреемство',
  Правопреем: 'Правопреемство',
  ДатаВып: 'Выписка',
  Контакты: 'Контакты',
  Налоги: 'Налоги',
  РМСП: 'МСП',
  ПоддержМСП: 'МСП',
  СЧР: 'Штат',
  СЧРГод: 'Штат',
  ЕФРСБ: 'Банкротство / ЕФРСБ',
  НедобПост: 'Риск-флаги',
  ДисквЛица: 'Риск-флаги',
  МассРуковод: 'Риск-флаги',
  МассУчред: 'Риск-флаги',
  НелегалФин: 'Риск-флаги',
  Санкции: 'Риск-флаги',
  СанкцУчр: 'Риск-флаги',
  ФИО: 'ИП',
  ОГРНИП: 'ИП',
}

function groupCompanyIntoShelves(d: AnyRec): CheckoShelf[] {
  const buckets = new Map<string, AnyRec>()
  for (const [k, v] of Object.entries(d)) {
    const title = TOP_LEVEL_SHELF_TITLES[k] || 'Прочие поля ЕГРЮЛ'
    const bucket = buckets.get(title) ?? {}
    bucket[k] = v
    buckets.set(title, bucket)
  }
  const order = [
    'Статус',
    'Идентификаторы',
    'Адрес',
    'Деятельность',
    'Капитал',
    'Руководство',
    'Учредители',
    'Управление',
    'Связи',
    'ФНС / фонды',
    'Налоги',
    'МСП',
    'Штат',
    'Контакты',
    'Классификаторы',
    'Лицензии',
    'Товарные знаки',
    'Подразделения',
    'Правопреемство',
    'Банкротство / ЕФРСБ',
    'Риск-флаги',
    'Выписка',
    'ИП',
    'Прочие поля ЕГРЮЛ',
  ]
  const shelves: CheckoShelf[] = []
  for (const title of order) {
    const bucket = buckets.get(title)
    if (!bucket) continue
    shelves.push(shelfFromObject(title, title, bucket))
  }
  for (const [title, bucket] of buckets) {
    if (!order.includes(title)) shelves.push(shelfFromObject(title, title, bucket))
  }
  return shelves
}

export async function lookupInn(apiKey: string, rawInn: string): Promise<CheckoReport> {
  const inn = rawInn.replace(/\D/g, '')
  const empty = (partial: Partial<CheckoReport>): CheckoReport => ({
    ok: false,
    inn,
    kind: 'company',
    light: 'unknown',
    lightLabel: 'Не проверено',
    canRegister: false,
    companyShort: '',
    companyFull: '',
    statusName: '',
    flags: [],
    counts: { ok: 0, warn: 0, bad: 0, neutral: 0 },
    shelves: [],
    checkedAt: new Date().toISOString(),
    ...partial,
  })

  if (!(inn.length === 10 || inn.length === 12)) {
    return empty({ error: 'ИНН: 10 цифр (ЮЛ) или 12 (ИП)', light: 'unknown', canRegister: false })
  }
  if (DEMO_INNS.has(inn)) return demoReport(inn)

  const kind = inn.length === 12 ? 'entrepreneur' : 'company'
  const path = kind === 'company' ? 'company' : 'entrepreneur'
  const main = await checkoGet(apiKey, path, inn)
  const meta = asRec(main?.['meta'])

  if (!main || str(meta?.['status']) === 'error' || !asRec(main['data'])) {
    return empty({
      ok: false,
      error: str(main?.['message']) || str(meta?.['message']) || 'Checko: ИНН не найден',
      kind,
      light: 'red',
      lightLabel: 'Не найден',
      canRegister: false,
      registerHint: 'Проверьте ИНН в ЕГРЮЛ / ЕГРИП',
      statusName: 'не найден',
      flags: [{ id: 'nf', level: 'bad', title: 'Нет в реестре Checko' }],
      meta: { todayRequestCount: Number(meta?.['today_request_count']) || undefined, balance: Number(meta?.['balance']) },
    })
  }

  const data = asRec(main['data'])!

  const extras =
    kind === 'company'
      ? await Promise.all([
          checkoGet(apiKey, 'legal-cases', inn),
          checkoGet(apiKey, 'inspections', inn),
          checkoGet(apiKey, 'enforcements', inn),
          checkoGet(apiKey, 'finances', inn),
        ])
      : [null, null, null, null]

  const [cases, inspections, enforcements, finances] = extras
  const { flags, active } = buildFlags(data)
  // scored later after court/fssp flags

  const shelves: CheckoShelf[] = [riskShelf(data), ...groupCompanyIntoShelves(data)]

  if (cases) shelves.push(shelfFromObject('legal-cases', 'Арбитражные дела (весь ответ Checko)', cases))
  if (inspections) shelves.push(shelfFromObject('inspections', 'Проверки Генпрокуратуры (весь ответ)', inspections))
  if (enforcements) shelves.push(shelfFromObject('enforcements', 'Исполнительные производства ФССП (весь ответ)', enforcements))
  if (finances) shelves.push(shelfFromObject('finances', 'Финансы / отчётность (весь ответ)', finances))

  // Подтянуть warn из счётчиков судов в общий light уже через flags — добавим если есть ненулевые числа в cases
  const caseData = asRec(cases?.['data'])
  if (caseData) {
    for (const [k, v] of Object.entries(caseData)) {
      if (typeof v === 'number' && v > 0 && /Ответчик|Сумм|Всего/i.test(k)) {
        flags.push({ id: `case-${k}`, level: 'warn', title: `Арбитраж: ${k}`, detail: String(v) })
      }
    }
  }
  const enfData = asRec(enforcements?.['data'])
  if (enfData) {
    for (const [k, v] of Object.entries(enfData)) {
      if (typeof v === 'number' && v > 0) {
        flags.push({ id: `enf-${k}`, level: 'warn', title: `ФССП: ${k}`, detail: String(v) })
      }
    }
  }
  const rescored = scoreFromFlags(flags, active)

  const companyShort = str(data['НаимСокр']) || str(data['ФИО']) || str(data['НаимПолн'])
  const companyFull = str(data['НаимПолн']) || companyShort
  const director = Array.isArray(data['Руковод'])
    ? str(asRec((data['Руковод'] as unknown[])[0])?.['ФИО'])
    : str(data['ФИО']) || undefined

  return {
    ok: true,
    inn,
    kind,
    light: rescored.light,
    lightLabel: rescored.lightLabel,
    canRegister: rescored.canRegister,
    registerHint: rescored.hint,
    companyShort,
    companyFull,
    statusName: str(asRec(data['Статус'])?.['Наим']) || '—',
    registeredAt: str(data['ДатаРег']) || undefined,
    director: director || undefined,
    address: str(asRec(data['ЮрАдрес'])?.['АдресРФ']) || undefined,
    flags,
    counts: countTones(shelves),
    shelves,
    meta: {
      todayRequestCount: Number(meta?.['today_request_count']) || undefined,
      balance: Number(meta?.['balance']),
    },
    checkedAt: new Date().toISOString(),
  }
}
