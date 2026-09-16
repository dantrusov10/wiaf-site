import { useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'

function localPoint(el: HTMLElement, e: MouseEvent) {
  const r = el.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }
}

/** Кнопка/ссылка чуть едет к курсору — как на витринах Т1 / МТС Банка. */
export function Magnetic({ children, className = '', strength = 0.28 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [t, setT] = useState({ x: 0, y: 0 })

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return
    const { x, y, w, h } = localPoint(ref.current, e)
    setT({ x: (x - w / 2) * strength, y: (y - h / 2) * strength })
  }

  return (
    <div
      ref={ref}
      className={`inline-flex ${className}`}
      onMouseMove={onMove}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{ transform: `translate3d(${t.x}px, ${t.y}px, 0)`, transition: t.x === 0 && t.y === 0 ? 'transform 0.35s ease' : 'transform 0.08s linear' }}
    >
      {children}
    </div>
  )
}

/** Лёгкий 3D-наклон карточки/ноутбука за мышью. */
export function Tilt({ children, className = '', max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [style, setStyle] = useState<CSSProperties>({ transform: 'perspective(900px) rotateX(0) rotateY(0)' })

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return
    const { x, y, w, h } = localPoint(ref.current, e)
    const rx = ((y - h / 2) / h) * -max
    const ry = ((x - w / 2) / w) * max
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`,
      transition: 'transform 0.08s linear',
    })
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={() => setStyle({ transform: 'perspective(900px) rotateX(0) rotateY(0)', transition: 'transform 0.45s ease' })}
      style={style}
    >
      {children}
    </div>
  )
}

/** Пятно света за курсором на герое. */
export function PointerStage({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce || !ref.current) return
    const { x, y } = localPoint(ref.current, e)
    ref.current.style.setProperty('--mx', `${x}px`)
    ref.current.style.setProperty('--my', `${y}px`)
  }

  return (
    <section ref={ref} className={`pointer-stage ${className}`} onMouseMove={onMove}>
      {children}
    </section>
  )
}

/** Карточка с бликом за курсором — для ЛК. */
export function ShineCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return
    const { x, y } = localPoint(ref.current, e)
    ref.current.style.setProperty('--sx', `${x}px`)
    ref.current.style.setProperty('--sy', `${y}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`shine-card relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${className}`}
    >
      {children}
    </div>
  )
}

/** Кнопка с лёгким press-scale. */
export function Pressable({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <Magnetic strength={0.2}>
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`transition active:scale-[0.97] disabled:opacity-40 ${className}`}
      >
        {children}
      </button>
    </Magnetic>
  )
}
