import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "聯絡我們 — Wealth Dashboard",
};

export default function ContactPage() {
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
            <Link href="/faq" className="px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
              FAQ
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
              登入
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 text-xs font-medium tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            GET IN TOUCH
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            我們隨時為你服務
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            產品問題、商業合作、技術整合 — 選擇最適合你的方式聯絡。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <ContactCard
            icon="📧"
            title="Email"
            desc="一般問題、技術支援、商業合作"
            detail="support@wealth-dashboard.com"
            link="mailto:support@wealth-dashboard.com"
          />
          <ContactCard
            icon="💼"
            title="業務諮詢"
            desc="企業方案、API 整合、白標服務"
            detail="sales@wealth-dashboard.com"
            link="mailto:sales@wealth-dashboard.com"
          />
          <ContactCard
            icon="🐛"
            title="問題回報"
            desc="Bug 回報、功能建議"
            detail="GitHub Issues"
            link="https://github.com/openclawsean024-create/wealth-dashboard/issues"
          />
          <ContactCard
            icon="📚"
            title="常見問題"
            desc="先看 FAQ，大部分問題都有解答"
            detail="查看 FAQ"
            link="/faq"
            internal
          />
        </div>

        <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur p-7">
          <h2 className="text-lg font-semibold mb-3">回覆時間</h2>
          <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <p>· 一般客服：<span className="text-[var(--color-text)]">24 小時內</span>（週一至週五 09:00–18:00）</p>
            <p>· Pro 會員優先客服：<span className="text-[var(--color-text)]">24 小時內</span></p>
            <p>· Business 會員專屬客服：<span className="text-[var(--color-text)]">4 小時內</span></p>
          </div>
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

function ContactCard({
  icon, title, desc, detail, link, internal,
}: {
  icon: string; title: string; desc: string; detail: string; link: string; internal?: boolean;
}) {
  const Wrapper = internal ? Link : "a";
  return (
    <Wrapper
      href={link}
      className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur p-6 hover:border-indigo-500/40 hover:bg-[var(--color-surface)]/70 transition group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-3">{desc}</p>
      <div className="text-sm font-medium text-indigo-300 group-hover:text-indigo-200 transition">
        {detail} →
      </div>
    </Wrapper>
  );
}