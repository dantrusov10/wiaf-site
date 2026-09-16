export type ToolRole = 'importer' | 'forwarder'

export type ToolDef = {
  slug: string
  title: string
  dek: string
  tag: string
  roles: ToolRole[]
}

/**
 * Наборы намеренно разные.
 * Общее только там, где обеим ролям нужна одна математика (CBM, сроки) —
 * но карточки и УТП на экране разные.
 */
export const toolsCatalog: ToolDef[] = [
  {
    slug: 'cbm',
    title: 'Объём и контейнер',
    dek: 'Коробки → CBM, вес, LCL vs FCL, шаблоны под одежду',
    tag: 'Считать',
    roles: ['importer', 'forwarder'],
  },
  {
    slug: 'landed',
    title: 'Партия на складе',
    dek: 'Себестоимость + таможня + сравнение фрахта с медианой слотов wIaF',
    tag: 'Закупка',
    roles: ['importer'],
  },
  {
    slug: 'quotes',
    title: 'Журнал котировок',
    dek: 'Чужие КП из чата vs медиана площадки, вилка, кого звать на час',
    tag: 'Переговоры',
    roles: ['importer'],
  },
  {
    slug: 'suppliers',
    title: 'Поставщики',
    dek: 'Реестр фабрик: чеклист ВИАФ, ваша оценка, статус проверки',
    tag: 'Поставщики',
    roles: ['importer'],
  },
  {
    slug: 'counterparty',
    title: 'Проверка контрагента',
    dek: 'ИНН → Checko: ЕГРЮЛ, риски, суды, ФССП — всё с подсветкой',
    tag: 'Риски',
    roles: ['importer', 'forwarder'],
  },
  {
    slug: 'deal',
    title: 'Сделка: базис и бумаги',
    dek: 'Ситуация → кто платит по пути → чеклист документов → текст в чат',
    tag: 'Сделка',
    roles: ['importer'],
  },
  {
    slug: 'plan',
    title: 'Календарь поставки',
    dek: 'Откуда сроки, этапы пути, праздники КНР, буфер',
    tag: 'План',
    roles: ['importer', 'forwarder'],
  },
  {
    slug: 'rates',
    title: 'Книга тарифов',
    dek: 'Закуп / продажа / маржа — внутренняя кухня исполнителя',
    tag: 'Маржа',
    roles: ['forwarder'],
  },
  {
    slug: 'offer',
    title: 'Конструктор КП',
    dek: 'Разбивка ставки и текст клиенту',
    tag: 'Продажи',
    roles: ['forwarder'],
  },
  {
    slug: 'allin',
    title: 'Сборка all-in',
    dek: 'Из «голого» фрахта в сумму для клиента: что добавить и зачем',
    tag: 'Котировка',
    roles: ['forwarder'],
  },
]

export function toolsFor(role: ToolRole): ToolDef[] {
  return toolsCatalog.filter((t) => t.roles.includes(role))
}

export function toolPath(role: ToolRole, slug?: string): string {
  const base = role === 'importer' ? '/app/importer/tools' : '/app/forwarder/tools'
  return slug ? `${base}/${slug}` : base
}

export const landingToolExamples = [
  {
    role: 'importer' as const,
    title: 'В кабинете заказчика',
    items: [
      { name: 'Партия на складе', example: 'Фрахт $4 200 vs медиана слота $3 120 · себестоимость 1 012 ₽/шт' },
      { name: 'Сделка', example: 'EXW → карта кто платит → документы → текст в WhatsApp' },
      { name: 'Журнал котировок', example: '3 КП → вилка $4.1–4.8k · кого звать на час' },
    ],
  },
  {
    role: 'forwarder' as const,
    title: 'В кабинете исполнителя',
    items: [
      { name: 'Книга тарифов', example: 'Закуп $3 800 → продажа $4 500 · маржа 18%' },
      { name: 'Сборка all-in', example: 'База $2 900 + THC + DOC = $3 105 клиенту' },
      { name: 'Конструктор КП', example: 'Разбивка + free time → текст в чат' },
    ],
  },
]
