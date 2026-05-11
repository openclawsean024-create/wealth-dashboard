'use client';

import { useState } from 'react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onAddAsset: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: '歡迎使用 Wealth Dashboard 👋',
    emoji: '🏦',
  },
  {
    id: 'privacy',
    title: '您的資料只在您的裝置',
    emoji: '🔒',
  },
  {
    id: 'add-asset',
    title: '先新增一筆資產試試看',
    emoji: '✏️',
  },
  {
    id: 'connect',
    title: '連結您的帳戶（可略過）',
    emoji: '🔗',
  },
  {
    id: 'done',
    title: '您已準備好了！',
    emoji: '🎉',
  },
] as const;

const PLATFORMS = [
  {
    name: 'MAX 加密交易所',
    desc: '台灣最大的加密貨幣交易所',
    emoji: '🟢',
    settingsId: 'max',
  },
  {
    name: 'Binance 加密交易所',
    desc: '全球最大交易所',
    emoji: '🟡',
    settingsId: 'binance',
  },
  {
    name: '富果 (Fugle) 台股',
    desc: '台灣股票帳戶',
    emoji: '📈',
    settingsId: 'fugle',
  },
  {
    name: 'Alpaca 美股',
    desc: '美國股票帳戶',
    emoji: '🇺🇸',
    settingsId: 'alpaca',
  },
  {
    name: 'Wise 國際匯款',
    desc: '多幣別外匯帳戶',
    emoji: '🌍',
    settingsId: 'wise',
  },
];

export function OnboardingWizard({ onComplete, onAddAsset }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onComplete();
  };

  const goBack = () => setStep(s => Math.max(0, s - 1));

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-[var(--border)] rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step counter */}
          <p className="text-xs text-[var(--text-muted)] mb-4">
            步驟 {step + 1} / {STEPS.length}
          </p>

          {/* Emoji + Title */}
          <div className="text-5xl mb-4">{current.emoji}</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            {current.title}
          </h2>

          {/* Step content */}
          {step === 0 && (
            <div className="space-y-4 text-[var(--text-secondary)]">
              <p className="text-base leading-relaxed">
                Wealth Dashboard 幫您把所有的錢集中在一個地方看：
              </p>
              <ul className="space-y-3">
                {[
                  { icon: '🏦', text: '銀行存款（玉山、王道、台新…）' },
                  { icon: '📈', text: '股票持倉（台股、美股）' },
                  { icon: '₿', text: '加密貨幣（Binance、MAX…）' },
                  { icon: '🏠', text: '不動產、黃金、其他資產' },
                ].map(item => (
                  <li key={item.text} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400">
                <p className="font-semibold mb-1">🔒 您的隱私我們非常重視</p>
                <p className="text-sm">
                  您輸入的所有資料和 API Key，都只儲存在您自己瀏覽器裡面。<br />
                  <strong>不會上傳到任何伺服器。</strong>
                </p>
              </div>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex gap-2">✅ 資料存在您的瀏覽器（localStorage）</li>
                <li className="flex gap-2">✅ 我們沒有後端資料庫</li>
                <li className="flex gap-2">✅ 建議申請「只能讀」的 API Key，不要用有交易權限的</li>
                <li className="flex gap-2">✅ 隨時可以用 Ctrl+H 隱藏所有金額</li>
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[var(--text-secondary)]">
                不管有沒有 API，都可以手動輸入任何資產（例如：銀行存款、不動產）。
              </p>
              <button
                onClick={() => { onAddAsset(); }}
                className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                ✏️ 新增第一筆資產
              </button>
              <p className="text-xs text-center text-[var(--text-muted)]">
                也可以按「下一步」先跳過，之後再新增
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                選擇您有的帳戶，點擊後會帶您到設定頁：
              </p>
              {PLATFORMS.map(p => (
                <a
                  key={p.settingsId}
                  href={`/settings#${p.settingsId}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group"
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                      {p.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{p.desc}</p>
                  </div>
                  <span className="text-[var(--text-muted)] group-hover:text-[var(--primary)]">→</span>
                </a>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-[var(--text-secondary)]">
                您已完成基本設定！以下是幾個實用小技巧：
              </p>
              <ul className="space-y-3">
                {[
                  { key: 'Ctrl+H', desc: '隱藏 / 顯示所有金額（有人在旁邊時很好用）' },
                  { key: '🔄 同步', desc: '點擊同步按鈕更新所有帳戶最新資料' },
                  { key: '匯出', desc: '定期備份您的資產資料，以防瀏覽器清空' },
                ].map(tip => (
                  <li key={tip.key} className="flex gap-3 items-start">
                    <code className="text-xs bg-[var(--surface-2)] border border-[var(--border)] px-2 py-1 rounded font-mono text-[var(--primary)] whitespace-nowrap">
                      {tip.key}
                    </code>
                    <span className="text-sm text-[var(--text-secondary)]">{tip.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={goBack}
                className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
              >
                ← 上一步
              </button>
            )}
            <button
              onClick={goNext}
              className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              {step === STEPS.length - 1 ? '開始使用 →' : step === 3 ? '略過，先看儀表板 →' : '下一步 →'}
            </button>
          </div>

          {/* Skip all */}
          {step < STEPS.length - 1 && (
            <button
              onClick={onComplete}
              className="w-full mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              略過所有步驟
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
