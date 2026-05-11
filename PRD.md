# Wealth Dashboard — Product Requirements Document

**版本：** v2.0  
**日期：** 2026-05-11  
**負責人：** 產品負責人  
**狀態：** 進行中

---

## 1. 產品願景

> 讓任何人，不管懂不懂電腦，都能在 30 秒內看清楚自己所有的錢放在哪裡。

Wealth Dashboard 是一個**個人資產總覽平台**，整合銀行存款、股票、加密貨幣、不動產、基金等所有資產於單一儀表板。使用者無需手動試算 Excel，也無需在多個 App 之間切換，即可掌握自身財務全貌。

---

## 2. 目標用戶

### 主要用戶：「忙碌的多元資產持有者」
- 年齡：25–55 歲
- 同時持有台股、美股、加密貨幣、銀行存款
- 有 Binance / MAX / 富果帳戶
- **不一定懂電腦**，但會用手機 App

### 用戶痛點
| 痛點 | 現況 | 我們解決方式 |
|------|------|------------|
| 資產分散、難以總覽 | 要打開 5 個 App 才能看完 | 一個頁面看全部 |
| 幣種換算複雜 | 要手動算 USD→TWD | 即時匯率自動換算 |
| 不知道今天賺賠 | 要自己算 | 自動算每日損益 |
| 怕被看到金額 | 被人看到螢幕很尷尬 | 一鍵隱私模式 |
| 設定太複雜 | API 文件看不懂 | 逐步引導設定 |

---

## 3. 核心使用情境

### 情境 A：早晨財務健診（3 分鐘）
使用者早上開啟 Dashboard，一眼看到總資產、今日漲跌、各類別佔比，決定今天要不要調整倉位。

### 情境 B：第一次設定（15 分鐘）
新用戶透過逐步引導 Wizard，連結自己的 Binance、富果、Wise 帳戶，無需看任何技術文件。

### 情境 C：手動補充資產
用戶手動新增銀行存款、不動產、黃金等無法 API 對接的資產，設定成本價，系統自動計算損益。

---

## 4. 功能規格

### 4.1 儀表板（Dashboard）

#### 已實作 ✅
| 功能 | 說明 |
|------|------|
| 總淨資產顯示 | 多幣種換算，支援 TWD / USD / BTC 計價 |
| 資產配置圓餅圖 | 6 類別：現金、股票、基金、加密、不動產、其他 |
| 歷史趨勢折線圖 | 7天 / 30天 / 90天 / 1年切換 |
| 資產明細列表 | 可排序、顯示損益、成本價 |
| 隱私模式 | Ctrl+H 或按鈕隱藏所有金額 |
| 主題切換 | 深色 / 淺色模式 |
| 新增資產 Modal | 手動輸入名稱、金額、類別、機構 |
| JSON 匯入匯出 | 備份與還原資料 |

#### 計劃新增 🔜
| 功能 | 優先級 | 說明 |
|------|--------|------|
| 一鍵全同步按鈕 | P0 | 同時同步所有已連結帳戶 |
| 帳戶連結狀態卡片 | P0 | 清楚顯示哪些帳戶已連結、上次同步時間 |
| 自動定時同步 | P1 | 每 5 分鐘自動更新價格 |
| 今日損益明細 | P1 | 按資產類別顯示每日盈虧 |
| 資產目標配置 | P2 | 設定目標比例，顯示偏離程度 |
| 通知提醒 | P2 | 資產漲跌超過閾值時提醒 |

---

### 4.2 帳戶連結（Integrations）

#### 已實作 ✅

| 平台 | 類型 | 方式 | 功能 |
|------|------|------|------|
| Binance | 加密貨幣交易所 | API Key + Secret | 現貨餘額 |
| Alpaca | 美股券商 | API Key + Secret | 帳戶餘額、持倉 |
| Wise | 國際銀行 | API Token | 多幣別餘額 |

#### 計劃新增 🔜

| 平台 | 類型 | 優先級 | 方式 | 備注 |
|------|------|--------|------|------|
| MAX (MaiCoin) | 台灣加密交易所 | P0 | API Key + Secret | 台灣最大加密貨幣交易所 |
| 富果 (Fugle) | 台股券商 | P1 | API Key | 台股持倉、損益 |
| OKX | 加密貨幣交易所 | P1 | API Key + Secret | 國際知名所 |
| 玉山銀行 | 台灣銀行 | P2 | Open API | 需申請，有額度限制 |
| 王道銀行 | 台灣銀行 | P2 | Open API | 需申請 |
| Firstrade | 美股券商 | P2 | CSV 匯入 | 無公開 API，用 CSV |
| 鏈上錢包 | ETH/BTC | P3 | 公鑰地址 | 無需私鑰，只需地址 |

---

### 4.3 設定頁（Settings）

#### 已實作 ✅
- Binance / Alpaca / Wise API Key 輸入儲存
- 連線測試與同步
- 隱私安全說明

#### 計劃新增 🔜
| 功能 | 優先級 | 說明 |
|------|--------|------|
| 逐步引導（Wizard） | P0 | 針對每個平台，提供截圖說明如何取得 API Key |
| 連結狀態總覽 | P0 | 顯示所有連結平台的狀態 |
| MAX 整合 | P0 | 台灣加密貨幣交易所 |
| 富果整合 | P1 | 台股券商 |
| 清除所有資料按鈕 | P1 | 方便重新設定 |
| 匯率來源設定 | P2 | 選擇匯率 API 來源 |

---

### 4.4 新用戶引導（Onboarding）

首次進入 Dashboard 時觸發：

**步驟 1 — 歡迎**
- 說明這是什麼產品
- 強調「資料只在您的瀏覽器，不會上傳」

**步驟 2 — 快速新增資產**
- 引導用戶手動輸入第一筆資產（例：玉山存款）
- 讓用戶立刻看到資產出現在圖表上

**步驟 3 — 連結帳戶（可略過）**
- 展示可連結的平台
- 每個平台有「怎麼設定」說明連結

**步驟 4 — 完成！**
- 顯示儀表板
- 提示隱私模式快捷鍵

---

## 5. 使用者體驗原則

### 5.1 不懂電腦也能上手
- **Zero Jargon**：不使用 API、Endpoint、Token 等術語（設定頁除外）
- **逐步引導**：每個步驟一件事，不要一次問太多
- **截圖說明**：如何取得 API Key 用圖示說明，不要只貼文字
- **成功反饋**：連結成功後明確告訴用戶「已連結！找到 X 筆資產」

### 5.2 快速
- Dashboard 首次載入 < 2 秒（使用 SSR 預載入）
- 同步時顯示骨架屏，不要空白
- 價格每 60 秒自動更新，無需手動刷新

### 5.3 安全感
- 明確說明「你的資料不離開你的瀏覽器」
- 建議用戶申請「唯讀」API Key
- 不顯示私鑰，輸入後立刻遮罩

---

## 6. 技術架構

### 6.1 前端
- **Framework：** Next.js 16 (App Router)
- **UI：** React 19 + Tailwind CSS v4
- **圖表：** Recharts 3
- **語言：** TypeScript

### 6.2 數據存儲
- **主要資料：** localStorage（無伺服器）
- **API Keys：** localStorage（瀏覽器端加密考慮）
- **匯率快取：** Next.js ISR（5 分鐘）

### 6.3 外部 API 整合架構

```
用戶瀏覽器
  │
  ├─ 手動資產 → localStorage
  │
  ├─ Binance/MAX/OKX → 直接呼叫（HMAC-SHA256 in browser）
  │
  ├─ 台股報價 → /api/stocks (Next.js route) → Yahoo Finance
  │
  ├─ 加密報價 → /api/crypto (Next.js route) → CoinGecko
  │
  └─ 匯率 → /api/exchange-rate (Next.js route) → ExchangeRate API
```

### 6.4 安全模型
- API Keys 儲存於 localStorage（僅限本機）
- HMAC 簽名在瀏覽器端計算（Web Crypto API）
- 無後端服務，無資料庫，無帳號系統
- 不支援跨裝置同步（刻意設計，保護隱私）

---

## 7. 各平台 API 整合規格

### 7.1 MAX Exchange（MaiCoin）
- **Base URL：** `https://max-api.maicoin.com`
- **Auth：** HMAC-SHA256
  - Payload：`Base64(JSON.stringify({path, nonce, ...params}))`
  - Signature：`HMAC-SHA256(secret, payload)` hex
  - Headers：`X-MAX-ACCESSKEY`, `X-MAX-PAYLOAD`, `X-MAX-SIGNATURE`
- **Endpoint：** `GET /api/v2/members/accounts`
- **返回：** 各幣別餘額（balance, locked）
- **設定頁說明：** 前往 MAX → 安全性 → API → 建立 API Key（選「讀取帳戶資訊」）

### 7.2 富果 Fugle Trade
- **Base URL：** `https://api.fugle.tw/trade/v1.0`
- **Auth：** API Key in header
- **Endpoint：** `GET /trade/balance`, `GET /trade/inventories`
- **設定頁說明：** 前往富果帳戶 → 設定 → API 金鑰管理

### 7.3 Binance（已實作）
- **詳見 `/src/lib/binance.ts`**

### 7.4 Alpaca（已實作）
- **詳見 `/src/lib/alpaca.ts`**

### 7.5 Wise（已實作）
- **詳見 `/src/lib/wise.ts`**

---

## 8. 數據模型

### 8.1 資產（Asset）
```typescript
interface Asset {
  id: string;
  name: string;              // 顯示名稱，如「玉山存款」
  value: number;             // 當前價值（以 currency 計）
  costBasis?: number;        // 成本價（計算損益用）
  category: AssetCategory;  // 'cash'|'stock'|'fund'|'crypto'|'real-estate'|'other'
  currency: string;          // 'TWD'|'USD'|'BTC'|'ETH'...
  institution?: string;      // 機構名稱，如「玉山銀行」
  updatedAt: string;         // ISO 8601
  source?: 'manual' | 'binance' | 'max' | 'alpaca' | 'fugle' | 'wise';
}
```

### 8.2 連結帳戶（ConnectedAccount）
```typescript
interface ConnectedAccount {
  platform: 'binance' | 'max' | 'alpaca' | 'fugle' | 'wise';
  status: 'connected' | 'error' | 'never';
  lastSyncAt?: string;
  assetsCount?: number;
  totalValueUSD?: number;
}
```

---

## 9. 成功指標（KPIs）

| 指標 | 目標 | 時間框架 |
|------|------|---------|
| 首次設定完成率 | > 70% 的新用戶完成至少一個帳戶連結 | v2.0 |
| 日活躍度 | 用戶每天至少開啟一次 | v2.0 |
| 設定時間 | < 5 分鐘完成第一個帳戶連結 | v2.0 |
| 同步成功率 | > 95% 的同步請求成功 | v2.0 |

---

## 10. 版本路線圖

### v1.0（已完成）✅
- 基礎 Dashboard + 甜甜圈圖 + 折線圖
- Binance / Alpaca / Wise 整合
- Yahoo Finance + CoinGecko 報價
- 隱私模式 + 主題切換
- JSON 匯入匯出

### v2.0（當前衝刺）🚀
- MAX Exchange 整合
- 富果券商整合
- 新用戶引導 Wizard
- 設定頁逐步說明（如何取得 API Key）
- 一鍵全同步 + 自動定時同步
- 帳戶連結狀態總覽

### v2.1（下一衝刺）
- OKX 交易所整合
- 鏈上錢包（ETH / BTC 公鑰查詢）
- 今日損益明細
- 資產目標配置功能

### v3.0（長期規劃）
- 玉山 / 王道 Open Banking
- CSV 匯入（Firstrade / 台新）
- 多設備同步（需引入後端）
- 行動裝置最佳化 PWA

---

## 11. 風險與限制

| 風險 | 影響 | 緩解方式 |
|------|------|---------|
| 台灣銀行無公開 API | 無法自動同步銀行餘額 | 改用手動輸入 + CSV 匯入 |
| API Key 被竊 | 帳戶資產被讀取 | 教育用戶申請唯讀 Key |
| 瀏覽器清除 localStorage | 資料遺失 | 提供 JSON 備份功能 |
| CoinGecko / Yahoo 免費限額 | 報價失敗 | 增加快取、提供 fallback |
| CORS 限制 | 無法直接呼叫部分 API | 使用 Next.js API Route 代理 |

---

## 附錄：設計稿說明

### 配色系統
```
主色：Indigo #6366F1（帳戶連結、主要按鈕）
成功：Emerald #10B981（漲幅、已連結）
警告：Amber #F59E0B（加密、注意）
危險：Rose #EF4444（跌幅、錯誤）
背景：#0F172A（深色模式）
卡片：#1E293B
```

### 組件庫
- `.card` — 內容卡片
- `.btn--primary` — 主要行動按鈕
- `.btn--ghost` — 次要按鈕
- `.form-input` — 輸入框
- `AssetPieChart` — 資產配置圖
- `BankCard` / `StockCard` / `CryptoCard` — 資產類別卡片
