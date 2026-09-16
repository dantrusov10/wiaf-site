import { ArrowDown, ArrowUp, ArrowUpDown, Filter, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

export type Col<T> = {
  key: string
  label: string
  /** значение для сортировки / фильтра / поиска */
  get: (row: T) => string | number | null | undefined
  /** ячейка; по умолчанию String(get) */
  cell?: (row: T) => ReactNode
  /** ширина / mono */
  className?: string
  sortType?: 'string' | 'number'
  /** false = не показывать в раскрытой панели фильтров */
  filterable?: boolean
}

type Props<T> = {
  rows: T[]
  columns: Col<T>[]
  rowKey: (row: T) => string
  empty?: ReactNode
  /** панель справа при клике на строку */
  renderDetail?: (row: T, close: () => void) => ReactNode
  searchPlaceholder?: string
  /** доп. фильтры-кнопки: значение → label */
  facetKey?: string
  facetAllLabel?: string
  /** стартовые значения фильтров (например из ?week=) */
  initialFilters?: Record<string, string>
  /** открыть панель фильтров сразу */
  initialFiltersOpen?: boolean
}

function cmp(a: string | number | null | undefined, b: string | number | null | undefined, type: 'string' | 'number') {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (type === 'number') return Number(a) - Number(b)
  return String(a).localeCompare(String(b), 'ru', { numeric: true, sensitivity: 'base' })
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  empty,
  renderDetail,
  searchPlaceholder = 'Поиск по ключевым словам…',
  facetKey,
  facetAllLabel = 'Все',
  initialFilters,
  initialFiltersOpen,
}: Props<T>) {
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [facet, setFacet] = useState<string>('__all__')
  const [filters, setFilters] = useState<Record<string, string>>(() => ({ ...(initialFilters ?? {}) }))
  const [filtersOpen, setFiltersOpen] = useState(() =>
    Boolean(initialFiltersOpen || (initialFilters && Object.values(initialFilters).some((v) => v.trim()))),
  )
  const [selected, setSelected] = useState<string | null>(null)

  // синхронизация при смене query (drill-down с главной ЛК)
  const initKey = JSON.stringify(initialFilters ?? {})
  useEffect(() => {
    if (!initialFilters) return
    setFilters((prev) => ({ ...prev, ...initialFilters }))
    if (Object.values(initialFilters).some((v) => v.trim())) setFiltersOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initKey отражает содержимое
  }, [initKey])

  const facetCol = facetKey ? columns.find((c) => c.key === facetKey) : undefined
  const facetValues = useMemo(() => {
    if (!facetCol) return [] as string[]
    const set = new Set<string>()
    for (const r of rows) {
      const v = facetCol.get(r)
      if (v != null && String(v).trim()) set.add(String(v))
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
  }, [rows, facetCol])

  const filterableCols = columns.filter((c) => c.filterable !== false)
  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length

  const filtered = useMemo(() => {
    const tokens = q
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)

    let list = rows
    if (facetCol && facet !== '__all__') {
      list = list.filter((r) => String(facetCol.get(r) ?? '') === facet)
    }
    for (const [k, v] of Object.entries(filters)) {
      if (!v.trim()) continue
      const col = columns.find((c) => c.key === k)
      if (!col) continue
      const needle = v.toLowerCase()
      list = list.filter((r) => String(col.get(r) ?? '').toLowerCase().includes(needle))
    }
    if (tokens.length) {
      list = list.filter((r) => {
        const hay = columns
          .map((c) => String(c.get(r) ?? ''))
          .join(' · ')
          .toLowerCase()
        return tokens.every((t) => hay.includes(t))
      })
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      if (col) {
        const type = col.sortType ?? (typeof col.get(rows[0] ?? ({} as T)) === 'number' ? 'number' : 'string')
        list = [...list].sort((a, b) => {
          const d = cmp(col.get(a), col.get(b), type)
          return sortDir === 'asc' ? d : -d
        })
      }
    }
    return list
  }, [rows, columns, q, sortKey, sortDir, facet, facetCol, filters])

  const selectedRow = selected ? (filtered.find((r) => rowKey(r) === selected) ?? rows.find((r) => rowKey(r) === selected)) : null

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const clearFilters = () => {
    setFilters({})
    setFacet('__all__')
    setQ('')
  }

  if (!rows.length) {
    return <>{empty ?? <p className="px-4 py-8 text-center text-[13.5px] text-muted">Нет строк.</p>}</>
  }

  return (
    <div className={`flex min-h-[28rem] gap-0 ${selectedRow && renderDetail ? 'lg:gap-0' : ''}`}>
      <div className={`min-w-0 flex-1 transition-[flex-basis] duration-300 ${selectedRow && renderDetail ? 'lg:basis-1/2 lg:max-w-[50%]' : 'basis-full'}`}>
        <div className="border-b border-line bg-fog/40 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
              <Search className="size-4 shrink-0 text-mist" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-[13.5px] outline-none"
              />
              {q ? (
                <button type="button" className="text-mist hover:text-ink" onClick={() => setQ('')} aria-label="Очистить">
                  <X className="size-3.5" />
                </button>
              ) : null}
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition ${
                filtersOpen || activeFilterCount
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-line bg-white text-ink hover:border-brand'
              }`}
            >
              <Filter className="size-3.5" />
              Фильтр
              {activeFilterCount ? (
                <span className="rounded-full bg-brand px-1.5 py-0.5 font-mono text-[10px] text-white">{activeFilterCount}</span>
              ) : null}
            </button>
            {activeFilterCount || q || facet !== '__all__' ? (
              <button type="button" onClick={clearFilters} className="text-[12px] text-mist underline hover:text-ink">
                Сбросить
              </button>
            ) : null}
          </div>

          {facetCol ? (
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                className={`rounded-md px-2.5 py-1 text-[12px] ${facet === '__all__' ? 'bg-brand text-white' : 'bg-white text-muted hover:text-ink'}`}
                onClick={() => setFacet('__all__')}
              >
                {facetAllLabel}
              </button>
              {facetValues.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`rounded-md px-2.5 py-1 text-[12px] ${facet === v ? 'bg-brand text-white' : 'bg-white text-muted hover:text-ink'}`}
                  onClick={() => setFacet(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          ) : null}

          {filtersOpen ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filterableCols.map((c) => (
                <label key={c.key} className="block">
                  <span className="mb-0.5 block font-mono text-[10px] uppercase tracking-wide text-mist">{c.label}</span>
                  <input
                    value={filters[c.key] ?? ''}
                    onChange={(e) => setFilters((f) => ({ ...f, [c.key]: e.target.value }))}
                    placeholder={`Фильтр: ${c.label}`}
                    className="w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-brand"
                  />
                </label>
              ))}
            </div>
          ) : null}

          <p className="mt-2 font-mono text-[11px] text-mist">
            {filtered.length} из {rows.length}
            {q ? ` · «${q}»` : ''}
            {facet !== '__all__' ? ` · ${facet}` : ''}
            {activeFilterCount ? ` · фильтров: ${activeFilterCount}` : ''}
          </p>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="sticky top-0 z-10 border-b border-line bg-white font-mono text-[10px] uppercase tracking-wide text-mist">
              <tr>
                {columns.map((c) => {
                  const active = sortKey === c.key
                  return (
                    <th key={c.key} className={`py-2.5 pl-3 pr-2 ${c.className ?? ''}`}>
                      <button type="button" className="inline-flex items-center gap-1 hover:text-ink" onClick={() => toggleSort(c.key)}>
                        {c.label}
                        {active ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="size-3 text-brand" />
                          ) : (
                            <ArrowDown className="size-3 text-brand" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 opacity-40" />
                        )}
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                    Ничего не найдено. Сбросьте поиск или фильтры.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const id = rowKey(row)
                  const on = selected === id
                  return (
                    <tr
                      key={id}
                      className={`cursor-pointer border-b border-line/80 last:border-0 ${on ? 'bg-brand/10' : 'hover:bg-fog/60'}`}
                      onClick={() => {
                        if (!renderDetail) return
                        setSelected((cur) => (cur === id ? null : id))
                      }}
                    >
                      {columns.map((c) => (
                        <td key={c.key} className={`py-2.5 pl-3 pr-2 ${c.className ?? ''}`}>
                          {c.cell ? c.cell(row) : String(c.get(row) ?? '—')}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRow && renderDetail ? (
        <aside className="flex w-full shrink-0 flex-col border-t border-line bg-white lg:w-1/2 lg:border-l lg:border-t-0 animate-[slideIn_0.28s_ease]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-semibold">Карточка</p>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted hover:bg-fog hover:text-ink"
              onClick={() => setSelected(null)}
            >
              <X className="size-3.5" />
              Закрыть
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{renderDetail(selectedRow, () => setSelected(null))}</div>
        </aside>
      ) : null}
    </div>
  )
}
