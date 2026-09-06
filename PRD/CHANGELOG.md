# wealth-dashboard · CHANGELOG

> 對齊 SPEC v3.0.2（見 [`PRD/SPEC.md`](SPEC.md) — 19 章, 1185 行, 從 v2.2.1 銳化為 v3.0 sweet spot）

---

## v3.0.2 — 2026-09-06 — PRD + GHA workflow + lint clean

> v3.0.2 完成於 2026-09-06 by Sean 10-repo-fleet

### Added
- `PRD/CHANGELOG.md` — 本檔
- `.github/workflows/ci.yml` — GHA 4-job workflow（lint / test / build / deploy-to-Vercel）
- `src/lib/api-keys.ts` 已存在的 helper

### Changed
- `src/app/(auth)/actions.ts` — `catch (e: any)` → `catch (e: unknown)` + type guard（x2 處）
- `src/app/(app)/dashboard/DashboardClient.tsx` — line 817 syncNow `any` → typed `Record<string, unknown>` mapping
- `src/app/settings/page.tsx` —
  - 移除 useEffect，改用 lazy `useState(() => apiKeys.xxx.get()?.field ?? '')` 初始化（修 `react-hooks/set-state-in-effect`）
  - `catch (err: any)` → `catch (err: unknown)` + `getErrorMessage` helper（x3 處）
  - `<a href="/">` → `<Link href="/">`（修 `@next/next/no-html-link-for-pages`）
- `src/app/api/prices/route.ts` — `Record<string, any>` → `Record<string, unknown>`
- `src/app/api/stocks/route.ts` — `Record<string, any>` → `Record<string, unknown>`
- `src/lib/alpaca.ts` — `Promise<any>` → `Promise<Record<string, unknown>>` + typed field access
- `src/lib/wise.ts` — `Promise<any>` → `Promise<unknown>` + typed field access
- `src/lib/prices.ts` — `const json: any` → `const json = (await res.json()) as Record<string, unknown>` + typed `chart / meta / indicators` access（x2 處：fetchYahoo / fetchCoingecko）

### Verified
- `npm run lint` — **0 errors**（從 17 errors / 16 warnings 修到 0 errors；剩 16 warnings 為 unused vars / useCallback deps，皆為 pre-existing 設計）
- `npm test` — 36/36 passed
- `npm run build` — green; 14 routes (5 static + 9 dynamic)

### Known warnings (pre-existing, not fixed in v3.0.2)
- 12× `@typescript-eslint/no-unused-vars`（DashboardClient 多個 unused import / variable）
- 1× `no-html-link-for-pages` 在 `dashboard.tsx` 為 Next.js `<a href="/upgrade">`（已用 `Link` 在 settings）
- 2× `react-hooks/exhaustive-deps`（DashboardClient useCallback 故意忽略 `symbols` 來避免 infinite loop）
- 1× unused `error` in `src/app/api/exchange-rate/route.ts:27`

---

## v3.0 — 2026-07-19 — sweet-spot sharp rewrite

- Commit `3540f5c` — `chore(prd): sweet-spot rewrite v3.0 — wealth-dashboard`
- Commit `3e77f1a` — `chore(prd): v3.0 validator 100%`
- 銳化 sweet spot 從 v2.2.1 升 v3.0：**CSV 試算表 + 跨券商對帳**（不做超級 App）
- 新增 8 家券商 CSV 解析（富邦 / 元大 / 永豐 / 國泰 / 台新 / IBKR / 嘉信 / Firstrade）
- 多幣別成本基礎 + 配息再投入 + 30% 美股預扣稅
- 含管理費 / 手續費 / 預扣稅的真實 IRR/MWR
- SPEC.md 1185 行，§1–§19 全章

---

## v2.2.1 — pre-2026-07

- 整合資產管理 M1 SaaS MVP 雛型
- 9 頁商業 landing + 3-plan subscription (free / pro / business)
- Next.js 16.2 + Prisma 5.22 + Auth.js v5 + Tailwind 4
- Binance / Alpaca / Wise API 串接（settings 頁）
- yahoo-finance2 + CoinGecko 即時報價

---

## v2.0 — Initial scaffold

- Commit `e2ccac6` — `wip(dev): wealth-dashboard v3.0 initial scaffold + 36 tests pass`
- `src/lib/v3/` — csv-parsers / cost-basis / irr / dividend / tax-report 五個純函數模組
- `tests/v3/portfolio.test.ts` — 36 個 Vitest 測試

---

## v0.1 — Initial commit

- Next.js 16.2.10 + Prisma 5.22 + Auth.js v5 + recharts + yahoo-finance2 + zod
- Tailwind 4 + ESLint 9
- 建立 ESLint config + Prisma schema
