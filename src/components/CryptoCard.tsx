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
}

interface CryptoCardProps {
  holdings: CryptoHolding[];
  total: number;
  loading: boolean;
  formatCurrency: (value: number, currency?: string) => string;
}

export default function CryptoCard({ holdings, total, loading, formatCurrency }: CryptoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-xs uppercase tracking-wide">加密貨幣</p>
            <p className="text-white font-semibold mt-1">₿ 數位資產</p>
          </div>
          <span className="text-3xl">₿</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">總市值</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {loading ? (
              <span className="text-gray-300">載入中...</span>
            ) : (
              formatCurrency(total)
            )}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
            🪙 持有資產
          </p>
          <div className="space-y-3">
            {holdings.map((coin) => (
              <div key={coin.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-700 font-medium">{coin.name}</p>
                  <p className="text-gray-400 text-xs">
                    {coin.amount} {coin.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-medium">
                    {loading ? '...' : formatCurrency(coin.value || 0)}
                  </p>
                  {!loading && coin.gain !== undefined && (
                    <p className={`text-xs ${coin.gain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {coin.gain >= 0 ? '+' : ''}
                      {coin.gainPercent?.toFixed(2)}%
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
