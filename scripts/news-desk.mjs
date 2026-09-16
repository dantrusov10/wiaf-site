/**
 * Локальный движок дайджеста wIaF.
 * Чужой HTML/RSS не копируем в прод. Берём title + url + дату + короткий snippet,
 * фильтруем по ЦА, пишем черновик JSON. Текст статьи пишет человек/ИИ по промпту.
 *
 *   node scripts/news-desk.mjs
 *   node scripts/news-desk.mjs --url "https://example.com/item"
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src', 'content', 'news-drafts')

const FEEDS = [
  { name: 'ФТС пресс-центр', url: 'https://customs.gov.ru/press/federal/rss' },
  { name: 'Альта RSS', url: 'https://www.alta.ru/rss/' },
  { name: 'Альта новости', url: 'https://www.alta.ru/rss/news/' },
]

const KEYWORDS = [
  'кита',
  'одежд',
  'трикотаж',
  'куртк',
  'тамож',
  'маркиров',
  'честн',
  'контейнер',
  'сборн',
  'гуанчжоу',
  'инкотерм',
  'вэд',
  'еаэ',
  'гтд',
  'свх',
  'импорт',
  'фрахт',
  'забайкал',
  'тн вэд',
  'пошлин',
  'сертиф',
  'карго',
  'маркетплейс',
  'wildberries',
  'ozon',
  'логист',
  'перевоз',
]

const STOP = [
  'ваканс',
  'курсы англий',
  'крипт',
  'forex',
  'казино',
  'багаж',
  'пассажир',
  'аэропорт',
  'ручной клад',
  'ящериц',
  'скрипк',
  'сигаре',
  'табачн',
  'слитк',
  'турист',
  'затруднен',
  'диасофт',
  'альта-гтд',
  'все посты',
  'субд',
]

function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function itemsFromRss(xml) {
  const blocks = xml.split(/<item[\s>]/i).slice(1)
  return blocks
    .map((block) => {
      const title = decode((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(block) || [])[1] || '')
      const link = decode(
        (/<link[^>]*>([\s\S]*?)<\/link>/i.exec(block) || [])[1] ||
          (/<guid[^>]*>([\s\S]*?)<\/guid>/i.exec(block) || [])[1] ||
          '',
      )
      const date = decode(
        (/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i.exec(block) || [])[1] ||
          (/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i.exec(block) || [])[1] ||
          '',
      )
      const raw =
        (/<description[^>]*>([\s\S]*?)<\/description>/i.exec(block) || [])[1] ||
        (/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i.exec(block) || [])[1] ||
        ''
      const snippet = decode(raw).slice(0, 240)
      return { title, link, date, snippet }
    })
    .filter((i) => i.title && i.link)
}

function score(item) {
  const t = `${item.title} ${item.snippet}`.toLowerCase()
  if (STOP.some((s) => t.includes(s))) return 0
  let n = 0
  for (const k of KEYWORDS) if (t.includes(k)) n += 1
  if (t.includes('кита') && (t.includes('росс') || t.includes('рф') || t.includes('моск'))) n += 2
  if (t.includes('одежд') || t.includes('лёгк') || t.includes('легк')) n += 2
  return n
}

function slugify(title) {
  const map = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'j',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  }
  const s = title
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return s || `draft-${Date.now()}`
}

function promptFor(item, sourceName) {
  return [
    'Напиши дайджест wIaF по факту ниже. Не копируй чужие абзацы.',
    'Голос: деловой, без «экономии 20%», без миллионных оборотов.',
    'Структура JSON Digest:',
    '- title: своя формулировка, не заголовок источника',
    '- dek: 1 предложение',
    '- topics: 2–4 тега из [ставки, таможня, маркировка, Китай–Москва, карго, одежда]',
    '- why: зачем это заказчику 15–65 м³ или экспедитору на этом плече',
    '- paragraphs: ровно 3 абзаца своими словами',
    '- auctionNote: что явно поставить в ТЗ лота',
    '- source.name / source.url / source.date — как в факте',
    '',
    `Источник: ${sourceName}`,
    `URL: ${item.link}`,
    `Дата: ${item.date || 'указать с страницы'}`,
    `Заголовок источника: ${item.title}`,
    `Короткий сниппет (не цитировать целиком): ${item.snippet}`,
  ].join('\n')
}

function toDraft(item, sourceName) {
  const slug = slugify(item.title)
  return {
    slug,
    status: 'needs-rewrite',
    score: item.score,
    source: { name: sourceName, url: item.link, date: item.date || '' },
    sourceTitle: item.title,
    snippet: item.snippet,
    published: new Date().toISOString().slice(0, 10),
    title: '',
    dek: '',
    topics: [],
    why: '',
    paragraphs: [],
    auctionNote: '',
    prompt: promptFor(item, sourceName),
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'wiaf-news-desk/1.0 (local editorial; +https://wiaf.ru)' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}

function pageMeta(html, url) {
  const title = decode((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || url)
  const desc = decode(
    (/property="og:description"[^>]*content="([^"]+)"/i.exec(html) || [])[1] ||
      (/name="description"[^>]*content="([^"]+)"/i.exec(html) || [])[1] ||
      '',
  )
  return {
    title: title.slice(0, 180),
    link: url,
    date: '',
    snippet: desc.slice(0, 240),
  }
}

async function main() {
  mkdirSync(outDir, { recursive: true })
  const args = process.argv.slice(2)
  const urlIdx = args.indexOf('--url')
  const single = urlIdx >= 0 ? args[urlIdx + 1] : null
  const collected = []

  if (single) {
    const html = await fetchText(single)
    const item = pageMeta(html, single)
    item.score = score(item)
    collected.push({ item, sourceName: new URL(single).hostname })
  } else {
    for (const feed of FEEDS) {
      try {
        const xml = await fetchText(feed.url)
        const items = itemsFromRss(xml)
          .map((i) => ({ ...i, score: score(i) }))
          .filter((i) => i.score >= 2)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
        for (const item of items) collected.push({ item, sourceName: feed.name })
        console.log(`ok  ${feed.name}: ${items.length} после фильтра`)
      } catch (err) {
        console.log(`skip ${feed.name}: ${err.message}`)
      }
    }
  }

  collected.sort((a, b) => b.item.score - a.item.score)
  if (!collected.length) {
    console.log('Пусто. Сеть/RSS могли не ответить — вставьте URL: node scripts/news-desk.mjs --url "…"')
    return
  }

  const index = []
  for (const { item, sourceName } of collected) {
    const draft = toDraft(item, sourceName)
    const file = join(outDir, `${draft.slug}.json`)
    writeFileSync(file, JSON.stringify(draft, null, 2), 'utf8')
    index.push({ slug: draft.slug, score: draft.score, source: sourceName, title: item.title })
    console.log(`${draft.score}\t${sourceName}\t${item.title}`)
  }
  writeFileSync(join(outDir, '_index.json'), JSON.stringify({ at: new Date().toISOString(), items: index }, null, 2))
  console.log(`\nЧерновики: ${outDir}`)
  console.log('Дальше: http://localhost:5173/app/news-desk — вставить 3 абзаца, не копипаст.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
