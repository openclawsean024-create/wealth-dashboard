import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "常見問題 — Wealth Dashboard",
};

const faqs = [
  {
    cat: "帳號與訂閱",
    items: [
      {
        q: "我可以隨時取消訂閱嗎？",
        a: "可以。在 dashboard 內的「設定」頁面點擊「取消訂閱」即可。取消後仍可使用至當期結束日，之後自動降回免費版。",
      },
      {
        q: "可以退款嗎？",
        a: "14 天內全額退款，不問理由。請來信 support@wealth-dashboard.com 申請。",
      },
      {
        q: "免費版和 Pro 版的差異？",
        a: "免費版最多 6 筆資產、無即時股價、無多幣別換算。Pro NT$149/月解鎖全部功能（無限資產、即時股價、多幣別、損益表）。",
      },
      {
        q: "可以多人共用一個帳號嗎？",
        a: "不建議。帳號資料是個人化的，多人共用會導致資產混雜。Business 方案最多支援 5 個子帳號（NT$399/月）。",
      },
    ],
  },
  {
    cat: "資料與隱私",
    items: [
      {
        q: "我的資產資料安全嗎？",
        a: "全部資料儲存在加密的雲端資料庫（PostgreSQL with SSL），密碼使用 bcrypt 雜湊。我們不會存取你的資產明細，也不會分享給第三方。",
      },
      {
        q: "可以匯出我的資料嗎？",
        a: "可以。dashboard 右上角有「匯出 JSON」按鈕，一鍵下載完整資產清單與交易紀錄。",
      },
      {
        q: "刪除帳號後資料會怎樣？",
        a: "帳號刪除後 30 天內可恢復，30 天後資料永久刪除（符合 GDPR 規範）。",
      },
      {
        q: "你們會看我的資產嗎？",
        a: "不會。我們的工程師沒有日常存取用戶資料的權限，僅在客服請求且經你授權後才會查閱特定資料。",
      },
    ],
  },
  {
    cat: "技術問題",
    items: [
      {
        q: "支援哪些瀏覽器？",
        a: "Chrome 90+、Firefox 88+、Safari 14+、Edge 90+。建議使用 Chrome 或 Safari 獲得最佳體驗。",
      },
      {
        q: "有手機 App 嗎？",
        a: "目前是 Progressive Web App（PWA），手機瀏覽器加入主畫面後體驗接近原生 App。iOS / Android 原生 App 規劃中。",
      },
      {
        q: "資料更新頻率？",
        a: "免費版：每日快照。Pro 版：即時（每 60 秒自動更新股價 / 加密貨幣）。",
      },
      {
        q: "可以匯入其他平台的資料嗎？",
        a: "目前支援 JSON 格式匯入。常見券商格式（如永豐、台新、富邦）的自動匯入整合規劃中。",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <nav className="border-b border-[var(--color-border)]">
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
            <Link href="/pricing" className="px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
              定價
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
              登入
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 text-xs font-medium tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 rounded-full uppercase">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
          FAQ
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          常見問題
        </h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          找不到答案？<Link href="/contact" className="text-indigo-400 underline-offset-4 hover:underline">聯絡我們</Link>。
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20 space-y-12">
        {faqs.map((sec) => (
          <div key={sec.cat}>
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-4">{sec.cat}</h2>
            <div className="space-y-3">
              {sec.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur open:bg-[var(--color-surface)]/70 transition"
                >
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 select-none">
                    <span className="font-medium">{item.q}</span>
                    <svg
                      className="w-4 h-4 text-[var(--color-text-muted)] transition-transform group-open:rotate-180 flex-shrink-0"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--color-text-muted)]">
          © 2026 Wealth Dashboard · 個人資產管理工具
        </div>
      </footer>
    </div>
  );
}