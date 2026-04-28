'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Asset {
  id: string;
  name: string;
  value: number;
  costBasis?: number;
  category: 'cash' | 'stock' | 'fund' | 'crypto' | 'real-estate' | 'other';
  currency: string;
  institution?: string;
  updatedAt: string;
}

type SortKey = 'value' | 'name' | 'category';
type DisplayCurrency = 'TWD' | 'USD';
type TimeInterval = '7' | '30' | '90' | '365';

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
function AssetRow({ asset, privacy }: { asset: Asset; privacy: boolean }) {
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
    </div>
  );
}

// Asset List (with sorting + add)
function AssetList({ assets, sortKey, onSortChange, onAdd, privacy }: {
  assets: Asset[];
  sortKey: SortKey;
  onSortChange: (k: SortKey) => void;
  onAdd: () => void;
  privacy: boolean;
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
      {sorted.map(a => <AssetRow key={a.id} asset={a} privacy={privacy} />)}
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
export default function DashboardClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [showAddModal, setShowAddModal] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [period, setPeriod] = useState<string>('30');
  const [syncTime, setSyncTime] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.assets && parsed.assets.length > 0) {
          setAssets(parsed.assets);
          return;
        }
      }
      setAssets(INITIAL_ASSETS);
    } catch {
      setAssets(INITIAL_ASSETS);
    }
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

  const handleAddAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
  };

  const handleImport = (imported: Asset[]) => {
    setAssets(imported);
    setSyncTime(new Date().toISOString());
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const syncNow = () => setSyncTime(new Date().toISOString());

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
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
        />

        {/* Import/Export */}
        <DataActions assets={assets} onImport={handleImport} />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.5rem', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        Wealth Dashboard · 純本地儲存，資料不上雲端 · Ctrl+H 隱藏金額
      </footer>

      {/* Add Modal */}
      {showAddModal && (
        <AddAssetModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAsset}
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
