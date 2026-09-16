export function PageHero({
  kicker,
  title,
  dek,
}: {
  kicker: string
  title: string
  dek?: string
}) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 pt-24 pb-8 md:pt-28">
        <p className="text-[12px] font-medium text-brand">{kicker}</p>
        <h1 className="mt-1 max-w-3xl text-[1.85rem] font-semibold leading-tight tracking-tight text-ink md:text-[2.15rem]">{title}</h1>
        {dek ? <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">{dek}</p> : null}
      </div>
    </header>
  )
}
