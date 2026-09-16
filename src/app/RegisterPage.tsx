import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Wordmark } from '../components/Brand'
import { fetchCheckoLookup } from '../checko/client'
import { CheckoReportView } from '../checko/CheckoReportView'
import type { CheckoReport } from '../checko/types'
import { Field, inputClass } from './ui'
import { useSession, type Role } from './session'

export function RegisterPage() {
  const { user, register } = useSession()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const role = ((params.get('role') as Role) ?? 'importer') as Role
  const [err, setErr] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [report, setReport] = useState<CheckoReport | null>(null)
  const [form, setForm] = useState({
    entity: (params.get('type') === 'ip' ? 'ip' : 'ooo') as 'ooo' | 'ip',
    company: '',
    inn: '',
    email: '',
    phone: '',
    responsible: '',
    password: '',
  })

  if (user) {
    return <Navigate to={user.role === 'importer' ? '/app/importer' : '/app/forwarder'} replace />
  }

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (k === 'inn') setReport(null)
  }

  const verifyInn = async () => {
    setErr(null)
    setChecking(true)
    try {
      const r = await fetchCheckoLookup(form.inn)
      setReport(r)
      if (r.ok || r.kind === 'demo') {
        setForm((f) => ({
          ...f,
          inn: r.inn || f.inn,
          company: r.companyShort && r.kind !== 'demo' ? r.companyShort : f.company,
          entity: r.kind === 'entrepreneur' ? 'ip' : r.kind === 'company' ? 'ooo' : f.entity,
          responsible: !f.responsible && r.director ? r.director : f.responsible,
        }))
      }
      if (!r.canRegister) setErr(r.registerHint || r.error || 'ИНН не прошёл проверку Checko')
    } catch {
      setErr('Не удалось вызвать Checko (нужен npm run dev с .env.local)')
    } finally {
      setChecking(false)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!report) {
      setErr('Сначала нажмите «Проверить ИНН»')
      return
    }
    if (!report.canRegister) {
      setErr(report.registerHint || 'Регистрация по этому ИНН закрыта')
      return
    }
    const fail = register({
      ...form,
      role,
      checko: {
        light: report.light,
        lightLabel: report.lightLabel,
        statusName: report.statusName,
        companyFull: report.companyFull,
        checkedAt: report.checkedAt,
        kind: report.kind,
      },
    })
    if (fail) {
      setErr(fail)
      return
    }
    navigate(role === 'importer' ? '/app/importer' : '/app/forwarder')
  }

  return (
    <div className="grid min-h-svh place-items-center bg-paper px-5 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <form className="space-y-3 rounded-xl border border-line bg-white p-7" onSubmit={submit}>
          <Wordmark />
          <h1 className="text-2xl font-semibold">Регистрация · {role === 'importer' ? 'заказчик' : 'исполнитель'}</h1>
          <p className="text-[13.5px] text-muted">
            ЮЛ или ИП, резидент РФ. ИНН проверяем через Checko (актуальность ЕГРЮЛ). Тестовые учётки localhost не удаляем.
          </p>
          <Field label="Форма">
            <select className={inputClass} value={form.entity} onChange={(e) => set('entity', e.target.value)}>
              <option value="ooo">ООО / ЮЛ</option>
              <option value="ip">ИП</option>
            </select>
          </Field>
          <Field label="ИНН" hint="Логин · сначала проверка">
            <div className="flex gap-2">
              <input
                className={`${inputClass} font-mono`}
                value={form.inn}
                onChange={(e) => set('inn', e.target.value)}
                required
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={verifyInn}
                disabled={checking || form.inn.replace(/\D/g, '').length < 10}
                className="shrink-0 rounded-lg border border-line px-3 text-[12.5px] font-semibold disabled:opacity-50"
              >
                {checking ? '…' : 'Проверить'}
              </button>
            </div>
          </Field>
          <Field label="Название">
            <input className={inputClass} value={form.company} onChange={(e) => set('company', e.target.value)} required />
          </Field>
          <Field label="Ответственное лицо">
            <input
              className={inputClass}
              value={form.responsible}
              onChange={(e) => set('responsible', e.target.value)}
              required
            />
          </Field>
          <Field label="Почта">
            <input className={inputClass} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </Field>
          <Field label="Телефон">
            <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
          </Field>
          <Field label="Пароль">
            <input
              className={inputClass}
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
            />
          </Field>
          {err ? <p className="text-[13px] text-danger">{err}</p> : null}
          {report?.canRegister ? (
            <p className="text-[12.5px] text-ok">Checko: можно регистрировать ({report.lightLabel})</p>
          ) : null}
          <button
            type="submit"
            disabled={!report?.canRegister}
            className="w-full rounded-lg bg-brand py-2.5 text-[14px] font-semibold text-white hover:bg-navy-2 disabled:opacity-50"
          >
            Создать кабинет
          </button>
          {role === 'forwarder' ? (
            <p className="text-[12.5px] text-mist">
              После регистрации пополните счёт на ≥ 1 000 ₽. Чтобы ставить — на балансе должен быть 1% от вашей ставки по лоту.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 text-[13px]">
            <Link to={`/app/login?role=${role}`} className="underline">
              Уже есть вход
            </Link>
          </div>
        </form>

        <div className="min-w-0 max-h-[min(90vh,52rem)] overflow-y-auto">
          {report ? (
            <CheckoReportView report={report} compact />
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-white/60 p-6 text-[14px] text-muted">
              Нажмите «Проверить» — полная карточка Checko с подсветкой. После входа тот же инструмент: «Проверка
              контрагента» в ЛК.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
