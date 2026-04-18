'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';

export interface AssetHolding {
  id: string;
  name: string;
  value: number;
  cost: number;
  category: 'stock' | 'bond' | 'cash' | 'crypto' | 'other';
  symbol?: string;
  unit?: string;
}

const TWD_PER_USD = 32.5;

type DisplayCurrency = 'USDC' | 'BTC' | 'ETH' | 'CNY';
type Currency = 'USD' | 'TWD' | 'HKD' | 'JPY' | 'EUR';
type TimeInterval = '1D' | '1W' | '1M' | '1Y' | 'All';

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', TWD: 'NT$', HKD: 'HK$', JPY: '¥', EUR: '€' };
const CURRENCY_DECIMALS: Record<string, number> = { USD: 2, TWD: 0, HKD: 2, JPY: 0, EUR: 2 };
const CURRENCY_NAMES: Record<string, string> = { USD: '美元', TWD: '新台幣', HKD: '港幣', JPY: '日圓', EUR: '歐元' };

const FALLBACK_FX = { BTC: 0.000016, ETH: 0.00027, CNY: 7.25 };

const CATEGORY_LABELS: Record<string, string> = {
  stock: '股票',
  bond: '債券',
  cash: '現金',
  crypto: '加密貨幣',
  other: '其他',
};

const CATEGORY_COLORS = ['#58A6FF', '#3FB950', '#D29922', '#F85149', '#8B949E'];

// Performance trend mock data
function generatePerformanceData(interval: TimeInterval) {
  const now = new Date();
  const points: { date: string; value: number; benchmark: number }[] = [];
  let days: number;
  switch (interval) {
    case '1D': days = 1; break;
    case '1W': days = 7; break;
    case '1M': days = 30; break;
    case '1Y': days = 365; break;
    default: days = 365;
  }
  const base = 100;
  let val = base;
  let bench = base;
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    val = val * (1 + (Math.random() - 0.45) * 0.02);
    bench = bench * (1 + (Math.random() - 0.47) * 0.015);
    points.push({
      date: d.toLocaleDateString('zh-TW', { month: 'short', day: interval === '1D' ? undefined : 'numeric' }),
      value: Math.round(val * 100) / 100,
      benchmark: Math.round(bench * 100) / 100,
    });
  }
  return points;
}

// Count-up animation hook
function useCountUp(target: number, duration = 500) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const startValRef = useRef(0);

  useEffect(() => {
    startRef.current = null;
    startValRef.current = value;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(startValRef.current + (target - startValRef.current) * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

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

function formatGain(v: number, suffix = '') {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}${suffix}`;
}

// ─── Total Overview Card ───────────────────────────────────────────────────────
function TotalOverviewCard({ totalUSD, totalTWD, todayGainUSD, todayGainPercent, totalGainUSD, totalGainPercent, currency, privacy, fmt, fmtTWD }: {
  totalUSD: number; totalTWD: number; todayGainUSD: number; todayGainPercent: number;
  totalGainUSD: number; totalGainPercent: number;
  currency: DisplayCurrency; privacy: boolean; fmt: (v: number) => string; fmtTWD: (v: number) => string;
}) {
  const animatedUSD = useCountUp(totalUSD);
  const animatedTWD = useCountUp(totalTWD);
  const todayColor = todayGainUSD >= 0 ? 'text-[#3FB950]' : 'text-[#F85149]';
  const totalColor = totalGainUSD >= 0 ? 'text-[#3FB950]' : 'text-[#F85149]';

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[#8B949E] mb-2">總資產</p>
      <p className={`text-3xl font-bold font-mono text-white ${privacy ? 'blur-sm select-none' : ''}`}>
        {fmt(animatedUSD)}
      </p>
      <p className={`text-sm text-[#8B949E] mt-1 ${privacy ? 'blur-sm select-none' : ''}`}>
        ≈ {fmtTWD(animatedTWD)}
      </p>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div>
          <p className="text-xs text-[#8B949E] mb-1">今日累計損益</p>
          <p className={`font-mono font-semibold text-sm ${todayColor} ${privacy ? 'blur-sm select-none' : ''}`}>
            {todayGainUSD >= 0 ? '+' : ''}{fmt(todayGainUSD)}
            <span className="text-xs ml-1">({todayGainPercent >= 0 ? '+' : ''}{todayGainPercent.toFixed(2)}%)</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8B949E] mb-1">累計損益</p>
          <p className={`font-mono font-semibold text-sm ${totalColor} ${privacy ? 'blur-sm select-none' : ''}`}>
            {totalGainUSD >= 0 ? '+' : ''}{fmt(totalGainUSD)}
            <span className="text-xs ml-1">({totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ assets, currency, privacy, fmt }: {
  assets: { category: string; value: number }[];
  currency: DisplayCurrency; privacy: boolean; fmt: (v: number) => string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = assets.reduce((s, a) => s + a.value, 0);

  const data = assets.map(a => ({
    name: CATEGORY_LABELS[a.category] || a.category,
    value: a.value,
    category: a.category,
  }));

  const COLORS = CATEGORY_COLORS;

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6">
      <h2 className="text-base font-semibold text-white mb-4">📊 資產配置</h2>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i]}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.5}
                  style={{ transform: activeIndex === i ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 150ms ease, opacity 150ms ease', cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: unknown) => [`$${((v as number) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`, '']}
              contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: 12, color: '#E6EDF3', fontSize: 13 }}
              itemStyle={{ color: '#E6EDF3' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-sm text-[#8B949E] flex-1">{d.name}</span>
              <span className="text-sm font-semibold text-white">
                {total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0'}%
              </span>
              <span className={`text-sm font-medium text-[#E6EDF3] ${privacy ? 'blur-sm select-none' : ''}`}>
                {fmt(fromUSD(d.value, currency))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Performance Trend Chart ─────────────────────────────────────────────────
function PerformanceChart({ interval, setInterval, currency, privacy, fmt }: {
  interval: TimeInterval; setInterval: (v: TimeInterval) => void;
  currency: DisplayCurrency; privacy: boolean; fmt: (v: number) => string;
}) {
  const [data] = useState(() => generatePerformanceData(interval));

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">📈 績效趨勢</h2>
        <div className="flex gap-1">
          {(['1D', '1W', '1M', '1Y', 'All'] as TimeInterval[]).map(t => (
            <button
              key={t}
              onClick={() => setInterval(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${interval === t ? 'bg-[#1E3A5F] text-white' : 'text-[#8B949E] hover:text-white hover:bg-[#21262D]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#58A6FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
          <XAxis dataKey="date" tick={{ fill: '#8B949E', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: 12, color: '#E6EDF3', fontSize: 12 }}
            formatter={(v: unknown) => [`${v}`, '績效']}
          />
          <Area type="monotone" dataKey="benchmark" stroke="#8B949E" strokeDasharray="4 4" fill="none" strokeWidth={1.5} name="基準" />
          <Area type="monotone" dataKey="value" stroke="#58A6FF" fill="url(#colorValue)" strokeWidth={2} name="策略" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Asset Detail List ───────────────────────────────────────────────────────
function AssetDetailList({ assets, currency, privacy, fmt }: {
  assets: AssetHolding[];
  currency: DisplayCurrency; privacy: boolean; fmt: (v: number) => string;
}) {
  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#161B22] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#30363D]">
        <h2 className="text-base font-semibold text-white">資產明細</h2>
      </div>
      <div className="divide-y divide-[#21262D]">
        {assets.map(a => {
          const gain = a.value - a.cost;
          const gainPct = a.cost > 0 ? (gain / a.cost) * 100 : 0;
          const gainColor = gain >= 0 ? 'text-[#3FB950]' : 'text-[#F85149]';
          return (
            <div key={a.id} className="px-6 py-4 hover:bg-[#21262D]/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                    {CATEGORY_LABELS[a.category]}
                  </span>
                  <span className="text-sm font-medium text-white">{a.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className={`font-mono text-white ${privacy ? 'blur-sm select-none' : ''}`}>{fmt(fromUSD(a.value, currency))}</span>
                  <span className={`font-mono w-24 text-right ${gainColor} ${privacy ? 'blur-sm select-none' : ''}`}>
                    {gain >= 0 ? '+' : ''}{fmt(fromUSD(gain, currency))}
                  </span>
                  <span className={`font-mono w-16 text-right ${gainColor} ${privacy ? 'blur-sm select-none' : ''}`}>
                    {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Currency Converter Panel ─────────────────────────────────────────────────
function CurrencyConverterPanel() {
  const [sourceCurrency, setSourceCurrency] = useState<Currency>('USD');
  const [amount, setAmount] = useState<string>('100');
  const [rates] = useState<Record<Currency, number>>({ USD: 1, TWD: 31.5, HKD: 7.82, JPY: 149.5, EUR: 0.92 });

  const amountNum = parseFloat(amount) || 0;

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6">
      <h2 className="text-base font-semibold text-white mb-4">💱 幣別換算</h2>
      <div className="flex gap-3 mb-5">
        <select
          value={sourceCurrency}
          onChange={e => setSourceCurrency(e.target.value as Currency)}
          className="px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
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
          className="flex-1 px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
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
            <div key={curr} className={`flex items-center justify-between px-3 py-2 rounded-xl ${isSource ? 'bg-[#1E3A5F]/30 border border-[#1E3A5F]/50' : 'bg-[#21262D]'}`}>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white w-8 text-center">{sym}</span>
                <span className="text-sm text-[#8B949E]">{CURRENCY_NAMES[curr]}</span>
              </div>
              <span className={`font-semibold ${isSource ? 'text-[#58A6FF]' : 'text-white'}`}>
                {converted.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardClient({ initialStocks, initialCrypto }: {
  initialStocks: { symbol: string; name: string; shares: number; avgCost: number; currentPrice?: number; value?: number; gain?: number; gainPercent?: number }[];
  initialCrypto: { id: string; symbol: string; name: string; amount: number; avgCost: number; currentPrice?: number; value?: number; gain?: number; gainPercent?: number }[];
}) {
  const [currency, setCurrency] = useState<DisplayCurrency>('USDC');
  const [privacy, setPrivacy] = useState(false);
  const [interval, setInterval] = useState<TimeInterval>('1M');

  useEffect(() => {
    const saved = localStorage.getItem('wealth_currency') as DisplayCurrency | null;
    if (saved && ['USDC', 'BTC', 'ETH', 'CNY'].includes(saved)) setCurrency(saved);
    setPrivacy(localStorage.getItem('wealth_privacy') === 'true');
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setPrivacy(v => { const next = !v; localStorage.setItem('wealth_privacy', String(next)); return next; });
      }
    };
    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, []);

  // Build 5-category asset list
  const stockValue = initialStocks.reduce((s, st) => s + (st.value || 0), 0);
  const stockCost = initialStocks.reduce((s, st) => s + st.avgCost * st.shares, 0);
  const cryptoValue = initialCrypto.reduce((s, c) => s + (c.value || 0), 0);
  const cryptoCost = initialCrypto.reduce((s, c) => s + c.avgCost * c.amount, 0);

  const bankUSD = 258420 / TWD_PER_USD;
  const bondValue = 50000; // mock bond value
  const bondCost = 48000;
  const cashUSD = (50000 + 32750) / TWD_PER_USD; // TWD + USD savings
  const cashCost = cashUSD;

  const assets: AssetHolding[] = [
    { id: 'stock', name: '股票', value: stockValue, cost: stockCost, category: 'stock' },
    { id: 'bond', name: '債券', value: bondValue, cost: bondCost, category: 'bond' },
    { id: 'cash', name: '現金存款', value: cashUSD, cost: cashCost, category: 'cash' },
    { id: 'crypto', name: '加密貨幣', value: cryptoValue, cost: cryptoCost, category: 'crypto' },
    { id: 'other', name: '其他資產', value: 8500, cost: 8000, category: 'other' },
  ];

  const totalUSD = assets.reduce((s, a) => s + a.value, 0);
  const totalCost = assets.reduce((s, a) => s + a.cost, 0);
  const totalGainUSD = totalUSD - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGainUSD / totalCost) * 100 : 0;

  // Mock today's gain (random within ±1%)
  const todayGainUSD = totalUSD * (Math.random() * 0.02 - 0.01);
  const todayGainPercent = todayGainUSD / totalUSD * 100;

  const totalTWD = totalUSD * TWD_PER_USD;

  const fmt = useCallback((v: number) => formatDisplayCurrency(v, currency, privacy), [currency, privacy]);
  const fmtTWD = useCallback((v: number) => formatCurrencyTWD(v, privacy), [privacy]);

  const toggleCurrency = (c: DisplayCurrency) => {
    setCurrency(c);
    localStorage.setItem('wealth_currency', c);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {/* Header */}
      <header className="border-b border-[#30363D] bg-[#0D1117]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3FB950]/20 bg-[#3FB950]/10 px-3 py-1 text-xs font-medium text-[#3FB950]">
                Live Wealth OS · Updated {new Date().toISOString().split('T')[0]}
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-white">Wealth Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#8B949E]">整合銀行、證券、加密資產的個人資產中心。</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex bg-[#161B22] border border-[#30363D] rounded-xl p-1 gap-1">
                {(['USDC', 'BTC', 'ETH', 'CNY'] as DisplayCurrency[]).map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCurrency(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currency === c ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-[#8B949E] hover:text-white'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPrivacy(v => { const next = !v; localStorage.setItem('wealth_privacy', String(next)); return next; })}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#161B22] border border-[#30363D] hover:bg-[#21262D] text-sm transition-colors"
                title={privacy ? '顯示金額 (Ctrl+H)' : '隱藏金額 (Ctrl+H)'}
              >
                {privacy ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Total overview */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TotalOverviewCard
            totalUSD={totalUSD} totalTWD={totalTWD}
            todayGainUSD={todayGainUSD} todayGainPercent={todayGainPercent}
            totalGainUSD={totalGainUSD} totalGainPercent={totalGainPercent}
            currency={currency} privacy={privacy} fmt={fmt} fmtTWD={fmtTWD}
          />
          <DonutChart assets={assets} currency={currency} privacy={privacy} fmt={fmt} />
          <PerformanceChart interval={interval} setInterval={setInterval} currency={currency} privacy={privacy} fmt={fmt} />
        </div>

        {/* Asset detail list - 5 categories */}
        <AssetDetailList assets={assets} currency={currency} privacy={privacy} fmt={fmt} />

        {/* Currency converter */}
        <CurrencyConverterPanel />
      </main>

      <footer className="border-t border-[#30363D] mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-[#8B949E] sm:px-6 lg:px-8">
          Wealth Dashboard MVP · 報價僅供參考，不構成投資建議 · Ctrl+H 隱藏金額
        </div>
      </footer>
    </div>
  );
}
