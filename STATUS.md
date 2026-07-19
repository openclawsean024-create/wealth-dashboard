# wealth-dashboard v3.0 — STATUS

**Date**: 2026-07-19
**Sub-agent**: Sophia (CPO)
**Branch**: main
**Status**: ✅ VERIFIED — Vercel production deployed

## What was built

Pure-function v3.0 financial core under `src/lib/v3/` + replace `src/app/page.tsx` with a v3.0 dashboard demo:

- **`csv-parsers.ts`** — 8 broker parsers (Fubon / Yuanta / SinoPac / Cathay / Taishin / IBKR / Schwab / Firstrade) + dispatcher
- **`cost-basis.ts`** — multi-currency weighted-average cost in original currency + NTD with buy-date FX fallback
- **`irr.ts`** — Newton-Raphson + bisection XIRR with sign convention for fees/tax/dividends
- **`dividend.ts`** — 30% US withholding (Form 1042-S) + ex-div reinvest at close price
- **`tax-report.ts`** — CSV tax report + rebalance suggestions

## Test results

```
Test Files  1 passed (1)
     Tests  36 passed (36)
  Duration  ~300ms
```

**Pass rate: 36/36 = 100%** (target ≥ 80%).

Coverage:
- 8 broker CSV parsers (15 tests)
- Multi-currency cost basis (6 tests)
- IRR / MWR with fees+tax (5 tests)
- Dividend reinvest + 30% US withholding (5 tests)
- Tax report + rebalance (5 tests)

## Build

`npx next build` exits 0 with all 20 routes generated.

## Pitfalls hit + resolved

1. **`findHeader` was case-sensitive** — `Date` not matching `date`. Fixed by lowercasing + per-needle includes.
2. **IBKR Buy/Sell column index** — was reading from index 6, should be 5 (commission is 4).
3. **TS literal widening in flatMap** — `flatMap` returned union of literal-typed arrays, refused by strict TS. Switched to imperative `for...of` with explicit `Cashflow[]` annotation.
4. **Existing v1.x scaffold crypto/stocks paths** — kept under `src/lib/` and `src/app/api/` (not removed) to avoid breaking build; v3.0 modules co-exist under `src/lib/v3/`. Demo page (`src/app/page.tsx`) replaced with v3.0 portfolio view.

## Next steps (future sprints)

- Wire Clerk auth + Vercel Postgres (current `prisma/schema.prisma` from v1.x left untouched)
- Add OCR for Fubon PDF (F-105, P1)
- Plug exchangerate.host free FX API to replace hardcoded demo rates (F-101, P1)