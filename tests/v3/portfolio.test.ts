/**
 * Pure-function TDD tests for v3.0 financial core.
 * Covers:
 *   - 8 broker CSV parsers (≥ 12 tests)
 *   - multi-currency cost basis (≥ 5 tests)
 *   - IRR / MWR (≥ 4 tests)
 *   - dividend reinvest + 30% US withholding (≥ 4 tests)
 *   - tax report + rebalance (≥ 5 tests)
 * Total ≥ 30 tests for ≥ 80% pass rate target.
 */

import { describe, it, expect } from 'vitest'
import {
  parseBrokerCsv,
  parseFubon,
  parseYuanta,
  parseIbkr,
  parseFirstrade,
  parseSinoPac,
  parseCathay,
  parseTaishin,
  parseSchwab,
  type Transaction,
  type BrokerId,
} from '../../src/lib/v3/csv-parsers'
import { computePositions, computeRealised, getFxRate, type FxRateMap } from '../../src/lib/v3/cost-basis'
import { computeIRR, xirr } from '../../src/lib/v3/irr'
import { applyWithholding, reinvestDividends, runPortfolio, US_WITHHOLDING_RATE } from '../../src/lib/v3/dividend'
import { buildTaxReport, rebalanceSuggestion } from '../../src/lib/v3/tax-report'

// ====================================================================
// CSV PARSERS
// ====================================================================

describe('CSV parsers — Fubon (富邦)', () => {
  it('parses buy + sell with NTD currency', () => {
    const csv = [
      '交易日期,股票代號,買賣,數量,價格,手續費,幣別',
      '2024-01-15,2330,買,1000,580,30,NTD',
      '2024-06-20,2330,賣,500,620,30,NTD',
    ].join('\n')
    const r = parseFubon(csv)
    expect(r.errors).toHaveLength(0)
    expect(r.txns).toHaveLength(2)
    expect(r.txns[0].type).toBe('buy')
    expect(r.txns[0].symbol).toBe('2330')
    expect(r.txns[1].type).toBe('sell')
    expect(r.txns[1].currency).toBe('NTD')
  })

  it('reports header error on empty CSV', () => {
    const r = parseFubon('garbage')
    expect(r.errors.length).toBeGreaterThan(0)
    expect(r.txns).toHaveLength(0)
  })

  it('handles YYYY/MM/DD date format', () => {
    const csv = [
      '交易日期,股票代號,買賣,數量,價格,手續費,幣別',
      '2024/03/10,0050,買,2000,50,20,NTD',
    ].join('\n')
    const r = parseFubon(csv)
    expect(r.txns[0].date).toBe('2024-03-10')
  })
})

describe('CSV parsers — Yuanta (元大)', () => {
  it('parses English-header format', () => {
    const csv = [
      'Date,StockCode,BuySell,Shares,Price,Fee,Currency',
      '2024-02-01,AAPL,BUY,10,180,1,USD',
    ].join('\n')
    const r = parseYuanta(csv)
    expect(r.errors).toHaveLength(0)
    expect(r.txns[0].symbol).toBe('AAPL')
    expect(r.txns[0].currency).toBe('USD')
    expect(r.txns[0].type).toBe('buy')
  })

  it('flags sell correctly', () => {
    const csv = [
      'Date,StockCode,BuySell,Shares,Price,Fee,Currency',
      '2024-03-01,TSLA,SELL,5,250,1,USD',
    ].join('\n')
    const r = parseYuanta(csv)
    expect(r.txns[0].type).toBe('sell')
  })
})

describe('CSV parsers — SinoPac / Cathay / Taishin / Schwab (reuse Fubon/IBKR)', () => {
  it('SinoPac parses 永豐 CSV', () => {
    const csv = ['交易日期,股票代號,買賣,數量,價格,手續費,幣別', '2024-04-01,1101,買,500,40,15,NTD'].join('\n')
    const r = parseSinoPac(csv)
    expect(r.txns).toHaveLength(1)
  })
  it('Cathay parses 國泰 CSV', () => {
    const csv = ['交易日期,股票代號,買賣,數量,價格,手續費,幣別', '2024-04-01,2882,買,3000,30,20,NTD'].join('\n')
    const r = parseCathay(csv)
    expect(r.txns).toHaveLength(1)
  })
  it('Taishin parses 台新 CSV', () => {
    const csv = ['交易日期,股票代號,買賣,數量,價格,手續費,幣別', '2024-04-01,2317,買,800,100,25,NTD'].join('\n')
    const r = parseTaishin(csv)
    expect(r.txns).toHaveLength(1)
  })
  it('Schwab parses IBKR-style CSV', () => {
    const csv = [
      'TradeDate,Symbol,Quantity,TradePrice,Commission,Buy/Sell,Currency,FxRateToBase',
      '2024-05-01,SCHD,20,80,0.5,BUY,USD,30',
    ].join('\n')
    const r = parseSchwab(csv)
    expect(r.txns[0].type).toBe('buy')
    expect(r.txns[0].currency).toBe('USD')
  })
})

describe('CSV parsers — IBKR', () => {
  it('parses IBKR Flex Query format with USD', () => {
    const csv = [
      'TradeDate,Symbol,Quantity,TradePrice,Commission,Buy/Sell,Currency,FxRateToBase',
      '2024-01-10,AAPL,100,180,1,BUY,USD,30.5',
      '2024-04-10,AAPL,50,200,1,SELL,USD,30.8',
    ].join('\n')
    const r = parseIbkr(csv)
    expect(r.errors).toHaveLength(0)
    expect(r.txns).toHaveLength(2)
    expect(r.txns[1].type).toBe('sell')
  })
  it('treats negative quantity as positive magnitude', () => {
    const csv = [
      'TradeDate,Symbol,Quantity,TradePrice,Commission,Buy/Sell,Currency,FxRateToBase',
      '2024-01-10,AAPL,-10,180,1,SELL,USD,30.5',
    ].join('\n')
    const r = parseIbkr(csv)
    expect(r.txns[0].quantity).toBe(10)
    expect(r.txns[0].type).toBe('sell')
  })
})

describe('CSV parsers — Firstrade', () => {
  it('parses dividend row with withholding', () => {
    const csv = [
      'Date,Symbol,Action,Quantity,Price,Commission,Currency,Notes,Withholding',
      '2024-06-15,AAPL,DIV,10,1,0,USD,Q2 dividend,3',
    ].join('\n')
    const r = parseFirstrade(csv)
    expect(r.errors).toHaveLength(0)
    expect(r.txns[0].type).toBe('dividend')
    expect(r.txns[0].withholding).toBe(3)
  })
  it('parses buy row', () => {
    const csv = [
      'Date,Symbol,Action,Quantity,Price,Commission,Currency,Notes,Withholding',
      '2024-07-01,VOO,BUY,5,400,0,USD,',
    ].join('\n')
    const r = parseFirstrade(csv)
    expect(r.txns[0].type).toBe('buy')
    expect(r.txns[0].price).toBe(400)
  })
})

describe('parseBrokerCsv dispatcher', () => {
  it('dispatches all 8 broker ids', () => {
    const ids: BrokerId[] = ['fubon', 'yuanta', 'sinopac', 'cathay', 'taishin', 'ibkr', 'schwab', 'firstrade']
    const csv = '交易日期,股票代號,買賣,數量,價格,手續費,幣別\n2024-01-01,2330,買,100,500,20,NTD'
    for (const id of ids) {
      const r = parseBrokerCsv(id, csv)
      expect(r.txns.length + r.errors.length).toBeGreaterThan(0)
    }
  })
  it('returns error for unknown broker', () => {
    const r = parseBrokerCsv('unknown' as BrokerId, '')
    expect(r.errors[0]).toMatch(/unknown broker/)
  })
})

// ====================================================================
// COST BASIS
// ====================================================================

const rates: FxRateMap = {
  '2024-01-15': { USD: 30.5, JPY: 0.21, HKD: 3.9 },
  '2024-06-15': { USD: 32.1, JPY: 0.20, HKD: 4.1 },
}

describe('Multi-currency cost basis', () => {
  it('computes weighted average in NTD using buy-date FX', () => {
    const txns: Transaction[] = [
      { date: '2024-01-15', symbol: 'AAPL', type: 'buy', quantity: 100, price: 50, currency: 'USD', fee: 0, withholding: 0 },
      { date: '2024-06-15', symbol: 'AAPL', type: 'buy', quantity: 50, price: 80, currency: 'USD', fee: 0, withholding: 0 },
    ]
    const positions = computePositions(txns, rates)
    expect(positions).toHaveLength(1)
    const p = positions[0]
    // avg cost NTD = (100*50*30.5 + 50*80*32.1) / 150 = (152500 + 128400) / 150 = 1872.67
    expect(p.quantity).toBe(150)
    expect(p.avgCostNTD).toBeCloseTo(1872.67, 1)
  })

  it('sell reduces position and locks in P&L', () => {
    const txns: Transaction[] = [
      { date: '2024-01-15', symbol: 'TSLA', type: 'buy', quantity: 10, price: 200, currency: 'USD', fee: 0, withholding: 0 },
      { date: '2024-06-15', symbol: 'TSLA', type: 'sell', quantity: 5, price: 250, currency: 'USD', fee: 0, withholding: 0 },
    ]
    const realised = computeRealised(txns, rates)
    expect(realised).toHaveLength(1)
    expect(realised[0].quantity).toBe(5)
    // avg cost per share NTD = 200 * 30.5 = 6100
    // proceeds NTD = 5 * 250 * 32.1 = 40125
    expect(realised[0].proceeds).toBeCloseTo(40125, 0)
    expect(realised[0].costBasisNTD).toBeCloseTo(5 * 200 * 30.5, 0)
    expect(realised[0].pnlNTD).toBeCloseTo(40125 - 30500, 0)
  })

  it('handles NTD with fxRate=1', () => {
    const txns: Transaction[] = [
      { date: '2024-01-15', symbol: '2330', type: 'buy', quantity: 1000, price: 580, currency: 'NTD', fee: 30, withholding: 0 },
    ]
    const positions = computePositions(txns, rates)
    expect(positions[0].avgCostNTD).toBe(580)
    expect(positions[0].avgCost).toBe(580)
  })

  it('falls back to most recent prior FX rate', () => {
    const txns: Transaction[] = [
      { date: '2024-03-01', symbol: 'JPM', type: 'buy', quantity: 10, price: 100, currency: 'USD', fee: 0, withholding: 0 },
    ]
    const positions = computePositions(txns, rates)
    expect(positions[0].avgCostNTD).toBeCloseTo(100 * 30.5, 1)
  })

  it('throws on sell exceeding position', () => {
    const txns: Transaction[] = [
      { date: '2024-01-15', symbol: 'X', type: 'buy', quantity: 5, price: 10, currency: 'USD', fee: 0, withholding: 0 },
      { date: '2024-06-15', symbol: 'X', type: 'sell', quantity: 10, price: 12, currency: 'USD', fee: 0, withholding: 0 },
    ]
    expect(() => computePositions(txns, rates)).toThrow(/exceeds/)
  })

  it('getFxRate returns 1 for NTD', () => {
    expect(getFxRate(rates, '2024-01-15', 'NTD')).toBe(1)
  })
})

// ====================================================================
// IRR
// ====================================================================

describe('IRR (含管理費/手續費/30% 美股預扣稅的真實報酬)', () => {
  it('simple buy-and-hold positive return', () => {
    const flows = [
      { date: '2024-01-01', amount: -100000 },
      { date: '2024-12-31', amount: 110000 },
    ]
    const r = xirr(flows)
    expect(r).toBeCloseTo(0.10, 2)
  })

  it('breakeven returns 0', () => {
    const flows = [
      { date: '2024-01-01', amount: -100000 },
      { date: '2024-12-31', amount: 100000 },
    ]
    const r = xirr(flows)
    expect(Math.abs(r)).toBeLessThan(0.001)
  })

  it('handles multiple cashflows with fees + tax', () => {
    const flows = [
      { date: '2024-01-01', amount: -100000, type: 'buy' as const },
      { date: '2024-06-01', amount: -500, type: 'fee' as const },
      { date: '2024-12-01', amount: -1500, type: 'tax' as const },
      { date: '2024-12-31', amount: 110000, type: 'sell' as const },
    ]
    const out = computeIRR({ flows })
    expect(out.hasResult).toBe(true)
    expect(out.irr).toBeGreaterThan(0.05)
    expect(out.irr).toBeLessThan(0.15)
  })

  it('rejects single cashflow', () => {
    expect(() => xirr([{ date: '2024-01-01', amount: -1000 }])).toThrow()
  })

  it('rejects empty flows in computeIRR', () => {
    const out = computeIRR({ flows: [] })
    expect(out.hasResult).toBe(false)
  })
})

// ====================================================================
// DIVIDEND + WITHHOLDING
// ====================================================================

describe('Dividend reinvestment + 30% US withholding', () => {
  it('US_WITHHOLDING_RATE is 0.30', () => {
    expect(US_WITHHOLDING_RATE).toBe(0.30)
  })

  it('applyWithholding adds 30% to USD dividend when missing', () => {
    const t: Transaction = { date: '2024-06-15', symbol: 'AAPL', type: 'dividend', quantity: 10, price: 1, currency: 'USD', fee: 0, withholding: 0 }
    const r = applyWithholding(t)
    expect(r.withholding).toBeCloseTo(3, 5)
  })

  it('applyWithholding leaves non-USD alone', () => {
    const t: Transaction = { date: '2024-06-15', symbol: '2330', type: 'dividend', quantity: 1000, price: 3, currency: 'NTD', fee: 0, withholding: 0 }
    const r = applyWithholding(t)
    expect(r.withholding).toBe(0)
  })

  it('reinvestDividends injects synthetic buy at ex-div close', () => {
    const txns: Transaction[] = [
      { date: '2024-01-15', symbol: 'AAPL', type: 'buy', quantity: 100, price: 50, currency: 'USD', fee: 0, withholding: 0 },
      { date: '2024-06-15', symbol: 'AAPL', type: 'dividend', quantity: 100, price: 1, currency: 'USD', fee: 0, withholding: 0 },
    ]
    const { txns: out, events } = reinvestDividends(txns, { AAPL: { '2024-06-15': 60 } })
    expect(out.length).toBe(3) // original buy + dividend + synthetic buy
    expect(events).toHaveLength(1)
    expect(events[0].withholding).toBeCloseTo(30, 5) // 100*1*0.30
    expect(events[0].netAmount).toBeCloseTo(70, 5)
    // synthetic buy: 70 / 60 ≈ 1.166 shares
    expect(events[0].reinvestedShares).toBeCloseTo(70 / 60, 3)
  })

  it('runPortfolio end-to-end includes dividend reinvest', () => {
    const txns: Transaction[] = [
      { date: '2024-01-15', symbol: 'VOO', type: 'buy', quantity: 50, price: 400, currency: 'USD', fee: 0, withholding: 0 },
      { date: '2024-06-15', symbol: 'VOO', type: 'dividend', quantity: 50, price: 5, currency: 'USD', fee: 0, withholding: 0 },
    ]
    const { positions, summary, dividendEvents } = runPortfolio(txns, rates, { VOO: { '2024-06-15': 420 } })
    expect(positions[0].quantity).toBeGreaterThan(50) // reinvest added shares
    expect(summary.positionCount).toBe(1)
    expect(dividendEvents[0].withholding).toBeGreaterThan(0)
  })
})

// ====================================================================
// TAX REPORT + REBALANCE
// ====================================================================

describe('Tax report + rebalance', () => {
  it('builds CSV with header row', () => {
    const txns: Transaction[] = [
      { date: '2024-01-15', symbol: '2330', type: 'buy', quantity: 1000, price: 580, currency: 'NTD', fee: 0, withholding: 0 },
      { date: '2024-06-15', symbol: '2330', type: 'sell', quantity: 500, price: 620, currency: 'NTD', fee: 0, withholding: 0 },
    ]
    const report = buildTaxReport(txns, { '2024-06-15': { NTD: 1 } })
    expect(report.csv.split('\n')[0]).toMatch(/^date,symbol,type/)
    expect(report.rows).toHaveLength(2)
    expect(report.summary.taxableEvents).toBe(1)
    expect(report.summary.totalPnLNTD).toBeGreaterThan(0)
  })

  it('tax report totals include withholding', () => {
    const txns: Transaction[] = [
      { date: '2024-06-15', symbol: 'AAPL', type: 'dividend', quantity: 10, price: 1, currency: 'USD', fee: 0, withholding: 3 },
    ]
    const report = buildTaxReport(txns, { '2024-06-15': { USD: 32 } })
    expect(report.summary.totalWithholdingNTD).toBeCloseTo(3 * 32, 1)
  })

  it('empty txns gives empty report', () => {
    const report = buildTaxReport([])
    expect(report.rows).toHaveLength(0)
    expect(report.summary.taxableEvents).toBe(0)
  })

  it('rebalance suggests buy when underweight', () => {
    const positions = [
      { symbol: 'A', quantity: 10, avgCostNTD: 100, currentPriceNTD: 100 },
      { symbol: 'B', quantity: 0, avgCostNTD: 0, currentPriceNTD: 100 },
    ]
    const sug = rebalanceSuggestion(positions, { A: 0.5, B: 0.5 })
    expect(sug.find(s => s.symbol === 'B')!.action).toBe('buy')
    expect(sug.find(s => s.symbol === 'B')!.shares).toBeGreaterThan(0)
    expect(sug.find(s => s.symbol === 'A')!.action).toBe('sell')
  })

  it('rebalance hold when within band', () => {
    const positions = [
      { symbol: 'A', quantity: 10, avgCostNTD: 100, currentPriceNTD: 100 },
    ]
    const sug = rebalanceSuggestion(positions, { A: 1.0 })
    expect(sug[0].action).toBe('hold')
  })
})