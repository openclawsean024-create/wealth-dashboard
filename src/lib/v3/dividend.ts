/**
 * Dividend reinvestment + 30% US withholding tax handling.
 *
 * Spec §3.1 F-004, F-005, AC-0004: US dividends auto-deduct 30% withholding
 * (Form 1042-S). Reinvest mode adds a synthetic buy at ex-div close price.
 */

import type { Transaction } from './csv-parsers'
import { computePositions, type FxRateMap, type SymbolPosition } from './cost-basis'

export interface ExDivPriceMap {
  // symbol → YYYY-MM-DD → close price (in original currency)
  [symbol: string]: Record<string, number>
}

export interface DividendEvent {
  symbol: string
  date: string
  grossAmount: number // in original currency
  withholding: number // already-withheld tax
  netAmount: number // grossAmount - withholding
  reinvestedShares: number
  reinvestPrice: number
  reinvestCurrency: Transaction['currency']
}

export const US_WITHHOLDING_RATE = 0.30

export function applyWithholding(txn: Transaction): Transaction {
  if (txn.type !== 'dividend') return txn
  // if withholding not set, default 30% for US (USD) holdings
  if (txn.withholding > 0 || txn.currency !== 'USD') return txn
  const gross = txn.quantity * txn.price
  return { ...txn, withholding: gross * US_WITHHOLDING_RATE }
}

export function reinvestDividends(
  txns: Transaction[],
  exDivPrices: ExDivPriceMap,
): { txns: Transaction[]; events: DividendEvent[] } {
  const out: Transaction[] = []
  const events: DividendEvent[] = []
  for (const t of txns) {
    if (t.type !== 'dividend') {
      out.push(t)
      continue
    }
    const normalized = applyWithholding(t)
    out.push(normalized)
    const gross = normalized.quantity * normalized.price
    const net = gross - normalized.withholding
    const priceMap = exDivPrices[normalized.symbol]
    const close = priceMap?.[normalized.date]
    if (!close || close <= 0) continue
    const shares = net / close
    if (shares <= 0) continue
    out.push({
      date: normalized.date,
      symbol: normalized.symbol,
      type: 'buy',
      quantity: shares,
      price: close,
      currency: normalized.currency,
      fee: 0,
      withholding: 0,
      note: `reinvest of ${normalized.symbol} dividend`,
    })
    events.push({
      symbol: normalized.symbol,
      date: normalized.date,
      grossAmount: gross,
      withholding: normalized.withholding,
      netAmount: net,
      reinvestedShares: shares,
      reinvestPrice: close,
      reinvestCurrency: normalized.currency,
    })
  }
  return { txns: out, events }
}

export interface PortfolioSummary {
  totalCostNTD: number
  totalQuantity: number
  positionCount: number
  byCurrency: Record<string, number>
}

export function summarize(positions: SymbolPosition[]): PortfolioSummary {
  const byCurrency: Record<string, number> = {}
  let totalCost = 0
  let totalQty = 0
  for (const p of positions) {
    totalCost += p.totalCostNTD
    totalQty += p.quantity
    byCurrency[p.currency] = (byCurrency[p.currency] ?? 0) + p.quantity
  }
  return {
    totalCostNTD: totalCost,
    totalQuantity: totalQty,
    positionCount: positions.length,
    byCurrency,
  }
}

export function runPortfolio(
  txns: Transaction[],
  rates: FxRateMap,
  exDivPrices: ExDivPriceMap = {},
) {
  const { txns: finalTxns, events } = reinvestDividends(txns, exDivPrices)
  const positions = computePositions(finalTxns, rates)
  const summary = summarize(positions)
  return { finalTxns, positions, summary, dividendEvents: events }
}