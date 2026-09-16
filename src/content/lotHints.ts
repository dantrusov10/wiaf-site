/** Умные подсказки: зависят от шага формы / контекста ставки. Без апселла. */

export type HintTone = 'tip' | 'warn' | 'ok'
export type CreateStep = 0 | 1 | 2 | 3 | 4

export type LotHint = {
  id: string
  tone: HintTone
  title: string
  text: string
  steps: CreateStep[]
}

export type CreateHintInput = {
  step: CreateStep
  country: string
  cargo: string
  cbm: number
  kg: number
  mode: string
  incoterm: string
  insurance: boolean
  customs: boolean
  cargoValue: number
  maxBidUsd: number
  durationMin: number
  bidStepUsd: number
  hs: string
  from: string
  to: string
  shipperAddress: string
  ready: string
  date: string
  places: number
}

export function smartLotHints(input: CreateHintInput): LotHint[] {
  const cargo = input.cargo.toLowerCase()
  const mode = input.mode.toLowerCase()
  const c = input.country.toLowerCase()
  const all: LotHint[] = []

  // шаг 0 — маршрут
  if (!input.from || !input.to) {
    all.push({
      id: 'route-empty',
      tone: 'warn',
      title: 'Маршрут',
      text: 'Город отправления и доставки — основа вилки. Без них экспедитор не считает плечо.',
      steps: [0, 4],
    })
  }
  if (input.from && input.to && input.from === input.to) {
    all.push({
      id: 'same-city',
      tone: 'warn',
      title: 'Одинаковые города',
      text: 'Отправление = доставка. Для международной перевозки обычно нужны разные точки.',
      steps: [0, 4],
    })
  }
  if (!input.shipperAddress && input.incoterm === 'EXW') {
    all.push({
      id: 'exw-addr',
      tone: 'warn',
      title: 'Адрес завода при EXW',
      text: 'При EXW экспедитор забирает с завода. Без точного адреса ставка раздуется «на всякий случай».',
      steps: [0, 2, 4],
    })
  }
  if (c.includes('кита')) {
    all.push({
      id: 'cn-density',
      tone: 'tip',
      title: 'Плотность игроков',
      text: 'На Китай→Москва зовите 2–3 своих экспедитора в ленту заранее — иначе час часто не состоится.',
      steps: [0, 3, 4],
    })
  }

  // шаг 1 — груз
  if (!input.cargo) {
    all.push({
      id: 'cargo-empty',
      tone: 'warn',
      title: 'Описание груза',
      text: 'Напишите характер груза или ТН ВЭД. «Товар» без деталей даёт разброс ставок 30%+.',
      steps: [1, 4],
    })
  }
  if (!input.hs || input.hs.replace(/\D/g, '').length < 6) {
    all.push({
      id: 'hs',
      tone: 'tip',
      title: 'ТН ВЭД',
      text: '6 цифр сужают вилку и риск классификации. Можно несколько кодов через запятую.',
      steps: [1, 4],
    })
  }
  if (input.kg > 0 && input.cbm > 0) {
    const dens = input.kg / input.cbm
    if (dens > 400) {
      all.push({
        id: 'heavy',
        tone: 'warn',
        title: `Тяжёлый куб ≈ ${Math.round(dens)} кг/м³`,
        text: 'Вес давит сильнее объёма. Укажите штабелирование и тип упаковки — иначе заложат перегруз.',
        steps: [1, 2, 4],
      })
    } else if (dens < 80 && input.cbm > 15) {
      all.push({
        id: 'light',
        tone: 'tip',
        title: 'Лёгкий объём',
        text: 'Низкая плотность — ставка ближе к «за куб». Проверьте, не завышен ли м³ относительно мест.',
        steps: [1, 4],
      })
    }
  }
  if (input.cbm > 0 && input.cbm < 12) {
    all.push({
      id: 'small-cbm',
      tone: 'tip',
      title: 'Малый объём',
      text: 'До 12 м³ часто дороже за куб. Можно ли догружать сборную — напишите в комментарии.',
      steps: [1, 3, 4],
    })
  }
  if (input.cbm >= 40 && input.cbm <= 65) {
    all.push({
      id: 'half-box',
      tone: 'tip',
      title: 'Почти контейнер',
      text: '40–65 м³ сравнивают с половиной 40HC. Зафиксируйте вид транспорта явно.',
      steps: [1, 2, 4],
    })
  }
  if (c.includes('кита') && (cargo.includes('одежд') || cargo.includes('трик') || cargo.includes('курт') || cargo.includes('футб') || cargo.includes('обув'))) {
    all.push({
      id: 'cz',
      tone: 'warn',
      title: 'Честный знак',
      text: 'Лёгпром: кто клеит коды маркировки и кто отвечает за выпуск — иначе «за всё» разъедется на таможне.',
      steps: [1, 2, 4],
    })
  }
  if (input.places > 0 && input.cbm > 0 && input.places / input.cbm > 8) {
    all.push({
      id: 'places',
      tone: 'tip',
      title: 'Много мест на куб',
      text: 'Высокая насыщенность местами — уточните габариты коробок и возможность штабелирования.',
      steps: [1, 4],
    })
  }

  // шаг 2 — что в ставке
  if (input.incoterm === 'EXW') {
    all.push({
      id: 'exw-ok',
      tone: 'ok',
      title: 'EXW',
      text: 'Классика для сборной из Китая. Несколько заводов — лучше два лота или явный комментарий.',
      steps: [2, 0, 4],
    })
  }
  if (!input.insurance) {
    all.push({
      id: 'ins',
      tone: 'tip',
      title: 'Страховка вне ставки',
      text: 'Напишите лимит ответственности. Иначе победитель и заказчик по-разному поймут «за всё».',
      steps: [2, 4],
    })
  }
  if (input.customs) {
    all.push({
      id: 'to',
      tone: 'warn',
      title: 'ТО в ставке',
      text: 'Таможня РФ резко расширяет вилку. Опишите брокера и платежи или сравните с лотом без ТО.',
      steps: [2, 4],
    })
  }
  if (mode.includes('жд') && c.includes('кита')) {
    all.push({
      id: 'rail',
      tone: 'ok',
      title: 'ЖД Китай→РФ',
      text: 'Ориентир рынка шире, чем у наземной сборной. Важны терминал и готовность к погрузке.',
      steps: [2, 1, 4],
    })
  }

  // шаг 3 — слот и цена
  if (!input.cargoValue || input.cargoValue <= 0) {
    all.push({
      id: 'value',
      tone: 'warn',
      title: 'Стоимость груза',
      text: 'Пусто или 0 — экспедитор не оценивает риск порчи/утраты. Укажите сумму в валюте лота.',
      steps: [3, 1, 4],
    })
  }
  if (!input.maxBidUsd || input.maxBidUsd < 100) {
    all.push({
      id: 'max-low',
      tone: 'warn',
      title: 'Потолок ставки',
      text: 'Задайте реалистичный максимум первой ставки в USD — иначе первые цифры «гуляют».',
      steps: [3, 4],
    })
  } else if (input.cargoValue > 0 && input.maxBidUsd > input.cargoValue * 0.45) {
    all.push({
      id: 'ceiling',
      tone: 'tip',
      title: 'Потолок высок к стоимости груза',
      text: 'Максимум ставки больше ~45% стоимости груза. Имеет смысл опустить потолок.',
      steps: [3, 4],
    })
  }
  if (input.durationMin < 45) {
    all.push({
      id: 'short',
      tone: 'warn',
      title: 'Короткий слот',
      text: 'Меньше 45 минут — слабо набрать ≥2 игроков. Для плотности обычно 60 минут.',
      steps: [3, 4],
    })
  }
  if (input.bidStepUsd > 5) {
    all.push({
      id: 'step',
      tone: 'tip',
      title: 'Крупный шаг',
      text: `Шаг $${input.bidStepUsd} ускоряет торг, но грубит цену. Для сборной одежды чаще $1–5.`,
      steps: [3, 4],
    })
  }
  if (input.ready && input.date) {
    all.push({
      id: 'lead-time',
      tone: 'ok',
      title: 'Срок до слота',
      text: 'Минимум +2 суток от готовности, лучше 3–4 — экспедиторам нужно посчитать условия.',
      steps: [3, 4],
    })
  }

  return all.filter((h) => h.steps.includes(input.step)).slice(0, 5)
}

export type BidHintInput = {
  bidUsd: number
  maxBidUsd: number
  lastBid?: number
  step: number
  balance: number
  needHold: number
  feePreview: number
  left: number
  cbm: number
  kg: number
  mode: string
  country: string
  cargo: string
  playersOnLot: number
}

export function smartBidHints(input: BidHintInput): LotHint[] {
  const hints: LotHint[] = []
  if (input.left <= 1) {
    hints.push({
      id: 'last-try',
      tone: 'warn',
      title: 'Последняя попытка — считайте маржу',
      text: 'Не жмите «ещё −$1» вслепую. Заложите all-in (плечо, страховка, простой) и ставьте цифру, с которой готовы работать.',
      steps: [0],
    })
  }
  if (input.bidUsd > 0 && input.maxBidUsd > 0 && input.bidUsd > input.maxBidUsd * 0.85) {
    hints.push({
      id: 'near-ceiling',
      tone: 'tip',
      title: 'Опуститесь ниже верхней вилки',
      text: 'Вы у потолка лота. Имеет смысл сразу уйти на свою «рабочую» цену — иначе выиграете дорого относительно вилки заказчика.',
      steps: [0],
    })
  }
  if (input.lastBid !== undefined && input.bidUsd > 0 && input.lastBid - input.bidUsd === input.step) {
    hints.push({
      id: 'min-step',
      tone: 'tip',
      title: 'Не дробите шаг — дайте свою цифру',
      text: 'Минимальный шаг редко выигрывает на слепых торгах. Лучше сразу поставить расчётную ставку с небольшим запасом вниз.',
      steps: [0],
    })
  }
  if (input.balance > 0 && input.needHold > 0 && input.balance < input.needHold * 1.15) {
    hints.push({
      id: 'hold-tight',
      tone: 'warn',
      title: 'Оставьте запас на счёте',
      text: 'После холда почти не останется средств. Либо пополните баланс до ставки, либо не заходите параллельно в другие лоты.',
      steps: [0],
    })
  }
  if (input.feePreview >= 5000) {
    hints.push({
      id: 'cap',
      tone: 'ok',
      title: 'Комиссия уже на потолке — торгуйте цену',
      text: 'Дальше рост ставки комиссию не увеличит (макс. 5 000 ₽). Фокус только на марже перевозки, не на плате площадке.',
      steps: [0],
    })
  }
  if (input.playersOnLot < 1) {
    hints.push({
      id: 'first',
      tone: 'tip',
      title: 'Дождитесь второго игрока или уходите',
      text: 'При одном участнике час сорвётся. Либо оставайтесь с запасом времени, либо не тратьте попытки — комиссия не спишется.',
      steps: [0],
    })
  }
  if (input.cbm >= 40 && input.bidUsd > 0 && input.bidUsd < 5000) {
    hints.push({
      id: 'cheap-big',
      tone: 'warn',
      title: 'Пересчитайте all-in по объёму',
      text: 'Крупный CBM при низкой ставке — риск дыры. Добавьте страховку, плечо и простой до отправки ставки.',
      steps: [0],
    })
  }
  const cargo = input.cargo.toLowerCase()
  if (input.country.toLowerCase().includes('кита') && (cargo.includes('одежд') || cargo.includes('трик'))) {
    hints.push({
      id: 'cz-bid',
      tone: 'tip',
      title: 'Явно решите про маркировку',
      text: 'Если ТО/маркировка не в ставке лота — не закладывайте «как будто включено». Либо увеличьте ставку, либо зафиксируйте исключение в комментарии к себе.',
      steps: [0],
    })
  }
  if (input.bidUsd > 0 && input.step > 0 && input.lastBid !== undefined && input.lastBid - input.bidUsd > input.step * 8) {
    hints.push({
      id: 'deep-cut',
      tone: 'tip',
      title: 'Резкий срез — оставьте запас',
      text: 'Сильное снижение за одну попытку съедает пространство для манёвра. Лучше оставить 1–2 ставки на корректировку.',
      steps: [0],
    })
  }
  return hints.slice(0, 4)
}
