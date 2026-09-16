import { useState } from 'react'
import { fetchCheckoLookup } from '../checko/client'
import { CheckoReportView } from '../checko/CheckoReportView'
import type { CheckoReport } from '../checko/types'
import { useSession } from '../app/session'
import { ToolPageFrame } from './ToolPageFrame'
import { Field, inputClass } from './ui'

export function CounterpartyToolPage() {
  const { user } = useSession()
  const [inn, setInn] = useState(user?.inn && !user.inn.startsWith('770') && user.inn !== '1234567890' ? user.inn : '5043092742')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<CheckoReport | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const run = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      setReport(await fetchCheckoLookup(inn))
    } catch {
      setErr('Checko недоступен — нужен npm run dev и CHECKO_API_KEY в .env.local')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolPageFrame
      slug="counterparty"
      title="Проверка контрагента"
      dek="ИНН → Checko: актуальность ЕГРЮЛ/ЕГРИП, риски, суды, ФССП, финансы. Вся выдача с подсветкой хорошо / подозрительно / плохо."
      usp={
        <>
          Не «галочка ИНН верный». Полный разбор карточки и связанных ответов API: что можно не бояться (зелёное), на что смотреть
          (жёлтое), что стоп (красное). Для РФ-контрагента. Китайских фабрик здесь нет — они в «Поставщиках».
        </>
      }
    >
      <form onSubmit={run} className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4">
        <Field label="ИНН ЮЛ (10) или ИП (12)" tip="Логин площадки тоже ИНН — можно проверить своего контрагента до договора">
          <input
            className={`${inputClass} w-52 font-mono`}
            value={inn}
            onChange={(e) => setInn(e.target.value)}
            inputMode="numeric"
            required
          />
        </Field>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Запрос к Checko…' : 'Проверить полностью'}
        </button>
        {user?.inn ? (
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-2.5 text-[13px]"
            onClick={() => setInn(user.inn)}
          >
            Мой ИНН
          </button>
        ) : null}
      </form>
      {err ? <p className="mt-3 text-[13px] text-brand">{err}</p> : null}
      <div className="mt-6">{report ? <CheckoReportView report={report} /> : null}</div>
    </ToolPageFrame>
  )
}
