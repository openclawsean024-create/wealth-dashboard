/**
 * Tax report generator + CSV/XLSX export.
 *
 * Spec §3.1 F-009: PDF/CSV 稅務報告.
 * For v3.0 MVP we generate a CSV-formatted report (the canonical
 * machine-readable format) and a structured summary object that the
 * UI / future PDF renderer can consume.
 */

import type { Transaction } from './csv-parsers'

export interface TaxReportRow {
  date: string
  symbol: string
  type: string
  quantity: number
  price: number
  currency: string
  proceedsNTD: number
  costBasisNTD: number
  pnlNTD: number
  withholdingNTD: number
  note?: string
}

export interface TaxReportSummary {
  totalProceedsNTD: number
  totalCostNTD: number
  totalPnLNTD: number
  totalWithholdingNTD: number
  taxableEvents: number
}

export interface TaxReport {
  generatedAt: string
  rows: TaxReportRow[]
  summary: TaxReportSummary
  csv: string
}

function getFxDefault(currency: string): number {
  // conservative default if no rates passed
  const map: Record<string, number> = { USD: 30, JPY: 0.2, HKD: 3.85, NTD: 1 }
  return map[currency] ?? 1
}

export function buildTaxReport(
  txns: Transaction[],
  fxRates: Record<string, Record<string, number>> = {},
): TaxReport {
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date))
  const rows: TaxReportRow[] = []
  let proceeds = 0
  let cost = 0
  let pnl = 0
  let wh = 0
  let taxable = 0
  // running avg cost in NTD per symbol
  const avg = new Map<string, { qty: number; costNTD: number; currency: string }>()

  for (const t of sorted) {
    const fx =
      fxRates[t.date]?.[t.currency] ?? getFxDefault(t.currency)
    let row: TaxReportRow
    if (t.type === 'buy') {
      let s = avg.get(t.symbol)
      if (!s) {
        s = { qty: 0, costNTD: 0, currency: t.currency }
        avg.set(t.symbol, s)
      }
      const addCost = t.quantity * t.price * fx
      s.qty += t.quantity
      s.costNTD += addCost
      row = {
        date: t.date,
        symbol: t.symbol,
        type: 'buy',
        quantity: t.quantity,
        price: t.price,
        currency: t.currency,
        proceedsNTD: 0,
        costBasisNTD: addCost,
        pnlNTD: 0,
        withholdingNTD: 0,
      }
    } else if (t.type === 'sell') {
      const s = avg.get(t.symbol)
      const unitCostNTD = s && s.qty > 0 ? s.costNTD / s.qty : 0
      const basis = t.quantity * unitCostNTD
      const proc = t.quantity * t.price * fx
      if (s) {
        s.qty -= t.quantity
        s.costNTD = s.qty > 0 ? s.costNTD - basis : 0
      }
      const gain = proc - basis
      row = {
        date: t.date,
        symbol: t.symbol,
        type: 'sell',
        quantity: t.quantity,
        price: t.price,
        currency: t.currency,
        proceedsNTD: proc,
        costBasisNTD: basis,
        pnlNTD: gain,
        withholdingNTD: 0,
      }
      proceeds += proc
      cost += basis
      pnl += gain
      taxable += 1
    } else {
      // dividend
      const gross = t.quantity * t.price * fx
      const whLocal = t.withholding * fx
      row = {
        date: t.date,
        symbol: t.symbol,
        type: 'dividend',
        quantity: t.quantity,
        price: t.price,
        currency: t.currency,
        proceedsNTD: gross,
        costBasisNTD: 0,
        pnlNTD: gross,
        withholdingNTD: whLocal,
      }
      proceeds += gross
      pnl += gross
      wh += whLocal
      taxable += 1
    }
    rows.push(row)
  }

  const csv = [
    'date,symbol,type,quantity,price,currency,proceedsNTD,costBasisNTD,pnlNTD,withholdingNTD',
    ...rows.map(r =>
      [
        r.date,
        r.symbol,
        r.type,
        r.quantity,
        r.price,
        r.currency,
        r.proceedsNTD.toFixed(2),
        r.costBasisNTD.toFixed(2),
        r.pnlNTD.toFixed(2),
        r.withholdingNTD.toFixed(2),
      ].join(','),
    ),
  ].join('\n')

  return {
    generatedAt: new Date().toISOString(),
    rows,
    summary: {
      totalProceedsNTD: proceeds,
      totalCostNTD: cost,
      totalPnLNTD: pnl,
      totalWithholdingNTD: wh,
      taxableEvents: taxable,
    },
    csv,
  }
}

export function rebalanceSuggestion(
  positions: { symbol: string; quantity: number; avgCostNTD: number; currentPriceNTD: number }[],
  targetWeights: Record<string, number>,
): { symbol: string; action: 'buy' | 'sell' | 'hold'; shares: number; reason: string }[] {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPriceNTD, 0)
  if (totalValue <= 0) return []
  return positions.map(p => {
    const currentWeight = (p.quantity * p.currentPriceNTD) / totalValue
    const targetWeight = targetWeights[p.symbol] ?? 0
    const targetValue = totalValue * targetWeight
    const currentValue = p.quantity * p.currentPriceNTD
    const deltaValue = targetValue - currentValue
    const shares = p.currentPriceNTD > 0 ? Math.round(deltaValue / p.currentPriceNTD) : 0
    let action: 'buy' | 'sell' | 'hold' = 'hold'
    if (shares > 0) action = 'buy'
    else if (shares < 0) action = 'sell'
    const reason =
      Math.abs(currentWeight - targetWeight) < 0.01
        ? 'within band'
        : `${(currentWeight * 100).toFixed(1)}% vs target ${(targetWeight * 100).toFixed(1)}%`
    return { symbol: p.symbol, action, shares, reason }
  })
}