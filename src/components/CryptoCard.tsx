type Currency = 'USDC' | 'BTC' | 'ETH' | 'CNY';

interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgCost: number;
  currentPrice?: number;
  value?: number;
  gain?: number;
  gainPercent?: number;
  category?: string;
}

interface CryptoCardProps {
  holdings: CryptoHolding[];
  total: number;
  currency: Currency;
  privacy: boolean;
  loading: boolean;
  formatCurrency: (value: number) => string;
}

export default function CryptoCard({ holdings, total, currency, privacy, loading, formatCurrency }: CryptoCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-100/70">加密貨幣</p>
            <p className="mt-1 text-lg font-semibold text-white">數位資產</p>
          </div>
          <span className="text-3xl">₿</span>
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
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">持有資產</p>
          <div className="space-y-4">
            {holdings.map((coin) => (
              <div key={coin.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-white">{coin.name}</p>
                  <p className="text-slate-500 text-xs">
                    {coin.category || 'Crypto'} · {coin.amount} {coin.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-white ${privacy ? 'blur-sm select-none' : ''}`}>
                    {loading ? '...' : formatCurrency(coin.value || 0)}
                  </p>
                  {!loading && coin.gain !== undefined && (
                    <p className={`text-xs ${coin.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {coin.gain >= 0 ? '+' : ''}{coin.gainPercent?.toFixed(2)}%
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
