import type { ReactNode } from 'react'

/** Рамка «ноутбук с живым UI» — канон ИТМен, без стекла и градиентов. */
export function DeviceFrame({ children, title = 'wiaf.ru' }: { children: ReactNode; title?: string }) {
  return (
    <div className="device-frame">
      <div className="device-lid">
        <div className="device-chrome">
          <span className="device-dot" />
          <span className="device-dot" />
          <span className="device-dot" />
          <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-mist">{title}</p>
        </div>
        <div className="device-screen">{children}</div>
      </div>
      <div className="device-base" aria-hidden />
    </div>
  )
}
