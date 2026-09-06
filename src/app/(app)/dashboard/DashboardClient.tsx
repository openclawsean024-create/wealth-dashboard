'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { formatPrice, FX_SYMBOL, type DisplayCurrency as PriceDisplayCurrency } from '@/lib/prices';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Asset {
  id: string;
  name: string;
  value: number;
  costBasis?: number;
  category: 'cash' | 'stock' | 'fund' | 'crypto' | 'real-estate' | 'other';
  currency: string;
  institution?: string;
  symbol?: string;
  quantity?: number;
  avgPrice?: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  assetId?: string | null;
  type: 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  note?: string | null;
  date: string;
  createdAt: string;
}

export interface PriceQuote {
  symbol: string;
  price: number;
  currency: string;
  change24h: number;
  asOf: string;
  source: string;
  displayPrice?: number;
  displayCurrency?: string;
}

type SortKey = 'value' | 'name' | 'category';
type DisplayCurrency = PriceDisplayCurrency;
type TimeInterval = '7' | '30' | '90' | '365';

// ─── Symbol → 報價 hook（每 60s 自動更新） ──────────────────────────────────
function usePricePolling(symbols: string[], display: DisplayCurrency, intervalMs = 60_000) {
  const [quotes, setQuotes] = useState<Record<string, PriceQuote | { error: string }>>({});
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNow = useCallback(async () => {
    if (symbols.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/prices?symbols=${encodeURIComponent(symbols.join(','))}&display=${display}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes ?? {});
        setFetchedAt(data.fetchedAt);
      }
    } catch (e) {
      console.warn('[price polling] fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, [symbols.join(','), display]);

  useEffect(() => {
    fetchNow();
    const t = setInterval(fetchNow, intervalMs);
    return () => clearInterval(t);
  }, [fetchNow, intervalMs]);

  return { quotes, fetchedAt, loading, refetch: fetchNow };
}

// ─── Plan Badge Component ────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: 'free' | 'pro' | 'business' }) {
  const config = {
    free: { label: '免費版', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' },
    pro: { label: '⭐ Pro', color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
    business: { label: '🏢 Business', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)' },
  }[plan];

  return (
    <Link
      href={plan === 'free' ? '/checkout?plan=pro' : '/checkout'}
      title={plan === 'free' ? '點擊升級 Pro' : '管理訂閱'}
      style={{
        fontSize: 'var(--font-size-sm)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-md)',
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      {config.label}
    </Link>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'wd_v4';
const TX_STORAGE_KEY = 'wd_txs_v4';

const CATEGORY_LABELS: Record<string, string> = {
  cash: '現金/銀行存款',
  stock: '股票',
  fund: '基金/ETF',
  crypto: '加密貨幣',
  'real-estate': '房地產',
  other: '其他',
};

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
];

const TWD_PER_USD = 32.5;
const CURRENCY_SYMBOL: Record<string, string> = { TWD: 'NT$', USD: '$' };

// ─── Mock initial data (6 categories) ─────────────────────────────────────────
const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: '玉山銀行 數位存款', category: 'cash', value: 520000, costBasis: 520000, currency: 'TWD', institution: '玉山銀行', updatedAt: new Date().toISOString() },
  { id: '2', name: '王道銀行 存款帳戶', category: 'cash', value: 280000, costBasis: 280000, currency: 'TWD', institution: '王道銀行', updatedAt: new Date().toISOString() },
  { id: '3', name: '台積電 2330', category: 'stock', value: 890000, costBasis: 620000, currency: 'TWD', institution: '富果證券', updatedAt: new Date().toISOString() },
  { id: '4', name: 'NVIDIA', category: 'stock', value: 420000, costBasis: 310000, currency: 'USD', institution: 'Firstrade', updatedAt: new Date().toISOString() },
  { id: '5', name: '元大台灣 0050', category: 'fund', value: 350000, costBasis: 300000, currency: 'TWD', institution: '基富通', updatedAt: new Date().toISOString() },
  { id: '6', name: '統一 FANG+ ETF', category: 'fund', value: 180000, costBasis: 150000, currency: 'TWD', institution: '基富通', updatedAt: new Date().toISOString() },
  { id: '7', name: '比特幣 BTC', category: 'crypto', value: 650000, costBasis: 400000, currency: 'USD', institution: 'MAX 交易所', updatedAt: new Date().toISOString() },
  { id: '8', name: '乙太幣 ETH', category: 'crypto', value: 220000, costBasis: 180000, currency: 'USD', institution: 'MAX 交易所', updatedAt: new Date().toISOString() },
  { id: '9', name: '台北市住宅', category: 'real-estate', value: 5800000, costBasis: 5200000, currency: 'TWD', institution: '自住', updatedAt: new Date().toISOString() },
  { id: '10', name: '黃金條塊 500g', category: 'other', value: 280000, costBasis: 240000, currency: 'TWD', institution: '銀樓', updatedAt: new Date().toISOString() },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function vr(value: number, decimals = 0): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toLocaleString('zh-TW', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtGain(v: number, suffix = '%'): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}${suffix}`;
}

function useCountUp(target: number, duration = 600): number {
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

// Mock history generator
function generateHistory(total: number, days: number) {
  const points: { date: string; value: number }[] = [];
  let val = total * 0.85;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    val = Math.max(val * (1 + (Math.random() - 0.47) * 0.015), total * 0.5);
    points.push({
      date: d.toISOString().split('T')[0],
      value: Math.round(val),
    });
  }
  return points;
}

// ─── Components ───────────────────────────────────────────────────────────────

// Donut Chart Tooltip
function DonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; value: number; pct: string } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-family)' }}>
      <div style={{ fontWeight: 600 }}>{d.label}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>{vr(d.value)} ({d.pct}%)</div>
    </div>
  );
}

// Line Chart Tooltip
function LineTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-family)' }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{vr(payload[0].value)}</div>
    </div>
  );
}

// Donut Chart
function DonutChart({ assets, privacy }: { assets: Asset[]; privacy: boolean }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const total = assets.reduce((s, a) => s + a.value, 0);

  const data = Object.entries(CATEGORY_LABELS).map(([key, label]) => {
    const catTotal = assets.filter(a => a.category === key).reduce((s, a) => s + a.value, 0);
    return { key, label, value: catTotal, pct: total > 0 ? ((catTotal / total) * 100).toFixed(1) : '0.0' };
  }).filter(d => d.value > 0);

  return (
    <div className="donut-wrapper">
      <div className="donut-wrapper__title">📊 資產配置</div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
              onMouseEnter={(_, idx) => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  opacity={activeIdx === null || activeIdx === i ? 1 : 0.5}
                  style={{ transform: activeIdx === i ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 150ms ease, opacity 150ms ease', cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-legend" style={{ flex: 1 }}>
          {data.map((d, i) => (
            <div key={d.key} className="donut-legend__item">
              <div className="donut-legend__left">
                <div className="donut-legend__dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="donut-legend__name">{d.label}</span>
              </div>
              <div className="donut-legend__right">
                <span className={privacy ? 'privacy-value' : ''}>{privacy ? '••••' : vr(d.value)}</span>
                <span className="donut-legend__pct">{d.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Line Chart
const LINE_TABS = [
  { key: '7', label: '7日' },
  { key: '30', label: '30日' },
  { key: '90', label: '90日' },
  { key: '365', label: '1年' },
];

function LineChart({ total, period, onPeriodChange }: { total: number; period: string; onPeriodChange: (p: string) => void }) {
  const days = parseInt(period) || 30;
  const data = generateHistory(total, days);
  const textColor = 'var(--color-text-muted)';
  const borderColor = 'var(--color-border)';

  const fmtDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  };

  return (
    <div className="linechart-wrapper">
      <div className="linechart-header">
        <div className="linechart-title">📈 歷史趨勢</div>
        <div className="linechart-tabs">
          {LINE_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => onPeriodChange(t.key)}
              className={`linechart-tab ${period === t.key ? 'linechart-tab--active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={borderColor} opacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: textColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={v => vr(v)}
            tick={{ fill: textColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip content={<LineTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            fill="url(#colorVal)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-primary)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Overview Cards
function OverviewCards({ total, todayGain, todayGainPct, assetCount, syncTime, privacy }: {
  total: number;
  todayGain: number;
  todayGainPct: number;
  assetCount: number;
  syncTime: string | null;
  privacy: boolean;
}) {
  const animatedTotal = useCountUp(total);
  const animatedGain = useCountUp(Math.abs(todayGain));
  const gainColor = todayGain >= 0 ? 'var(--color-accent)' : 'var(--color-danger)';

  return (
    <div className="overview-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      <div className="card">
        <div className="card__label" style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>總資產</div>
        <div className="card__value" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums', marginBottom: '0.25rem' }}>
          {privacy ? '••••••' : `$${vr(animatedTotal)}`}
        </div>
        <div className="card__sub" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {assetCount} 筆資產
        </div>
      </div>

      <div className="card">
        <div className="card__label" style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>今日累計損益</div>
        <div className="card__value" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: gainColor, fontVariantNumeric: 'tabular-nums', marginBottom: '0.25rem' }}>
          {privacy ? '••••••' : `${todayGain >= 0 ? '+' : '-'}$${vr(animatedGain)}`}
        </div>
        <div className="card__sub" style={{ fontSize: 'var(--font-size-xs)', color: gainColor }}>
          {privacy ? '••••' : fmtGain(todayGainPct)}
        </div>
      </div>

      <div className="card">
        <div className="card__label" style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>資產類別</div>
        <div className="card__value" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)' }}>6</div>
        <div className="card__sub" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          現金・股票・基金・加密・房地產・其他
        </div>
      </div>

      <div className="card">
        <div className="card__label" style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>最後同步</div>
        <div className="card__value" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
          {syncTime ? new Date(syncTime).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '從未同步'}
        </div>
        <div className="card__sub" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {syncTime ? '已同步' : '本地模式'}
        </div>
      </div>
    </div>
  );
}

// Asset Row
function AssetRow({ asset, privacy, onDelete }: { asset: Asset; privacy: boolean; onDelete: (id: string) => void }) {
  const gain = asset.value - (asset.costBasis || asset.value);
  const gainPct = (asset.costBasis || asset.value) > 0 ? (gain / (asset.costBasis || asset.value)) * 100 : 0;
  const gainColor = gain >= 0 ? 'var(--color-accent)' : 'var(--color-danger)';

  return (
    <div className="asset-row">
      <div>
        <span className="asset-row__name">{asset.name}</span>
        <span className="asset-row__category">{CATEGORY_LABELS[asset.category]}</span>
      </div>
      <div className={`asset-row__value ${privacy ? 'privacy-value' : ''}`}>
        {privacy ? '••••••' : `${CURRENCY_SYMBOL[asset.currency] || '$'}${vr(asset.value)}`}
      </div>
      <div className={`asset-row__pl ${gain >= 0 ? 'asset-row__pl--positive' : 'asset-row__pl--negative'} ${privacy ? 'privacy-value' : ''}`}>
        {privacy ? '••••' : fmtGain(gainPct)}
      </div>
      <button
        className="asset-row__delete"
        onClick={() => onDelete(asset.id)}
        title="刪除這筆資產"
        aria-label="刪除資產"
      >
        🗑
      </button>
    </div>
  );
}

// Asset List (with sorting + add)
function AssetList({ assets, sortKey, onSortChange, onAdd, privacy, onDelete }: {
  assets: Asset[];
  sortKey: SortKey;
  onSortChange: (k: SortKey) => void;
  onAdd: () => void;
  privacy: boolean;
  onDelete: (id: string) => void;
}) {
  const sorted = [...assets].sort((a, b) => {
    if (sortKey === 'value') return b.value - a.value;
    if (sortKey === 'name') return a.name.localeCompare(b.name, 'zh-TW');
    return a.category.localeCompare(b.category);
  });

  return (
    <div className="asset-list">
      <div className="asset-list__header">
        <div className="asset-list__title">資產明細（{assets.length}）</div>
        <div className="asset-list__sort">
          <select
            value={sortKey}
            onChange={e => onSortChange(e.target.value as SortKey)}
          >
            <option value="value">依價值</option>
            <option value="name">依名稱</option>
            <option value="category">依類別</option>
          </select>
          <button className="btn btn--primary" onClick={onAdd}>+ 新增</button>
        </div>
      </div>
      {sorted.map(a => <AssetRow key={a.id} asset={a} privacy={privacy} onDelete={onDelete} />)}
    </div>
  );
}

// Add Asset Modal
function AddAssetModal({ onClose, onSave }: { onClose: () => void; onSave: (asset: Asset) => void }) {
  const [form, setForm] = useState({
    name: '',
    category: 'cash' as Asset['category'],
    value: '',
    costBasis: '',
    currency: 'TWD',
    institution: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.value) return;
    onSave({
      id: Date.now().toString(),
      name: form.name,
      category: form.category,
      value: parseFloat(form.value) || 0,
      costBasis: parseFloat(form.costBasis) || parseFloat(form.value) || 0,
      currency: form.currency,
      institution: form.institution || form.name.split(' ')[0],
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">新增資產</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">名稱</label>
            <input className="form-input" placeholder="例如：台積電 2330" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">類別</label>
            <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Asset['category'] }))}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">現值</label>
            <input className="form-input" type="number" placeholder="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">成本（選填）</label>
            <input className="form-input" type="number" placeholder="同上" value={form.costBasis} onChange={e => setForm(f => ({ ...f, costBasis: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">機構</label>
            <input className="form-input" placeholder="例如：玉山銀行、富果證券" value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">貨幣</label>
            <select className="form-select" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              <option value="TWD">TWD</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn--primary">儲存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Import/Export
function DataActions({ assets, onImport }: { assets: Asset[]; onImport: (assets: Asset[]) => void }) {
  const handleExport = () => {
    const json = JSON.stringify({ assets, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealth-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const imported = Array.isArray(parsed.assets) ? parsed.assets : Array.isArray(parsed) ? parsed : [];
        if (imported.length > 0) onImport(imported);
      } catch {
        alert('檔案格式錯誤');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="data-actions">
      <button className="btn btn--ghost" onClick={handleExport}>📥 匯出 JSON</button>
      <label className="btn btn--ghost" style={{ cursor: 'pointer' }}>
        📤 匯入 JSON
        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function DashboardClient({
  userEmail,
  initialAssets,
  plan,
  justUpgraded,
  justDowngraded,
}: {
  userEmail: string;
  initialAssets: Asset[];
  plan: "free" | "pro" | "business";
  justUpgraded?: string;
  justDowngraded?: string;
}) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [period, setPeriod] = useState<string>('30');
  const [syncTime, setSyncTime] = useState<string | null>(null);
  const [display, setDisplay] = useState<DisplayCurrency>('TWD');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 啟動即時報價 polling（每 60s）
  const symbols = Array.from(new Set(assets.map(a => a.symbol).filter((s): s is string => Boolean(s))));
  const { quotes, fetchedAt: priceFetchedAt, loading: priceLoading } = usePricePolling(symbols, display);

  // 載入交易紀錄
  const loadTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions ?? []);
      }
    } catch (e) {
      console.warn('[tx] load failed', e);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // 已從 server 拿到 initial assets — 不再從 localStorage 覆蓋
  useEffect(() => {
    setSyncTime(new Date().toISOString());
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ assets }));
    }
  }, [assets]);

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wd_theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('wd_theme') as 'dark' | 'light' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Privacy shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setPrivacy(p => {
          const next = !p;
          localStorage.setItem('wd_privacy', String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('wd_privacy') === 'true';
    setPrivacy(saved);
  }, []);

  // Computed
  const total = assets.reduce((s, a) => s + a.value, 0);
  const totalCost = assets.reduce((s, a) => s + (a.costBasis || a.value), 0);
  const totalGain = total - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const todayGain = total * (Math.random() * 0.02 - 0.01);
  const todayGainPct = todayGain / total * 100;

  // P&L：每個 asset 對成本基礎（cost basis 是原幣，通常是 TWD）
  // 即時報價只影響 category === 'stock' / 'crypto' 的當前市值
  const pnlRows = assets.map(a => {
    const q = a.symbol ? quotes[a.symbol.toUpperCase()] : undefined;
    const hasQuote = q && !('error' in q);
    // 即時市值（USD）→ 換算回 TWD：value / 32.5 已是 USD；如需台股 .TW 報價為 TWD 要分開
    // 簡化：value 已是 TWD（市值），報價為 USD；只對加密 / 美股有意義
    // cost basis = 原始投入 TWD
    const currentValueTWD = a.value;
    const costTWD = a.costBasis ?? a.value;
    const gainTWD = currentValueTWD - costTWD;
    const gainPct = costTWD > 0 ? (gainTWD / costTWD) * 100 : 0;
    return {
      asset: a,
      costTWD,
      currentValueTWD,
      gainTWD,
      gainPct,
      change24hPct: hasQuote ? q.change24h : null,
    };
  });
  const totalPnlTWD = pnlRows.reduce((s, r) => s + r.gainTWD, 0);
  const winners = pnlRows.filter(r => r.gainTWD > 0).length;
  const losers = pnlRows.filter(r => r.gainTWD < 0).length;

  const handleAddAsset = async (asset: Asset) => {
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: asset.name,
          value: asset.value,
          costBasis: asset.costBasis ?? null,
          category: asset.category,
          currency: asset.currency,
          institution: asset.institution ?? null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "新增失敗");
        return;
      }
      const { asset: created } = await res.json();
      setAssets(prev => [...prev, { ...created, costBasis: created.costBasis ?? undefined, institution: created.institution ?? undefined, updatedAt: created.updatedAt }]);
      setSyncTime(new Date().toISOString());
    } catch (e) {
      console.error("add asset failed:", e);
      alert("網路錯誤，新增失敗");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("確定要刪除這筆資產？此操作無法復原。")) return;
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "刪除失敗");
        return;
      }
      setAssets(prev => prev.filter(a => a.id !== id));
      setSyncTime(new Date().toISOString());
    } catch (e) {
      console.error("delete asset failed:", e);
      alert("網路錯誤，刪除失敗");
    }
  };

  const handleImport = (imported: Asset[]) => {
    setAssets(imported);
    setSyncTime(new Date().toISOString());
  };

  const handleAddTx = async (tx: { assetId?: string | null; type: Transaction['type']; amount: number; currency: string; note?: string; date?: string }) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? '新增失敗');
        if (err.upgrade) {
          // 提示升級
          if (confirm('交易紀錄已達方案上限，要升級 Pro 解鎖更多嗎？')) {
            window.location.href = '/checkout?plan=pro';
          }
        }
        return;
      }
      await loadTransactions();
      setSyncTime(new Date().toISOString());
    } catch (e) {
      console.error('add tx failed:', e);
      alert('網路錯誤，新增失敗');
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!confirm('確定要刪除這筆交易紀錄？')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? '刪除失敗');
        return;
      }
      await loadTransactions();
    } catch (e) {
      console.error('delete tx failed:', e);
      alert('網路錯誤，刪除失敗');
    }
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const syncNow = async () => {
    try {
      const res = await fetch("/api/assets", { cache: "no-store" });
      if (!res.ok) throw new Error("sync failed");
      const data = await res.json();
      setAssets((data.assets ?? []).map((a: Record<string, unknown>) => ({
        id: String(a.id ?? ''),
        name: String(a.name ?? ''),
        value: Number(a.value ?? 0),
        costBasis: a.costBasis != null ? Number(a.costBasis) : undefined,
        category: String(a.category ?? 'other'),
        currency: String(a.currency ?? 'TWD'),
        institution: a.institution != null ? String(a.institution) : undefined,
        symbol: a.symbol != null ? String(a.symbol) : undefined,
        quantity: a.quantity != null ? Number(a.quantity) : undefined,
        avgPrice: a.avgPrice != null ? Number(a.avgPrice) : undefined,
        updatedAt: String(a.updatedAt ?? new Date().toISOString()),
      })));
      setSyncTime(new Date().toISOString());
    } catch (e) {
      console.error("sync failed:", e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-family)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>💰 Wealth Dashboard</h1>
            {syncTime && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inlineBlock' }} />
                已同步 {new Date(syncTime).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn--icon"
              onClick={syncNow}
              title="同步資料"
              style={{ fontSize: 'var(--font-size-sm)', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all var(--transition-base)' }}
            >
              🔄 同步
            </button>
            <button
              className="btn--icon"
              onClick={() => { setPrivacy(p => { const next = !p; localStorage.setItem('wd_privacy', String(next)); return next; }); }}
              title="Ctrl+H 隱私模式"
              style={{ fontSize: 'var(--font-size-sm)', background: privacy ? 'var(--color-primary)' : 'transparent', border: '1px solid var(--color-border)', color: privacy ? 'white' : 'var(--color-text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all var(--transition-base)' }}
            >
              {privacy ? '🔒 已隱藏' : '🔓 顯示'}
            </button>
            <button
              className="btn--icon"
              onClick={toggleTheme}
              title="切換主題"
              style={{ fontSize: 'var(--font-size-sm)', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all var(--transition-base)' }}
            >
              {theme === 'dark' ? '☀️ 淺色' : '🌙 深色'}
            </button>
            <PlanBadge plan={plan} />
            {/* 顯示貨幣切換（TWD / USD / BTC / ETH） */}
            <div style={{ display: 'inline-flex', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-md)', padding: 2 }}>
              {(['TWD', 'USD', 'BTC', 'ETH'] as DisplayCurrency[]).map(c => (
                <button
                  key={c}
                  onClick={() => setDisplay(c)}
                  title={c === 'TWD' ? '新台幣' : c === 'USD' ? '美元' : c === 'BTC' ? 'Bitcoin' : 'Ethereum'}
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    padding: '4px 10px',
                    borderRadius: 'calc(var(--radius-md) - 4px)',
                    background: display === c ? 'var(--color-primary)' : 'transparent',
                    color: display === c ? 'white' : 'var(--color-text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontFamily: 'var(--font-family)',
                    transition: 'all var(--transition-base)',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            {priceLoading && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>📡</span>
            )}
            {plan === 'free' && assets.length >= 5 && (
              <Link
                href="/checkout?plan=pro"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #6366F1, #10B981)',
                  color: 'white',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                }}
              >
                🚀 升級 Pro
              </Link>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 10px 4px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #10B981)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text)', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </span>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                title="登出"
                style={{ fontSize: 'var(--font-size-sm)', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all var(--transition-base)' }}
              >
                登出
              </button>
            </form>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 升級/降級 toast banner */}
        {(justUpgraded || justDowngraded) && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: justUpgraded
                ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15))'
                : 'rgba(148,163,184,0.1)',
              border: justUpgraded
                ? '1px solid rgba(16,185,129,0.3)'
                : '1px solid rgba(148,163,184,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                {justUpgraded ? '🎉 升級成功！' : '已降級到免費版'}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                {justUpgraded
                  ? `${justUpgraded === 'pro' ? 'Pro' : justUpgraded === 'business' ? 'Business' : '免費版'} 功能已啟用。立即體驗無限資產、即時股價、多幣別換算。`
                  : '降級成功，超過 6 筆的資產已鎖住。升級 Pro 可重新存取。'}
              </div>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.replaceState({}, '', '/dashboard');
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                padding: '4px 8px',
              }}
              aria-label="關閉通知"
            >
              ✕
            </button>
          </div>
        )}

        {/* Overview + Donut + Line */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <OverviewCards
            total={total}
            todayGain={todayGain}
            todayGainPct={todayGainPct}
            assetCount={assets.length}
            syncTime={syncTime}
            privacy={privacy}
          />
          <DonutChart assets={assets} privacy={privacy} />
          <LineChart total={total} period={period} onPeriodChange={setPeriod} />
        </div>

        {/* Asset list */}
        <AssetList
          assets={assets}
          sortKey={sortKey}
          onSortChange={setSortKey}
          onAdd={() => setShowAddModal(true)}
          privacy={privacy}
          onDelete={handleDeleteAsset}
        />

        {/* 損益表 P&L */}
        <PnLPanel
          pnlRows={pnlRows}
          totalPnlTWD={totalPnlTWD}
          totalGainPct={totalGainPct}
          winners={winners}
          losers={losers}
          privacy={privacy}
          display={display}
          quotes={quotes}
        />

        {/* 交易紀錄 */}
        <TransactionPanel
          transactions={transactions}
          assets={assets}
          onAdd={() => setShowTxModal(true)}
          onDelete={handleDeleteTx}
          privacy={privacy}
          display={display}
        />

        {/* Import/Export */}
        <DataActions assets={assets} onImport={handleImport} />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.5rem', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        Wealth Dashboard · 雲端同步 · Ctrl+H 隱藏金額
      </footer>

      {/* Add Modal */}
      {showAddModal && (
        <AddAssetModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAsset}
        />
      )}

      {/* Add Tx Modal */}
      {showTxModal && (
        <AddTxModal
          assets={assets}
          onClose={() => setShowTxModal(false)}
          onSave={handleAddTx}
        />
      )}

      {/* Privacy overlay hint */}
      {privacy && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-family)', zIndex: 50 }}>
          🔒 隱私模式已開啟 · Ctrl+H 關閉
        </div>
      )}
    </div>
  );
}

// ─── P&L 損益表面板 ──────────────────────────────────────────────────────────
interface PnlRow {
  asset: Asset;
  costTWD: number;
  currentValueTWD: number;
  gainTWD: number;
  gainPct: number;
  change24hPct: number | null;
}

function PnLPanel({
  pnlRows,
  totalPnlTWD,
  totalGainPct,
  winners,
  losers,
  privacy,
  display,
  quotes,
}: {
  pnlRows: PnlRow[];
  totalPnlTWD: number;
  totalGainPct: number;
  winners: number;
  losers: number;
  privacy: boolean;
  display: DisplayCurrency;
  quotes: Record<string, PriceQuote | { error: string }>;
}) {
  const mask = privacy ? '••••••' : null;
  const fmt = (v: number) => mask ?? formatPrice(v, display, { decimals: 0 });
  const totalColor = totalPnlTWD > 0 ? '#10B981' : totalPnlTWD < 0 ? '#EF4444' : 'var(--color-text-muted)';

  return (
    <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)' }}>📊 損益表 (P&L)</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: 'var(--font-size-xs)' }}>
          <span style={{ padding: '3px 8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-sm)', color: '#10B981', fontWeight: 600 }}>
            🟢 {winners} 個獲利
          </span>
          <span style={{ padding: '3px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#EF4444', fontWeight: 600 }}>
            🔴 {losers} 個虧損
          </span>
        </div>
      </div>

      {/* 總損益 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>總損益 ({display})</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalColor }}>
            {totalPnlTWD >= 0 ? '+' : ''}{fmt(totalPnlTWD)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: totalColor, marginTop: 2 }}>
            {totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(2)}% 總報酬率
          </div>
        </div>
      </div>

      {/* 每個 asset 的損益列 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>資產</th>
              <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>成本</th>
              <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>現值</th>
              <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>損益</th>
              <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>報酬率</th>
              <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>24h</th>
            </tr>
          </thead>
          <tbody>
            {pnlRows.map((r) => {
              const color = r.gainTWD > 0 ? '#10B981' : r.gainTWD < 0 ? '#EF4444' : 'var(--color-text-muted)';
              const has24h = r.change24hPct != null;
              const color24h = r.change24hPct! > 0 ? '#10B981' : r.change24hPct! < 0 ? '#EF4444' : 'var(--color-text-muted)';
              return (
                <tr key={r.asset.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 500 }}>
                    {r.asset.name}
                    {r.asset.symbol && (
                      <span style={{ marginLeft: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>({r.asset.symbol})</span>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmt(r.costTWD)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmt(r.currentValueTWD)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color, fontWeight: 600 }}>
                    {r.gainTWD >= 0 ? '+' : ''}{fmt(r.gainTWD)}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color, fontWeight: 600 }}>
                    {r.gainPct >= 0 ? '+' : ''}{r.gainPct.toFixed(2)}%
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color: has24h ? color24h : 'var(--color-text-muted)' }}>
                    {has24h ? `${r.change24hPct! >= 0 ? '+' : ''}${r.change24hPct!.toFixed(2)}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.75rem', textAlign: 'right' }}>
        即時報價：{Object.keys(quotes).length === 0 ? '載入中…' : `${Object.keys(quotes).length} 個標的追蹤中`}
      </div>
    </section>
  );
}

// ─── 交易紀錄面板 ──────────────────────────────────────────────────────────────
const TX_TYPE_LABELS: Record<Transaction['type'], { label: string; color: string; icon: string }> = {
  buy: { label: '買入', color: '#10B981', icon: '📈' },
  sell: { label: '賣出', color: '#EF4444', icon: '📉' },
  dividend: { label: '股息', color: '#F59E0B', icon: '💰' },
  deposit: { label: '存入', color: '#3B82F6', icon: '⬇️' },
  withdrawal: { label: '提出', color: '#8B5CF6', icon: '⬆️' },
};

function TransactionPanel({
  transactions,
  assets,
  onAdd,
  onDelete,
  privacy,
  display,
}: {
  transactions: Transaction[];
  assets: Asset[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  privacy: boolean;
  display: DisplayCurrency;
}) {
  const mask = privacy ? '••••••' : null;
  const fmt = (v: number, c: string) => {
    if (mask) return mask;
    // tx 是原幣；若 display != 原幣，僅顯示原幣金額 + 標示
    return `${c === 'TWD' ? 'NT$' : c === 'USD' ? '$' : ''}${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const assetName = (id?: string | null) => assets.find(a => a.id === id)?.name ?? '—';

  return (
    <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
          📋 交易紀錄 <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-muted)' }}>({transactions.length})</span>
        </h2>
        <button
          onClick={onAdd}
          style={{
            padding: '6px 14px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
          }}
        >
          ＋ 新增交易
        </button>
      </div>

      {transactions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          還沒有交易紀錄。點擊「＋ 新增交易」開始記錄買賣、股息、定存。
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>日期</th>
                <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>類型</th>
                <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>資產</th>
                <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>金額</th>
                <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>備註</th>
                <th style={{ padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 20).map((tx) => {
                const meta = TX_TYPE_LABELS[tx.type] ?? TX_TYPE_LABELS.deposit;
                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                      {new Date(tx.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <span style={{ color: meta.color, fontWeight: 600 }}>{meta.icon} {meta.label}</span>
                    </td>
                    <td style={{ padding: '0.5rem' }}>{assetName(tx.assetId)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: meta.color }}>
                      {fmt(tx.amount, tx.currency)}
                    </td>
                    <td style={{ padding: '0.5rem', color: 'var(--color-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.note ?? '—'}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <button
                        onClick={() => onDelete(tx.id)}
                        title="刪除"
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.875rem', padding: '4px 8px' }}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {transactions.length > 20 && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              顯示前 20 筆，總共 {transactions.length} 筆
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── 新增交易 Modal ──────────────────────────────────────────────────────────
function AddTxModal({
  assets,
  onClose,
  onSave,
}: {
  assets: Asset[];
  onClose: () => void;
  onSave: (tx: { assetId?: string | null; type: Transaction['type']; amount: number; currency: string; note?: string; date?: string }) => void;
}) {
  const [type, setType] = useState<Transaction['type']>('buy');
  const [assetId, setAssetId] = useState<string>(assets[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TWD');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!isFinite(num) || num <= 0) {
      alert('金額必須是正數');
      return;
    }
    setSubmitting(true);
    await onSave({
      assetId: assetId || null,
      type,
      amount: num,
      currency,
      note: note || undefined,
      date: new Date(date).toISOString(),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: 480, width: '100%', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>新增交易紀錄</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>類型</span>
            <select value={type} onChange={(e) => setType(e.target.value as Transaction['type'])} style={selectStyle}>
              <option value="buy">📈 買入</option>
              <option value="sell">📉 賣出</option>
              <option value="dividend">💰 股息 / 配息</option>
              <option value="deposit">⬇️ 存入</option>
              <option value="withdrawal">⬆️ 提出</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>關聯資產（選填）</span>
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)} style={selectStyle}>
              <option value="">— 不綁定 —</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>金額</span>
              <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required style={inputStyle} placeholder="10000" />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>幣別</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={selectStyle}>
                <option value="TWD">TWD</option>
                <option value="USD">USD</option>
                <option value="JPY">JPY</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>日期</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>備註（選填）</span>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} placeholder="例：定期定額 0050" />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
              取消
            </button>
            <button type="submit" disabled={submitting} style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'var(--font-family)', opacity: submitting ? 0.6 : 1 }}>
              {submitting ? '送出中…' : '新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  fontSize: 'var(--font-size-sm)',
  fontFamily: 'var(--font-family)',
};
const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  fontSize: 'var(--font-size-sm)',
  fontFamily: 'var(--font-family)',
};
