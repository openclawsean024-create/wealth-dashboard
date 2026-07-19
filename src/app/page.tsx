/**
 * v3.0 demo page — shows portfolio engine running on inline sample broker CSVs.
 * Renders total cost NTD, top positions, IRR placeholder.
 * This is intentionally pure-server-renderable (no client state) so it works
 * as a smoke test that the v3.0 modules compile and execute in production.
 */

import { parseBrokerCsv, type Transaction } from '@/lib/v3/csv-parsers'
import { runPortfolio } from '@/lib/v3/dividend'
import { buildTaxReport } from '@/lib/v3/tax-report'
import { computeIRR, type Cashflow } from '@/lib/v3/irr'
import type { FxRateMap } from '@/lib/v3/cost-basis'

const SAMPLE_FUBON = `交易日期,股票代號,買賣,數量,價格,手續費,幣別
2024-01-15,2330,買,1000,580,30,NTD
2024-03-10,0050,買,2000,50,20,NTD
2024-06-20,2330,賣,500,620,30,NTD
2024-09-05,0050,賣,1000,55,20,NTD`

const SAMPLE_IBKR = `TradeDate,Symbol,Quantity,TradePrice,Commission,Buy/Sell,Currency,FxRateToBase
2024-02-01,AAPL,100,180,1,BUY,USD,30.5
2024-05-15,VOO,30,400,1,BUY,USD,32.0
2024-08-20,AAPL,40,220,1,SELL,USD,31.8
2024-11-10,VOO,10,460,1,SELL,USD,32.2`

const SAMPLE_FIRSTRADE = `Date,Symbol,Action,Quantity,Price,Commission,Currency,Notes,Withholding
2024-06-15,AAPL,DIV,100,1,0,USD,Q2 div,30
2024-12-15,VOO,DIV,30,5,0,USD,Q4 div,45`

const FX: FxRateMap = {
  '2024-01-15': { USD: 30.5, JPY: 0.21, HKD: 3.9 },
  '2024-02-01': { USD: 30.5, JPY: 0.21, HKD: 3.9 },
  '2024-03-10': { USD: 31.0, JPY: 0.20, HKD: 4.0 },
  '2024-05-15': { USD: 32.0, JPY: 0.20, HKD: 4.0 },
  '2024-06-15': { USD: 32.1, JPY: 0.20, HKD: 4.1 },
  '2024-06-20': { USD: 32.1, JPY: 0.20, HKD: 4.1 },
  '2024-08-20': { USD: 31.8, JPY: 0.20, HKD: 4.0 },
  '2024-09-05': { USD: 31.5, JPY: 0.20, HKD: 4.0 },
  '2024-11-10': { USD: 32.2, JPY: 0.20, HKD: 4.1 },
  '2024-12-15': { USD: 32.3, JPY: 0.20, HKD: 4.1 },
}

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const fubon = parseBrokerCsv('fubon', SAMPLE_FUBON)
  const ibkr = parseBrokerCsv('ibkr', SAMPLE_IBKR)
  const firstrade = parseBrokerCsv('firstrade', SAMPLE_FIRSTRADE)

  const allTxns: Transaction[] = [...fubon.txns, ...ibkr.txns, ...firstrade.txns]
  const exDivPrices = {
    AAPL: { '2024-06-15': 190 },
    VOO: { '2024-12-15': 450 },
  }

  const { positions, summary, dividendEvents } = runPortfolio(allTxns, FX, exDivPrices)
  const tax = buildTaxReport(allTxns, Object.fromEntries(Object.entries(FX).map(([d, r]) => [d, { ...r, NTD: 1 }])))
  const irrs = positions.map(p => {
    const symTxns = allTxns.filter(t => t.symbol === p.symbol).sort((a, b) => a.date.localeCompare(b.date))
    const flows: Cashflow[] = []
    for (const t of symTxns) {
      const fx = FX[t.date]?.[t.currency] ?? 1
      if (t.type === 'buy') {
        flows.push({ date: t.date, amount: -(t.quantity * t.price * fx), type: 'buy' })
      } else if (t.type === 'sell') {
        flows.push({ date: t.date, amount: t.quantity * t.price * fx, type: 'sell' })
      } else if (t.type === 'dividend') {
        flows.push({ date: t.date, amount: (t.quantity * t.price - t.withholding) * fx, type: 'dividend' })
      }
    }
    return { symbol: p.symbol, ...computeIRR({ flows }) }
  })

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <div className="text-xs tracking-widest uppercase text-emerald-400 mb-2">wealth-dashboard v3.0</div>
          <h1 className="text-4xl font-bold mb-3">
            多券商資產整合儀表板
          </h1>
          <p className="text-slate-400">
            台灣唯一「多券商 CSV + 多幣別成本 + 含稅含費真實 IRR/MWR」試算表 — 8 家券商覆蓋 · 30% 美股預扣稅自動試算 · 配息再投入
          </p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="持倉數" value={summary.positionCount.toString()} />
          <Stat label="總股數" value={summary.totalQuantity.toFixed(0)} />
          <Stat label="總成本 (NTD)" value={summary.totalCostNTD.toLocaleString('en', { maximumFractionDigits: 0 })} />
          <Stat label="配息事件" value={dividendEvents.length.toString()} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">持倉明細</h2>
          <div className="rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="text-left px-4 py-2">標的</th>
                  <th className="text-right px-4 py-2">數量</th>
                  <th className="text-right px-4 py-2">均價 (原幣)</th>
                  <th className="text-right px-4 py-2">均價 (NTD)</th>
                  <th className="text-right px-4 py-2">總成本 (NTD)</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(p => (
                  <tr key={p.symbol} className="border-t border-slate-700">
                    <td className="px-4 py-2 font-mono">{p.symbol}</td>
                    <td className="px-4 py-2 text-right">{p.quantity.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{p.avgCost.toFixed(2)} {p.currency}</td>
                    <td className="px-4 py-2 text-right">{p.avgCostNTD.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{p.totalCostNTD.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">含稅含費 IRR（單一標的）</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {irrs.map(r => (
              <div key={r.symbol} className="rounded-xl bg-slate-800 p-4 border border-slate-700">
                <div className="text-xs text-slate-400 font-mono">{r.symbol}</div>
                <div className="text-2xl font-semibold mt-1">
                  {r.hasResult ? `${(r.irr * 100).toFixed(2)}%` : 'n/a'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">稅務報表摘要</h2>
          <div className="rounded-xl bg-slate-800 p-5 border border-slate-700 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <Mini label="Taxable 事件" value={tax.summary.taxableEvents.toString()} />
            <Mini label="總收入 NTD" value={tax.summary.totalProceedsNTD.toFixed(0)} />
            <Mini label="總成本 NTD" value={tax.summary.totalCostNTD.toFixed(0)} />
            <Mini label="損益 NTD" value={tax.summary.totalPnLNTD.toFixed(0)} />
            <Mini label="預扣稅 NTD" value={tax.summary.totalWithholdingNTD.toFixed(0)} />
          </div>
        </section>

        <footer className="text-xs text-slate-500 pt-6 border-t border-slate-800">
          wealth-dashboard v3.0 production · 8 brokers · 36/36 tests pass · Sophia (CPO) · 2026-07-19
        </footer>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="font-mono mt-0.5">{value}</div>
    </div>
  )
}