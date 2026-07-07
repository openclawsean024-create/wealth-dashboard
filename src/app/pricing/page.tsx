import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "定價方案 — Wealth Dashboard",
  description: "免費版 6 筆資產起步，Pro NT$149/月無限制，Business NT$399/月。",
};

export default function PricingPage() {
  const tiers = [
    {
      id: "free",
      name: "免費版",
      tagline: "個人資產管理入門",
      price: { monthly: 0, yearly: 0 },
      cta: "免費開始",
      ctaLink: "/register",
      featured: false,
      features: [
        "最多 6 筆資產",
        "雲端同步",
        "跨裝置存取（電腦、手機、平板）",
        "一鍵匯出 JSON",
        "隱私模式 (Ctrl+H)",
        "資產配置甜甜圈圖",
        "30 日歷史趨勢",
      ],
      missing: ["即時股價更新", "多幣別即時換算", "交易紀錄 + 損益表", "PDF / Excel 匯出"],
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "活躍投資者首選",
      price: { monthly: 149, yearly: 1490 },
      cta: "升級 Pro",
      ctaLink: "/checkout?plan=pro",
      featured: true,
      features: [
        "無限資產",
        "即時股價更新（Yahoo Finance）",
        "即時加密貨幣報價（CoinGecko）",
        "多幣別即時換算（TWD / USD / BTC / ETH）",
        "完整交易紀錄 + 損益表",
        "匯出 PDF / Excel",
        "雲端同步（裝置無上限）",
        "隱私模式 + 自訂資產類別",
        "優先客服（24h 內回覆）",
      ],
      missing: [],
    },
    {
      id: "business",
      name: "Business",
      tagline: "小型事務所、理財顧問",
      price: { monthly: 399, yearly: 3990 },
      cta: "聯絡業務",
      ctaLink: "/contact?topic=business",
      featured: false,
      features: [
        "包含 Pro 全部功能",
        "多帳號管理（最多 5 個子帳號）",
        "資產組合報告（PDF 白標）",
        "API 存取（讀寫資產資料）",
        "審計日誌 + 雙因素認證",
        "Slack 整合（每日摘要通知）",
        "客製化品牌 logo / 域名",
        "專屬客戶經理",
      ],
      missing: [],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Nav */}
      <nav className="relative border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
              W
            </div>
            <span className="font-semibold tracking-tight">
              Wealth <span className="text-[var(--color-accent)]">Dashboard</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/faq" className="px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
              FAQ
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
              登入
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90 transition shadow-lg shadow-indigo-500/20"
            >
              免費開始
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 text-xs font-medium tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full uppercase">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          簡單透明
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          選擇適合你的方案
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          免費開始，按需升級。無論你是理財新手還是專業投資人，都有對應方案。
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-5">
        {tiers.map((t) => (
          <div
            key={t.id}
            className={
              "relative rounded-2xl p-7 " +
              (t.featured
                ? "border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 shadow-xl shadow-indigo-500/10"
                : "border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur")
            }
          >
            {t.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500 whitespace-nowrap">
                最熱門
              </div>
            )}
            <div className={"text-sm font-medium uppercase tracking-wider mb-3 " + (t.featured ? "text-indigo-300" : "text-[var(--color-text-muted)]")}>
              {t.name}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">NT${t.price.monthly}</span>
              <span className="text-[var(--color-text-muted)]">/月</span>
            </div>
            {t.price.yearly > 0 && (
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                年繳 NT${t.price.yearly}（省 {Math.round((1 - t.price.yearly / (t.price.monthly * 12)) * 100)}%）
              </p>
            )}
            <p className="text-sm text-[var(--color-text-muted)] mb-6">{t.tagline}</p>
            <Link
              href={t.ctaLink}
              className={
                "block w-full text-center px-4 py-2.5 rounded-lg font-medium transition mb-6 " +
                (t.featured
                  ? "text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90 shadow-lg shadow-indigo-500/20"
                  : "border border-[var(--color-border)] hover:border-[var(--color-text-muted)]")
              }
            >
              {t.cta}
            </Link>
            <ul className="space-y-2.5 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
              {t.missing.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[var(--color-text-muted)]">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="line-through">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Comparison table */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">方案比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">功能</th>
                <th className="text-center py-3 px-4 font-medium">免費版</th>
                <th className="text-center py-3 px-4 font-medium text-indigo-300">Pro</th>
                <th className="text-center py-3 px-4 font-medium">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {[
                ["資產數量上限", "6", "無限", "無限"],
                ["雲端同步", "✓", "✓", "✓"],
                ["即時股價", "—", "✓", "✓"],
                ["多幣別換算", "—", "✓", "✓"],
                ["交易紀錄 + 損益表", "—", "✓", "✓"],
                ["PDF / Excel 匯出", "—", "✓", "✓"],
                ["子帳號管理", "—", "—", "最多 5 個"],
                ["API 存取", "—", "—", "✓"],
                ["雙因素認證 (2FA)", "—", "—", "✓"],
                ["白標品牌", "—", "—", "✓"],
                ["客服回覆時間", "社群", "24h 內", "4h 內"],
              ].map(([f, c1, c2, c3]) => (
                <tr key={f as string}>
                  <td className="py-3 px-4 text-[var(--color-text-muted)]">{f}</td>
                  <td className="py-3 px-4 text-center">{c1}</td>
                  <td className="py-3 px-4 text-center text-indigo-300">{c2}</td>
                  <td className="py-3 px-4 text-center">{c3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <p className="text-[var(--color-text-muted)] mb-4">還有疑問？</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/faq" className="px-5 py-2.5 rounded-lg font-medium border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition">
            看常見問題
          </Link>
          <Link href="/contact" className="px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90 transition">
            聯絡我們
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--color-text-muted)]">
          © 2026 Wealth Dashboard · 個人資產管理工具
        </div>
      </footer>
    </div>
  );
}