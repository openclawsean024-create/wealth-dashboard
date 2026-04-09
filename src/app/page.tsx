'use client';

import { useEffect, useState } from 'react';
import BankCard from '@/components/BankCard';
import StockCard from '@/components/StockCard';
import CryptoCard from '@/components/CryptoCard';

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

const MOCK_BANK = {
  name: '玉山銀行 (ESun)',
  accountType: '數位帳戶',
  balance: 258420,
  currency: 'TWD',
  syncTime: '2026-04-09 18:45',
  transactions: [
    { id: '1', description: '薪水入帳', amount: 85000, date: '2026-03-25', type: 'income' },
    { id: '2', description: 'PChome 購物', amount: -3240, date: '2026-03-22', type: 'expense' },
    { id: '3', description: '王品餐飲', amount: -1850, date: '2026-03-20', type: 'expense' },
  ],
};

const STOCK_HOLDINGS: StockHolding[] = [
  { symbol: '2330.TW', name: '台積電', shares: 100, avgCost: 580 },
  { symbol: '2317.TW', name: '鴻海', shares: 200, avgCost: 148 },
  { symbol: 'BTC-USD', name: 'Bitcoin ETF', shares: 50, avgCost: 42000 },
];

const CRYPTO_HOLDINGS: CryptoHolding[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', amount: 0.85, avgCost: 62000, category: 'Store of Value' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', amount: 4.2, avgCost: 2800, category: 'Layer 1' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', amount: 25, avgCost: 95, category: 'Layer 1' },
];

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockHolding[]>(STOCK_HOLDINGS);
  const [crypto, setCrypto] = useState<CryptoHolding[]>(CRYPTO_HOLDINGS);
  const [loading, setLoading] = useState(true);
  const [totalNetWorth, setTotalNetWorth] = useState(0);
  const [lastSync, setLastSync] = useState('');

  useEffect(() => {
    const now = new Date();
    setLastSync(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );

    async function fetchData() {
      try {
        const stockRes = await fetch('/api/stocks');
        const stockData = await stockRes.json() as { prices?: Record<string, number> };
        if (stockData.prices) {
          const updated = STOCK_HOLDINGS.map((s) => {
            const currentPrice = (stockData.prices?.[s.symbol] as number) || s.avgCost;
            const value = currentPrice * s.shares;
            const cost = s.avgCost * s.shares;
            const gain = value - cost;
            const gainPercent = s.avgCost > 0 ? ((currentPrice - s.avgCost) / s.avgCost) * 100 : 0;
            return { ...s, currentPrice, value, gain, gainPercent };
          });
          setStocks(updated);
        }
      } catch (e) {
        console.error('Stocks fetch error', e);
      }

      try {
        const cryptoRes = await fetch('/api/crypto');
        const cryptoData = await cryptoRes.json() as { prices?: Record<string, { usd?: number }> };
        if (cryptoData.prices) {
          const updated = CRYPTO_HOLDINGS.map((c) => {
            const currentPrice = cryptoData.prices?.[c.id]?.usd || c.avgCost;
            const value = currentPrice * c.amount;
            const cost = c.avgCost * c.amount;
            const gain = value - cost;
            const gainPercent = c.avgCost > 0 ? ((currentPrice - c.avgCost) / c.avgCost) * 100 : 0;
            return { ...c, currentPrice, value, gain, gainPercent };
          });
          setCrypto(updated);
        }
      } catch (e) {
        console.error('Crypto fetch error', e);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const bankTotal = MOCK_BANK.balance;
    const stockTotal = stocks.reduce((sum, s) => sum + (s.value || 0), 0);
    const cryptoTotal = crypto.reduce((sum, c) => sum + (c.value || 0), 0);
    setTotalNetWorth(bankTotal + stockTotal + cryptoTotal);
  }, [stocks, crypto]);

  const formatCurrency = (value: number, currency = 'TWD') => {
    if (currency === 'TWD') {
      return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
  };

  const stockTotal = stocks.reduce((sum, s) => sum + (s.value || 0), 0);
  const cryptoTotal = crypto.reduce((sum, c) => sum + (c.value || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Live Wealth OS · Updated {new Date().toISOString().split('T')[0]}
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Wealth Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                整合銀行、證券、加密資產與會員系統的個人資產中心。
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">總淨資產</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {loading ? '...' : formatCurrency(totalNetWorth)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                已連結 Plaid · Sync {lastSync}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Membership Section */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Membership</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Gold Member</h2>
                <p className="mt-1 text-sm text-slate-400">帳戶整合、分類視圖與進階資產追蹤已啟用。</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  登入狀態<br />
                  <span className="text-emerald-300 font-semibold">Authenticated</span>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  方案<br />
                  <span className="text-amber-300 font-semibold">Premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Linking */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Account Linking</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Bank</span>
                <span className="text-emerald-300">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Brokerage</span>
                <span className="text-emerald-300">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Crypto</span>
                <span className="text-emerald-300">Connected</span>
              </div>
            </div>
          </div>
        </section>

        {/* Asset Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <BankCard bank={MOCK_BANK} formatCurrency={formatCurrency} />
          <StockCard holdings={stocks} total={stockTotal} loading={loading} formatCurrency={formatCurrency} />
          <CryptoCard holdings={crypto} total={cryptoTotal} loading={loading} formatCurrency={formatCurrency} />
        </div>

        {/* Asset Allocation Summary */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="text-xs text-blue-400 uppercase tracking-wider">銀行存款</p>
              <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(MOCK_BANK.balance)}</p>
              <p className="mt-1 text-xs text-blue-300">{(MOCK_BANK.balance / totalNetWorth * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
              <p className="text-xs text-green-400 uppercase tracking-wider">股票</p>
              <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(stockTotal)}</p>
              <p className="mt-1 text-xs text-green-300">{(stockTotal / totalNetWorth * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
              <p className="text-xs text-amber-400 uppercase tracking-wider">加密貨幣</p>
              <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(cryptoTotal)}</p>
              <p className="mt-1 text-xs text-amber-300">{(cryptoTotal / totalNetWorth * 100).toFixed(1)}%</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          Wealth Dashboard MVP · 資料僅供參考，不構成投資建議
        </div>
      </footer>
    </div>
  );
}
