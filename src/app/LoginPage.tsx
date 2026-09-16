import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Wordmark } from '../components/Brand'
import { inputClass } from './ui'
import { useSession, type Role } from './session'
import { useState } from 'react'

export function LoginPage() {
  const { user, login } = useSession()
  const [params] = useSearchParams()
  const pref = (params.get('role') as Role | null) ?? 'importer'
  const [role, setRole] = useState<Role>(pref)
  const [inn, setInn] = useState(pref === 'importer' ? '7700000000' : '1234567890')
  const [password, setPassword] = useState('1234')
  const [err, setErr] = useState<string | null>(null)

  const pick = (next: Role) => {
    setRole(next)
    setInn(next === 'importer' ? '7700000000' : '1234567890')
    setErr(null)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const fail = login(inn, password)
    if (fail) {
      setErr(fail)
      return
    }
  }

  if (user) {
    return <Navigate to={user.role === 'importer' ? '/app/importer' : '/app/forwarder'} replace />
  }

  return (
    <div className="grid min-h-svh place-items-center bg-paper px-5">
      <form className="w-full max-w-md rounded-xl border border-line bg-white p-7" onSubmit={submit}>
        <Wordmark />
        <h1 className="mt-6 text-2xl font-semibold">Вход</h1>
        <p className="mt-2 text-[14px] text-muted">Два кабинета. Директор — почта внутри кабинета заказчика, не третья регистрация.</p>
        <div className="mt-5 grid grid-cols-2 rounded-lg border border-line p-1 text-[13px] font-semibold">
          <button type="button" className={`rounded-md py-2 ${role === 'importer' ? 'bg-brand text-white' : 'text-muted'}`} onClick={() => pick('importer')}>
            Заказчик
          </button>
          <button type="button" className={`rounded-md py-2 ${role === 'forwarder' ? 'bg-brand text-white' : 'text-muted'}`} onClick={() => pick('forwarder')}>
            Перевозчик
          </button>
        </div>
        <label className="mt-5 block">
          <span className="text-[12.5px] font-semibold">ИНН фирмы или ИП</span>
          <input
            className={`${inputClass} mt-1`}
            value={inn}
            onChange={(e) => setInn(e.target.value)}
            autoComplete="username"
            inputMode="numeric"
            required
          />
        </label>
        <label className="mt-3 block">
          <span className="text-[12.5px] font-semibold">Пароль</span>
          <input
            className={`${inputClass} mt-1`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {err ? <p className="mt-3 text-[13px] text-danger">{err}</p> : null}
        <button type="submit" className="mt-5 w-full rounded-lg bg-brand py-2.5 text-[14px] font-semibold text-white hover:bg-navy-2">
          Войти
        </button>
        <p className="mt-4 text-[12.5px] text-mist">
          Тест: заказчик 7700000000 / 1234 · исполнитель 1234567890 / 1234
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
          <Link to={`/app/register?role=${role}`} className="underline">
            Регистрация
          </Link>
          <Link to="/director" className="underline">
            Директору
          </Link>
          <Link to="/" className="underline">
            На главную
          </Link>
        </div>
      </form>
    </div>
  )
}
