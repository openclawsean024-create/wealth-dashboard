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
}

const MOCK_BANK = {
  name: '玉山銀行 (ESun)',
  accountType: '數位帳戶',
  balance: 258420,
  currency: 'TWD',
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
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', amount: 0.85, avgCost: 62000 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', amount: 4.2, avgCost: 2800 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', amount: 25, avgCost: 95 },
];

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockHolding[]>(STOCK_HOLDINGS);
  const [crypto, setCrypto] = useState<CryptoHolding[]>(CRYPTO_HOLDINGS);
  const [loading, setLoading] = useState(true);
  const [totalNetWorth, setTotalNetWorth] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const stockRes = await fetch('/api/stocks');
        const stockData = await stockRes.json();
        if (stockData.prices) {
          const updated = STOCK_HOLDINGS.map((s) => {
            const price = stockData.prices[s.symbol];
            const currentPrice = price?.regularMarketPrice || s.avgCost;
            const value = currentPrice * s.shares;
            const cost = s.avgCost * s.shares;
            const gain = value - cost;
            const gainPercent = ((currentPrice - s.avgCost) / s.avgCost) * 100;
            return { ...s, currentPrice, value, gain, gainPercent };
          });
          setStocks(updated);
        }
      } catch (e) {
        console.error('Stocks fetch error', e);
      }

      try {
        const cryptoRes = await fetch('/api/crypto');
        const cryptoData = await cryptoRes.json();
        if (cryptoData.prices) {
          const updated = CRYPTO_HOLDINGS.map((c) => {
            const price = cryptoData.prices[c.id];
            const currentPrice = price?.usd || c.avgCost;
            const value = currentPrice * c.amount;
            const cost = c.avgCost * c.amount;
            const gain = value - cost;
            const gainPercent = ((currentPrice - c.avgCost) / c.avgCost) * 100;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💰 Wealth Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">你的個人資產總覽</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">總淨資產</p>
              <p className="text-3xl font-bold text-indigo-600">
                {loading ? '...' : formatCurrency(totalNetWorth)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bank Card */}
          <BankCard bank={MOCK_BANK} formatCurrency={formatCurrency} />

          {/* Stock Card */}
          <StockCard
            holdings={stocks}
            total={stockTotal}
            loading={loading}
            formatCurrency={formatCurrency}
          />

          {/* Crypto Card */}
          <CryptoCard
            holdings={crypto}
            total={cryptoTotal}
            loading={loading}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Asset Allocation Summary */}
        {!loading && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 資產配置</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-500 uppercase mb-1">銀行存款</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(MOCK_BANK.balance)}</p>
                <p className="text-xs text-blue-400 mt-1">
                  {((MOCK_BANK.balance / totalNetWorth) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-500 uppercase mb-1">股票</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(stockTotal)}</p>
                <p className="text-xs text-green-400 mt-1">
                  {((stockTotal / totalNetWorth) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-500 uppercase mb-1">加密貨幣</p>
                <p className="text-xl font-bold text-orange-700">{formatCurrency(cryptoTotal)}</p>
                <p className="text-xs text-orange-400 mt-1">
                  {((cryptoTotal / totalNetWorth) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-gray-400">
            Wealth Dashboard MVP · 資料僅供參考，不構成投資建議
          </p>
        </div>
      </footer>
    </div>
  );
}
