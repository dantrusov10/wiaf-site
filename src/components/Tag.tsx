export function Tag({
  children,
  tone = 'ink',
}: {
  children: string
  tone?: 'ink' | 'brand' | 'ok'
}) {
  const color =
    tone === 'brand'
      ? 'border-brand/25 bg-brand/10 text-brand'
      : tone === 'ok'
        ? 'border-ok/25 bg-ok/10 text-ok'
        : 'border-line bg-white text-muted'
  return (
    <span className={`inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${color}`}>
      {children}
    </span>
  )
}
