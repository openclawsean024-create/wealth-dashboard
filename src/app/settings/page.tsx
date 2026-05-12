'use client';

import { useState, useEffect, useId } from 'react';
import { apiKeys } from '@/lib/api-keys';
import { fetchBinanceSpotBalances, type BinanceSpotBalances } from '@/lib/binance';
import { fetchAlpacaPortfolio, type AlpacaPortfolio } from '@/lib/alpaca';
import { fetchWiseAccount, type WiseAccount } from '@/lib/wise';
import { fetchMaxAccount, type MaxAccount } from '@/lib/max';
import { fetchFugleAccount, type FugleAccount } from '@/lib/fugle';
import { fetchOkxAccount } from '@/lib/okx';
import type { OkxAccount } from '@/lib/sync-to-assets';

type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface SyncState {
  binance: SyncStatus;
  alpaca: SyncStatus;
  wise: SyncStatus;
  max: SyncStatus;
  fugle: SyncStatus;
  okx: SyncStatus;
}

interface SyncResult {
  binance?: BinanceSpotBalances;
  alpaca?: AlpacaPortfolio;
  wise?: WiseAccount;
  max?: MaxAccount;
  fugle?: FugleAccount;
  okx?: OkxAccount;
  error?: string;
}

// ── Guide accordion ──────────────────────────────────────────────────
function GuideStep({ num, text }: { num: number; text: string }) {
  return (
    <li className="flex gap-3 items-start text-sm text-[#8B949E]">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#30363D] text-[#8B949E] text-xs flex items-center justify-center font-bold mt-0.5">
        {num}
      </span>
      <span dangerouslySetInnerHTML={{ __html: text }} />
    </li>
  );
}

function HowToGuide({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#30363D] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#8B949E] hover:text-white hover:bg-[#21262D] transition-all"
      >
        <span className="flex items-center gap-2">
          <span>📖</span>
          <span>如何取得 API Key？（逐步說明）</span>
        </span>
        <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 bg-[#0D1117] border-t border-[#30363D]">
          <ol className="space-y-3 mt-3">
            {children}
          </ol>
        </div>
      )}
    </div>
  );
}

// ── Status pill ────────────────────────────────────────────────────────
function StatusPill({ status }: { status: SyncStatus }) {
  if (status === 'idle') return null;
  const map: Record<SyncStatus, { label: string; className: string }> = {
    idle: { label: '', className: '' },
    loading: { label: '同步中…', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    success: { label: '✅ 已連結', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    error: { label: '❌ 錯誤', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };
  const { label, className } = map[status];
  return (
    <span className={`ml-auto text-xs border px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

// ── Input field ────────────────────────────────────────────────────────
function Field({
  label, hint, value, onChange, type = 'text', placeholder,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-[#8B949E] mb-1">
        {label}
        {hint && <span className="ml-1 text-[#6E7681]">({hint})</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF] placeholder-[#6E7681]"
      />
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────
function Section({
  id, emoji, title, subtitle, status, children,
}: {
  id: string; emoji: string; title: string; subtitle: string;
  status: SyncStatus; children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6 scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="text-xs text-[#8B949E]">{subtitle}</p>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// ── Sync result card ───────────────────────────────────────────────────
function ResultCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl bg-[#21262D] border border-[#30363D] p-4 space-y-2">
      {children}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[#8B949E]">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  // Binance
  const [binanceApiKey, setBinanceApiKey] = useState('');
  const [binanceSecret, setBinanceSecret] = useState('');

  // Alpaca
  const [alpacaApiKey, setAlpacaApiKey] = useState('');
  const [alpacaSecret, setAlpacaSecret] = useState('');

  // Wise
  const [wiseToken, setWiseToken] = useState('');
  const [wiseProfileId, setWiseProfileId] = useState('');

  // MAX
  const [maxApiKey, setMaxApiKey] = useState('');
  const [maxSecret, setMaxSecret] = useState('');

  // Fugle
  const [fugleApiKey, setFugleApiKey] = useState('');

  // OKX
  const [okxApiKey, setOkxApiKey] = useState('');
  const [okxSecret, setOkxSecret] = useState('');
  const [okxPassphrase, setOkxPassphrase] = useState('');

  const [syncState, setSyncState] = useState<SyncState>({
    binance: 'idle', alpaca: 'idle', wise: 'idle', max: 'idle', fugle: 'idle', okx: 'idle',
  });
  const [syncResults, setSyncResults] = useState<SyncResult>({});
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const b = apiKeys.binance.get();
    if (b) { setBinanceApiKey(b.apiKey); setBinanceSecret(b.secretKey); }
    const a = apiKeys.alpaca.get();
    if (a) { setAlpacaApiKey(a.apiKey); setAlpacaSecret(a.secretKey); }
    const w = apiKeys.wise.get();
    if (w) { setWiseToken(w.apiToken); setWiseProfileId(w.profileId); }
    const m = apiKeys.max.get();
    if (m) { setMaxApiKey(m.apiKey); setMaxSecret(m.secretKey); }
    const f = apiKeys.fugle.get();
    if (f) { setFugleApiKey(f.apiKey); }
    const o = apiKeys.okx.get();
    if (o) { setOkxApiKey(o.apiKey); setOkxSecret(o.secretKey); setOkxPassphrase(o.passphrase); }
  }, []);

  // ── Save handlers ──────────────────────────────────────────────────
  const saveBinance = () => apiKeys.binance.set({ apiKey: binanceApiKey.trim(), secretKey: binanceSecret.trim() });
  const saveAlpaca = () => apiKeys.alpaca.set({ apiKey: alpacaApiKey.trim(), secretKey: alpacaSecret.trim() });
  const saveWise = () => apiKeys.wise.set({ apiToken: wiseToken.trim(), profileId: wiseProfileId.trim() });
  const saveMax = () => apiKeys.max.set({ apiKey: maxApiKey.trim(), secretKey: maxSecret.trim() });
  const saveFugle = () => apiKeys.fugle.set({ apiKey: fugleApiKey.trim() });
  const saveOkx = () => apiKeys.okx.set({ apiKey: okxApiKey.trim(), secretKey: okxSecret.trim(), passphrase: okxPassphrase.trim() });

  // ── Sync handlers ──────────────────────────────────────────────────
  const setStatus = (platform: keyof SyncState, s: SyncStatus) =>
    setSyncState(prev => ({ ...prev, [platform]: s }));

  const handleSyncBinance = async () => {
    saveBinance();
    const keys = apiKeys.binance.get();
    if (!keys?.apiKey) return setSyncError('請先填入 Binance API Key');
    setStatus('binance', 'loading'); setSyncError(null);
    try {
      const result = await fetchBinanceSpotBalances(keys);
      setSyncResults(p => ({ ...p, binance: result }));
      setStatus('binance', 'success');
    } catch (err: unknown) {
      setSyncError((err as Error).message ?? '同步失敗');
      setStatus('binance', 'error');
    }
  };

  const handleSyncAlpaca = async () => {
    saveAlpaca();
    const keys = apiKeys.alpaca.get();
    if (!keys?.apiKey) return setSyncError('請先填入 Alpaca API Key');
    setStatus('alpaca', 'loading'); setSyncError(null);
    try {
      const result = await fetchAlpacaPortfolio(keys);
      setSyncResults(p => ({ ...p, alpaca: result }));
      setStatus('alpaca', 'success');
    } catch (err: unknown) {
      setSyncError((err as Error).message ?? '同步失敗');
      setStatus('alpaca', 'error');
    }
  };

  const handleSyncWise = async () => {
    saveWise();
    const keys = apiKeys.wise.get();
    if (!keys?.apiToken) return setSyncError('請先填入 Wise API Token');
    setStatus('wise', 'loading'); setSyncError(null);
    try {
      const result = await fetchWiseAccount(keys);
      setSyncResults(p => ({ ...p, wise: result }));
      setStatus('wise', 'success');
    } catch (err: unknown) {
      setSyncError((err as Error).message ?? '同步失敗');
      setStatus('wise', 'error');
    }
  };

  const handleSyncMax = async () => {
    saveMax();
    const keys = apiKeys.max.get();
    if (!keys?.apiKey) return setSyncError('請先填入 MAX API Key');
    setStatus('max', 'loading'); setSyncError(null);
    try {
      const result = await fetchMaxAccount(keys);
      setSyncResults(p => ({ ...p, max: result }));
      setStatus('max', 'success');
    } catch (err: unknown) {
      setSyncError((err as Error).message ?? '同步失敗');
      setStatus('max', 'error');
    }
  };

  const handleSyncFugle = async () => {
    saveFugle();
    const keys = apiKeys.fugle.get();
    if (!keys?.apiKey) return setSyncError('請先填入富果 API Key');
    setStatus('fugle', 'loading'); setSyncError(null);
    try {
      const result = await fetchFugleAccount(keys);
      setSyncResults(p => ({ ...p, fugle: result }));
      setStatus('fugle', 'success');
    } catch (err: unknown) {
      setSyncError((err as Error).message ?? '同步失敗');
      setStatus('fugle', 'error');
    }
  };

  const handleSyncOkx = async () => {
    saveOkx();
    const keys = apiKeys.okx.get();
    if (!keys?.apiKey) return setSyncError('請先填入 OKX API Key');
    setStatus('okx', 'loading'); setSyncError(null);
    try {
      const result = await fetchOkxAccount(keys);
      setSyncResults(p => ({ ...p, okx: result }));
      setStatus('okx', 'success');
    } catch (err: unknown) {
      setSyncError((err as Error).message ?? '同步失敗');
      setStatus('okx', 'error');
    }
  };

  const handleClearAll = () => {
    if (!confirm('確定要清除所有 API Key 嗎？這個動作無法復原。')) return;
    ['binance', 'alpaca', 'wise', 'max', 'fugle', 'okx'].forEach(k =>
      (apiKeys as Record<string, { clear: () => void }>)[k].clear()
    );
    setBinanceApiKey(''); setBinanceSecret('');
    setAlpacaApiKey(''); setAlpacaSecret('');
    setWiseToken(''); setWiseProfileId('');
    setMaxApiKey(''); setMaxSecret('');
    setFugleApiKey('');
    setOkxApiKey(''); setOkxSecret(''); setOkxPassphrase('');
    setSyncResults({});
    setSyncState({ binance: 'idle', alpaca: 'idle', wise: 'idle', max: 'idle', fugle: 'idle', okx: 'idle' });
  };

  // ── Shared button styles ───────────────────────────────────────────
  const saveBtn = 'px-4 py-2 rounded-xl bg-[#21262D] border border-[#30363D] text-sm text-[#8B949E] hover:text-white hover:border-[#58A6FF] transition-all';
  const syncBtn = (color: string, disabled: boolean) =>
    `px-4 py-2 rounded-xl ${color} text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 ${disabled ? 'cursor-not-allowed' : ''}`;

  const connected = Object.values(syncState).filter(s => s === 'success').length;

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {/* Header */}
      <header className="border-b border-[#30363D] bg-[#0D1117]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-[#8B949E] hover:text-white transition-colors text-sm">← 返回儀表板</a>
            <span className="text-[#30363D]">|</span>
            <h1 className="text-lg font-bold text-white">⚙️ 帳戶連結設定</h1>
          </div>
          {connected > 0 && (
            <span className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-full">
              {connected} 個已連結
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 space-y-6">
        {/* Intro */}
        <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-5">
          <h2 className="text-sm font-semibold text-white mb-2">連結您的帳戶，自動同步餘額</h2>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            填入 API Key 後點擊「同步」，系統會自動讀取您的帳戶餘額並顯示在儀表板。<br />
            <strong className="text-[#E6EDF3]">所有金鑰只存在您的瀏覽器，不會傳到任何伺服器。</strong>
          </p>
        </div>

        {/* Error banner */}
        {syncError && (
          <div className="rounded-xl border border-[#F85149]/30 bg-[#F85149]/10 px-4 py-3 text-sm text-[#F85149]">
            ⚠️ {syncError}
          </div>
        )}

        {/* ── MAX Exchange ──────────────────────────────────────── */}
        <Section
          id="max"
          emoji="🟢"
          title="MAX 加密交易所（台灣）"
          subtitle="MaiCoin MAX — 台灣最大加密貨幣交易所，讀取現貨餘額"
          status={syncState.max}
        >
          <HowToGuide>
            <GuideStep num={1} text='前往 <a href="https://max.maicoin.com" target="_blank" class="underline text-[#58A6FF]">max.maicoin.com</a> 並登入帳號' />
            <GuideStep num={2} text='點選右上角帳號頭像 → <strong class="text-white">安全性</strong>' />
            <GuideStep num={3} text='找到 <strong class="text-white">API</strong> 分頁，點擊「建立 API 金鑰」' />
            <GuideStep num={4} text='勾選「<strong class="text-white">讀取帳戶資訊</strong>」（不要勾選交易和提領）' />
            <GuideStep num={5} text='填入 2FA 驗證碼，系統會顯示 API Key 和 Secret Key，複製下來貼到這裡' />
          </HowToGuide>

          <Field label="API Key" value={maxApiKey} onChange={setMaxApiKey} placeholder="例：abc123..." />
          <Field label="Secret Key" type="password" value={maxSecret} onChange={setMaxSecret} placeholder="例：xyz789..." />

          <div className="flex gap-3">
            <button onClick={saveMax} className={saveBtn}>儲存</button>
            <button
              onClick={handleSyncMax}
              disabled={syncState.max === 'loading'}
              className={syncBtn('bg-emerald-600 text-white', syncState.max === 'loading')}
            >
              {syncState.max === 'loading' ? '⏳ 同步中…' : '🔄 同步餘額'}
            </button>
          </div>

          {syncResults.max && (
            <ResultCard>
              <p className="text-xs text-[#8B949E]">✅ 找到 {syncResults.max.balances.length} 種幣別</p>
              {syncResults.max.balances.slice(0, 8).map(b => (
                <ResultRow key={b.currency} label={b.currency} value={b.total.toFixed(6)} />
              ))}
              {syncResults.max.balances.length > 8 && (
                <p className="text-xs text-[#8B949E]">…還有 {syncResults.max.balances.length - 8} 種</p>
              )}
              <p className="text-xs text-[#6E7681]">
                同步時間：{new Date(syncResults.max.syncedAt).toLocaleString('zh-TW')}
              </p>
            </ResultCard>
          )}
        </Section>

        {/* ── Fugle 富果 ────────────────────────────────────────── */}
        <Section
          id="fugle"
          emoji="📈"
          title="富果 (Fugle) 台股帳戶"
          subtitle="讀取台灣股票庫存與帳戶餘額"
          status={syncState.fugle}
        >
          <HowToGuide>
            <GuideStep num={1} text='前往 <a href="https://developer.fugle.tw" target="_blank" class="underline text-[#58A6FF]">developer.fugle.tw</a> 並登入' />
            <GuideStep num={2} text='點選右上角 → <strong class="text-white">帳戶設定</strong> → <strong class="text-white">API 金鑰管理</strong>' />
            <GuideStep num={3} text='點擊「產生新金鑰」，選擇「交易 API」類型' />
            <GuideStep num={4} text='複製顯示的 API Key 貼到下方欄位' />
            <GuideStep num={5} text='注意：富果 Trade API 需要先完成 KYC 開戶才能使用' />
          </HowToGuide>

          <Field label="API Key" value={fugleApiKey} onChange={setFugleApiKey} placeholder="例：FUGLE-XXXXXXXXXX" />

          <div className="flex gap-3">
            <button onClick={saveFugle} className={saveBtn}>儲存</button>
            <button
              onClick={handleSyncFugle}
              disabled={syncState.fugle === 'loading'}
              className={syncBtn('bg-[#58A6FF] text-white', syncState.fugle === 'loading')}
            >
              {syncState.fugle === 'loading' ? '⏳ 同步中…' : '🔄 同步帳戶'}
            </button>
          </div>

          {syncResults.fugle && (
            <ResultCard>
              <p className="text-xs text-[#8B949E]">✅ 帳戶同步成功</p>
              <ResultRow label="可用資金" value={`NT$ ${syncResults.fugle.cashBalance.toLocaleString('zh-TW')}`} />
              <ResultRow label="持股市值" value={`NT$ ${syncResults.fugle.totalMarketValue.toLocaleString('zh-TW')}`} />
              <ResultRow label="總資產" value={`NT$ ${syncResults.fugle.totalAssets.toLocaleString('zh-TW')}`} />
              {syncResults.fugle.inventories.length > 0 && (
                <>
                  <p className="text-xs text-[#8B949E] pt-1">持股明細（{syncResults.fugle.inventories.length} 筆）：</p>
                  {syncResults.fugle.inventories.slice(0, 5).map(i => (
                    <ResultRow
                      key={i.stockNo}
                      label={`${i.stockName} (${i.stockNo})`}
                      value={`${i.quantity} 股`}
                    />
                  ))}
                </>
              )}
              <p className="text-xs text-[#6E7681]">
                同步時間：{new Date(syncResults.fugle.syncedAt).toLocaleString('zh-TW')}
              </p>
            </ResultCard>
          )}
        </Section>

        {/* ── OKX ──────────────────────────────────────────────── */}
        <Section
          id="okx"
          emoji="🔵"
          title="OKX 交易所（全球）"
          subtitle="全球前三大加密貨幣交易所，讀取現貨/合約帳戶"
          status={syncState.okx}
        >
          <HowToGuide>
            <GuideStep num={1} text='前往 <a href="https://www.okx.com" target="_blank" class="underline text-[#58A6FF]">okx.com</a> 並登入' />
            <GuideStep num={2} text='點右上角頭像 → <strong class="text-white">API</strong>' />
            <GuideStep num={3} text='點「建立 API 金鑰」，選擇「用於閱讀」類型' />
            <GuideStep num={4} text='設定您的 <strong class="text-white">Passphrase</strong>（自定義密碼，需記住）' />
            <GuideStep num={5} text='只勾選「讀取」權限，完成 2FA，複製 API Key、Secret Key 和 Passphrase 到下方' />
          </HowToGuide>

          <Field label="API Key" value={okxApiKey} onChange={setOkxApiKey} placeholder="例：abc123xyz..." />
          <Field label="Secret Key" type="password" value={okxSecret} onChange={setOkxSecret} placeholder="例：xyz789..." />
          <Field label="Passphrase" type="password" value={okxPassphrase} onChange={setOkxPassphrase} placeholder="您建立 API 時設定的 Passphrase" />

          <div className="flex gap-3">
            <button onClick={saveOkx} className={saveBtn}>儲存</button>
            <button
              onClick={handleSyncOkx}
              disabled={syncState.okx === 'loading'}
              className={syncBtn('bg-[#3B82F6] text-white', syncState.okx === 'loading')}
            >
              {syncState.okx === 'loading' ? '⏳ 同步中…' : '🔄 同步餘額'}
            </button>
          </div>

          {syncResults.okx && (
            <ResultCard>
              <p className="text-xs text-[#8B949E]">✅ 找到 {syncResults.okx.balances.length} 種資產</p>
              {syncResults.okx.balances.slice(0, 8).map(b => (
                <ResultRow key={b.currency} label={b.currency} value={b.total.toFixed(6)} />
              ))}
              {syncResults.okx.balances.length > 8 && (
                <p className="text-xs text-[#8B949E]">…還有 {syncResults.okx.balances.length - 8} 種</p>
              )}
              <p className="text-xs text-[#6E7681]">
                同步時間：{new Date(syncResults.okx.syncedAt).toLocaleString('zh-TW')}
              </p>
            </ResultCard>
          )}
        </Section>

        {/* ── Binance ──────────────────────────────────────────── */}
        <Section
          id="binance"
          emoji="🟡"
          title="Binance 現貨帳戶（全球）"
          subtitle="全球最大加密貨幣交易所，讀取現貨餘額"
          status={syncState.binance}
        >
          <HowToGuide>
            <GuideStep num={1} text='前往 <a href="https://www.binance.com" target="_blank" class="underline text-[#58A6FF]">binance.com</a> 並登入' />
            <GuideStep num={2} text='點右上角頭像 → <strong class="text-white">API Management</strong>（API 管理）' />
            <GuideStep num={3} text='點「Create API」→ 選擇「System Generated」' />
            <GuideStep num={4} text='權限設定：只勾選「<strong class="text-white">Read Info</strong>」（讀取資訊），不要勾選 Enable Trading' />
            <GuideStep num={5} text='完成 2FA 驗證，複製 API Key 和 Secret Key 到下方' />
          </HowToGuide>

          <Field label="API Key" value={binanceApiKey} onChange={setBinanceApiKey} placeholder="例：abc123xyz..." />
          <Field label="Secret Key" type="password" value={binanceSecret} onChange={setBinanceSecret} placeholder="例：xyz789..." />

          <div className="flex gap-3">
            <button onClick={saveBinance} className={saveBtn}>儲存</button>
            <button
              onClick={handleSyncBinance}
              disabled={syncState.binance === 'loading'}
              className={syncBtn('bg-[#F0B90B] text-black', syncState.binance === 'loading')}
            >
              {syncState.binance === 'loading' ? '⏳ 同步中…' : '🔄 同步餘額'}
            </button>
          </div>

          {syncResults.binance && (
            <ResultCard>
              <p className="text-xs text-[#8B949E]">✅ 找到 {syncResults.binance.balances.length} 種資產</p>
              {syncResults.binance.balances.slice(0, 8).map(b => (
                <ResultRow key={b.asset} label={b.asset} value={b.total.toFixed(6)} />
              ))}
              {syncResults.binance.balances.length > 8 && (
                <p className="text-xs text-[#8B949E]">…還有 {syncResults.binance.balances.length - 8} 種</p>
              )}
              <p className="text-xs text-[#6E7681]">
                同步時間：{new Date(syncResults.binance.syncedAt).toLocaleString('zh-TW')}
              </p>
            </ResultCard>
          )}
        </Section>

        {/* ── Alpaca ────────────────────────────────────────────── */}
        <Section
          id="alpaca"
          emoji="🇺🇸"
          title="Alpaca 美股帳戶"
          subtitle="美國零手續費股票券商，讀取帳戶餘額與持倉"
          status={syncState.alpaca}
        >
          <HowToGuide>
            <GuideStep num={1} text='前往 <a href="https://app.alpaca.markets" target="_blank" class="underline text-[#58A6FF]">app.alpaca.markets</a> 並登入' />
            <GuideStep num={2} text='在側欄點擊 <strong class="text-white">Paper Trading</strong>（模擬交易）或切換到 Live Trading' />
            <GuideStep num={3} text='點擊右上角頭像 → <strong class="text-white">Your API Keys</strong>' />
            <GuideStep num={4} text='點「Generate New Key」，複製 Key ID 和 Secret Key' />
            <GuideStep num={5} text='貼到下方欄位，點「同步帳戶」' />
          </HowToGuide>

          <Field label="API Key ID" value={alpacaApiKey} onChange={setAlpacaApiKey} placeholder="例：PKXXXXXXXXXX" />
          <Field label="Secret Key" type="password" value={alpacaSecret} onChange={setAlpacaSecret} placeholder="例：xxxxxxxxxxxxxxxx" />

          <div className="flex gap-3">
            <button onClick={saveAlpaca} className={saveBtn}>儲存</button>
            <button
              onClick={handleSyncAlpaca}
              disabled={syncState.alpaca === 'loading'}
              className={syncBtn('bg-[#58A6FF] text-white', syncState.alpaca === 'loading')}
            >
              {syncState.alpaca === 'loading' ? '⏳ 同步中…' : '🔄 同步帳戶'}
            </button>
          </div>

          {syncResults.alpaca && (
            <ResultCard>
              <p className="text-xs text-[#8B949E]">✅ 帳戶同步成功</p>
              <ResultRow label="Portfolio Value" value={`$${syncResults.alpaca.account.portfolioValue.toLocaleString()}`} />
              <ResultRow label="持倉數量" value={`${syncResults.alpaca.positions.length} 筆`} />
              {syncResults.alpaca.positions.slice(0, 5).map(p => (
                <ResultRow key={p.symbol} label={p.symbol} value={`${p.qty} 股 @ $${p.currentPrice.toFixed(2)}`} />
              ))}
              <p className="text-xs text-[#6E7681]">
                同步時間：{new Date(syncResults.alpaca.syncedAt).toLocaleString('zh-TW')}
              </p>
            </ResultCard>
          )}
        </Section>

        {/* ── Wise ──────────────────────────────────────────────── */}
        <Section
          id="wise"
          emoji="🌍"
          title="Wise 國際帳戶"
          subtitle="多幣別外匯帳戶，支援 TWD / USD / EUR / JPY 等"
          status={syncState.wise}
        >
          <HowToGuide>
            <GuideStep num={1} text='前往 <a href="https://wise.com" target="_blank" class="underline text-[#58A6FF]">wise.com</a> 並登入' />
            <GuideStep num={2} text='點右上角頭像 → <strong class="text-white">Settings</strong>（設定）' />
            <GuideStep num={3} text='找到 <strong class="text-white">API tokens</strong> 分頁' />
            <GuideStep num={4} text='點「Create new token」，選擇 Read-only 權限' />
            <GuideStep num={5} text='複製 token 貼到下方「API Token」欄位（Profile ID 可留空，會自動偵測）' />
          </HowToGuide>

          <Field label="API Token" type="password" value={wiseToken} onChange={setWiseToken} placeholder="從 Wise Dashboard 取得" />
          <Field label="Profile ID" hint="選填，留空自動偵測" value={wiseProfileId} onChange={setWiseProfileId} placeholder="留空則自動取第一個 profile" />

          <div className="flex gap-3">
            <button onClick={saveWise} className={saveBtn}>儲存</button>
            <button
              onClick={handleSyncWise}
              disabled={syncState.wise === 'loading'}
              className={syncBtn('bg-[#10B981] text-white', syncState.wise === 'loading')}
            >
              {syncState.wise === 'loading' ? '⏳ 同步中…' : '🔄 同步餘額'}
            </button>
          </div>

          {syncResults.wise && (
            <ResultCard>
              <p className="text-xs text-[#8B949E]">✅ 找到 {syncResults.wise.balances.length} 種幣別</p>
              {syncResults.wise.balances.map(b => (
                <ResultRow
                  key={b.currency}
                  label={b.currency}
                  value={parseFloat(String(b.amount)).toLocaleString('en-US', { maximumFractionDigits: 4 })}
                />
              ))}
              <p className="text-xs text-[#6E7681]">
                同步時間：{new Date(syncResults.wise.syncedAt).toLocaleString('zh-TW')}
              </p>
            </ResultCard>
          )}
        </Section>

        {/* ── Privacy & Clear ───────────────────────────────────── */}
        <section className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">🔒 隱私與安全</h3>
          <ul className="space-y-2 text-xs text-[#8B949E]">
            <li>• 所有 API Key 只存在您瀏覽器的 localStorage，不會上傳</li>
            <li>• 建議申請「只讀」權限的 API Key，避免提款或交易風險</li>
            <li>• 使用 Ctrl+H 可以快速隱藏所有金額</li>
            <li>• 清除瀏覽器資料時，API Key 也會一併清除</li>
          </ul>

          <button
            onClick={handleClearAll}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all"
          >
            🗑️ 清除所有 API Key
          </button>
        </section>
      </main>
    </div>
  );
}
