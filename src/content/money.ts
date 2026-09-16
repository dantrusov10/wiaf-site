/** Деньги площадки — единый источник формулировок. */

export const COMMISSION_PCT = 1
export const COMMISSION_CAP_RUB = 5000
export const REG_BALANCE_MIN = 1000

export const moneyCopy = {
  commissionShort: '1%, не более 5 000 ₽',
  commissionLong: 'Комиссия с победителя 1% от ставки, но не более 5 000 ₽',
  commissionHint: 'потолок 5 000 ₽',
  freeReg: 'Регистрация бесплатная для ЮЛ и ИП',
  freeImporter: 'Импортёру бесплатно: регистрация и выкладка слотов — 0 ₽',
  hold: 'Чтобы ставить — на счёте ≥ 1% от вашей ставки (холд), но не больше потолка комиссии 5 000 ₽',
  activation: `Активация счёта исполнителя — от ${REG_BALANCE_MIN.toLocaleString('ru-RU')} ₽`,
}
