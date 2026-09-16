import { Link } from 'react-router-dom'
import { Magnetic, Tilt } from './Motion'
import { ThemeSvgIcon, type ThemeIconId } from './icons/ThemeSvgs'

export type { ThemeIconId }

/** Нативная SVG-иконка без подложки-квадрата. */
export function ThemeIcon({
  id,
  size = 88,
  className = '',
  alt = '',
}: {
  id: ThemeIconId
  size?: number
  className?: string
  alt?: string
}) {
  return (
    <Tilt className={`inline-flex ${className}`} max={8}>
      <ThemeSvgIcon
        id={id}
        title={alt || undefined}
        className="select-none transition duration-200 group-hover:scale-[1.05]"
        style={{ width: size, height: size }}
      />
    </Tilt>
  )
}

/** Плитка: иконка + подпись, без «белого квадрата вокруг PNG». */
export function ThemeTile({
  id,
  label,
  to,
  size = 80,
}: {
  id: ThemeIconId
  label: string
  to?: string
  size?: number
}) {
  const inner = (
    <Magnetic strength={0.22} className="w-full">
      <span className="group flex w-full flex-col items-center rounded-2xl border border-line/70 bg-paper/80 px-2 pb-3 pt-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-white">
        <ThemeIcon id={id} size={size} />
        <span className="mt-2.5 text-center text-[13px] font-semibold leading-tight text-ink/90">{label}</span>
      </span>
    </Magnetic>
  )
  if (!to) return <div className="w-full">{inner}</div>
  return (
    <Link to={to} className="block w-full">
      {inner}
    </Link>
  )
}

export function ThemeTileRow({
  items,
  className = '',
}: {
  items: { id: ThemeIconId; label: string; to?: string }[]
  className?: string
}) {
  return (
    <ul className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 ${className}`}>
      {items.map((it) => (
        <li key={it.id + it.label}>
          <ThemeTile id={it.id} label={it.label} to={it.to} size={104} />
        </li>
      ))}
    </ul>
  )
}

export function ArticleCover({
  icon,
  title,
  category,
  meta,
  large,
}: {
  icon: ThemeIconId
  title?: string
  category?: string
  meta?: string
  large?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line bg-fog/40 ${
        large ? 'min-h-[220px] px-6 py-8 md:min-h-[280px] md:px-10 md:py-12' : 'h-40 px-4 py-4'
      }`}
    >
      <div className={`relative flex ${large ? 'h-full items-end gap-6' : 'h-full items-center justify-between gap-3'}`}>
        <div className={large ? 'max-w-xl' : 'min-w-0'}>
          {category ? (
            <span className="inline-flex rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-medium text-ink">
              {category}
            </span>
          ) : null}
          {meta ? <p className="mt-2 font-mono text-[11px] text-mist">{meta}</p> : null}
          {title && large ? <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{title}</h2> : null}
        </div>
        <ThemeIcon id={icon} size={large ? 140 : 100} className="shrink-0" />
      </div>
    </div>
  )
}
