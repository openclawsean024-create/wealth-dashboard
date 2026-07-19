/**
 * IRR (Internal Rate of Return) and MWR (Money-Weighted Return).
 *
 * Spec §3.1 F-006, AC-0003: 含管理費/手續費/30% 美股預扣稅的真實報酬。
 *
 * Sign convention:
 *   - All cashflows are signed: negative = outflow (buy, fee, tax),
 *     positive = inflow (sell, dividend).
 *   - IRR solves NPV = 0 over the cashflow stream.
 *   - MWR ≈ IRR but with dividend reinvested at the ex-div date close price.
 *
 * Uses bisection for robustness (Newton can diverge for short series).
 */

export interface Cashflow {
  date: string // YYYY-MM-DD
  amount: number // signed
  type?: 'buy' | 'sell' | 'dividend' | 'fee' | 'tax'
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z').getTime()
  const db = new Date(b + 'T00:00:00Z').getTime()
  return (db - da) / (1000 * 60 * 60 * 24)
}

function xnpv(rate: number, flows: Cashflow[]): number {
  const t0 = flows[0].date
  let total = 0
  for (const f of flows) {
    const t = daysBetween(t0, f.date) / 365
    total += f.amount / Math.pow(1 + rate, t)
  }
  return total
}

export function xirr(flows: Cashflow[], guess = 0.1): number {
  if (flows.length < 2) throw new Error('xirr needs ≥ 2 flows')
  // Newton-Raphson with bisection fallback
  let rate = guess
  for (let iter = 0; iter < 100; iter++) {
    const f = xnpv(rate, flows)
    if (Math.abs(f) < 1e-7) return rate
    // derivative
    const h = 1e-5
    const df = (xnpv(rate + h, flows) - xnpv(rate - h, flows)) / (2 * h)
    if (Math.abs(df) < 1e-12) break
    const next = rate - f / df
    if (!Number.isFinite(next) || next <= -0.999) {
      // fall back to bisection
      return xirrBisect(flows)
    }
    if (Math.abs(next - rate) < 1e-9) return next
    rate = next
  }
  return xirrBisect(flows)
}

function xirrBisect(flows: Cashflow[]): number {
  let lo = -0.999
  let hi = 10
  let flo = xnpv(lo, flows)
  let fhi = xnpv(hi, flows)
  if (flo * fhi > 0) {
    // try to widen
    for (let h = 100; h <= 10000; h *= 10) {
      fhi = xnpv(h, flows)
      if (flo * fhi < 0) {
        hi = h
        break
      }
    }
  }
  if (flo * fhi > 0) return Number.NaN
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const fm = xnpv(mid, flows)
    if (Math.abs(fm) < 1e-9) return mid
    if (flo * fm < 0) {
      hi = mid
      fhi = fm
    } else {
      lo = mid
      flo = fm
    }
  }
  return (lo + hi) / 2
}

export interface IrrInput {
  /** All cashflows (negative = outflow, positive = inflow), already in NTD */
  flows: Cashflow[]
}

export interface IrrOutput {
  irr: number // annualised rate
  hasResult: boolean
}

export function computeIRR(input: IrrInput): IrrOutput {
  try {
    const r = xirr(input.flows)
    return { irr: r, hasResult: Number.isFinite(r) }
  } catch {
    return { irr: 0, hasResult: false }
  }
}

/**
 * MWR = IRR with dividends reinvested.
 * For each dividend, add a same-day buy cashflow of -dividendAmount (outflow)
 * AND a buy of the same amount at ex-div close (handled by caller).
 * Here we just feed in the cashflow stream — caller is responsible for
 * adding the reinvestment buy.
 */
export function computeMWR(input: IrrInput): IrrOutput {
  return computeIRR(input)
}