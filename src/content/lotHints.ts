/** Умные подсказки: рынок / объём / плечо / состав ставки. Без апселла. */

import { estimateFairUsd } from './marketBench'

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
  const fair = estimateFairUsd({
    country: input.country,
    cargo: input.cargo,
    mode: input.mode,
    cbm: input.cbm,
    customs: input.customs,
    insurance: input.insurance,
  })

  // шаг 0 — маршрут / плечо
  if (!input.from || !input.to) {
    all.push({
      id: 'route-empty',
      tone: 'warn',
      title: 'Укажите оба конца плеча',
      text: 'Без города отправления и доставки экспедитор заложит «запас на неизвестность» — вилка разъедется.',
      steps: [0, 4],
    })
  }
  if (input.from && input.to && input.from === input.to) {
    all.push({
      id: 'same-city',
      tone: 'warn',
      title: 'Плечо нулевое',
      text: 'Отправление = доставка. Для международной перевозки нужны разные точки — иначе ставки будут «не про этот лот».',
      steps: [0, 4],
    })
  }
  if (!input.shipperAddress && input.incoterm === 'EXW') {
    all.push({
      id: 'exw-addr',
      tone: 'warn',
      title: 'Добавьте адрес завода (EXW)',
      text: 'Без точного адреса забор «на глаз» — ставка обычно +8–15% к рынку. Напишите район/улицу.',
      steps: [0, 2, 4],
    })
  }
  if (c.includes('кита')) {
    all.push({
      id: 'cn-leg',
      tone: 'tip',
      title: 'Плечо Китай→Москва длинное',
      text: 'Зовите 2–3 своих экспедитора заранее. На длинном плече час часто срывается, если в ленте только «чужие».',
      steps: [0, 3, 4],
    })
  } else if (c.includes('тур')) {
    all.push({
      id: 'tr-leg',
      tone: 'tip',
      title: 'Плечо короче Китая — вилка уже',
      text: 'На Турции рынок быстрее сходится. Не раздувайте потолок «как на Китай» — отпугнёте игроков.',
      steps: [0, 3, 4],
    })
  } else if (c.includes('вьет') || c.includes('инд')) {
    all.push({
      id: 'sea-leg',
      tone: 'tip',
      title: 'Море / длинное плечо — шире ориентир',
      text: 'Зафиксируйте FOB/EXW и терминал явно. Иначе в ставке «спрячут» плечо и простой.',
      steps: [0, 2, 4],
    })
  }

  // шаг 1 — груз / объём
  if (!input.cargo) {
    all.push({
      id: 'cargo-empty',
      tone: 'warn',
      title: 'Опишите характер груза',
      text: '«Товар» без деталей даёт разброс ставок 30%+. Напишите одежда / обувь / ткань и упаковку.',
      steps: [1, 4],
    })
  }
  if (!input.hs || input.hs.replace(/\D/g, '').length < 6) {
    all.push({
      id: 'hs',
      tone: 'tip',
      title: 'Добавьте ТН ВЭД (6 цифр)',
      text: 'Код сужает риск классификации. Для лёгпрома это часто −$100–300 к «страху» в ставке.',
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
        text: 'Вес давит сильнее объёма. Укажите штабелирование — иначе заложат перегруз поверх рыночной вилки.',
        steps: [1, 2, 4],
      })
    } else if (dens < 80 && input.cbm > 15) {
      all.push({
        id: 'light',
        tone: 'tip',
        title: 'Лёгкий объём — ставка «за куб»',
        text: 'Низкая плотность: проверьте, не завышен ли м³. Лишний куб на длинном плече дорого стоит.',
        steps: [1, 4],
      })
    }
  }
  if (input.cbm > 0 && input.cbm < 12) {
    all.push({
      id: 'small-cbm',
      tone: 'tip',
      title: 'Малый объём дороже за куб',
      text: 'До 12 м³ обычно выше $/м³. Напишите, можно ли догружать сборную — это снижает ставку.',
      steps: [1, 3, 4],
    })
  }
  if (input.cbm >= 40 && input.cbm <= 65) {
    all.push({
      id: 'half-box',
      tone: 'tip',
      title: 'Объём как «половина контейнера»',
      text: '40–65 м³ сравнивают с ½ 40HC. Явно зафиксируйте вид транспорта — иначе вилка разъедется.',
      steps: [1, 2, 4],
    })
  }
  if (fair.bench && input.cbm > 0) {
    const per = Math.round(fair.mid / input.cbm)
    all.push({
      id: 'vol-market',
      tone: 'ok',
      title: `Ориентир рынка ≈ $${fair.low}–$${fair.high}`,
      text: `Для ${fair.bench.corridor}, ~${input.cbm} м³ обычно ~$${per}/м³ all-in. Потолок ставки держите около верхней границы вилки.`,
      steps: [1, 3, 4],
    })
  }
  if (c.includes('кита') && (cargo.includes('одежд') || cargo.includes('трик') || cargo.includes('курт') || cargo.includes('футб') || cargo.includes('обув'))) {
    all.push({
      id: 'cz',
      tone: 'warn',
      title: 'Честный знак — кто клеит?',
      text: 'Лёгпром: явно напишите, кто маркирует и кто отвечает за выпуск. Иначе «за всё» разъедется на таможне.',
      steps: [1, 2, 4],
    })
  }
  if (input.places > 0 && input.cbm > 0 && input.places / input.cbm > 8) {
    all.push({
      id: 'places',
      tone: 'tip',
      title: 'Много мест на куб — уточните габариты',
      text: 'Высокая насыщенность местами. Добавьте размеры коробок и штабелирование — снизит «запас» в ставке.',
      steps: [1, 4],
    })
  }

  // шаг 2 — что в ставке
  if (input.incoterm === 'EXW') {
    all.push({
      id: 'exw-ok',
      tone: 'ok',
      title: 'EXW — классика сборной',
      text: 'Несколько заводов лучше двумя лотами. Один лот «со всех адресов» обычно +10% к ставке.',
      steps: [2, 0, 4],
    })
  }
  if (!input.insurance) {
    all.push({
      id: 'ins',
      tone: 'tip',
      title: 'Страховка вне ставки — напишите лимит',
      text: 'Без лимита ответственности победитель и вы по-разному поймёте «за всё». Одна строка в комментарии закрывает спор.',
      steps: [2, 4],
    })
  }
  if (input.customs) {
    all.push({
      id: 'to',
      tone: 'warn',
      title: 'ТО в ставке расширяет вилку',
      text: 'Таможня РФ часто +10–20% к фрахту. Опишите брокера/платежи или сравните с лотом без ТО.',
      steps: [2, 4],
    })
  }
  if (mode.includes('жд') && c.includes('кита')) {
    all.push({
      id: 'rail',
      tone: 'ok',
      title: 'ЖД: рынок шире наземной сборной',
      text: 'Важны терминал и готовность к погрузке. Без этого ставка «плавает» сильнее, чем на авто/наземке.',
      steps: [2, 1, 4],
    })
  }

  // шаг 3 — слот и цена / потолок vs рынок
  if (!input.cargoValue || input.cargoValue <= 0) {
    all.push({
      id: 'value',
      tone: 'warn',
      title: 'Укажите стоимость груза',
      text: 'Пусто или 0 — экспедитор не оценивает риск порчи. Без суммы ставка часто завышена «на всякий».',
      steps: [3, 1, 4],
    })
  }
  if (!input.maxBidUsd || input.maxBidUsd < 100) {
    all.push({
      id: 'max-low',
      tone: 'warn',
      title: 'Задайте потолок первой ставки',
      text: 'Без реалистичного максимума первые цифры «гуляют». Ориентир рынка выше в подсказках по объёму.',
      steps: [3, 4],
    })
  } else if (fair.bench) {
    if (input.maxBidUsd > fair.high * 1.25) {
      all.push({
        id: 'ceiling-high',
        tone: 'warn',
        title: 'Потолок сильно выше рынка',
        text: `Максимум $${input.maxBidUsd} при ориентире ~$${fair.low}–$${fair.high}. Опустите потолок — иначе старт будет дорогим.`,
        steps: [3, 4],
      })
    } else if (input.maxBidUsd < fair.low * 0.75) {
      all.push({
        id: 'ceiling-low',
        tone: 'warn',
        title: 'Потолок ниже рынка — слабо соберутся',
        text: `$${input.maxBidUsd} мало для ~${input.cbm || '—'} м³ на этом плече (обычно от ~$${fair.low}). Поднимите потолок или сузьте состав ставки.`,
        steps: [3, 4],
      })
    } else {
      all.push({
        id: 'ceiling-ok',
        tone: 'ok',
        title: 'Потолок в рыночной вилке',
        text: `$${input.maxBidUsd} близко к ориентиру ~$${fair.low}–$${fair.high}. Так проще набрать ≥2 игроков.`,
        steps: [3, 4],
      })
    }
  }
  if (input.cargoValue > 0 && input.maxBidUsd > 0 && input.maxBidUsd > input.cargoValue * 0.45) {
    all.push({
      id: 'ceiling-vs-cargo',
      tone: 'tip',
      title: 'Потолок высок к стоимости груза',
      text: 'Максимум ставки >~45% стоимости груза. Имеет смысл опустить потолок или пересмотреть состав «что в ставке».',
      steps: [3, 4],
    })
  }
  if (input.durationMin < 45) {
    all.push({
      id: 'short',
      tone: 'warn',
      title: 'Удлините слот до ~60 мин',
      text: 'Меньше 45 минут — слабо набрать ≥2 игроков на длинном плече. Для плотности обычно час.',
      steps: [3, 4],
    })
  }
  if (input.bidStepUsd > 5) {
    all.push({
      id: 'step',
      tone: 'tip',
      title: 'Уменьшите шаг ставки',
      text: `Шаг $${input.bidStepUsd} ускоряет торг, но грубит цену. Для сборной одежды чаще $1–5.`,
      steps: [3, 4],
    })
  }
  if (input.ready && input.date) {
    all.push({
      id: 'lead-time',
      tone: 'ok',
      title: 'Дайте 3–4 суток до слота',
      text: 'Минимум +2 суток от готовности. На плече с морем/ЖД экспедиторам нужно время посчитать all-in.',
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
  insurance?: boolean
  customs?: boolean
  incoterm?: string
}

export function smartBidHints(input: BidHintInput): LotHint[] {
  const hints: LotHint[] = []
  const fair = estimateFairUsd({
    country: input.country,
    cargo: input.cargo,
    mode: input.mode,
    cbm: input.cbm,
    customs: input.customs,
    insurance: input.insurance,
  })
  const cargo = input.cargo.toLowerCase()
  const dens = input.cbm > 0 ? input.kg / input.cbm : 0

  // рынок vs ставка — главный блок
  if (input.bidUsd > 0 && fair.mid > 0) {
    if (input.bidUsd > fair.high * 1.08) {
      hints.push({
        id: 'over-market',
        tone: 'warn',
        title: 'Ставка завышена к рынку',
        text: `~$${input.bidUsd} выше ориентира ~$${fair.low}–$${fair.high} за этот объём/плечо. Опустите к верхней границе вилки — иначе выиграете дорого.`,
        steps: [0],
      })
    } else if (input.bidUsd < fair.low * 0.88) {
      hints.push({
        id: 'under-market',
        tone: 'warn',
        title: 'Ниже рынка — пересчитайте all-in',
        text: `~$${input.bidUsd} мало для ~${input.cbm} м³ на этом плече (обычно от ~$${fair.low}). Добавьте плечо, простой, страховку — или не заходите.`,
        steps: [0],
      })
    } else if (input.bidUsd > fair.mid * 1.05) {
      hints.push({
        id: 'high-band',
        tone: 'tip',
        title: 'Выше середины рынка — есть запас вниз',
        text: `Ориентир середины ~$${fair.mid}. Имеет смысл сразу дать «свою» цифру ближе к $${Math.round((fair.mid + fair.low) / 2)}, а не дробить шаг.`,
        steps: [0],
      })
    } else {
      hints.push({
        id: 'in-band',
        tone: 'ok',
        title: 'В рыночной вилке',
        text: `~$${input.bidUsd} в коридоре ~$${fair.low}–$${fair.high}. Дальше смотрите маржу и состав ставки, не «ещё −$1».`,
        steps: [0],
      })
    }
  }

  if (input.cbm > 0 && input.bidUsd > 0) {
    const per = Math.round(input.bidUsd / input.cbm)
    const hintPer = fair.bench?.usdPerCbmHint ?? Math.round(fair.mid / Math.max(input.cbm, 1))
    if (per > hintPer * 1.25) {
      hints.push({
        id: 'per-cbm-high',
        tone: 'tip',
        title: `Дорого за куб (~$${per}/м³)`,
        text: `На этом плече обычно ближе к ~$${hintPer}/м³. Либо объём завышен в анкете, либо ставка ещё не «сжата».`,
        steps: [0],
      })
    } else if (per < hintPer * 0.7 && input.cbm >= 15) {
      hints.push({
        id: 'per-cbm-low',
        tone: 'warn',
        title: `Дешево за куб (~$${per}/м³)`,
        text: `Ориентир ~$${hintPer}/м³. Проверьте, всё ли в all-in: забор, плечо, простой, маркировка.`,
        steps: [0],
      })
    }
  }

  if (input.customs) {
    hints.push({
      id: 'customs-in',
      tone: 'tip',
      title: 'ТО в лоте — заложите отдельно',
      text: 'Таможня в ставке. Не считайте «как чистый фрахт» — к рыночному плечу обычно +10–20%.',
      steps: [0],
    })
  }
  if (input.insurance === false) {
    hints.push({
      id: 'no-ins',
      tone: 'tip',
      title: 'Страховка не в ставке',
      text: 'Не закладывайте «как будто включено». Либо увеличьте цифру, либо зафиксируйте исключение у себя.',
      steps: [0],
    })
  }
  if (dens > 400 && input.bidUsd > 0) {
    hints.push({
      id: 'heavy-bid',
      tone: 'warn',
      title: 'Тяжёлый груз — вес важнее куба',
      text: `≈${Math.round(dens)} кг/м³. Пересчитайте по весу/перегрузу, а не только по CBM — иначе маржа съестся на плече.`,
      steps: [0],
    })
  }

  if (input.left <= 1) {
    hints.push({
      id: 'last-try',
      tone: 'warn',
      title: 'Последняя попытка — считайте маржу',
      text: 'Не жмите «ещё −$1». Поставьте цифру all-in, с которой готовы работать после плеча и простоев.',
      steps: [0],
    })
  }
  if (input.bidUsd > 0 && input.maxBidUsd > 0 && input.bidUsd > input.maxBidUsd * 0.9) {
    hints.push({
      id: 'near-ceiling',
      tone: 'tip',
      title: 'У потолка лота — уйдите на рабочую цену',
      text: 'Вы у верхней границы заказчика. Сразу дайте свою расчётную ставку — иначе выиграете дорого относительно вилки.',
      steps: [0],
    })
  }
  if (input.lastBid !== undefined && input.bidUsd > 0 && input.lastBid - input.bidUsd === input.step) {
    hints.push({
      id: 'min-step',
      tone: 'tip',
      title: 'Не дробите шаг',
      text: 'Минимальный шаг редко выигрывает на слепых. Лучше сразу своя цифра с небольшим запасом вниз.',
      steps: [0],
    })
  }
  if (input.balance > 0 && input.needHold > 0 && input.balance < input.needHold * 1.15) {
    hints.push({
      id: 'hold-tight',
      tone: 'warn',
      title: 'Пополните баланс до ставки',
      text: 'После холда почти не останется запаса. Либо пополните, либо не заходите параллельно в другие лоты.',
      steps: [0],
    })
  }
  if (input.feePreview >= 5000) {
    hints.push({
      id: 'cap',
      tone: 'ok',
      title: 'Комиссия на потолке — торгуйте цену',
      text: 'Дальше рост ставки комиссию не увеличит (макс. 5 000 ₽). Фокус на марже перевозки.',
      steps: [0],
    })
  }
  if (input.playersOnLot < 1) {
    hints.push({
      id: 'first',
      tone: 'tip',
      title: 'Дождитесь второго или не тратьте попытки',
      text: 'При одном участнике час сорвётся. Сохраните ставки на момент, когда появится плотность.',
      steps: [0],
    })
  }
  if (input.country.toLowerCase().includes('кита') && (cargo.includes('одежд') || cargo.includes('трик') || cargo.includes('обув'))) {
    hints.push({
      id: 'cz-bid',
      tone: 'tip',
      title: 'Маркировка: включить или исключить явно',
      text: 'Если ТО/ЧЗ не в ставке — не считайте «как будто есть». Либо +к цифре, либо исключение в своих заметках.',
      steps: [0],
    })
  }
  if (input.bidUsd > 0 && input.step > 0 && input.lastBid !== undefined && input.lastBid - input.bidUsd > input.step * 8) {
    hints.push({
      id: 'deep-cut',
      tone: 'tip',
      title: 'Резкий срез — оставьте 1–2 попытки',
      text: 'Сильное снижение съедает манёвр. Лучше подойти к fair (~$' + fair.mid + ') в два шага.',
      steps: [0],
    })
  }

  // приоритет: рыночные советы первыми
  const order = ['over-market', 'under-market', 'per-cbm-high', 'per-cbm-low', 'high-band', 'customs-in', 'heavy-bid', 'last-try']
  hints.sort((a, b) => {
    const ia = order.indexOf(a.id)
    const ib = order.indexOf(b.id)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
  return hints.slice(0, 5)
}
