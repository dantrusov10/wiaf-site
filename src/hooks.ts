import { useEffect, useState } from 'react'

export function formatDiff(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const clock = `${pad(h)}:${pad(m)}:${pad(s)}`
  return d > 0 ? `${d}д ${clock}` : clock
}

export function useCountdown(targetIso: string) {
  const now = useNow(1000)
  const diff = new Date(targetIso).getTime() - now
  if (diff <= 0) {
    return { label: 'окно торгов', ended: true as const }
  }
  return { label: formatDiff(diff), ended: false as const }
}

export function useSlotClock(startIso: string, endIso: string) {
  const now = useNow(1000)
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  if (now < start) return { phase: 'queue' as const, label: formatDiff(start - now) }
  if (now < end) return { phase: 'live' as const, label: formatDiff(end - now) }
  return { phase: 'closed' as const, label: 'закрыт' }
}

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}
