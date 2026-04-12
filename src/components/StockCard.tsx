type Currency = 'USDC' | 'BTC' | 'ETH' | 'CNY';

interface StockHolding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice?: number;
  value?: number;
  gain?: number;
  gainPercent?: number;
  category?: string;
}

interface StockCardProps {
  holdings: StockHolding[];
  total: number;
  currency: Currency;
  privacy: boolean;
  loading: boolean;
  formatCurrency: (value: number) => string;
}

function getStockCategory(symbol: string): string {
  if (symbol.includes('BTC-USD') || symbol.includes('ETF')) return 'ETF';
  return 'Equity';
}

export default function StockCard({ holdings, total, currency, privacy, loading, formatCurrency }: StockCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="bg-gradient-to-r from-sky-500/80 to-indigo-500/80 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-100/70">股票投資</p>
            <p className="mt-1 text-lg font-semibold text-white">證券帳戶</p>
          </div>
          <span className="text-3xl">📈</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">總市值</p>
          <p className={`mt-2 text-3xl font-bold text-white ${privacy ? 'blur-sm select-none' : ''}`}>
            {loading ? <span className="text-slate-500">載入中...</span> : formatCurrency(total)}
          </p>
          <p className="text-xs text-slate-500 mt-1">計價：{currency}</p>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">持有部位</p>
          <div className="space-y-4">
            {holdings.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-white">{stock.name} ({stock.symbol})</p>
                  <p className="text-slate-500 text-xs">
                    {getStockCategory(stock.symbol)} · {stock.shares} 股 @{' '}
                    {loading ? '...' : formatCurrency(stock.currentPrice || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-white ${privacy ? 'blur-sm select-none' : ''}`}>
                    {loading ? '...' : formatCurrency(stock.value || 0)}
                  </p>
                  {!loading && stock.gain !== undefined && (
                    <p className={`text-xs ${stock.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stock.gain >= 0 ? '+' : ''}{stock.gainPercent?.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
