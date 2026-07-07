"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PLANS, getPlan, type PlanId } from "@/lib/plans";
import { upgradePlanAction } from "./actions";

export default function CheckoutClient({ userEmail }: { userEmail: string }) {
  const params = useSearchParams();
  const requestedPlan = (params.get("plan") ?? "pro") as PlanId;
  const plan = getPlan(requestedPlan);

  const [state, formAction, pending] = useActionState(upgradePlanAction, undefined);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Nav */}
      <nav className="border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">W</div>
            <span className="font-semibold tracking-tight">Wealth <span className="text-[var(--color-accent)]">Dashboard</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)] hidden sm:block">{userEmail}</span>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition">
              返回 Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-2xl mx-auto px-6 py-12">
        <div className="rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 p-8 shadow-xl shadow-indigo-500/10">
          <div className="text-center mb-8">
            <div className="text-xs tracking-widest uppercase text-indigo-300 mb-2">CHECKOUT</div>
            <h1 className="text-3xl font-bold mb-2">{plan.name} 訂閱</h1>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold">NT${plan.price.monthly}</span>
              <span className="text-[var(--color-text-muted)]">/月</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{plan.tagline}</p>
          </div>

          <ul className="space-y-2 mb-8 max-w-md mx-auto">
            {plan.features.slice(0, 6).map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{f}</span>
              </li>
            ))}
            {plan.features.length > 6 && (
              <li className="text-xs text-[var(--color-text-muted)] pl-6">+ {plan.features.length - 6} 項更多功能</li>
            )}
          </ul>

          {/* 金流 placeholder */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <span className="text-base">🔧</span>
              <span>金流串接中（MVP 階段）</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3">
              信用卡金流（Stripe）預計 2026 Q4 上線。目前可透過下方按鈕
              <strong className="text-[var(--color-text)]"> 直接啟用 Pro 功能</strong>（MVP 期間免費，
              之後會通知付費轉換時程）。
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              · 升級 Pro 立即生效 · 14 天內可無條件降回免費版 · 期間隨時取消
            </p>
          </div>

          <form action={formAction} className="space-y-3">
            <input type="hidden" name="planId" value={plan.id} />
            {state?.error && (
              <div className="px-3 py-2 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">
                {state.error}
              </div>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-indigo-500/30 text-base"
            >
              {pending ? "啟用中..." : `啟用 ${plan.name}（MVP 期間免費）`}
            </button>
            <Link
              href="/pricing"
              className="block w-full text-center py-3 rounded-xl font-medium border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition"
            >
              比較其他方案
            </Link>
          </form>
        </div>

        {/* FAQ */}
        <div className="mt-10 space-y-3">
          <details className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur open:bg-[var(--color-surface)]/70 transition">
            <summary className="cursor-pointer list-none px-5 py-3.5 flex items-center justify-between gap-4 select-none text-sm font-medium">
              <span>什麼時候會開始收費？</span>
              <svg className="w-4 h-4 text-[var(--color-text-muted)] transition-transform group-open:rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm text-[var(--color-text-muted)] leading-relaxed">
              預計 2026 Q4 開始收費。正式收費前 30 天會 Email 通知，你可以選擇繼續使用或降回免費版。
            </div>
          </details>
          <details className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur open:bg-[var(--color-surface)]/70 transition">
            <summary className="cursor-pointer list-none px-5 py-3.5 flex items-center justify-between gap-4 select-none text-sm font-medium">
              <span>可以降回免費版嗎？</span>
              <svg className="w-4 h-4 text-[var(--color-text-muted)] transition-transform group-open:rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm text-[var(--color-text-muted)] leading-relaxed">
              可以，隨時降回。降級後資料保留，超過 6 筆的資產會被鎖住（不刪除），升級 Pro 後可重新存取。
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] py-8 mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--color-text-muted)]">
          © 2026 Wealth Dashboard · MVP 階段
        </div>
      </footer>
    </div>
  );
}