import { Link } from 'react-router-dom'

type MarkProps = {
  className?: string
}

/** Эмблема с wiaf.ru (`/img/ww2-1.png`). */
export function Mark({ className }: MarkProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}brand/wiaf-logo.png`}
      alt=""
      width={40}
      height={40}
      className={`object-contain ${className ?? 'size-10'}`}
      decoding="async"
    />
  )
}

export function Wordmark({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline">
      <Mark className={compact ? 'size-9 shrink-0' : 'size-11 shrink-0'} />
      <span className="leading-none">
        <span
          className={`block font-semibold tracking-tight ${compact ? 'text-[1.15rem]' : 'text-[1.35rem]'} ${
            light ? 'text-white' : 'text-ink'
          }`}
        >
          wIaF
        </span>
        {!compact ? (
          <span
            className={`mt-0.5 block text-[10px] font-medium tracking-wide ${light ? 'text-white/70' : 'text-muted'}`}
          >
            аукцион перевозок
          </span>
        ) : (
          <span
            className={`block font-mono text-[9px] uppercase tracking-[0.16em] ${light ? 'text-white/55' : 'text-mist'}`}
          >
            аукцион
          </span>
        )}
      </span>
    </Link>
  )
}
