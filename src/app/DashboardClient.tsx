'use client';

import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import BankCard from '@/components/BankCard';
import StockCard from '@/components/StockCard';
import CryptoCard from '@/components/CryptoCard';

export interface StockHolding {
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

export interface CryptoHolding {
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

const TWD_PER_USD = 32.5;

type DisplayCurrency = 'USDC' | 'BTC' | 'ETH' | 'CNY';
type Currency = 'USD' | 'TWD' | 'HKD' | 'JPY' | 'EUR';

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', TWD: 'NT$', HKD: 'HK$', JPY: '¥', EUR: '€' };
const CURRENCY_DECIMALS: Record<string, number> = { USD: 2, TWD: 0, HKD: 2, JPY: 0, EUR: 2 };
const CURRENCY_NAMES: Record<string, string> = { USD: '美元', TWD: '新台幣', HKD: '港幣', JPY: '日圓', EUR: '歐元' };

const FALLBACK_FX = { BTC: 0.000016, ETH: 0.00027, CNY: 7.25 };

function fromUSD(usd: number, currency: DisplayCurrency): number {
  if (currency === 'USDC') return usd;
  if (currency === 'BTC') return usd * FALLBACK_FX.BTC;
  if (currency === 'ETH') return usd * FALLBACK_FX.ETH;
  if (currency === 'CNY') return usd * TWD_PER_USD * FALLBACK_FX.CNY;
  return usd;
}

function formatDisplayCurrency(value: number, currency: DisplayCurrency, privacy: boolean): string {
  if (privacy) return '••••••';
  const sym = currency === 'USDC' ? '$' : currency === 'ETH' ? 'Ξ' : currency === 'BTC' ? '₿' : '¥';
  if (currency === 'BTC') return `${value.toFixed(5)} BTC`;
  if (currency === 'ETH') return `${value.toFixed(4)} ETH`;
  if (currency === 'CNY') return `¥${value.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`;
  return `${sym}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCurrencyTWD(value: number, privacy: boolean): string {
  if (privacy) return '••••••';
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value);
}

interface DashboardClientProps {
  initialStocks: StockHolding[];
  initialCrypto: CryptoHolding[];
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

function DonutChart({ bankUSD, stockUSD, cryptoUSD, currency, privacy }: {
  bankUSD: number; stockUSD: number; cryptoUSD: number;
  currency: DisplayCurrency; privacy: boolean;
}) {
  const data = [
    { name: '銀行存款', value: bankUSD, label: '銀行' },
    { name: '股票', value: stockUSD, label: '股票' },
    { name: '加密貨幣', value: cryptoUSD, label: '加密' },
  ];
  const total = bankUSD + stockUSD + cryptoUSD;
  const COLORS = ['#6366f1', '#22c55e', '#f59e0b'];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-base font-semibold text-white mb-4">📊 資產配置</h2>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
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
                {formatDisplayCurrency(fromUSD(d.value, currency), currency, false)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Currency Converter Panel ──────────────────────────────────────────────────
function CurrencyConverterPanel() {
  const [sourceCurrency, setSourceCurrency] = useState<Currency>('USD');
  const [amount, setAmount] = useState<string>('100');
  const [rates, setRates] = useState<Record<Currency, number>>({ USD: 1, TWD: 31.5, HKD: 7.82, JPY: 149.5, EUR: 0.92 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 10000);
    let isCancelled = false;
    const BASE = typeof window !== 'undefined' ? window.location.origin : '';

    async function loadRates() {
      try {
        await new Promise(r => setTimeout(r, 500));
        if (isCancelled) return;
        const res = await fetch(`${BASE}/api/exchange-rate`);
        if (isCancelled) return;
        const data = await res.json() as { rates?: Record<Currency, number> };
        if (isCancelled) return;
        if (data.rates) setRates(data.rates);
      } catch { /* keep fallback */ }
      finally {
        if (!isCancelled) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    }

    loadRates();
    return () => { isCancelled = true; clearTimeout(timeoutId); };
  }, []);

  const amountNum = parseFloat(amount) || 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-base font-semibold text-white mb-4">💱 幣別換算</h2>
      <div className="flex gap-3 mb-5">
        <select
          value={sourceCurrency}
          onChange={e => setSourceCurrency(e.target.value as Currency)}
          className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {(['USD', 'TWD', 'HKD', 'JPY', 'EUR'] as Currency[]).map(c => (
            <option key={c} value={c}>{CURRENCY_NAMES[c]} ({CURRENCY_SYMBOLS[c]})</option>
          ))}
        </select>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="輸入金額"
          className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-2">
        {(['USD', 'TWD', 'HKD', 'JPY', 'EUR'] as Currency[]).map(curr => {
          const rate = rates[curr] || 1;
          const rateFromSource = rate / (rates[sourceCurrency] || 1);
          const converted = amountNum * rateFromSource;
          const sym = CURRENCY_SYMBOLS[curr];
          const dec = CURRENCY_DECIMALS[curr];
          const isSource = curr === sourceCurrency;
          return (
            <div key={curr} className={`flex items-center justify-between px-3 py-2 rounded-xl ${isSource ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-white/5'}`}>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white w-8 text-center">{sym}</span>
                <span className="text-sm text-slate-400">{CURRENCY_NAMES[curr]}</span>
              </div>
              <span className={`font-semibold ${isSource ? 'text-indigo-300' : 'text-white'}`}>
                {converted.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-3 text-right">
        {loading ? '匯率載入中...' : `1 ${CURRENCY_NAMES[sourceCurrency]} = ${(rates.TWD / (rates[sourceCurrency] || 1)).toFixed(4)} TWD`}
      </p>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardClient({ initialStocks, initialCrypto }: DashboardClientProps) {
  const [stocks, setStocks] = useState<StockHolding[]>(initialStocks);
  const [crypto, setCrypto] = useState<CryptoHolding[]>(initialCrypto);
  const [loading, setLoading] = useState(false); // Server-fetched data pre-loaded, no initial loading
  const [currency, setCurrency] = useState<DisplayCurrency>('USDC');
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wealth_currency') as DisplayCurrency | null;
    if (saved && ['USDC', 'BTC', 'ETH', 'CNY'].includes(saved)) setCurrency(saved);
    setPrivacy(localStorage.getItem('wealth_privacy') === 'true');
  }, []);

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

  const bankUSD = MOCK_BANK.balance / TWD_PER_USD;
  const stockUSD = stocks.reduce((s, st) => s + (st.value || 0), 0);
  const cryptoUSD = crypto.reduce((s, c) => s + (c.value || 0), 0);
  const totalUSD = bankUSD + stockUSD + cryptoUSD;
  const totalTWD = totalUSD * TWD_PER_USD;

  const fmt = useCallback((v: number) => formatDisplayCurrency(v, currency, privacy), [currency, privacy]);
  const fmtTWD = useCallback((v: number) => formatCurrencyTWD(v, privacy), [privacy]);

  const toggleCurrency = (c: DisplayCurrency) => {
    setCurrency(c);
    localStorage.setItem('wealth_currency', c);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                {(['USDC', 'BTC', 'ETH', 'CNY'] as DisplayCurrency[]).map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCurrency(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      currency === c ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPrivacy(v => { const next = !v; localStorage.setItem('wealth_privacy', String(next)); return next; })}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition-colors"
                title={privacy ? '顯示金額 (Ctrl+H)' : '隱藏金額 (Ctrl+H)'}
              >
                {privacy ? '🙈' : '👁️'}
              </button>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">總淨資產</p>
                <p className={`mt-1 text-2xl font-bold text-white ${privacy ? 'blur-sm select-none' : ''}`}>
                  {totalTWD >= 10000 ? `${(totalTWD / 10000).toLocaleString('zh-TW', { maximumFractionDigits: 1 })}萬 TWD` : totalTWD.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}
                </p>
                {totalUSD > 0 && (
                  <p className={`mt-0.5 text-sm font-medium text-slate-400 ${privacy ? 'blur-sm select-none' : ''}`}>
                    ≈ {fmt(totalUSD)} USD
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
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
                  登入狀態<br /><span className="text-emerald-300 font-semibold">Authenticated</span>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  方案<br /><span className="text-amber-300 font-semibold">Premium</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Account Linking</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between"><span>Bank</span><span className="text-emerald-300">Connected</span></div>
              <div className="flex items-center justify-between"><span>Brokerage</span><span className="text-emerald-300">Connected</span></div>
              <div className="flex items-center justify-between"><span>Crypto</span><span className="text-emerald-300">Connected</span></div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <BankCard bank={MOCK_BANK} formatCurrency={fmtTWD} />
          <StockCard holdings={stocks} total={fromUSD(stockUSD, currency)} currency={currency} privacy={privacy} loading={loading} formatCurrency={fmt} />
          <CryptoCard holdings={crypto} total={fromUSD(cryptoUSD, currency)} currency={currency} privacy={privacy} loading={loading} formatCurrency={fmt} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DonutChart bankUSD={bankUSD} stockUSD={stockUSD} cryptoUSD={cryptoUSD} currency={currency} privacy={privacy} />
          <CurrencyConverterPanel />
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
