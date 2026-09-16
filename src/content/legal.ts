import sections from './legal/sections.json'

export type LegalTab = 'summary' | 'interaction' | 'reglament' | 'pd' | 'policy'

export const legalNote =
  'Тексты перенесены с прода wiaf.ru (приказ ООО «ВИАФ» № 10 от 30.12.2025). В целевой модели этого макета активация счёта — от 1 000 ₽, холд = 1% ставки с потолком 5 000 ₽; в проде в отдельных пунктах ещё фигурирует аванс 5 000 ₽.'

export const legalTabs: { id: LegalTab; label: string }[] = [
  { id: 'summary', label: 'Кратко' },
  { id: 'interaction', label: 'Правила взаимодействия' },
  { id: 'reglament', label: 'Регламент ЭТП / оферта' },
  { id: 'pd', label: 'Обработка ПД' },
  { id: 'policy', label: 'Политика ПД' },
]

export function legalParagraphs(tab: Exclude<LegalTab, 'summary'>): string[] {
  if (tab === 'interaction') return sections.interaction.filter((p) => p.length > 2)
  if (tab === 'reglament') return sections.reglament.filter((p) => p.length > 2)
  if (tab === 'pd') return sections.pdTerms.filter((p) => p.length > 2)
  return sections.pdPolicy.filter((p) => p.length > 2)
}

export const legalSummary = [
  'ООО «ВИАФ» — организатор аукционов на понижение ставок по международной перевозке.',
  'Заказчику информационная поддержка бесплатна; исполнителю — платная информационная услуга.',
  'Аукцион состоялся при ≥2 исполнителях со ставками; иначе — не состоялся (ст. 447 ГК РФ).',
  'Торги слепые, обычно 60 минут, до 5 ставок, шаг снижения задаётся в лоте (на проде — $1).',
  'Комиссия 1% с победителя, не более 5 000 ₽, в рублях по курсу ЦБ.',
  'После часа стороны сами заключают договор перевозки. Площадка договор не подписывает.',
  'Регистрация = присоединение к Регламенту ЭТП (договор присоединения / оферта).',
  'Обработка персональных данных — по 152-ФЗ; отдельные условия и Политика ООО «ВИАФ» — во вкладках ниже.',
]
