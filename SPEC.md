# Wealth Dashboard MVP — 規格書

## 1. 專案概述

**名稱：** Wealth Dashboard（整合資產管理平台）  
**版本：** MVP v1.0  
**目的：** 聚合銀行、股票、加密貨幣資產於單一儀表板，支援多幣種計價。  
**目標用戶：** 個人投資者，同時持有股票與加密貨幣資產。

---

## 2. 功能規格（MVP）

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
