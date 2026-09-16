import type { ReactNode } from 'react'
import { useActiveToolRole } from './ui'
import { ToolNav, UspBox } from './ui'

export function ToolPageFrame({
  title,
  dek,
  slug,
  usp,
  children,
}: {
  title: string
  dek: string
  slug: string
  usp: ReactNode
  children: ReactNode
}) {
  const role = useActiveToolRole()
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
        {role === 'importer' ? 'Инструмент заказчика' : 'Инструмент исполнителя'}
      </p>
      <h1 className="mt-1 text-xl font-semibold">{title}</h1>
      <p className="mt-1 max-w-2xl text-[13.5px] text-muted">{dek}</p>
      <div className="mt-4">
        <ToolNav currentSlug={slug} />
      </div>
      <div className="mt-5">
        <UspBox title="Зачем этот инструмент">{usp}</UspBox>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}
