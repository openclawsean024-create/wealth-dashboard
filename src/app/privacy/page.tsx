import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私權聲明 — Wealth Dashboard",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <nav className="border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">W</div>
            <span className="font-semibold tracking-tight">Wealth <span className="text-[var(--color-accent)]">Dashboard</span></span>
          </Link>
          <Link href="/login" className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">登入</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-xs tracking-widest uppercase text-emerald-400 mb-3">PRIVACY</div>
        <h1 className="text-4xl font-bold mb-3">隱私權聲明</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">最後更新：2026-07-07</p>

        <Section title="我們收集什麼">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>註冊資料：姓名、Email、密碼（bcrypt 雜湊儲存）</li>
            <li>資產資料：你主動輸入的資產明細、交易紀錄</li>
            <li>使用資料：登入時間、使用的功能（用於改善服務）</li>
            <li>裝置資料：瀏覽器類型、作業系統（用於優化介面）</li>
          </ul>
        </Section>

        <Section title="我們怎麼用你的資料">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>提供與改善核心功能（資產紀錄、雲端同步、報價查詢）</li>
            <li>客服支援（僅在你主動聯絡時）</li>
            <li>發送重要通知（帳號變更、安全警報、條款更新）</li>
            <li><strong>絕對不會</strong>用於行銷或出售給第三方</li>
          </ul>
        </Section>

        <Section title="資料儲存與安全">
          所有資料儲存在加密的雲端資料庫（PostgreSQL with SSL/TLS）。密碼使用 bcrypt 雜湊（無法反解）。我們使用業界標準的安全措施保護你的資料。
        </Section>

        <Section title="你的權利">
          你隨時可以：
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>查看你的所有資料（dashboard 內）</li>
            <li>匯出你的資料（JSON 格式）</li>
            <li>修改你的個人資料</li>
            <li>刪除你的帳號（刪除後 30 天內可恢復，30 天後永久刪除）</li>
          </ul>
        </Section>

        <Section title="Cookie 使用">
          我們使用必要的 session cookie 來維持你的登入狀態。不使用任何追蹤 cookie 或第三方分析工具。
        </Section>

        <Section title="第三方服務">
          我們使用以下第三方服務來提供核心功能：
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Yahoo Finance（股票報價）— 公開 API</li>
            <li>CoinGecko（加密貨幣報價）— 公開 API</li>
            <li>Vercel（雲端託管）— 受信任的基礎設施</li>
            <li>Neon / Supabase（資料庫，未來生產環境）</li>
          </ul>
          這些服務不會收到你的個人身分資料。
        </Section>

        <Section title="聯絡我們">
          如對隱私有任何疑問或行使你的權利，請來信 <a href="mailto:privacy@wealth-dashboard.com" className="text-indigo-400 underline">privacy@wealth-dashboard.com</a>。
        </Section>
      </article>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--color-text-muted)]">
          © 2026 Wealth Dashboard · <Link href="/terms" className="underline">使用條款</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)]">{title}</h2>
      <div className="text-sm leading-relaxed text-[var(--color-text-muted)]">{children}</div>
    </section>
  );
}