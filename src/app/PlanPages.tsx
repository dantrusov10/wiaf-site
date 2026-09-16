import { Check, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  forwarderHeroes,
  forwarderMatrix,
  importerHeroes,
  importerMatrix,
  type PlanHero,
} from '../content/pricing'
import { moneyCopy } from '../content/money'
import { ThemeIcon } from '../components/ThemeIcon'
import type { PlanId } from './engine'
import { useSession } from './session'
import { Panel } from './ui'

function planForRole(role: 'importer' | 'forwarder'): PlanHero[] {
  return role === 'importer' ? importerHeroes : forwarderHeroes
}

function idFromHero(h: PlanHero, role: 'importer' | 'forwarder'): PlanId {
  if (role === 'importer') {
    if (h.id === 'imp-zakupka') return 'imp-zakupka'
    if (h.id === 'imp-pro') return 'imp-pro'
    return 'imp-free'
  }
  if (h.id === 'fwd-stol') return 'fwd-stol'
  if (h.id === 'fwd-pro') return 'fwd-pro'
  return 'fwd-free'
}

export function PlanPage({ role }: { role: 'importer' | 'forwarder' }) {
  const { user, setPlan } = useSession()
  const heroes = planForRole(role)
  const matrix = role === 'importer' ? importerMatrix : forwarderMatrix
  const current = user?.planId ?? (role === 'importer' ? 'imp-free' : 'fwd-free')

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <ThemeIcon id="tips" size={72} />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">Подписка</p>
          <h1 className="mt-1 text-2xl font-semibold">Тарифы</h1>
          <p className="mt-1 max-w-2xl text-[13.5px] text-muted">
            Торги доступны без подписки. Платный тариф открывает журнал, калькуляторы и подсказки при создании лота или
            ставке. {moneyCopy.freeReg}. {moneyCopy.commissionLong}.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {heroes.map((h) => {
          const id = idFromHero(h, role)
          const active = current === id
          return (
            <div
              key={h.id}
              className={`rounded-xl border p-5 ${active ? 'border-brand bg-brand/5' : 'border-line bg-white'} ${h.highlight ? 'ring-1 ring-brand/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] font-medium text-mist">{h.name}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {h.price}
                    {h.priceNote ? <span className="ml-1 text-[13px] font-normal text-muted">{h.priceNote}</span> : null}
                  </p>
                </div>
                {active ? <Check className="h-5 w-5 text-brand" /> : <CreditCard className="h-5 w-5 text-mist" />}
              </div>
              <p className="mt-3 text-[13px] text-muted">{h.forWhom}</p>
              <p className="mt-2 text-[13.5px] leading-snug text-ink">{h.outcome}</p>
              <button
                type="button"
                disabled={active}
                onClick={() => setPlan(id)}
                className="mt-4 w-full rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white hover:bg-navy-2 disabled:bg-fog disabled:text-muted"
              >
                {active ? 'Текущий тариф' : h.cta}
              </button>
            </div>
          )
        })}
      </div>

      <Panel title="Что входит">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-mist">
                <th className="py-2 pr-3 font-medium">Функция</th>
                <th className="py-2 pr-3 font-medium">Free</th>
                <th className="py-2 pr-3 font-medium">{role === 'importer' ? 'Закупка' : 'Стол'}</th>
                <th className="py-2 font-medium">Pro</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.feature} className="border-b border-line/70">
                  <td className="py-2.5 pr-3">
                    <span className="font-medium text-ink">{row.feature}</span>
                    <span className="mt-0.5 block text-[12px] text-mist">{row.why}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-muted">{cell(row.free)}</td>
                  <td className="py-2.5 pr-3 text-muted">{cell(row.mid)}</td>
                  <td className="py-2.5 text-muted">{cell(row.pro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] text-mist">
          Оплата на этом макете — переключение тарифа в браузере. Публичная витрина:{' '}
          <Link to="/pricing" className="underline">
            /pricing
          </Link>
          .
        </p>
      </Panel>
    </div>
  )
}

function cell(v: boolean | string) {
  if (v === true) return 'да'
  if (v === false) return '—'
  return v
}
