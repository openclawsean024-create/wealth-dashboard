interface StockHolding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice?: number;
  value?: number;
  gain?: number;
  gainPercent?: number;
}

interface StockCardProps {
  holdings: StockHolding[];
  total: number;
  loading: boolean;
  formatCurrency: (value: number, currency?: string) => string;
}

export default function StockCard({ holdings, total, loading, formatCurrency }: StockCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs uppercase tracking-wide">股票投資</p>
            <p className="text-white font-semibold mt-1">📈 證券帳戶</p>
          </div>
          <span className="text-3xl">📈</span>
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
            💎 持有部位
          </p>
          <div className="space-y-3">
            {holdings.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-700 font-medium">{stock.name}</p>
                  <p className="text-gray-400 text-xs">
                    {stock.shares} 股 @ {loading ? '...' : formatCurrency(stock.currentPrice || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-medium">
                    {loading ? '...' : formatCurrency(stock.value || 0)}
                  </p>
                  {!loading && stock.gain !== undefined && (
                    <p className={`text-xs ${stock.gain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {stock.gain >= 0 ? '+' : ''}
                      {stock.gainPercent?.toFixed(2)}%
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
