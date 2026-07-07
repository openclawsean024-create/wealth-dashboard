"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      {/* 背景裝飾 — 微漸層 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #10B981 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            W
          </div>
          <span className="text-xl font-semibold text-[var(--color-text)] tracking-tight">
            Wealth <span className="text-[var(--color-accent)]">Dashboard</span>
          </span>
        </Link>

        {/* 卡片 */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">歡迎回來</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              登入查看你的資產總覽
            </p>
          </div>

          <form action={formAction} className="space-y-4">
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
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
                autoComplete="current-password"
                minLength={8}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="至少 8 碼"
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
              className="w-full py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20"
            >
              {pending ? "登入中..." : "登入"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            還沒有帳號？{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-4 hover:underline">
              免費註冊
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          純本地優先 · 資料可同步雲端 · 隨時可匯出
        </p>
      </div>
    </div>
  );
}