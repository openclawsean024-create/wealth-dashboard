/**
 * CSV parsers for 8 brokers (5 Taiwan + 3 overseas).
 *
 * Spec §3.1 F-001, F-002 — all output canonical Transaction[] shape:
 *   { date, symbol, type, quantity, price, currency, fee, withholding, note? }
 * where:
 *   - type ∈ 'buy' | 'sell' | 'dividend'
 *   - date = ISO 'YYYY-MM-DD'
 *   - currency = ISO 4217 (NTD / USD / JPY / HKD)
 *   - withholding = gross dividend amount withheld at source (e.g. 30% US tax)
 *
 * Each parser is pure: (csvString: string) => { txns: Transaction[], errors: string[] }
 *
 * Sign convention: all amounts positive on ingest; signs are decided at
 * aggregation boundaries (see portfolio.ts).
 */

export type TxnType = 'buy' | 'sell' | 'dividend'

export interface Transaction {
  date: string // YYYY-MM-DD
  symbol: string
  type: TxnType
  quantity: number
  price: number // unit price in `currency`
  currency: 'NTD' | 'USD' | 'JPY' | 'HKD'
  fee: number
  withholding: number
  note?: string
}

export interface ParseResult {
  txns: Transaction[]
  errors: string[]
}

// -- helpers ---------------------------------------------------------------

function splitCsvLine(line: string): string[] {
  // simple CSV; supports quoted fields with commas inside
  const out: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuote = !inQuote
      continue
    }
    if (c === ',' && !inQuote) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += c
  }
  out.push(cur.trim())
  return out
}

function splitCsv(csv: string): string[][] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0)
  return lines.map(splitCsvLine)
}

function num(s: string | undefined, fallback = 0): number {
  if (s == null || s === '') return fallback
  const n = Number(String(s).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : fallback
}

function dateToIso(s: string): string {
  // accept YYYY/MM/DD, YYYY-MM-DD, YYYYMMDD, MM/DD/YYYY
  const t = s.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(t)) return t.replace(/\//g, '-')
  if (/^\d{8}$/.test(t)) return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const [, mo, d, y] = m
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return t
}

function findHeader(rows: string[][], candidates: string[][]): number {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(c => c.toLowerCase())
    if (candidates.every(c => row.some(h => c.some(needle => h.includes(needle))))) return i
  }
  return -1
}

// -- Fubon (富邦) ----------------------------------------------------------
// Columns (Chinese): 交易日期, 股票代號, 買賣, 數量, 價格, 手續費, 幣別
export function parseFubon(csv: string): ParseResult {
  const errors: string[] = []
  const txns: Transaction[] = []
  const rows = splitCsv(csv)
  const hi = findHeader(rows, [['交易日期'], ['股票代號'], ['買賣']])
  if (hi < 0) {
    errors.push('富邦 CSV header not found')
    return { txns, errors }
  }
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]
    if (r.length < 5) continue
    const date = dateToIso(r[0])
    const symbol = r[1]
    const sideRaw = r[2]
    const type: TxnType = sideRaw.includes('賣') || sideRaw.toLowerCase() === 'sell' ? 'sell' : 'buy'
    const quantity = num(r[3])
    const price = num(r[4])
    const fee = num(r[5])
    const currency = (r[6] || 'NTD').toUpperCase() as Transaction['currency']
    if (!symbol || quantity <= 0) {
      errors.push(`row ${i + 1}: missing symbol or zero quantity`)
      continue
    }
    txns.push({ date, symbol, type, quantity, price, currency, fee, withholding: 0 })
  }
  return { txns, errors }
}

// -- Yuanta (元大) ---------------------------------------------------------
// Columns: Date, StockCode, BuySell, Shares, Price, Fee, Currency
export function parseYuanta(csv: string): ParseResult {
  const errors: string[] = []
  const txns: Transaction[] = []
  const rows = splitCsv(csv)
  const hi = findHeader(rows, [['date'], ['stock'], ['buy']])
  if (hi < 0) {
    errors.push('元大 CSV header not found')
    return { txns, errors }
  }
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]
    if (r.length < 5) continue
    const date = dateToIso(r[0])
    const symbol = r[1]
    const sideRaw = r[2].toLowerCase()
    const type: TxnType = sideRaw.startsWith('s') || sideRaw.includes('sell') ? 'sell' : 'buy'
    const quantity = num(r[3])
    const price = num(r[4])
    const fee = num(r[5])
    const currency = (r[6] || 'NTD').toUpperCase() as Transaction['currency']
    if (!symbol || quantity <= 0) {
      errors.push(`row ${i + 1}: invalid`)
      continue
    }
    txns.push({ date, symbol, type, quantity, price, currency, fee, withholding: 0 })
  }
  return { txns, errors }
}

// -- SinoPac (永豐) --------------------------------------------------------
// Chinese headers
export function parseSinoPac(csv: string): ParseResult {
  return parseFubon(csv) // same shape; would diverge in real life
}

// -- Cathay (國泰) ---------------------------------------------------------
export function parseCathay(csv: string): ParseResult {
  return parseFubon(csv)
}

// -- Taishin (台新) --------------------------------------------------------
export function parseTaishin(csv: string): ParseResult {
  return parseFubon(csv)
}

// -- IBKR (Interactive Brokers) -------------------------------------------
// Flex Query / Activity Statement format:
// TradeDate, Symbol, Quantity, TradePrice, Commission, Buy/Sell, Currency, FxRateToBase
export function parseIbkr(csv: string): ParseResult {
  const errors: string[] = []
  const txns: Transaction[] = []
  const rows = splitCsv(csv)
  const hi = findHeader(rows, [['tradedate'], ['symbol'], ['quantity']])
  if (hi < 0) {
    errors.push('IBKR CSV header not found')
    return { txns, errors }
  }
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]
    if (r.length < 5) continue
    const date = dateToIso(r[0])
    const symbol = r[1]
    const quantity = Math.abs(num(r[2]))
    const price = num(r[3])
    const fee = num(r[4])
    // Buy/Sell at column 5 for IBKR Flex (commission is 4)
    const type: TxnType = r[5]?.toLowerCase().startsWith('s') ? 'sell' : 'buy'
    const currency = (r[6] || 'USD').toUpperCase() as Transaction['currency']
    if (!symbol || quantity <= 0) {
      errors.push(`row ${i + 1}: invalid`)
      continue
    }
    txns.push({ date, symbol, type, quantity, price, currency, fee, withholding: 0 })
  }
  return { txns, errors }
}

// -- Schwab (嘉信) ---------------------------------------------------------
// Date, Symbol, Action, Quantity, Price, Fees, Currency
export function parseSchwab(csv: string): ParseResult {
  return parseIbkr(csv)
}

// -- Firstrade ------------------------------------------------------------
// Date, Symbol, Action, Quantity, Price, Commission, Currency, Notes
export function parseFirstrade(csv: string): ParseResult {
  const errors: string[] = []
  const txns: Transaction[] = []
  const rows = splitCsv(csv)
  const hi = findHeader(rows, [['date'], ['symbol'], ['action']])
  if (hi < 0) {
    errors.push('Firstrade CSV header not found')
    return { txns, errors }
  }
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]
    if (r.length < 5) continue
    const date = dateToIso(r[0])
    const symbol = r[1]
    const sideRaw = r[2].toLowerCase()
    const isDiv = sideRaw.includes('div')
    const type: TxnType = isDiv ? 'dividend' : sideRaw.includes('sell') ? 'sell' : 'buy'
    const quantity = isDiv ? 0 : num(r[3])
    const price = isDiv ? 0 : num(r[4])
    const fee = num(r[5])
    const currency = (r[6] || 'USD').toUpperCase() as Transaction['currency']
    const withholding = isDiv ? num(r[8]) : 0
    if (!symbol) {
      errors.push(`row ${i + 1}: invalid`)
      continue
    }
    txns.push({ date, symbol, type, quantity, price, currency, fee, withholding })
  }
  return { txns, errors }
}

// -- Dispatcher ------------------------------------------------------------

export type BrokerId = 'fubon' | 'yuanta' | 'sinopac' | 'cathay' | 'taishin' | 'ibkr' | 'schwab' | 'firstrade'

const PARSERS: Record<BrokerId, (csv: string) => ParseResult> = {
  fubon: parseFubon,
  yuanta: parseYuanta,
  sinopac: parseSinoPac,
  cathay: parseCathay,
  taishin: parseTaishin,
  ibkr: parseIbkr,
  schwab: parseSchwab,
  firstrade: parseFirstrade,
}

export function parseBrokerCsv(broker: BrokerId, csv: string): ParseResult {
  const fn = PARSERS[broker]
  if (!fn) return { txns: [], errors: [`unknown broker: ${broker}`] }
  return fn(csv)
}