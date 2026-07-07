import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Wealth Dashboard — 你的個人資產中心",
};

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* 背景裝飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #10B981 0%, transparent 70%)" }} />
      </div>

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
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            >
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

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 text-xs font-medium tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full uppercase">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          v1.0 · 雲端同步已上線
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          看見你的 <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">每一分資產</span>
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          整合銀行、股票、加密貨幣、房地產於單一儀表板。
          <br />
          跨裝置即時同步，隨時掌握你的淨值。
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90 transition shadow-xl shadow-indigo-500/30"
          >
            免費開始 →
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl font-medium border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition"
          >
            已有帳號登入
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon="📊"
          title="資產配置一目了然"
          desc="6 大類資產自動分類，甜甜圈圖即時顯示你的投資組合比例與分布。"
        />
        <FeatureCard
          icon="☁️"
          title="雲端跨裝置同步"
          desc="資料存雲端，電腦、手機、平板隨時登入都看到最新狀態。支援一鍵匯出 JSON。"
        />
        <FeatureCard
          icon="🔒"
          title="隱私與安全優先"
          desc="Ctrl+H 一鍵隱藏金額。資料加密儲存，僅本人帳號可存取。"
        />
      </section>

      {/* Pricing preview */}
      <section className="relative max-w-4xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <div className="text-xs tracking-widest uppercase text-indigo-400 mb-2">PRICING</div>
          <h2 className="text-3xl font-bold">免費開始，按需升級</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur p-7">
            <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">免費版</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">NT$0</span>
              <span className="text-[var(--color-text-muted)]">/月</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">永久免費，無需信用卡</p>
            <ul className="space-y-2 text-sm">
              {["最多 6 筆資產", "雲端同步", "跨裝置存取", "一鍵匯出 JSON", "隱私模式 (Ctrl+H)"].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-2xl border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 p-7 shadow-xl shadow-indigo-500/10">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500">
              即將推出
            </div>
            <div className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-3">Pro</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">NT$149</span>
              <span className="text-[var(--color-text-muted)]">/月</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">解鎖全部功能</p>
            <ul className="space-y-2 text-sm">
              {["無限資產", "即時股價更新", "多幣別即時換算", "交易紀錄 + 損益表", "匯出 PDF / Excel", "優先客服"].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-[var(--color-border)] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--color-text-muted)]">
          © 2026 Wealth Dashboard · 個人資產管理工具
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur p-7 hover:border-indigo-500/40 transition">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
    </div>
  );
}