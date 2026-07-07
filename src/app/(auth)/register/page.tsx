"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "../actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    registerAction,
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      {/* 背景裝飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #10B981 0%, transparent 70%)" }} />
        <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            W
          </div>
          <span className="text-xl font-semibold text-[var(--color-text)] tracking-tight">
            Wealth <span className="text-[var(--color-accent)]">Dashboard</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="text-xs text-emerald-400 tracking-widest uppercase mb-2">
              免費開始 · 無需信用卡
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              建立你的資產儀表板
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              跨裝置同步 · 永久保存 · 一鍵匯出 JSON
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={60}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                placeholder="王小明"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                placeholder="至少 8 碼，建議大小寫+數字+符號"
              />
            </div>

            {state?.error && (
              <div className="px-3 py-2 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-emerald-500 to-indigo-500 hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20"
            >
              {pending ? "建立帳號中..." : "建立帳號"}
            </button>
          </form>

          <p className="text-xs text-[var(--color-text-muted)] mt-4 leading-relaxed">
            註冊即代表你同意遵守我們的{" "}
            <Link href="/terms" className="underline">使用條款</Link> 與{" "}
            <Link href="/privacy" className="underline">隱私權聲明</Link>。
          </p>

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-6">
            已有帳號？{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-4 hover:underline">
              立即登入
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}