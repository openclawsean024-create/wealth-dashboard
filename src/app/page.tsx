'use client';

import { useEffect, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import BankCard from '@/components/BankCard';
import StockCard from '@/components/StockCard';
import CryptoCard from '@/components/CryptoCard';

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── FX Constants ─────────────────────────────────────────────────────────────
type Currency = 'USDC' | 'BTC' | 'ETH' | 'CNY';
const FX = { USDC: 1, BTC: 67000, ETH: 3500, CNY: 7.25 };
const TWD_PER_USD = 32.5;

// ─── Static Data ─────────────────────────────────────────────────────────────
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
  { symbol: '2330.TW', name: '台積電', shares: 100, avgCost: 580, category: 'Equity' },
  { symbol: '2317.TW', name: '鴻海', shares: 200, avgCost: 148, category: 'Equity' },
  { symbol: 'BTC-USD', name: 'Bitcoin ETF', shares: 50, avgCost: 42000, category: 'ETF' },
];

const CRYPTO_HOLDINGS: CryptoHolding[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', amount: 0.85, avgCost: 62000, category: 'Store of Value' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', amount: 4.2, avgCost: 2800, category: 'Layer 1' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', amount: 25, avgCost: 95, category: 'Layer 1' },
];

// ─── Currency Conversion ──────────────────────────────────────────────────────
function toUSD(value: number, currency: Currency): number {
  if (currency === 'USDC') return value;
  if (currency === 'BTC') return value * FX.BTC;
  if (currency === 'ETH') return value * FX.ETH;
  if (currency === 'CNY') return value * TWD_PER_USD * FX.CNY;
  return value;
}

function fromUSD(usd: number, currency: Currency): number {
  if (currency === 'USDC') return usd;
  if (currency === 'BTC') return usd / FX.BTC;
  if (currency === 'ETH') return usd / FX.ETH;
  if (currency === 'CNY') return usd * TWD_PER_USD * FX.CNY;
  return usd;
}

function formatCurrency(value: number, currency: Currency, privacy: boolean): string {
  if (privacy) return '••••••';
  if (currency === 'BTC') return `${value.toFixed(5)} BTC`;
  if (currency === 'ETH') return `${value.toFixed(4)} ETH`;
  if (currency === 'CNY') return `¥${value.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

function formatCurrencyTWD(value: number, privacy: boolean): string {
  if (privacy) return '••••••';
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value);
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const COLORS = ['#6366F1', '#10B981', '#F59E0B'];

function DonutChart({ bankUSD, stockUSD, cryptoUSD, currency, privacy }: {
  bankUSD: number; stockUSD: number; cryptoUSD: number;
  currency: Currency; privacy: boolean;
}) {
  const data = [
    { name: '銀行存款', value: bankUSD, label: '銀行' },
    { name: '股票', value: stockUSD, label: '股票' },
    { name: '加密貨幣', value: cryptoUSD, label: '加密' },
  ];

  const total = bankUSD + stockUSD + cryptoUSD;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-base font-semibold text-white mb-4">📊 資產配置</h2>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: unknown) => `$${((v as number) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-sm text-slate-400 flex-1">{d.label}</span>
              <span className="text-sm font-semibold text-white">
                {total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0'}%
              </span>
              <span className={`text-sm font-medium ${privacy ? 'blur-sm select-none' : 'text-slate-200'}`}>
                {formatCurrency(fromUSD(d.value, currency), currency, false)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stocks, setStocks] = useState<StockHolding[]>(STOCK_HOLDINGS);
  const [crypto, setCrypto] = useState<CryptoHolding[]>(CRYPTO_HOLDINGS);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>('USDC');
  const [privacy, setPrivacy] = useState(false);
  const [lastSync, setLastSync] = useState('');

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem('wealth_currency') as Currency | null;
    if (saved && ['USDC', 'BTC', 'ETH', 'CNY'].includes(saved)) setCurrency(saved);
    setPrivacy(localStorage.getItem('wealth_privacy') === 'true');
    const now = new Date();
    setLastSync(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  }, []);

  // Keyboard shortcut: Ctrl+H for privacy
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setPrivacy(v => {
          const next = !v;
          localStorage.setItem('wealth_privacy', String(next));
          return next;
        });
      }
    };
    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, []);

  // Fetch prices
  useEffect(() => {
    async function fetchData() {
      try {
        const stockRes = await fetch('/api/stocks');
        const stockData = await stockRes.json() as { prices?: Record<string, number> };
        if (stockData.prices) {
          setStocks(STOCK_HOLDINGS.map(s => {
            const currentPrice = (stockData.prices?.[s.symbol] as number) || s.avgCost;
            const value = currentPrice * s.shares;
            const cost = s.avgCost * s.shares;
            const gain = value - cost;
            const gainPercent = s.avgCost > 0 ? ((currentPrice - s.avgCost) / s.avgCost) * 100 : 0;
            return { ...s, currentPrice, value, gain, gainPercent };
          }));
        }
      } catch (e) { console.error('Stocks fetch error', e); }

      try {
        const cryptoRes = await fetch('/api/crypto');
        const cryptoData = await cryptoRes.json() as { prices?: Record<string, { usd?: number }> };
        if (cryptoData.prices) {
          setCrypto(CRYPTO_HOLDINGS.map(c => {
            const currentPrice = cryptoData.prices?.[c.id]?.usd || c.avgCost;
            const value = currentPrice * c.amount;
            const cost = c.avgCost * c.amount;
            const gain = value - cost;
            const gainPercent = c.avgCost > 0 ? ((currentPrice - c.avgCost) / c.avgCost) * 100 : 0;
            return { ...c, currentPrice, value, gain, gainPercent };
          }));
        }
      } catch (e) { console.error('Crypto fetch error', e); }

      setLoading(false);
    }
    fetchData();
  }, []);

  // ─── Computed Values (all in USD) ────────────────────────────────────────────
  const bankUSD = MOCK_BANK.balance / TWD_PER_USD;
  const stockUSD = stocks.reduce((s, st) => s + (st.value || 0), 0);
  const cryptoUSD = crypto.reduce((s, c) => s + (c.value || 0), 0);
  const totalUSD = bankUSD + stockUSD + cryptoUSD;
  const totalDisplay = fromUSD(totalUSD, currency);

  // Format functions that respect currency + privacy
  const fmt = useCallback((v: number) => formatCurrency(v, currency, privacy), [currency, privacy]);
  const fmtTWD = useCallback((v: number) => formatCurrencyTWD(v, privacy), [privacy]);

  const toggleCurrency = (c: Currency) => {
    setCurrency(c);
    localStorage.setItem('wealth_currency', c);
  };

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
                整合銀行、證券、加密資產的個人資產中心。
              </p>
            </div>

            {/* Controls: Currency + Privacy */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Currency Selector */}
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                {(['USDC', 'BTC', 'ETH', 'CNY'] as Currency[]).map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCurrency(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      currency === c
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Privacy Button */}
              <button
                onClick={() => {
                  setPrivacy(v => {
                    const next = !v;
                    localStorage.setItem('wealth_privacy', String(next));
                    return next;
                  });
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition-colors"
                title={privacy ? '顯示金額 (Ctrl+H)' : '隱藏金額 (Ctrl+H)'}
              >
                {privacy ? '🙈' : '👁️'}
              </button>

              {/* Net Worth in Header */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">總淨資產</p>
                <p className={`mt-1 text-2xl font-bold text-white ${privacy ? 'blur-sm select-none' : ''}`}>
                  {loading ? '...' : fmt(totalDisplay)}
                </p>
              </div>
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
          <BankCard bank={MOCK_BANK} formatCurrency={fmtTWD} />
          <StockCard holdings={stocks} total={fromUSD(stockUSD, currency)} currency={currency} privacy={privacy} loading={loading} formatCurrency={fmt} />
          <CryptoCard holdings={crypto} total={fromUSD(cryptoUSD, currency)} currency={currency} privacy={privacy} loading={loading} formatCurrency={fmt} />
        </div>

        {/* Donut Chart + Asset Allocation */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DonutChart bankUSD={bankUSD} stockUSD={stockUSD} cryptoUSD={cryptoUSD} currency={currency} privacy={privacy} />

          {/* Allocation Summary */}
          {!loading && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-base font-semibold text-white mb-4">📈 組合概覽</h2>
              <div className="space-y-4">
                {[
                  { label: '銀行存款', value: bankUSD, color: '#6366F1', pct: totalUSD > 0 ? (bankUSD / totalUSD) * 100 : 0 },
                  { label: '股票', value: stockUSD, color: '#10B981', pct: totalUSD > 0 ? (stockUSD / totalUSD) * 100 : 0 },
                  { label: '加密貨幣', value: cryptoUSD, color: '#F59E0B', pct: totalUSD > 0 ? (cryptoUSD / totalUSD) * 100 : 0 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{item.pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <p className={`text-right text-sm text-slate-300 mt-1 ${privacy ? 'blur-sm select-none' : ''}`}>
                      {formatCurrency(fromUSD(item.value, currency), currency, false)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          Wealth Dashboard MVP · 報價僅供參考，不構成投資建議 · Ctrl+H 隱藏金額
        </div>
      </footer>
    </div>
  );
}
