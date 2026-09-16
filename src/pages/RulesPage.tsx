import { PageHero } from '../components/PageHero'
import { prod } from '../data'

export function RulesPage() {
  return (
    <main>
      <PageHero
        kicker="Сводка"
        title="Правила торгов в одном экране"
        dek="Конспект целевой модели на localhost. Юридически на проде пока ещё старый текст с потолком 5 000 ₽ — его нужно будет заменить."
      />
      <div className="mx-auto max-w-3xl px-5 py-14">
        <ul className="space-y-3 text-[15px] leading-relaxed text-muted">
          <li>Участники — резиденты РФ, ЮЛ и ИП. ЦА — СМБ, простые категории груза.</li>
          <li>Импортёру сервис бесплатен.</li>
          <li>
            Исполнитель: на счёте от <strong className="text-ink">1 000 ₽</strong> (активация). Чтобы поставить
            ставку — баланс ≥ <strong className="text-ink">1% от этой ставки</strong> в рублях (холд под комиссию).
          </li>
          <li>Торги 60 минут, до 5 ставок, шаг $1, слепые. Победитель = наименьшая цена автоматом.</li>
          <li>Состоялись только при ≥ 2 исполнителях со ставками.</li>
          <li>
            Второй по цене открывается только если победитель уклонился в срок — не меню «выберите глазами».
          </li>
          <li>
            Комиссия <strong className="text-ink">1% с победителя, без потолка 5 000 ₽</strong>. Ставки в USD,
            комиссия в RUB. Внутри 1% часть уходит в копилку процедуры (не второй прайс).
          </li>
          <li>
            После победы стороны сами заключают договор перевозки. Площадка его не подписывает — так и в кабинете,
            и здесь, без «обязан / желательно».
          </li>
        </ul>
        <a
          href={prod.rules}
          className="mt-10 inline-flex rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          Открыть полные правила на прод
        </a>
      </div>
    </main>
  )
}
