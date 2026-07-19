/**
 * Multi-currency cost-basis computation.
 *
 * Spec §3.1 F-003, AC-0002: weighted-average cost in original currency
 * and NTD equivalent using buy-date FX rates.
 *
 * Sign convention:
 *   - All amounts are stored as positive magnitudes
 *   - quantity is always ≥ 0
 *   - realised P&L uses sell.quantity × (sellPrice - avgCost)
 */

import type { Transaction } from './csv-parsers'

export interface FxRateMap {
  // date 'YYYY-MM-DD' → currency → rate to NTD
  [date: string]: Record<string, number>
}

export interface Lot {
  date: string
  quantity: number
  price: number // in original currency
  currency: Transaction['currency']
  fxRate: number // NTD per 1 unit of currency at buy date
}

export interface SymbolPosition {
  symbol: string
  currency: Transaction['currency']
  quantity: number
  avgCost: number // in original currency (weighted average)
  avgCostNTD: number // weighted average × buy-date fx
  totalCostNTD: number
  lots: Lot[]
}

export interface RealisedTrade {
  symbol: string
  date: string
  quantity: number
  proceeds: number
  costBasisNTD: number
  pnlNTD: number
}

export function getFxRate(rates: FxRateMap, date: string, currency: Transaction['currency']): number {
  if (currency === 'NTD') return 1
  const day = rates[date]
  if (day && typeof day[currency] === 'number') return day[currency]
  // fallback: look at most recent prior date
  const dates = Object.keys(rates).filter(d => d <= date).sort()
  for (let i = dates.length - 1; i >= 0; i--) {
    const r = rates[dates[i]]
    if (r && typeof r[currency] === 'number') return r[currency]
  }
  throw new Error(`No FX rate for ${currency} on or before ${date}`)
}

export function computePositions(txns: Transaction[], rates: FxRateMap): SymbolPosition[] {
  const bySymbol = new Map<string, SymbolPosition>()

  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date))

  for (const t of sorted) {
    if (t.type === 'dividend') continue
    let pos = bySymbol.get(t.symbol)
    if (!pos) {
      pos = {
        symbol: t.symbol,
        currency: t.currency,
        quantity: 0,
        avgCost: 0,
        avgCostNTD: 0,
        totalCostNTD: 0,
        lots: [],
      }
      bySymbol.set(t.symbol, pos)
    }
    if (t.type === 'buy') {
      const fx = getFxRate(rates, t.date, t.currency)
      const lot: Lot = { date: t.date, quantity: t.quantity, price: t.price, currency: t.currency, fxRate: fx }
      const newQty = pos.quantity + t.quantity
      // weighted average cost in NTD = (prev cost + new cost) / new qty
      const newCostNTD = pos.totalCostNTD + t.quantity * t.price * fx
      pos.quantity = newQty
      pos.totalCostNTD = newCostNTD
      pos.avgCostNTD = newQty > 0 ? newCostNTD / newQty : 0
      pos.avgCost = newQty > 0 ? pos.avgCostNTD / fx : 0
      pos.lots.push(lot)
    } else if (t.type === 'sell') {
      if (t.quantity > pos.quantity) {
        throw new Error(`sell ${t.quantity} exceeds held ${pos.quantity} for ${t.symbol}`)
      }
      const costPerUnit = pos.avgCostNTD // NTD per share
      const proceedsNTD = t.quantity * t.price * getFxRate(rates, t.date, t.currency)
      const costBasisNTD = t.quantity * costPerUnit
      pos.quantity -= t.quantity
      pos.totalCostNTD = pos.quantity > 0 ? pos.totalCostNTD - costBasisNTD : 0
      pos.avgCostNTD = pos.quantity > 0 ? pos.totalCostNTD / pos.quantity : 0
      if (pos.quantity > 0) {
        pos.avgCost = pos.avgCostNTD / getFxRate(rates, t.date, pos.currency)
      } else {
        pos.avgCost = 0
        pos.lots = []
      }
    }
  }

  return [...bySymbol.values()]
}

export function computeRealised(txns: Transaction[], rates: FxRateMap): RealisedTrade[] {
  const realised: RealisedTrade[] = []
  const positions = new Map<string, { quantity: number; avgCostNTD: number }>()

  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date))

  for (const t of sorted) {
    if (t.type === 'dividend') continue
    let p = positions.get(t.symbol)
    if (!p) {
      p = { quantity: 0, avgCostNTD: 0 }
      positions.set(t.symbol, p)
    }
    if (t.type === 'buy') {
      const fx = getFxRate(rates, t.date, t.currency)
      const newQty = p.quantity + t.quantity
      p.avgCostNTD = newQty > 0 ? (p.avgCostNTD * p.quantity + t.quantity * t.price * fx) / newQty : 0
      p.quantity = newQty
    } else {
      const proceeds = t.quantity * t.price * getFxRate(rates, t.date, t.currency)
      const costBasis = t.quantity * p.avgCostNTD
      realised.push({
        symbol: t.symbol,
        date: t.date,
        quantity: t.quantity,
        proceeds,
        costBasisNTD: costBasis,
        pnlNTD: proceeds - costBasis,
      })
      p.quantity -= t.quantity
      if (p.quantity === 0) p.avgCostNTD = 0
    }
  }
  return realised
}