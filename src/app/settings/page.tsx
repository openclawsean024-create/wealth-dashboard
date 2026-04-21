'use client';

import { useState, useEffect } from 'react';
import { apiKeys } from '@/lib/api-keys';
import { fetchBinanceSpotBalances, type BinanceSpotBalances } from '@/lib/binance';
import { fetchAlpacaPortfolio, type AlpacaPortfolio } from '@/lib/alpaca';
import { fetchWiseAccount, type WiseAccount } from '@/lib/wise';

type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface SyncState {
  binance: SyncStatus;
  alpaca: SyncStatus;
  wise: SyncStatus;
}

interface SyncResult {
  binance?: BinanceSpotBalances;
  alpaca?: AlpacaPortfolio;
  wise?: WiseAccount;
  error?: string;
}

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

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>({ binance: 'idle', alpaca: 'idle', wise: 'idle' });
  const [syncResults, setSyncResults] = useState<SyncResult>({});
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load saved keys on mount
  useEffect(() => {
    const bKeys = apiKeys.binance.get();
    if (bKeys) {
      setBinanceApiKey(bKeys.apiKey);
      setBinanceSecret(bKeys.secretKey);
    }
    const aKeys = apiKeys.alpaca.get();
    if (aKeys) {
      setAlpacaApiKey(aKeys.apiKey);
      setAlpacaSecret(aKeys.secretKey);
    }
    const wKeys = apiKeys.wise.get();
    if (wKeys) {
      setWiseToken(wKeys.apiToken);
      setWiseProfileId(wKeys.profileId);
    }
  }, []);

  const handleSaveBinance = () => {
    apiKeys.binance.set({ apiKey: binanceApiKey.trim(), secretKey: binanceSecret.trim() });
  };

  const handleSaveAlpaca = () => {
    apiKeys.alpaca.set({ apiKey: alpacaApiKey.trim(), secretKey: alpacaSecret.trim() });
  };

  const handleSaveWise = () => {
    apiKeys.wise.set({ apiToken: wiseToken.trim(), profileId: wiseProfileId.trim() });
  };

  const handleSyncBinance = async () => {
    const keys = apiKeys.binance.get();
    if (!keys?.apiKey || !keys?.secretKey) {
      setSyncError('請先填入 Binance API Key 和 Secret');
      return;
    }
    setSyncState(s => ({ ...s, binance: 'loading' }));
    setSyncError(null);
    try {
      const result = await fetchBinanceSpotBalances(keys);
      setSyncResults(prev => ({ ...prev, binance: result }));
      setSyncState(s => ({ ...s, binance: 'success' }));
    } catch (err: any) {
      setSyncError(err.message || '同步失敗');
      setSyncState(s => ({ ...s, binance: 'error' }));
    }
  };

  const handleSyncAlpaca = async () => {
    const keys = apiKeys.alpaca.get();
    if (!keys?.apiKey || !keys?.secretKey) {
      setSyncError('請先填入 Alpaca API Key 和 Secret');
      return;
    }
    setSyncState(s => ({ ...s, alpaca: 'loading' }));
    setSyncError(null);
    try {
      const result = await fetchAlpacaPortfolio(keys);
      setSyncResults(prev => ({ ...prev, alpaca: result }));
      setSyncState(s => ({ ...s, alpaca: 'success' }));
    } catch (err: any) {
      setSyncError(err.message || '同步失敗');
      setSyncState(s => ({ ...s, alpaca: 'error' }));
    }
  };

  const handleSyncWise = async () => {
    const keys = apiKeys.wise.get();
    if (!keys?.apiToken) {
      setSyncError('請先填入 Wise API Token');
      return;
    }
    setSyncState(s => ({ ...s, wise: 'loading' }));
    setSyncError(null);
    try {
      const result = await fetchWiseAccount(keys);
      setSyncResults(prev => ({ ...prev, wise: result }));
      setSyncState(s => ({ ...s, wise: 'success' }));
    } catch (err: any) {
      setSyncError(err.message || '同步失敗');
      setSyncState(s => ({ ...s, wise: 'error' }));
    }
  };

  const statusIcon = (status: SyncStatus) => {
    if (status === 'loading') return '⏳';
    if (status === 'success') return '✅';
    if (status === 'error') return '❌';
    return '';
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {/* Header */}
      <header className="border-b border-[#30363D] bg-[#0D1117]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <a href="/" className="text-[#8B949E] hover:text-white transition-colors text-sm">← 返回</a>
            <a href="/settings" className="text-[#8B949E] hover:text-white transition-colors text-sm">⚙️ API 設定</a>
            <h1 className="text-2xl font-bold text-white">⚙️ API 設定</h1>
          </div>
          <p className="mt-2 text-sm text-[#8B949E]">
            所有 API Key 只存在您的瀏覽器 localStorage，不會上傳至任何外部伺服器。
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 space-y-8">

        {/* Error banner */}
        {syncError && (
          <div className="rounded-xl border border-[#F85149]/30 bg-[#F85149]/10 px-4 py-3 text-sm text-[#F85149]">
            ⚠️ {syncError}
          </div>
        )}

        {/* ── Binance ─────────────────────────────────── */}
        <section className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🟡</span>
            <div>
              <h2 className="text-base font-semibold text-white">Binance 現貨帳戶</h2>
              <p className="text-xs text-[#8B949E]">讀取現貨餘額（需開通「閱讀」權限的 API Key）</p>
            </div>
            {syncState.binance !== 'idle' && (
              <span className="ml-auto text-sm">{statusIcon(syncState.binance)}</span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#8B949E] mb-1.5">API Key</label>
              <input
                type="text"
                value={binanceApiKey}
                onChange={e => setBinanceApiKey(e.target.value)}
                placeholder="例：abc123xyz..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8B949E] mb-1.5">Secret Key</label>
              <input
                type="password"
                value={binanceSecret}
                onChange={e => setBinanceSecret(e.target.value)}
                placeholder="例：xyz789..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveBinance}
                className="px-4 py-2 rounded-xl bg-[#21262D] border border-[#30363D] text-sm text-[#8B949E] hover:text-white hover:border-[#58A6FF] transition-all"
              >
                儲存
              </button>
              <button
                onClick={handleSyncBinance}
                disabled={syncState.binance === 'loading'}
                className="px-4 py-2 rounded-xl bg-[#F0B90B] text-black font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {syncState.binance === 'loading' ? '同步中...' : '🔄 同步餘額'}
              </button>
            </div>
          </div>

          {/* Sync result */}
          {syncResults.binance && (
            <div className="mt-4 rounded-xl bg-[#21262D] border border-[#30363D] p-4">
              <p className="text-xs text-[#8B949E] mb-2">同步結果</p>
              <p className="text-sm text-white">✅ 成功讀取 {syncResults.binance.balances.length} 種資產</p>
              <p className="text-xs text-[#8B949E] mt-1">時間：{new Date(syncResults.binance.syncedAt).toLocaleString('zh-TW')}</p>
              <div className="mt-3 space-y-1">
                {syncResults.binance.balances.slice(0, 8).map(b => (
                  <div key={b.asset} className="flex justify-between text-xs">
                    <span className="text-[#8B949E]">{b.asset}</span>
                    <span className="text-white">{(b.total).toFixed(4)}</span>
                  </div>
                ))}
                {syncResults.binance.balances.length > 8 && (
                  <p className="text-xs text-[#8B949E]">...還有 {syncResults.binance.balances.length - 8} 種</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Alpaca ──────────────────────────────────── */}
        <section className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">📈</span>
            <div>
              <h2 className="text-base font-semibold text-white">Alpaca 美股帳戶</h2>
              <p className="text-xs text-[#8B949E]">讀取帳戶餘額與持倉（預設使用 Paper Trade）</p>
            </div>
            {syncState.alpaca !== 'idle' && (
              <span className="ml-auto text-sm">{statusIcon(syncState.alpaca)}</span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#8B949E] mb-1.5">API Key ID</label>
              <input
                type="text"
                value={alpacaApiKey}
                onChange={e => setAlpacaApiKey(e.target.value)}
                placeholder="例：PKXXXXXXXXXX"
                className="w-full px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8B949E] mb-1.5">Secret Key</label>
              <input
                type="password"
                value={alpacaSecret}
                onChange={e => setAlpacaSecret(e.target.value)}
                placeholder="例：xxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveAlpaca}
                className="px-4 py-2 rounded-xl bg-[#21262D] border border-[#30363D] text-sm text-[#8B949E] hover:text-white hover:border-[#58A6FF] transition-all"
              >
                儲存
              </button>
              <button
                onClick={handleSyncAlpaca}
                disabled={syncState.alpaca === 'loading'}
                className="px-4 py-2 rounded-xl bg-[#58A6FF] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {syncState.alpaca === 'loading' ? '同步中...' : '🔄 同步帳戶'}
              </button>
            </div>
          </div>

          {/* Sync result */}
          {syncResults.alpaca && (
            <div className="mt-4 rounded-xl bg-[#21262D] border border-[#30363D] p-4">
              <p className="text-xs text-[#8B949E] mb-2">同步結果</p>
              <p className="text-sm text-white">✅ 帳戶 portfolio value: ${syncResults.alpaca.account.portfolioValue.toLocaleString()}</p>
              <p className="text-xs text-[#8B949E] mt-1">持倉 {syncResults.alpaca.positions.length} 筆</p>
              <div className="mt-3 space-y-1">
                {syncResults.alpaca.positions.slice(0, 5).map(p => (
                  <div key={p.symbol} className="flex justify-between text-xs">
                    <span className="text-[#8B949E]">{p.symbol}</span>
                    <span className="text-white">{p.qty} 股 @ ${p.currentPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Wise ────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🌍</span>
            <div>
              <h2 className="text-base font-semibold text-white">Wise 國際帳戶</h2>
              <p className="text-xs text-[#8B949E]">讀取多幣別帳戶餘額</p>
            </div>
            {syncState.wise !== 'idle' && (
              <span className="ml-auto text-sm">{statusIcon(syncState.wise)}</span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#8B949E] mb-1.5">API Token</label>
              <input
                type="password"
                value={wiseToken}
                onChange={e => setWiseToken(e.target.value)}
                placeholder="從 Wise Dashboard 取得"
                className="w-full px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8B949E] mb-1.5">Profile ID（選填）</label>
              <input
                type="text"
                value={wiseProfileId}
                onChange={e => setWiseProfileId(e.target.value)}
                placeholder="留空則自動取第一個 profile"
                className="w-full px-3 py-2.5 rounded-xl bg-[#21262D] border border-[#30363D] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveWise}
                className="px-4 py-2 rounded-xl bg-[#21262D] border border-[#30363D] text-sm text-[#8B949E] hover:text-white hover:border-[#58A6FF] transition-all"
              >
                儲存
              </button>
              <button
                onClick={handleSyncWise}
                disabled={syncState.wise === 'loading'}
                className="px-4 py-2 rounded-xl bg-[#10B981] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {syncState.wise === 'loading' ? '同步中...' : '🔄 同步餘額'}
              </button>
            </div>
          </div>

          {/* Sync result */}
          {syncResults.wise && (
            <div className="mt-4 rounded-xl bg-[#21262D] border border-[#30363D] p-4">
              <p className="text-xs text-[#8B949E] mb-2">同步結果</p>
              <p className="text-sm text-white">✅ 成功讀取 {syncResults.wise.balances.length} 種幣別</p>
              <div className="mt-3 space-y-1">
                {syncResults.wise.balances.map(b => (
                  <div key={b.currency} className="flex justify-between text-xs">
                    <span className="text-[#8B949E]">{b.currency}</span>
                    <span className="text-white">{parseFloat(String(b.amount)).toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Privacy note */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">🔒 隱私與安全說明</h3>
          <ul className="space-y-2 text-xs text-[#8B949E]">
            <li>• 所有 API Key / Secret 僅儲存於您瀏覽器的 localStorage</li>
            <li>• 資料不會上傳至任何外部伺服器（我們也沒有後端）</li>
            <li>• 建議申請「唯讀」權限的 API Key，不要使用有交易權限的金鑰</li>
            <li>• 離開時請關閉瀏覽器標籤，防止他人存取您的 localStorage</li>
            <li>• 若要清除所有金鑰，請手動清除瀏覽器的 localStorage</li>
          </ul>
        </div>
      </main>
    </div>
  );
}