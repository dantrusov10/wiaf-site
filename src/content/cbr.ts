/** Курсы ЦБ — снимок для макета + попытка живого XML ЦБ РФ. */

export type CbrRate = {
  code: string
  name: string
  nominal: number
  value: number
}

export const cbrFallbackDate = '2026-09-15'

export const cbrFallback: CbrRate[] = [
  { code: 'USD', name: 'Доллар США', nominal: 1, value: 96.12 },
  { code: 'EUR', name: 'Евро', nominal: 1, value: 104.85 },
  { code: 'CNY', name: 'Китайский юань', nominal: 1, value: 13.28 },
  { code: 'TRY', name: 'Турецкая лира', nominal: 10, value: 28.41 },
  { code: 'KZT', name: 'Казахстанский тенге', nominal: 100, value: 18.92 },
]

const CBR_XML = 'https://www.cbr.ru/scripts/XML_daily.asp'

function parseRuFloat(s: string) {
  return Number(s.replace(',', '.'))
}

export async function fetchCbrRates(): Promise<{ date: string; rates: CbrRate[]; live: boolean }> {
  try {
    const res = await fetch(CBR_XML, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) throw new Error('cbr http')
    const xml = await res.text()
    const dateMatch = xml.match(/Date="([^"]+)"/)
    const date = dateMatch?.[1] ?? cbrFallbackDate
    const want = new Set(['USD', 'EUR', 'CNY', 'TRY', 'KZT'])
    const rates: CbrRate[] = []
    const re = /<Valute[^>]*>[\s\S]*?<CharCode>(\w+)<\/CharCode>[\s\S]*?<Nominal>(\d+)<\/Nominal>[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?<Value>([^<]+)<\/Value>[\s\S]*?<\/Valute>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(xml))) {
      const code = m[1]
      if (!want.has(code)) continue
      rates.push({
        code,
        name: m[3],
        nominal: Number(m[2]),
        value: parseRuFloat(m[4]),
      })
    }
    if (rates.length < 3) throw new Error('parse')
    return { date, rates, live: true }
  } catch {
    return { date: cbrFallbackDate, rates: cbrFallback, live: false }
  }
}
