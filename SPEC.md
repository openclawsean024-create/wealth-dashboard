# Wealth Dashboard MVP — 規格書

## 1. 專案概述

**名稱：** Wealth Dashboard（整合資產管理平台）  
**版本：** MVP v1.0 → v2.0 商業化（2026-07-07 啟動）
**目的：** 聚合銀行、股票、加密貨幣資產於單一儀表板，支援多幣種計價。
**目標用戶：** 個人投資者，同時持有股票與加密貨幣資產。

---

## 2. 功能規格（MVP v1.0）

### ✅ 已實作

| # | 功能 | 說明 |
|---|------|------|
| 1 | 總淨資產顯示 | 銀行 + 股票 + 加密貨幣總計（USDC 預設） |
| 2 | 甜甜圈圖 | Recharts 圓餅圖，顯示三類資產配置比例 |
| 3 | 股票報價 | Yahoo Finance API（2330.TW、2317.TW、BTC-USD） |
| 4 | 加密報價 | CoinGecko API（bitcoin、ethereum、solana） |
| 5 | 幣別切換 | USDC / BTC / ETH / CNY 一鍵切換 |
| 6 | 隱私模式 | Ctrl+H 或點擊按鈕隱藏所有金額 |
| 7 | 漲跌顏色 | 漲時綠色（emerald），跌時紅色（rose） |
| 8 | 進度條配置 | 組合概覽區塊，各類資產佔比視覺化 |
| 9 | 帳戶連結面板 | 顯示 Bank/Brokerage/Crypto 連結狀態 |
| 10 | 會員面板 | Gold Member 展示（登入狀態、方案） |

### ❌ 未實作（未來版本）

- P&L 追蹤
- 預算功能
- 價格預測
- 多平台交易所 API
- 鏈上錢包整合
- DeFi 協議整合

---

## 2.5 商業化路線圖（v2.0 — 6 Session 計劃）

> 2026-07-07 老闆選 A1「完整 6 session 商業化」。目標：推到 9/10（真實能收費）。

**商業模式：**
- **Free**：最多 6 筆資產 + 雲端同步 + JSON 匯出
- **Pro NT$149/月**：無限資產 + 即時股價 + 多幣別換算 + PDF/Excel 匯出
- **Business NT$399/月**：多帳號（≤5）+ 白標 + API + 2FA

### Session 1（已完成）✅
- 盤點 + Notion 推進
- Vercel 既部署確認活著

### Session 2（已完成）✅
- Prisma 5.22 schema（User / Asset / Transaction / Subscription / Account / Session）
- Auth.js v5 + bcrypt（Credentials provider）
- `/register`、`/login` 設計師級頁面
- `/api/assets` REST（GET/POST/PATCH/DELETE，userId 過濾）
- Dashboard 加 auth guard + user email + logout button
- `DashboardClient` 改用 server-rendered initialAssets + syncNow fetch API + handleAddAsset POST API
- Landing page 設計師級（Hero / 3 features / Pricing preview）
- 自動 seed 7 個 demo 資產給首次登入用戶
- **自驗證**：register → auto-login → 7 資產顯示（DB 證據）
- **部署**：`wealth-dashboard-iota.vercel.app` live verify
- **Notion**：狀態「🔄 開發中」

### Session 3（進行中）
**完成標準**：
1. ⏳ `/pricing` 頁面（3 方案 + 比較表）
2. ⏳ `/faq` 頁面（accordion 12 條 FAQ 分 3 大類）
3. ⏳ `/contact` 頁面（4 種聯絡管道）
4. ⏳ `/terms`、`/privacy` 頁面（法律文件，設計師級排版）
5. ⏳ Dashboard asset row 加 🗑️ 按鈕 + 確認 modal + DELETE API 整合
6. ⏳ 確認 Tailwind v4 production utility class 編譯（不降版 v3）
7. ⏳ Live E2E 驗證：register → create asset → delete asset
8. ⏳ Vercel redeploy + Notion 推進

### Session 4（待辦）
- Pro plan Stripe checkout placeholder（沿用名片王架構）
- `/checkout` 頁面 + plan limit 提示 UI
- Plan upgrade 流程（free → pro）

### Session 5（待辦）
- 即時股價更新（每 60s polling）
- 多幣別切換功能（TWD / USD / BTC / ETH）
- 損益表 + 交易紀錄 UI

### Session 6（待辦）
- 最終 polish（截圖驗證、SEO meta、Open Graph）
- Notion 推到「✅ 已完成部署」
- Postgres 切換（Vercel 後台設 DATABASE_URL）
- AUTH_SECRET 換 production value

### 技術債（生產前必修）
- ❌ SQLite dev.db 在 Vercel 不持久（cold start 重置）
- ❌ AUTH_SECRET 是 placeholder
- ❌ Stripe 金流是 placeholder
- ❌ 沒 OAuth（Google / GitHub）

---

## 3. 技術棧

- **Framework：** Next.js 16.2.1 (App Router)
- **UI：** React 19 + Tailwind CSS v4
- **圖表：** Recharts 3.8.1
- **股票報價：** Yahoo Finance (yahoo-finance2)
- **加密報價：** CoinGecko REST API
- **部署：** Vercel

---

## 4. 匯率設定（固定匯率，MVP 用）

```typescript
const FX = { USDC: 1, BTC: 67000, ETH: 3500, CNY: 7.25 };
const TWD_PER_USD = 32.5;
```

---

## 5. 驗收標準

| # | 條件 | 狀態 |
|---|------|------|
| 1 | Dashboard 顯示總淨資產（USDC 預設） | ✅ |
| 2 | 甜甜圈圖顯示銀行/股票/加密配置比例 | ✅ |
| 3 | 股票報價從 Yahoo Finance 取得 | ✅ |
| 4 | 加密貨幣報價從 CoinGecko 取得 | ✅ |
| 5 | 可切換 USDC / BTC / ETH / CNY 計價 | ✅ |
| 6 | Ctrl+H 隱藏/顯示所有金額 | ✅ |
| 7 | 漲時綠色，跌時紅色標示 | ✅ |
| 8 | 部署至 Vercel 可正常運作 | ✅ |
