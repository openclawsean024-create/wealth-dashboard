import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "使用條款 — Wealth Dashboard",
};

export default function TermsPage() {
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

      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-invert prose-headings:tracking-tight">
        <div className="text-xs tracking-widest uppercase text-emerald-400 mb-3">LEGAL</div>
        <h1 className="text-4xl font-bold mb-3">使用條款</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">最後更新：2026-07-07</p>

        <Section title="1. 接受條款">
          當你註冊 Wealth Dashboard 帳號或使用本服務時，即表示你同意遵守這些使用條款。如不同意，請勿使用本服務。
        </Section>

        <Section title="2. 服務內容">
          Wealth Dashboard 是一個個人資產管理工具，提供資產紀錄、雲端同步、即時報價查詢等服務。我們保留隨時修改或停止部分功能的權利。
        </Section>

        <Section title="3. 帳號責任">
          你必須為自己帳號下的所有活動負責。請妥善保管你的密碼，不要與他人共用。如發現未授權使用，請立即通知我們。
        </Section>

        <Section title="4. 訂閱與付款">
          Pro / Business 方案按月或按年計費，可以隨時取消。取消後仍可使用至當期結束日。14 天內可申請全額退款。
        </Section>

        <Section title="5. 禁止行為">
          你同意不會：(a) 上傳虛假或誤導性的資產資料；(b) 嘗試未授權存取其他用戶的資料；(c) 從事任何違法活動；(d) 反向工程或嘗試提取我們的原始碼。
        </Section>

        <Section title="6. 資料所有權">
          你擁有你所上傳的所有資產資料。我們只是代為儲存。我們不會存取、出售或分享你的個人資產明細。
        </Section>

        <Section title="7. 免責聲明">
          本服務僅供個人資產紀錄用途。我們提供的報價資訊不構成投資建議，投資風險由你自行承擔。
        </Section>

        <Section title="8. 條款修改">
          我們可能會更新這些條款。重大變更會透過 email 通知。繼續使用本服務即代表你接受修改後的條款。
        </Section>

        <Section title="9. 聯絡我們">
          如對這些條款有任何疑問，請來信 <a href="mailto:legal@wealth-dashboard.com" className="text-indigo-400 underline">legal@wealth-dashboard.com</a>。
        </Section>
      </article>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--color-text-muted)]">
          © 2026 Wealth Dashboard · <Link href="/privacy" className="underline">隱私權聲明</Link>
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