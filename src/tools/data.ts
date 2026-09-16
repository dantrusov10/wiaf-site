/** Справочники для инструментов. Ставки ориентировочные — не оферта ФТС. */

export type HsCode = {
  code: string
  name: string
  dutyPct: number
  vatPct: number
  note?: string
}

/** Топ кодов под одежду / потреб для демо. Уточняет брокер. */
export const hsCodes: HsCode[] = [
  { code: '6109 10 000 0', name: 'Футболки трикотажные, х/б', dutyPct: 10, vatPct: 22 },
  { code: '6109 90 200 0', name: 'Футболки трикотажные, прочие', dutyPct: 10, vatPct: 22 },
  { code: '6110 30 910 0', name: 'Свитеры / джемперы, синтетика', dutyPct: 10, vatPct: 22 },
  { code: '6203 42 310 0', name: 'Брюки мужские, х/б', dutyPct: 10, vatPct: 22 },
  { code: '6204 62 310 0', name: 'Брюки женские, х/б', dutyPct: 10, vatPct: 22 },
  { code: '6205 20 000 0', name: 'Рубашки мужские, х/б', dutyPct: 10, vatPct: 22 },
  { code: '6402 99 910 0', name: 'Обувь с верхом из резины/пластика', dutyPct: 10, vatPct: 22, note: 'Часто доп. условия по маркировке' },
  { code: '4202 92 190 0', name: 'Сумки / рюкзаки текстильные', dutyPct: 10, vatPct: 22 },
  { code: '9503 00 950 0', name: 'Игрушки прочие', dutyPct: 5, vatPct: 22 },
  { code: '3924 10 000 0', name: 'Посуда / кухня из пластмасс', dutyPct: 6.5, vatPct: 22 },
]

export type ContainerType = {
  id: string
  name: string
  /** Практический полезный объём, м³ */
  cbm: number
  maxKg: number
  innerL: number
  innerW: number
  innerH: number
}

export const containers: ContainerType[] = [
  { id: '20dc', name: '20′ DC', cbm: 28, maxKg: 21700, innerL: 5.9, innerW: 2.35, innerH: 2.39 },
  { id: '40dc', name: '40′ DC', cbm: 58, maxKg: 26700, innerL: 12.03, innerW: 2.35, innerH: 2.39 },
  { id: '40hc', name: '40′ HC', cbm: 68, maxKg: 26500, innerL: 12.03, innerW: 2.35, innerH: 2.69 },
  { id: '45hc', name: '45′ HC', cbm: 78, maxKg: 25800, innerL: 13.56, innerW: 2.35, innerH: 2.69 },
]

export type Incoterm = {
  code: string
  title: string
  mode: string
  risk: string
  buyerPays: string[]
  sellerPays: string[]
  trap: string
}

export const incoterms: Incoterm[] = [
  {
    code: 'EXW',
    title: 'Ex Works',
    mode: 'Любой',
    risk: 'На складе продавца',
    sellerPays: ['Товар на своём складе'],
    buyerPays: ['Погрузка', 'Экспорт', 'Фрахт', 'Страховка', 'Импорт', 'Доставка по РФ'],
    trap: '«EXW дверь» в чате часто значит, что погрузку всё равно ждёт покупатель — уточняйте письменно.',
  },
  {
    code: 'FCA',
    title: 'Free Carrier',
    mode: 'Любой',
    risk: 'После передачи перевозчику покупателя',
    sellerPays: ['Довоз до перевозчика', 'Экспортное оформление (обычно)'],
    buyerPays: ['Основной фрахт', 'Страховка', 'Импорт', 'Доставка по РФ'],
    trap: 'Важно указать пункт передачи (склад / терминал), иначе спорят, кто грузил.',
  },
  {
    code: 'FOB',
    title: 'Free On Board',
    mode: 'Море / река',
    risk: 'На борту судна в порту отгрузки',
    sellerPays: ['До порта', 'Погрузка на судно', 'Экспорт'],
    buyerPays: ['Морской фрахт', 'Страховка', 'Импорт', 'Доставка'],
    trap: 'Для ж/д и авто FOB формально не тот базис — берите FCA.',
  },
  {
    code: 'CIF',
    title: 'Cost, Insurance and Freight',
    mode: 'Море / река',
    risk: 'На борту в порту отгрузки (не в порту назначения!)',
    sellerPays: ['Фрахт до порта назначения', 'Минимальная страховка'],
    buyerPays: ['Выгрузка / THC по условиям', 'Импорт', 'Доставка по РФ'],
    trap: 'Риск переходит рано; страховка у продавца часто минимальная — проверьте покрытие.',
  },
  {
    code: 'CFR',
    title: 'Cost and Freight',
    mode: 'Море / река',
    risk: 'На борту в порту отгрузки',
    sellerPays: ['Фрахт до порта назначения'],
    buyerPays: ['Страховка', 'Импорт', 'Доставка'],
    trap: 'Похоже на CIF, но страховки нет — покупатель страхует сам.',
  },
  {
    code: 'DAP',
    title: 'Delivered At Place',
    mode: 'Любой',
    risk: 'В согласованном месте в стране покупателя до разгрузки',
    sellerPays: ['Почти вся логистика до места'],
    buyerPays: ['Импортные платежи и оформление', 'Разгрузка'],
    trap: 'Таможню платит покупатель — это не «под ключ».',
  },
  {
    code: 'DDP',
    title: 'Delivered Duty Paid',
    mode: 'Любой',
    risk: 'В месте назначения, пошлины уплачены продавцом',
    sellerPays: ['Фрахт', 'Импорт', 'Пошлины/НДС (как договорено)', 'Довоз'],
    buyerPays: ['Обычно только разгрузка'],
    trap: 'Дорого и сложно для продавца из КНР; проверяйте, кто реально импортёр по документам.',
  },
  {
    code: 'FAS',
    title: 'Free Alongside Ship',
    mode: 'Море',
    risk: 'У борта судна в порту отгрузки',
    sellerPays: ['Довоз до причала'],
    buyerPays: ['Погрузка', 'Фрахт', 'Импорт'],
    trap: 'Реже в одежде; путают с FOB.',
  },
]

export type TransitLane = {
  id: string
  mode: string
  from: string
  to: string
  daysMin: number
  daysMax: number
  note: string
}

export const transitLanes: TransitLane[] = [
  { id: 'sea-fcl', mode: 'Море FCL', from: 'Шанхай / Нинбо', to: 'Владивосток → Москва', daysMin: 35, daysMax: 48, note: 'Порт + ж/д или авто по РФ' },
  { id: 'sea-lcl', mode: 'Море LCL', from: 'Южный Китай', to: 'Москва', daysMin: 40, daysMax: 55, note: 'Сборный — дольше консолидация' },
  { id: 'rail', mode: 'Ж/д контейнер', from: 'Чунцин / Сиань / Чжэнчжоу', to: 'Москва / подмосковные ТЛЦ', daysMin: 18, daysMax: 28, note: 'Пик сезона растягивает' },
  { id: 'auto', mode: 'Авто', from: 'Гуанчжоу / Иу', to: 'Москва', daysMin: 20, daysMax: 32, note: 'Зависит от границ и загрузок' },
  { id: 'air', mode: 'Авиа', from: 'PVG / CAN', to: 'SVO / DME', daysMin: 5, daysMax: 12, note: 'Дорого; плюс таможня и довоз' },
]

export type ChinaHoliday = {
  id: string
  name: string
  start: string
  end: string
  tip: string
}

/** Ориентиры 2026 для планировщика (уточнять ежегодно). */
export const chinaHolidays2026: ChinaHoliday[] = [
  { id: 'cny', name: 'Китайский Новый год', start: '2026-02-15', end: '2026-02-23', tip: 'Фабрики встают раньше и дольше; груз «до НГ» бронируйте за 4–6 недель.' },
  { id: 'qingming', name: 'Цинмин', start: '2026-04-04', end: '2026-04-06', tip: 'Короткое окно; влияет на порт и фуры.' },
  { id: 'labor', name: 'Праздник труда', start: '2026-05-01', end: '2026-05-05', tip: 'Пик вывоза до каникул.' },
  { id: 'dragon', name: 'Праздник драконьих лодок', start: '2026-06-19', end: '2026-06-21', tip: 'Локальные простои.' },
  { id: 'midautumn', name: 'Середина осени', start: '2026-09-25', end: '2026-09-27', tip: 'Часто стыкуется с соседними выходными.' },
  { id: 'golden', name: 'Золотая неделя (Нац. день)', start: '2026-10-01', end: '2026-10-07', tip: 'Второй по силе простой после НГ.' },
]

export const docChecklist = [
  { id: 'contract', title: 'Внешнеторговый контракт', when: 'Почти всегда', side: 'Оба' },
  { id: 'invoice', title: 'Коммерческий инвойс', when: 'Всегда', side: 'Продавец' },
  { id: 'packing', title: 'Упаковочный лист (packing list)', when: 'Всегда', side: 'Продавец' },
  { id: 'bl', title: 'Коносамент / жд накладная / AWB', when: 'По виду транспорта', side: 'Перевозчик' },
  { id: 'export', title: 'Экспортная декларация КНР', when: 'Экспорт из Китая', side: 'Продавец / агент' },
  { id: 'dt', title: 'Декларация на товары (РФ)', when: 'Импорт в РФ', side: 'Импортёр / брокер' },
  { id: 'cert', title: 'Сертификаты / декларации соответствия', when: 'По виду товара (одежда — часто)', side: 'Импортёр' },
  { id: 'mark', title: 'Маркировка (если применимо)', when: 'Отдельные категории', side: 'Импортёр' },
  { id: 'insurance', title: 'Полис страхования груза', when: 'По договору / Incoterms', side: 'Кто страхует' },
  { id: 'payment', title: 'Платёжка / SWIFT / условия L/C', when: 'Всегда для банка/учёта', side: 'Покупатель' },
]

export const supplierFlags = [
  { id: 'legal', q: 'Есть юрлицо / экспортная лицензия, а не только WeChat-ник?', bad: 'Только личный WeChat без компании' },
  { id: 'factory', q: 'Можно ли подтвердить адрес фабрики / склада (фото, видео, инспекция)?', bad: 'Отказ показать производство' },
  { id: 'sample', q: 'Есть оплаченный образец до крупной партии?', bad: '«Сразу 40HC без семпла»' },
  { id: 'terms', q: 'Базис (EXW/FOB) и что входит в цену — письменно?', bad: 'Только голосовые' },
  { id: 'payment', q: 'Оплата на счёт компании, а не на личную карту / крипту?', bad: 'Просьба на личный счёт' },
  { id: 'deposit', q: 'Аванс разумный (обычно ≤30–50%), остаток против документов?', bad: '100% предоплата новому контрагенту' },
  { id: 'qc', q: 'Согласована проверка перед отгрузкой (свой человек / SGS и т.п.)?', bad: '«Доверьтесь, мы давно на Alibaba»' },
  { id: 'pack', q: 'Есть спецификация упаковки и маркировки под РФ?', bad: '«Как получится»' },
  { id: 'refs', q: 'Есть контакты других клиентов в РФ / СНГ?', bad: 'Ни одной проверяемой поставки' },
  { id: 'contract', q: 'Готовы подписать контракт с реквизитами и штрафами за срыв?', bad: 'Только переписка' },
]

export const surchargeGlossary = [
  { code: 'THC', name: 'Terminal Handling Charge', tip: 'Обработка контейнера на терминале' },
  { code: 'BAF', name: 'Bunker Adjustment Factor', tip: 'Топливная надбавка' },
  { code: 'CAF', name: 'Currency Adjustment Factor', tip: 'Валютная корректировка' },
  { code: 'PSS', name: 'Peak Season Surcharge', tip: 'Сезонная надбавка' },
  { code: 'GRI', name: 'General Rate Increase', tip: 'Общее повышение линии' },
  { code: 'ISPS', name: 'Security surcharge', tip: 'Охрана / безопасность порта' },
  { code: 'DOC', name: 'Documentation fee', tip: 'Оформление документов' },
  { code: 'DEM', name: 'Demurrage', tip: 'Сверхнорматив у линии в порту' },
  { code: 'DET', name: 'Detention', tip: 'Сверхнорматив пользования контейнером вне порта' },
]
