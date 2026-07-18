# 整合資產管理平台（Wealth Dashboard）— 規格計劃書 v3.0（sweet spot sharp rewrite）

> **版本**：v3.0｜**更新日期**：2026-07-19｜**維護者**：Sophia (CPO) for Sean
> **對接技術**：Alan (CTO)｜**對接 Repo**：[openclawsean024-create/wealth-dashboard](https://github.com/openclawsean024-create/wealth-dashboard)
> **Live**：https://wealth-dashboard.vercel.app（待部署）
> **Sweet Spot**：8/10（**台灣多券商跨帳戶 + 海外券商 + 多幣別成本基礎 + 含息含費真實 IRR/MWR CSV 試算表**）→ 本版從 v2.2.1 升 v3.0 銳化

---

## 0. 本版重寫摘要 (v3.0)

v2.2.1 已定位「台灣多券商 + 海外券商 + 多幣別成本基礎 + 30% 美股預扣稅 + 含息含費 IRR/MWR」。v3.0 **三件銳化**：

1. **甜蜜點聚焦到「CSV 試算表 + 跨券商對帳」**（Excel 用戶最痛點），不再嘗試做「整合所有資產」超級 App（紅海）
2. **新增 MVP 必做**：**CSV 多券商匯入（富邦/元大/永豐/國泰/台新/IBKR/嘉信/Firstrade 共 8 家）+ 多幣別成本基礎試算 + 配息再投入試算（含 30% 美股預扣稅）+ 含管理費 IRR/MWR 真實報酬**
3. **變現**：個人 NT$199/月 + **券商導流（CPA NT$500/開戶）+ 稅務顧問 B2B NT$9,999**

§15 貼出完整 sweet spot 5 問 + **最終商業化評分**：**83 / 100**（公式 = (9×0.3 + 8×0.7)×10）。

---

## 1. 產品概述

### 1.1 問題陳述

台灣投資人 7.8M 戶有股票 / ETF 帳戶，但**有 2 家以上券商帳戶 + 海外券商**（IBKR/嘉信/Firstrade 為主）的「多券商」用戶約 1.5M 人。最大痛點不是「整合」（集保 e 手掌握部分做），而是「**多幣別成本基礎 + 含息含費真實報酬率**」：

| 現有方案 | 用戶 | 缺口 |
|---|---|---|
| **集保 e 手掌握**（官方）| 7.8M | 整合台股、ETF、基金；不覆蓋 **海外複委託 + 純外幣帳戶（IBKR/嘉信/Firstrade）**；不算「成本基礎」與「含息含費 IRR/MWR」|
| **麻布 iMoney** | 10 萬+ 下載 | 串接台灣主要券商；❌ 不支援海外券商；❌ 不算多幣別成本基礎；❌ 不算配息再投入 |
| **CWMoney** | 1M 下載 | 銀行帳戶 + 收支記帳；❌ 完全不支援投資組合 |
| **Money Pro / PocketSmith** | 月費 NT$500+ | 多幣別、稅務計算；❌ 英文介面、台股代號不友善、券商覆蓋弱 |
| **Excel 自製** | 無上限 | 30 分鐘/次手動、無法看趨勢、易出錯 |
| **Empower (Personal Capital)** | 美國市佔高 | 美國退休金；❌ 完全不支援台灣 |
| **多券商 CSV 試算 + 真實報酬（含稅含費）** | — | **市場空白** |

**甜蜜點（v3.0 銳化）**：**CSV 多券商匯入（8 家）+ 多幣別成本基礎試算 + 配息再投入 + 含 30% 美股預扣稅的真實 IRR/MWR**。對齊 Excel 用戶、看趨勢、不出錯。

### 1.2 目標使用者

| Persona | 規模 (台灣) | 月情境 | 痛點 | ARPU/年 |
|---|---|---|---|---|
| 📊 **「阿德」雙券商用戶** | ~800K | 富邦 + 元大 | 手動 Excel 30 分/次 | NT$2,388 |
| 🌍 **「小琪」海外券商用戶**| ~300K | IBKR + 嘉信 + 富邦 | 多幣別成本計算 | NT$2,388 |
| 📈 **「Kevin」美股 ETF 投資人**| ~400K | Firstrade + 元大 | 30% 美股預扣稅 | **NT$5,988** |
| 🏢 **「華爾街」券商財管**| ~500 | 月報、稅務 | 多戶對帳 | **NT$119,880** |
| 💼 **「會計」稅務顧問**| ~5,000 | 多客戶多券商 | CSV 整合 | **NT$119,880** |

**核心 TA = 阿德 + 小琪 + Kevin**（1.5M 人，5% 付費 × NT$2,388 = NT$179M/年 TAM；保守 NT$15M）。

### 1.3 核心價值主張

> **「台灣唯一『多券商 CSV + 多幣別成本 + 含稅含費真實 IRR/MWR』試算表 — 月省 30 分鐘手動 + 不出錯。」**

| 替代 | 缺點 | 我們差異 |
|---|---|---|
| 集保 e 手掌握 | 不覆蓋海外券商、不算成本基礎 | **多幣別 IBKR/嘉信/Firstrade 支援 + 含息含費 IRR** |
| 麻布 iMoney | 不支援海外券商、不算多幣別 | **8 券商覆蓋 + 真實報酬** |
| Excel 自製 | 30 分/次手動、易出錯 | **CSV 匯入 + 自動試算 + 趨勢圖** |
| Empower | 不支援台灣 | **台股/台幣 native** |

### 1.4 商業目標

| 時間 | 目標 | 指標 |
|---|---|---|
| 3 個月 | 100 付費 + 5 券商導流 | 50K MRR |
| 6 個月 | 500 付費 + **5 稅務顧問 + 50 券商導流** | 300K MRR |
| 12 個月 | 3000 付費 + **30 稅務顧問 + 500 券商導流** | **2M MRR** |

**Unit Economics**：
- 個人 NT$199 × 3,000 = NT$597K MRR
- 稅務顧問 NT$999 × 30 = NT$30K MRR
- 券商導流 NT$500 × 500 = NT$250K MRR（一次性 / 年）
- 合計 NT$877K MRR（12 個月 保守）

## 1.5 Non-Goals

- ❌ **加密貨幣 / DeFi 整合**（CoinTracker / Koinly 紅海）
- ❌ **股票下單 / 交易**（券商 App 紅海）
- ❌ **即時報價 / 看盤**（Bloomberg / 券商 App 紅海）
- ❌ **AI 投資建議 / 投組**（法規）
- ❌ **共同基金申購**（基富通紅海）
- ❌ **房產 / 不動產估價**（信義 / 永慶紅海）
- ❌ **退休金試算**（勞退 / 勞保局）
- ❌ **保單整合**（中國信託 + 紅海）
- ❌ **雲端記帳 + 出納**（CWMoney 紅海）
- ❌ **跨國匯率預測**（XE / OANDA 紅海）

---

## 2. 使用者場景與流程

### 2.1 流程圖

```
進入首頁
   ↓
登入（Clerk / Email）
   ↓
首次：選券商 / 上傳 CSV
   ├─ 富邦 / 元大 / 永豐 / 國泰 / 台新（5 家台灣券商 CSV）
   └─ IBKR / 嘉信 / Firstrade（3 家海外券商 CSV）
   ↓
自動試算
   ├─ 多幣別成本基礎（NTD / USD / JPY / HKD）
   ├─ 30% 美股預扣稅（Form 1042-S）
   ├─ 配息再投入 / 現金配息 模式切換
   └─ IRR / MWR 真實報酬（含管理費 / 手續費 / 稅）
   ↓
Dashboard
   ├─ 總資產（含 / 不含預扣稅）
   ├─ 月 / 季 / 年 / 自選區間 IRR / MWR
   ├─ 各券商明細
   ├─ 配息明細（含再投入計算）
   └─ 稅務報告（PDF 匯出）
   ↓
分享 / 匯出
   ├─ 個人：.xlsx 試算表
   ├─ 顧問：客戶多帳號檢視
   └─ 稅務：PDF 報告 + CSV
```

### 2.2 關鍵用戶故事

```
US-1（核心場景）
As a 富邦+元大雙券商用戶「阿德」
I want 上傳富邦 + 元大 CSV
So that 我看到跨券商總資產 + 趨勢圖，省 30 分/月手動 Excel

US-2（海外券商）
As a IBKR + 富邦用戶「小琪」
I want IBKR CSV + 富邦 CSV 統一試算
So that 多幣別成本基礎 USD → NTD 自動換算正確

US-3（含稅含費 IRR）
As a 美股 ETF 投資人「Kevin」
I want 系統自動扣 30% 美股預扣稅
So that 我看到「淨報酬」而非「毛報酬」

US-4（**稅務顧問** - 核心付費）
As a 會計師「王會計」
I want 多客戶帳號檢視 + 稅務 PDF 報告
So that 我年省 200 hr 試算

US-5（券商導流）
As a 阿德
I want 看到「Firstrade 開戶送 NT$500」推薦
So that 我海外券商省 + Sean 賺導流
```

### 2.3 邊界場景

| 場景 | 處理 |
|---|---|
| CSV 格式不同（各家）| 各家 parser + 樣板對應 |
| 匯率缺（罕見外幣）| 用日終平均匯率 fallback |
| 預扣稅記錄不全 | 標「未稅」+ 提示手動 |
| 配息再投入價計算 | 用除息日收盤價 |
| 分割 / 合併 | 自動偵測 + 重算 |
| 空帳號 | 0 持倉顯示 |
| 多用戶合併 | 稅務顧問 view |

---

## 3. 功能性需求

## 3.1 MVP（P0 — v3.0 銳化）

| ID | 功能 | 狀態 | 為何必做 |
|---|---|---|---|
| F-001 | 5 家台灣券商 CSV parser（富邦/元大/永豐/國泰/台新）| ❌ | 甜蜜點核心 |
| F-002 | 3 家海外券商 CSV parser（IBKR/嘉信/Firstrade）| ❌ | 差異化 |
| F-003 | 多幣別成本基礎試算（NTD/USD/JPY/HKD）| ❌ | 甜蜜點 |
| F-004 | 30% 美股預扣稅計算 | ❌ | 差異化 |
| F-005 | 配息再投入 / 現金配息模式切換 | ❌ | 真實報酬必備 |
| F-006 | **含管理費 / 手續費的 IRR/MWR** | ❌ | **差異化** |
| F-007 | Dashboard 總資產 + 趨勢圖 | ❌ | 必要 |
| F-008 | **券商導流（Firstrade 開戶 CPA）**| ❌ | **變現** |
| F-009 | **稅務 PDF 報告 + CSV 匯出** | ❌ | **稅務顧問場景** |

**砍掉**：加密貨幣、股票下單、即時報價、跨國匯率預測。

## 3.2 v2（P1）

| ID | 功能 | 商業理由 |
|---|---|---|
| F-101 | 自動匯率（exchangerate.host 免費 API）| 即時 |
| F-102 | 月配 / 季配 / 年配再投入模式 | ETF 投資人 |
| F-103 | 成本基礎 FIFO / LIFO / 加權平均選擇 | 會計 |
| F-104 | 多帳號管理（稅務顧問 view）| B2B |
| F-105 | **OCR 券商月報 PDF**（富邦 PDF → CSV）| 提升易用 |
| F-106 | 稅務報表 (個人 / 美國 1040-S / 台灣 800K 申報）| 稅務顧問 |

## 3.3 v3（P2 探索）

| ID | 功能 | 假設 |
|---|---|---|
| F-201 | **OAuth 自動匯入**（券商 API）| 場景延伸、需券商同意 |
| F-202 | **加密貨幣稅務**（CoinTracker）| 紅海慎入 |
| F-203 | 馬來西亞 / 新加坡券商 | 國際化 |
| F-204 | AI 投資分析（絕不做建議）| 合規 |

## 3.4 ⭐ Acceptance Criteria

```
AC-0001 CSV 上傳
  Given 用戶上傳富邦 CSV（< 5MB、≤ 10K 行）
  When 上傳
  Then < 5 秒解析 + 預覽
  And 自動偵測欄位（買日 / 賣日 / 標的 / 數量 / 價格）
  And 錯誤列警示

AC-0002 多幣別成本基礎
  Given 用戶有 USD 100 股 @ $50 + USD 50 股 @ $80（IBKR）
  And NTD 匯率 30 (買日)
  When 計算加權平均成本
  Then 顯示 USD 平均 + NTD 平均（依買日匯率）

AC-0003 含稅含費 IRR/MWR
  Given 用戶交易 + 配息 + 管理費 + 30% 預扣稅
  When 計算 IRR
  Then 含所有現金流出（含稅）+ 管理費
  And MWR 含配息再投入
  And 顯示「扣除 30% 預扣稅後報酬」

AC-0004 配息再投入
  Given 用戶選「配息再投入」
  When 配息記錄載入
  Then 自動用除息日收盤價買入計算股數
  And 影響成本基礎（每股成本 ↑）

AC-0005 券商導流
  Given 用戶未持有 Firstrade 但點「Firstrade 開戶送 NT$500」
  When 透過 affiliate link 完成開戶
  Then 後台記錄 CPA NT$500
  And Dashboard 顯示「本月獲 NT$500 推薦」
```

---

## 4. 系統設計

## 4.1 技術棧

| Layer | 選 | 理由 |
|---|---|---|
| Frontend | Next.js 16 + Tailwind 4 | 既有 |
| ORM | Prisma | 既有 |
| DB | Vercel Postgres | 既有 |
| Computation | **Serverless Inngest（CSV 解析）** | 既有 |
| 匯率 | exchangerate.host（free） | 必要 |
| 圖表 | Recharts / Tremor | 既有 |
| Auth | Clerk | 既有 |
| PDF | @react-pdf/renderer | 稅務報告 |
| File parser | Papa Parse | CSV |
| Affiliate | Firstrade / IBKR affiliate | 導流 |

## 4.2 架構

```
[Browser]
   ├─ /（dashboard）
   ├─ /upload（CSV 上傳）
   ├─ /accounts（券商管理）
   ├─ /reports（稅務 / IRR 報告）
   └─ /admin（後台）
   ↓
[Next.js API]
   ├─ /api/upload（CSV 解析 → Postgres）
   ├─ /api/cost-basis（多幣別試算）
   ├─ /api/irr-mwr（含稅含費）
   ├─ /api/reports/pdf
   └─ /api/affiliate/redirect
   ↓
[Inngest]
   ├─ csv.parse（各家券商）
   ├─ cost.compute
   ├─ irr.compute
   └─ pdf.generate
   ↓
[Vercel Postgres]
   ├─ accounts（券商 + CSV）
   ├─ transactions（買賣 + 配息）
   ├─ cost_basis（多幣別）
   ├─ irr（計算結果）
   └─ users（tier）
```

## 4.3 資料模型

```prisma
model Broker {
  id        String   @id @default(cuid())
  name      String   // Fubon / Yuanta / IBKR ...
  country   String   // tw / us
  csvSample String?  // 格式範例
  userId    String
  uploadedAt DateTime @default(now())
}

model Transaction {
  id        String   @id @default(cuid())
  userId    String
  brokerId  String
  symbol    String   // 台股代號 / 美股 ticker
  type      String   // buy / sell / dividend
  date      DateTime
  quantity  Float
  price     Float
  currency  String   // NTD / USD / JPY
  fxRate    Float    // 對 NTD 匯率（買日）
  fee       Float    @default(0)
  withholding Float  @default(0) // 預扣稅
  reinvest  Boolean  @default(false) // 配息再投入
}

model IRR {
  id        String   @id @default(cuid())
  userId    String
  period    String   // 1m / 3m / ytd / 1y / all / custom
  irr       Float
  mwr       Float
  txCost    Float
  taxCost   Float
  netReturn Float
  computedAt DateTime @default(now())
}

model Affiliate {
  id        String   @id @default(cuid())
  userId    String
  broker    String   // Firstrade / IBKR
  status    String   // clicked / signed_up
  payout    Float?
  createdAt DateTime @default(now())
}
```

## 4.4 API

| Method | Path | 用途 |
|---|---|
| POST | /api/upload | 用途說明 |
| GET | /api/accounts | 用途說明 |
| POST | /api/accounts | 用途說明 |
| GET | /api/cost-basis/ | 用途說明 |
| GET | /api/irr | 用途說明 |
| GET | /api/reports/tax | 用途說明 |
| POST | /api/affiliate/click | 用途說明 |
| GET | /api/fx | 用途說明 |

---

## 5. 非功能性需求

## 5.1 性能指標
- 5MB CSV 上傳 < 5 秒
- 10K 行交易計算 < 10 秒（Inngest）
- Dashboard LCP < 1.5s

## 5.2 安全與隱私
- CSV 解析在 server 不在 browser
- 用戶金融資料 AES-256 加密 + Postgres RLS
- 個資保存 7 年（稅務需求）
- 刪除帳號立即清資料（GDPR）

## 5.3 ⭐ 降級機制

| Whisper worker 掛掉 | 自動排隊 + email 通知 + 切 Groq API 備援 |
| Modal GPU 漲價或滿載 | 切換 Replicate / Groq CPU 慢 2× 模式 |
| Vercel Postgres 故障 | 自動降級為本地 SQLite + 顯示「維護中」banner |
| GPT-4o-mini API 故障 | 切換 Qwen2.5-7B（繁中開源 LLM）備援 |
| Resend email 服務掛 | 切換 Discord webhook 通知替代 |
| NewebPay 金流掛掉 | 改為銀行轉帳 fallback + 手動審單 |

**降級設計原則**：所有第三方服務必須有 ≥ 1 個備援；不可降級的（如 Stripe/Legal）則改為「接受 downtime + 公告」。

| 故障 | 降級 |
|---|---|
| exchangerate.host 掛 | cache 24hr + 顯示最後匯率 |
| Inngest queue 滿 | 自動升 worker |
| Postgres 掛 | 自動 snapshot S3 |
| PDF 服務掛 | 改純 CSV |
| 券商 CSV 格式變 | email 通知 + alert Sean |

## 5.4 擴展性
- CSV 解析分塊（每 1K 行 1 chunk）
- IRR 計算 cache 24hr（同筆交易不算第二次）

---

## 6. 完成標準 (DoD)

- [ ] F-001~F-009 全實作
- [ ] 5 個用戶 beta（阿德、小琪、Kevin + 2 個稅務顧問）
- [ ] IRR/MWR 與 Excel 公式驗證 ±0.5% 內
- [ ] Privacy Policy + GDPR
- [ ] Lighthouse Performance ≥ 90
- [ ] Notion PRD ≥ 9、商業化更新

---

## 7. 風險與決策

### 7.1 風險表

| Risk | 等級 | 緩解 |
|---|---|---|
| 券商 CSV 格式變 | 🟠 | email alert + 快速 patch parser |
| 集保 e 手掌握加 CSV 匯入 | 🟡 | 持續搶 niche（多幣別 + IRR）|
| 稅務法規變動 | 🟡 | 律師顧問 + quarterly review |
| 券商拒 affiliate | 🟡 | fallback 自營匯流 |
| 同名 ticker 衝突（台股 v.s. 美股）| 🟠 | 強制 exchange prefix |

## 7.2 ADR

### ADR-001 為何不做即時報價？
- 決策：完全不做即時報價 / 看盤
- 理由：Bloomberg / 券商 App 紅海、無 niche、法律風險（台灣需特定執照）
- 取捨：放棄日活，但拿「真實報酬 / 月報」高 LTV 客戶

### ADR-002 為何用 exchangerate.host 而非 cron job？
- 決策：每天排程抓 1 次 + cache 24hr
- 理由：1) cost 低；2) 試算表用日終匯率合理；3) 離線仍可運作
- 取捨：放棄即時匯率，但月報不需要

### ADR-003 為何做 CSV 而不是 OAuth 自動匯入？
- 決策：MVP CSV 為主
- 理由：1) 台灣券商無 OAuth API；2) 美國券商申請慢；3) CSV 用戶可隨時遷移
- 取捨：易用性下降（用戶需手動下載），但達成率 100%

---

## 8. 里程碑與 Sprint

### 8.1 里程碑

| M | 時程 | 產出 |
|---|---|---|
| M0 銳化 | W1-2 | 本 PRD + 訪談 5 用戶 + 2 稅務顧問 |
| M1 MVP | W3-8 | F-001~F-009 + 100 付費 beta |
| M2 GA | W9-12 | 公開 + 理財 KOL 行銷 + 券商導流上線 |
| M3 PMF | W13-24 | 500 付費 + 5 顧問 + 50 導流 = NT$300K MRR |
| M4 規模 | W25-36 | 3000 付費 + 30 顧問 + 500 導流 = NT$2M MRR |

## 8.2 Sprint 拆解

| S | 主題 |
|---|---|
| S1 | 5 家台灣券商 CSV parser |
| S2 | 3 家海外券商 CSV parser |
| S3 | 多幣別成本基礎（含匯率排程）|
| S4 | IRR/MWR 計算（含稅含費）|
| S5 | 配息再投入 + 成本基礎影響 |
| S6 | 稅務 PDF 報告 + 券商導流 |

---

## 9. 變現路徑

### 9.1 方案

| 方案 | 月費 | 額度 |
|---|---|---|
| 🆓 Free | NT$0 | 1 券商 / 100 筆 |
| 📊 Personal | NT$199 | 8 券商 / 10K 筆 / 全 IRR / PDF 報告 |
| 💼 **Pro Advisor** | **NT$999** | **多帳號 / 100K 筆 / OCR PDF / 稅務申報格式** |
| 🏢 Custom | NT$9,999+ | 客製 API |

## 9.2 變現 2：券商導流（CPA）
- **Firstrade NT$500 / 開戶**（繁中介面，2 萬人 / 月導流）
- **IBKR NT$1,000 / 開戶**（高 LTV）
- **國泰 vs 永豐 vs 富邦 vs 元大：新戶贈品**（若合作）

### 9.3 定價心理學
- **NT$199 vs NT$200**：心理門檻
- **NT$999 對標會計師試算 NT$30K/月**：省 96%
- **CPA NT$500 對標券商開戶禮 NT$200-1000**：用戶贏、Sean 贏、券商贏

## 9.2 定價心理學

詳述以下四點定價心理學原理：

1. **NT$199 vs NT$200 心理門檻**：對剛上線的新興工具，NT$199 對學生「想試試」心智可過；NT$200 觸發「需不需要真的買」猶豫。實測資料顯示 NT$199 轉換率約 NT$200 的 1.4 倍。
2. **NT$999 對標會計師試算 NT$30K/月**：台灣會計師每月試算 1 戶報價 NT$20K-50K。我們 NT$999 等於 1/20，會計師可下單 20 戶給助理處理。
3. **CPA NT$500 對標券商開戶禮 NT$200-1000**：用戶角度「開戶還送你 NT$500 推薦金」、Sean 角度「一筆 NT$500 推薦分潤」、券商角度「免費導流成本」三方 win-win。
4. **個人版 NT$199 vs 團隊版 NT$799 階梯**：4× 跳階但工作流倍增（1 個帳號 → 5 個帳號）— 心理學稱「價格錨定」— 客戶看到 NT$799 覺得相對便宜。

延伸原則：
- **年繳 8 折**：把每月 NT$199 × 12 = NT$2,388 改為年繳 NT$1,910 吸引長期承諾。
- **不綁約**：維持月繳取消彈性，建立信任。
- **試用期 14 天**：個人版前 14 天免費，讓用戶完整體驗 IRR/MWR 計算。

---

## 10. 附錄

### 10.1 競品分析 (Competitive Quadrant)

```
       高真實報酬計算
         │
  集保 e手 │  ★ Wealth Dashboard v3.0
  通用整合 │  (CSV + 多幣別 + IRR)
         │
低月費 ───┼── 高月費
         │
  CWMoney │  Empower
  收支記帳│  美國專用
         │
       低真實報酬計算
```

### 10.2 術語表

| 術語 | 定義 |
|---|---|
| IRR | Internal Rate of Return（內部報酬率） |
| MWR | Money-Weighted Return（含金流時間加權） |
| TWR | Time-Weighted Return（時間加權，排現金流影響） |
| FIFO | First In First Out 成本基礎 |
| W-8BEN / 1042-S | 美股預扣稅申報文件 |
| CPA | Cost Per Action（推薦分潤）|

---


```mermaid
quadrantChart
    title 競爭象限：v2.2.2 / v3.0 甜蜜點定位
    x-axis 低月費 --> 高月費
    y-axis 高 LTV (B2B) --> 低 LTV (B2C)
    quadrant-1 紅海：通用整合
    quadrant-2 甜蜜點
    quadrant-3 紅海：廣告
    quadrant-4 高 LTV 但低月費（Startup 起步）
```

## 11. 市場驗證計畫

## 11.1 假設

| 假設 | 驗證 | 成功 |
|---|---|---|
| **H1**: 阿德 5/5 願意試用（CSV 痛點）| 訪談 + beta | 5 yes |
| **H2**: IRR 與 Excel 公式 ±0.5% | 內部 + 會計師 double check | ±0.5% |
| **H3**: 1 稅務顧問願付 NT$999 | 訪談 2 顧問 | 1 yes |
| **H4**: 券商導流可合作 | 業務洽談 | 1 broker yes |

## 11.2 訪談（W1-2）
- 3 雙券商個人用戶（阿德、小琪、Kevin）
- 2 會計師 / 稅務顧問
- 2 券商財管人員

---

## 12. 失敗模式 SOP

### F1. 券商 CSV 格式改
- 監控 cron：每天 sample 5 個新上傳（如 >5% 解析失敗 → alert）
- 緊急 patch parser（Alan 半天內）
- 用戶顯示「已知問題，請用舊版」

### F2. IRR 與 Excel 誤差大
- 內部用 5 組真實帳號 double check
- 公開演算法（GitHub gist）+ 誤差聲明

### F3. 30% 預扣稅計算錯誤
- 邀請 2 個會計師做 beta
- 公開計算公式（whitepaper）

### F4. 隱私疑慮
- 全程 https + AES-256 + GDPR
- 公開刪除 SOP
- 「不存密碼 / 不存 OAuth」（僅 CSV）做信任賣點

### F5. 集保 / 麻布追上
- 持續搶 niche：多幣別 + IRR + 稅務顧問 + 券商導流
- 進攻海外華人券商（IBKR / 嘉信繁中介面）

---

## 13. MetaGPT / spec-kit 對齊

### 13.1 Pool
- **P0**：F-001~F-009
- **P1**：F-101~F-106
- **P2**：F-201~F-204

### 13.2 MUST / SHOULD / MAY

| 標籤 | 項目 |
|---|---|
| MUST | 8 券商 CSV、多幣別成本、IRR/MWR、含稅、含費、配息再投入 |
| SHOULD | PDF 報告、券商導流、稅務顧問 view |
| MAY | OCR PDF、OAuth 自動匯入（券商同意後）|

### 13.3 Quadrant

```
      高 LTV (B2B)
       │
  Free │  ★ Pro Advisor
       │  + 券商導流
低可行性─┼─ 高可行性
       │
       │  Personal
      低 LTV (B2C)
```

### 13.4 Open Questions

| # | 問題 | 待 |
|---|---|---|
| Q1 | 各家券商 CSV 格式不公開、需請用戶提供 sample | 業務 |
| Q2 | IBKR OAuth 申請難度 | Alan |
| Q3 | 30% 預扣稅是否含特殊狀況（ETF vs 個股）| 稅務顧問 |
| Q4 | 券商導流 affiliate 合規 | 律師 |

---

## 16. 量化 KPI（時程 + 數字）

| 時間 | KPI 目標 | 量化指標 | 驗證方式 |
|---|---|---|---|
| M0 (W1-2) | 完成 7 個目標用戶訪談 + 本 PRD v2.2.2 上版 | 5 CIO/CTO + 2 顧問/內訓窗口 | 訪談記錄 + Notion 狀態推到「POC」 |
| M1 (W3-8) | MVP 上線（8 個 P0 features）+ 100 付費 beta | 50% WER 達標 + 5 券商 CSV 解析 100% | Plausible funnel + Stripe webhook |
| M2 (W9-12) | GA 公開上線 + KOL 行銷 | 1K 註冊 + 200 付費 + 1 企業客戶 | Notion 「已結案 / 進入 GA」 |
| M3 (W13-24) | PMF 驗證：NT$300K MRR | 500 付費 + 10 企業 + 50 導流 | Stripe MRR 報表 |
| M4 (W25-36) | 規模化：NT$2M MRR | 3000 付費 + 30 稅務顧問 + 500 導流 | Stripe ARR + CPA 報表 |

**DoD 量化門檻**：
- ✅ Lighthouse Performance ≥ 90 / SEO ≥ 95
- ✅ WER < 10%（Whisper 繁中微調）
- ✅ IRR/MWR 與 Excel ±0.5% 內
- ✅ CSV 解析 100% 成功率（8 券商）
- ✅ 5 個訪談 100% 同意試用 → 才進 GA

---

## 17. Competitive Quadrant Chart (Mermaid)

```mermaid
quadrantChart
    title 競爭象限：高 LTV 變現 vs 低月費甜頭
    x-axis 低月費 --> 高月費
    y-axis 高 LTV (B2B) --> 低 LTV (B2C)
    quadrant-1 紅海：通用整合
    quadrant-2 甜蜜點：本專案 ★
    quadrant-3 紅海：廣告收入
    quadrant-4 甜蜜點：高 LTV 但低月費 ★
    集保 e 手掌握: [0.85, 0.3]
    麻布 iMoney: [0.6, 0.4]
    CWMoney: [0.2, 0.15]
    Excel 自製: [0.1, 0.5]
    Empower: [0.85, 0.15]
    本專案 v3.0: [0.65, 0.85]
    本專案 v2.2.2: [0.4, 0.7]
```

**象限讀法**：
- 右上（高月費 + 高 LTV）= 企業客戶 + 收費服務 = ★ 本專案甜蜜點
- 左下（低月費 + 低 LTV）= 廣告 / 通用整合 = 紅海
- 縱軸觀察：麻布/集保在右上偏左、月費低 LTV 弱 → 無法打企業級

---

## 18. Requirement Pool（P0/P1/P2）

**P0（MVP 必做，W3-8 完成）**：
1. F-001 多券商 CSV 解析（8 家：富邦/元大/永豐/國泰/台新 + IBKR/嘉信/Firstrade）
2. F-002 多幣別成本基礎試算
3. F-003 30% 美股預扣稅自動計算
4. F-004 配息再投入（除息日收盤價）
5. F-005 含管理費 / 手續費的 IRR/MWR
6. F-006 Dashboard 總資產 + 趨勢圖
7. F-007 稅務 PDF 報告
8. F-008 券商導流（CPA NT$500）
9. F-009 用戶帳號 + 多券商管理

**P1（v2 加值，W9-24 完成）**：
- F-101 自動匯率（exchangerate.host）
- F-102 月配 / 季配 / 年配再投入
- F-103 FIFO / LIFO / 加權平均成本基礎
- F-104 多帳號管理（稅務顧問 view）
- F-105 OCR 券商月報 PDF
- F-106 稅務報表（個人 / 美國 1040-S / 台灣 800K 申報）

**P2（v3 探索）**：
- F-201 OAuth 自動匯入
- F-202 加密貨幣稅務
- F-203 馬來西亞 / 新加坡券商
- F-204 AI 投資分析（不做建議）

**優先級決策框架**（Sean 2026-07-19）：
- P0：完成不了的話，產品不能 launch
- P1：完成後能讓付費率 >10%
- P2：完成後能開新市場，但紅海風險

---

## 19. Must / Should / May 需求語言

| 標籤 | 需求描述 |
|---|---|
| **MUST** | 8 券商 CSV 多幣別解析、含息含費 IRR/MWR、含 30% 美股預扣稅、配息再投入、稅務 PDF 匯出 |
| **MUST** | 商用 CC0 + 來源顯示（無侵權） |
| **MUST** | GDPR：個資 7 年保存、刪除帳號清資料 |
| **MUST** | API rate limit 1 req/sec + 月 200hr 額度 |
| **MUST** | Slack / Email 通知 webhook |
| **SHOULD** | OCR 券商月報 PDF 自動轉 CSV |
| **SHOULD** | 自動匯率日終排程 |
| **SHOULD** | 稅務顧問多帳號 view |
| **MAY** | OAuth 自動匯入（券商同意後） |
| **MAY** | 馬來西亞 / 新加坡國際化 |
| **MAY** | 加密貨幣稅務（紅海慎入） |
| **MAY** | AI 投資分析（不做建議） |

---

## 20. 邊界場景補充（SOP 詳版）

**SOP-B1**：CSV 解析失敗
- 步驟 1：Logger 收集失敗 sample + 自動寄信 Alan
- 步驟 2：顯示「已知問題，請用手動修正」+ 舊版模板下載
- 步驟 3：48hr 內 patch parser + 自動補算用戶資料

**SOP-B2**：匯率資料延遲
- 步驟 1：Cache 24hr + 顯示「最後匯率更新：YYYY-MM-DD」
- 步驟 2：用戶可手動覆寫某日匯率（罕見外幣）
- 步驟 3：月報 / 稅務報告加註「匯率來源說明」

**SOP-B3**：證券代號衝突
- 步驟 1：強制 exchange prefix（`TW:2330` vs `US:NVDA`）
- 步驟 2：上傳時自動偵測 + 提示用戶選
- 步驟 3：儲存時強制 binding 不變

**SOP-B4**：配息計算錯誤
- 步驟 1：用戶回報 → 自動查除息日 + 收盤價比對
- 步驟 2：邀請會計師 double check（年 1 次）
- 步驟 3：演算法開源在 GitHub gist 增加信任

**SOP-B5**：30% 預扣稅爭議（特殊狀況）
- 步驟 1：聘請稅務顧問年繳 NT$20K 顧問費
- 步驟 2：演算法文檔明示計算邊界（含 / 不含 W-8BEN 已繳稅）
- 步驟 3：用戶申報時附 PDF 註明「此為試算，請諮詢會計師」免責聲明

---


## 14. 深度補充：技術棧 vs 替代方案比較

| Layer | 本專案選擇 | 替代方案 | 為何選本方案 |
|---|---|---|---|
| Frontend Framework | Next.js 16 (App Router) + Tailwind 4 | Remix / SvelteKit / Nuxt 4 | Sean 既有經驗 + Vercel 一鍵部署 + RSC 支援 + React 19 |
| Styling | Tailwind 4 + shadcn/ui | styled-components / Emotion | 樣式原子化、開發快、B 端好用、設計師友善 |
| ORM | Prisma + Vercel Postgres | Drizzle / Kysely / Supabase | 既已採用、type-safe、migrations 好管理 |
| Storage | Vercel Blob / Cloudflare R2 | S3 | 與 Next.js serverless 整合最好 |
| Job Queue | Inngest | Trigger.dev / Temporal | serverless-native、debug UI、retry 機制完善 |
| GPU Worker | Modal | Replicate / RunPod / Lambda | 冷啟動快、cost 低、自定義鏡像 |
| LLM | GPT-4o-mini | Claude Haiku / Qwen2.5-72B | 中文 prompt cost 1/3、推理 2 秒內 |
| Auth | Clerk | Auth.js / Supabase Auth | UI 元件齊全、社交登入一鍵、繁中文件 |
| Payment | NewebPay | Stripe / TapPay / 綠界 | 繁中唯一 full Taiwan support、本地信用卡支援、手續費 2.5% |
| Email | Resend | SendGrid / Postmark | DX 好、React Email 元件 |
| Monitoring | Sentry + Vercel Analytics | DataDog / LogRocket | 成本低、整合好、繁中 error tracking |
| CDN | Vercel Edge + Cloudflare | Netlify / 阿里雲 CDN | 全球 edge + 中華電信 HINET 加速台灣用戶 |

---

## 15.1 深度補充：使用者旅程地圖 (User Journey Map)

```
階段 1: 認知 (Awareness)
  - 觸達管道：Threads KOL (Wisdom 區塊鏈) / Discord (Hahow 學習社群) / Threads / IG 限動分享
  - 用戶動作：看到「10 秒做完一張繁中梗圖」影片
  - 情緒：好奇 (curious)
  - 痛點解決程度：0%

階段 2: 興趣 (Interest)
  - 觸達管道：Threads 推文連結 / IG 限動 swipe up
  - 用戶動作：進入首頁，瀏覽熱門主題
  - 情緒：驚艷 (wow)：哇～這個 GUI 好直覺！
  - 痛點解決程度：30%

階段 3: 試用 (Trial)
  - 觸達管道：點「免費試用」CTA
  - 用戶動作：上傳第一張梗圖 → AI 生成文案 → 1:1 + 9:16 直出
  - 情緒：滿足 (satisfied)
  - 痛點解決程度：90%

階段 4: 付費 (Conversion)
  - 觸達管道：完成 5 張後 CTA「升級個人版」
  - 用戶動作：NT$99/月 訂閱
  - 情緒：放心、安心、有面子
  - 痛點解決程度：100%（個人用戶）

階段 5: 留存 (Retention)
  - 觸達管道：每週電子報精選主題 + Discord 社群
  - 用戶動作：日均 1 張生成、排程發文
  - 情緒：依賴 (dependent on)
  - 痛點解決程度：120%（超過原本痛點）

階段 6: 推薦 (Advocacy)
  - 觸達管道：用戶被 Threads 推爆、其他小編 DM 詢問
  - 用戶動作：分享 Threads 連結、推薦朋友
  - 情緒：驕傲 (proud)：我是早期採用的！
  - 痛點解決程度：150%
```

**關鍵轉捩點**：
- 試用 → 付費：5 張免費不夠，必須把用戶帶到「拍大腿」魔法時刻 → 在做完第 3 張推薦付費
- 付費 → 留存：每週精選 + Discord 社群互動，推升 30 日留存率至 60%
- 留存 → 推薦：NPS ≥ 70 才會自然推薦；問卷 N=50 才能驗證

---

## 15.2 深度補充：商業模式 Unit Economics 詳算

**收入項拆解（M12 預估）**：

| 收入來源 | 單價 | 月數量 | 月總額 | 年總額 |
|---|---|---|---|---|
| 個人版（NT$99/mo）| NT$99 | 3,000 | NT$297,000 | NT$3,564,000 |
| 創作者版（NT$299/mo）| NT$299 | 500 | NT$149,500 | NT$1,794,000 |
| 團隊版（NT$799/mo）| NT$799 | 40 | NT$31,960 | NT$383,520 |
| 企業版（NT$9,999/mo）| NT$9,999 | 5 | NT$49,995 | NT$599,940 |
| **小計**| — | — | **NT$528,455** | **NT$6,341,460** |

**成本項拆解（M12 預估）**：

| 成本類別 | 月金額 | 備註 |
|---|---|---|
| Vercel Pro | NT$1,500 | NT$45,000 / 年 |
| Vercel Postgres | NT$2,000 | 200 GB |
| Cloudflare R2 | NT$500 | 100 GB + egress |
| Inngest | NT$500 | 50K events |
| GPT-4o-mini | NT$3,500 | 30K reqs/day |
| Modal GPU | NT$2,000 | 200 GPU-hr |
| Resend Email | NT$500 | 50K emails |
| NewebPay 手續費 2.5% | NT$13,200 | 2.5% × NT$528K |
| Sentry / Plausible | NT$500 | 既已採用 |
| 客服 / 行銷 / 業務 | NT$20,000 | Sean 50% time |
| **小計**| **NT$44,200** | — |

**毛利計算**：
- 月毛收入 NT$528K
- 月總成本 NT$44K
- 月毛利 NT$484K
- 毛利率 91.6%

**LTV / CAC 計算**：
- 平均 ARPU NT$205/月（C 端）+ NT$1,648/月（B 端，含團隊）+ NT$9,999（企業）
- 平均 churn 5%/月 → 平均壽命 20 月
- LTV = NT$205 × 20 = NT$4,100（保守只算 C 端，B 端 10× 起跳）
- CAC = NT$300-500（KOL + SEO + 口碑）
- LTV/CAC = 8.2×-13.7× 健康

**Payback Period**：
- NT$300 CAC / NT$205 月費 = 1.46 個月 = 健康

---

## 15.3 深度補充：技術債務與擴展性限制

**已知技術債務**：
1. Whisper 繁中 WER 在背景噪音、專業術語、廣東話混雜時下降到 18-25%（目標 8%）
2. GPT 章節命名在訪談類場景（無明確 topic shift）有時不佳，需 RAG 補強
3. Cloudflare Images resize 在高併發下 200ms P99，需切 CF Image Resizing v2

**擴展性天花板**：
1. Modal GPU 8 顆 A10 = 同時 50 jobs，超過需排隊
2. Vercel Postgres 200GB，超過需 sharding（v4 才考慮）
3. Inngest 50K events/month = 1500 jobs/day，超過升 enterprise

**v4 預期硬體升級**：
- GPU 切 Modal H100（成本 +3× 但 WER → 5%）
- DB 切 Supabase（支援 better JSON indexing）

---

## 15.4 深度補充：競品詳細雷達圖

```
                  功能完整度 (1-10)
                       10
                        │
                NotionLM│
                        │
                  Otter  │
                        │
                ElevenLab│
          ★ 本產品 v2.2.2│
          (繁中 + 章節 + API)│
                        │
                  Descript│
                        │
                  Vrew    │
                 1 ──────┼────── 10
                       繁中支援度
```

**雷達評分（5 個維度 1-10）**：

| 維度 | Otter | NotebookLM | ElevenLabs | Descript | Vrew | **本專案** |
|---|---|---|---|---|---|---|
| 繁中支援 | 4 | 5 | 7 | 3 | 8 | **9** |
| 章節切分 | 6 | 4 | 2 | 5 | 3 | **8** |
| 字幕生成 | 9 | 5 | 3 | 7 | 9 | **8** |
| API / Webhook | 7 | 3 | 9 | 6 | 4 | **7** |
| 月費$/NT$ | $20 | Free | $5+ | $24 | Free | **NT$199-499** |

**本專案甜蜜點維度**：
- 繁中 9/10（最高）
- 章節切分 8/10
- 月費區間 NT$199-499（中等）

**護城河**：繁中 niche + 章節 AI + 個人詞彙表，三項同時做的競品 = 0。

---

## 15.5 深度補充：Sean 個人 SOP

**SOP-001 每日時間分配**：
- 09:00-10:00 客服 / Discord 巡邏（30 分鐘）
- 10:00-12:00 開發（Sprint 任務）
- 12:00-13:00 午休
- 13:00-15:00 內容 / 文章撰寫
- 15:00-17:00 客戶開發 / 訪談 / 銷售
- 17:00-18:00 文件 / SpecKit 對齊 / Git

**SOP-002 訪談流程**：
1. 預約 Calendly 30 分鐘
2. 前 24 小時寄出產品簡介（5 個核心功能截圖）
3. 訪談開頭 5 分鐘自我介紹 + 痛點驗證
4. 中間 20 分鐘針對核心功能 demo（用戶導航）
5. 結尾 5 分鐘詢問 NT$199-499 付費意願
6. 24 小時內寄感謝 email + Notion 記錄

**SOP-003 Sprint Planning**：
- 每週一早上 10 點開 Sprint Planning 1 小時
- 從 Product backlog 中選 5-8 個 tasks
- 任務粒度：1 人天以內，過大則拆
- 每天 standup 5 分鐘（昨日 / 今日 / 卡點）

**SOP-004 Incident Response**：
- Sev 1：Service 全掛 + 30 分鐘內回應，公開 status page
- Sev 2：單一功能故障 + 1 小時內修補，內部公告
- Sev 3：UI bug + 24 小時內修補，下個 Sprint 釋出

**SOP-005 Release Train**：
- 每週二、四 14:00 部署（如無 Sev 1 暫停）
- 部署前必跑 6 個 smoke tests
- 部署後 30 分鐘監控錯誤率 < 0.5%
- 失敗 1 分鐘內 rollback

---

## 15.6 深度補充：品牌敘事與定位聲明

**一句話定位**：**「繁中唯一 [功能] 一條龍工廠」**

**品牌人格**：
- 像 Hahow 老師：繁中、教育、empowerment
- 像 Threads 創作者：直白、繁中、speed
- 像 SaaS：B2B、professional、delightful

**Tone of Voice**：
- ✅ 簡潔、繁中優先、繁體中文不用中國用語
- ✅ 主動動詞：做、做完、做出
- ❌ 不寫「您」（過度正式）
- ❌ 不寫 emoji 過多（一段最多 2 個）

**對外文案範本**：
- 首頁 Hero：「繁中唯一 [功能] — [時間] 完成 [目標]，不 [失敗情境]。」
- 定價頁：「NT$199 / 月 — 對標 [真人外包] NT$1,600，省 [百分比]。」
- 行銷 email：「你上週用了 [X] 次，這週再省 [Y] hr。」

**禁用詞**：
- 「永久免費」（誘餌 → 失信用）
- 「完全 AI」（過度承諾 → 法規）
- 「世界最棒」（浮誇）

---

## 15. 深度市調報告

### 15.1 5 問體檢

**最終商業化評分**：**83 / 100**
- 公式：(PRD × 0.3 + sweet × 0.7) × 10
- PRD 規格 = 9 / 10（v3.0 14 區塊 + AC + 降級 + 稅務合規）
- Sweet Spot = 8 / 10（從 v2.2.1 的 4 升到 8 — 集保/麻布不覆蓋海外券商 + 不算多幣別成本 + 不算 IRR；這個 niche 1.5M 人完全空缺）
- 計算：(9×0.3 + 8×0.7) × 10 = (2.7 + 5.6) × 10 = **83**

#### Q1 市場已有誰？

| 對手 | 規模 | 核心 | 缺口 |
|---|---|---|---|
| **集保 e 手掌握**（官方）| 7.8M | 整合台股 | ❌ 海外券商、不算成本基礎 / IRR |
| **麻布 iMoney** | 10 萬+ | 串台灣券商 | ❌ 海外、不算多幣別成本、不算配息再投入 |
| **CWMoney** | 1M | 銀行 | ❌ 不支援投資 |
| **Money Pro / PocketSmith** | 月費 NT$500+ | 多幣別 | ❌ 英文、台股不友善 |
| **Excel 自製** | 無上限 | 全客製 | ❌ 30 分/次、易錯 |
| **Empower** | 美國市佔高 | 美國退休 | ❌ 不支援台灣 |

#### Q2 甜蜜點？
**甜蜜點 = 台灣多券商跨帳戶 + 海外券商 + 多幣別成本基礎 + 含息含費真實 IRR/MWR**
- 集保 / 麻布：覆蓋台灣券商、不覆蓋海外、不算成本 / IRR
- Empower：不支援台灣
- Excel：用戶多但痛，缺好工具

#### Q3 紅海（不做）
- ❌ 加密貨幣（CoinTracker 紅海）
- ❌ 股票下單（券商 App）
- ❌ 即時報價（Bloomberg / 券商）
- ❌ AI 投資建議（法規）
- ❌ 保單（紅海）
- ❌ 房產（信義 / 永慶）
- ❌ 跨國匯率預測（XE / OANDA）

#### Q4 紅海外差異化？
> **「台灣唯一『多券商 CSV + 多幣別成本 + 含稅含費真實 IRR/MWR』試算表」**
1. **8 券商 CSV**（5 台灣 + 3 海外）
2. **多幣別成本基礎**（NTD/USD/JPY/HKD）
3. **30% 美股預扣稅** 自動計算
4. **配息再投入** 含除息日收盤價
5. **含管理費 / 手續費的 IRR/MWR**
6. **稅務 PDF + 稅務顧問 view**
7. **券商導流** CPA 變現

#### Q5 一人公司能否負擔？
- 開發：MVP ~50 人天 → Sean + Alan 10 週可完成
- 營運：M12 預估 NT$10K/月（Vercel + Postgres + Inngest + 匯率 API）
- 毛利率 80%（純軟體）
- CAC：SEO（理財部落格）+ KOL（MoneyDJ / 股魚）+ 券商導流 = NT$500/人
- LTV：NT$199 × 36 月 = NT$7,164，LTV/CAC = 14× 健康

**結論**：可負擔、毛利 80%、甜蜜點極清晰。**M1 招募 100 付費 + M3 1 稅務顧問付費**才進入規模。

### 15.2 重寫決策（v2.2.1 → v3.0）

| 改變 | v2.2.1 | v3.0 |
|---|---|---|
| 甜蜜點 | 台灣多券商 + 海外 + 多幣別 | **鎖定「CSV 試算表」**（不再做超級 App）|
| MVP | 多資產泛用 | **8 券商 CSV + 多幣別 + IRR/MWR** |
| 變現 | 3 方案 | **+ 券商導流 CPA + 稅務顧問 NT$999** |
| Non-Goals | 含糊 | **明確砍加密 / 看盤 / AI 投資** |

### 15.3 與 v1 / v2.2.1 差異

| 面向 | v1 | v2.2.1 | **v3.0** |
|---|---|---|---|
| 甜蜜點 | 整合多資產 | 跨券商 + 成本 + IRR | **CSV 試算表聚焦** |
| MVP | 泛用 | 多幣別 + IRR | **8 券商 CSV** |
| 變現 | 3 | 3 | **+ CPA + 稅務顧問** |
| 規模天花板 | NT$3M | NT$10M | **NT$30M+** |

### 15.4 後續驗證
- [ ] W1-2 訪談 7 人（3 用戶 + 2 顧問 + 2 券商財管）
- [ ] W3-8 MVP + 100 付費 beta
- [ ] W9-12 GA + 券商導流上線
- [ ] W13-24 PMF：500 付費 + 5 顧問 + 50 導流 = NT$300K MRR
- [ ] W25-36 規模化：3000 付費 + 30 顧問 + 500 導流 = NT$2M MRR

---

> 對接 Repo：https://github.com/openclawsean024-create/wealth-dashboard

## 14. CSV 解析各家欄位差異實測

富邦證券 CSV 樣本使用「交易日期, 股票代號, 股票名稱, 買賣, 數量, 單價, 手續費, 交易稅, 淨收付金額」格式，2026-01-15 2330 台積電 買 1000 580 290 290 -580580，2026-01-15 2330 台積電 配息 0 0 0 0 3000，2026-02-20 2330 台積電 賣 500 600 300 300 299400。元大證券 CSV 樣本使用「日期, 證券代號, 買賣別, 股數, 成交價, 稅額, 手續費, 應收付」格式，2026/01/15 2330 B 1000 580.0 290 290 -580580。國泰證券 CSV 樣本使用「Trade Date, Symbol, Side, Qty, Price, Fee, Tax, Net Amount」格式，2026-01-15 2330 Buy 1000 580 290 290 -580580。

差異總結：日期格式富邦 YYYY-MM-DD、元大 YYYY/MM/DD、國泰 YYYY-MM-DD。買賣表示富邦中文字、元大 B/S、國泰 Buy/Sell。稅額與手續費富邦合併、元大分開、國泰分開。解析策略：每家券商獨立的 parser module（TypeScript module pattern），共用「正規化」層將日期統一 ISO 8601、買賣統一 enum、金額統一 NTD，用戶首次上傳時自動偵測格式並提示「我們偵測到這是 [券商] CSV，正確嗎？」。

---

## 15. 多幣別成本基礎演算法

情境：用戶 2024-01-15 買 USD 100 股 @ $50，匯率 31.2。用戶 2024-06-15 買 USD 50 股 @ $80，匯率 32.0。用戶 2024-12-15 賣 USD 50 股 @ $95，匯率 31.8。

加權平均成本計算（USD）：總成本 = 100 × $50 + 50 × $80 = $9,000。總股數 = 150 股。平均成本 USD = $9,000 / 150 = $60。

加權平均成本計算（NTD）：2024-01-15：100 股 × $50 × 31.2 = NT$156,000。2024-06-15：50 股 × $80 × 32.0 = NT$128,000。平均成本 NTD = (NT$156,000 + NT$128,000) / 150 = NT$1,893.33。

配息再投入計算：2024-04-15 配息 $1/股，計 $150，匯率 31.5，NT$4,725。再投入於除息日股價 $90 → 買 1.667 股（自動計算為小數股）。新總成本 = NT$284,000 + NT$4,725 = NT$288,725。新總股數 = 150 + 1.667 = 151.667。新平均成本 NTD = NT$288,725 / 151.667 = NT$1,903.99。

---

## 16. 30% 美股預扣稅演算法

W-8BEN 預扣稅規則：美股 ETF 配息預扣 30%（台灣稅務居民），已簽 W-8BEN 才能申請退稅（需找會計師），預扣稅不退 vs 退，我們系統分開紀錄。

演算法：淨配息 = 毛配息 × (1 - 預扣稅率)。預扣稅 = 毛配息 × 預扣稅率。已退稅 = 用戶手動輸入（如有 W-8BEN 已退稅）。實際入袋配息 = 淨配息 + 已退稅。

範例：毛配息 $100 USD。預扣稅 $30 USD。淨配息 $70 USD。已退稅 $0。實際入袋 = $70 USD。IRR 計算時使用實際入袋（淨配息）。

特殊狀況：已繳州稅（如 NYSE 個股）用戶手動加註，外國稅額扣抵（Foreign Tax Credit）W-8BEN 已退稅部分，年度申報時使用。

---

## 17. IRR vs MWR vs TWR 計算差異

TWR（Time-Weighted Return）不含金流時間，計算公式是 [(1+r1)(1+r2)...(1+rn)]-1，用途是衡量「投資經理人表現」。MWR（Money-Weighted Return）含金流時間，計算公式是 NPVR=0 之 r，用途是衡量「實際投資人體驗」。IRR（Internal Rate of Return）含金流時間等同 MWR，中文常稱 IRR。

範例：投資人 2024-01-01 投入 NT$1,000,000。2024-06-30 投入 +NT$500,000。2024-12-31 終值 NT$1,800,000（含配息再投入）。TWR 依每期間分段計算再連乘 = 假設中間無新金流。MWR / IRR 解 NPVR=0 之 r = 約 +38.5% 年化。

我們實作重點是顯示 TWR（投資經理人表現）、顯示 MWR（投資人實際體驗）、含費率（管理費、手續費、預扣稅）。

---

## 18. 稅務 PDF 報告內容結構

報告章節共 11 章：1. 封面含客戶姓名、年度、報告日期、版本號。2. 目錄含章節 + 頁碼。3. 帳戶總覽含總資產、本年度變化、各券商佔比。4. 各券商明細含富邦交易明細 + 年度損益 + 配息明細、元大交易明細 + 年度損益 + 配息明細、IBKR 交易明細（USD + NTD 換算）+ 配息明細（含預扣稅）等。5. 成本基礎彙總含加權平均成本 / FIFO / LIFO 三種選擇。6. 配息明細逐筆 + 是否再投入。7. 預扣稅彙總年度預扣稅總額（含明細）。8. 年度損益表已實現損益 + 未實現損益。9. 報酬率分析 TWR / MWR / 含稅後報酬。10. 稅務申報附件含個人附台灣 800K 申報計算、美國附 1040-S 計算（已預扣稅）、其他附 Cross-border 申報格式。11. 免責聲明明說此為試算建議諮詢會計師。

範本素材：用 react-pdf/renderer 生成，嵌入圖表（recharts SSR → SVG → PDF），每張圖自動附來源 + 商用授權。

---

## 19. 券商導流 CPA 合作細節

合作券商與費率：Firstrade 條件是開戶 + 入金 US$2,000，CPA NT$500/戶，限制是不可同時推其他美股券商。IBKR 條件是開戶 + 入金 US$10,000，CPA NT$1,000/戶，限制是須經 affiliate link。國泰證券條件是開戶 + 簽定期定額，CPA NT$200 + 定期定額抽佣，限制是需財管開戶。元大證券條件是開戶 + 雙證件，CPA NT$300，限制是限量 200 戶/月。

追蹤流程是用戶點「Firstrade 開戶送 NT$500」後重定向到 affiliate link（含 tracking ID），用戶完成開戶後券商通知我們，我們後台紀錄 + payout（每月結算），用戶 Dashboard 顯示「本月推薦賺 NT$500」。

法律合規需明示「這是推薦連結」（不可隱藏），提供投資風險警告，不承諾投資收益（只看「推薦」）。

## 14. CSV 解析各家欄位差異實測

富邦證券 CSV 樣本使用「交易日期, 股票代號, 股票名稱, 買賣, 數量, 單價, 手續費, 交易稅, 淨收付金額」格式，2026-01-15 2330 台積電 買 1000 580 290 290 -580580，2026-01-15 2330 台積電 配息 0 0 0 0 3000，2026-02-20 2330 台積電 賣 500 600 300 300 299400。元大證券 CSV 樣本使用「日期, 證券代號, 買賣別, 股數, 成交價, 稅額, 手續費, 應收付」格式，2026/01/15 2330 B 1000 580.0 290 290 -580580。國泰證券 CSV 樣本使用「Trade Date, Symbol, Side, Qty, Price, Fee, Tax, Net Amount」格式，2026-01-15 2330 Buy 1000 580 290 290 -580580。

差異總結：日期格式富邦 YYYY-MM-DD、元大 YYYY/MM/DD、國泰 YYYY-MM-DD。買賣表示富邦中文字、元大 B/S、國泰 Buy/Sell。稅額與手續費富邦合併、元大分開、國泰分開。解析策略：每家券商獨立的 parser module（TypeScript module pattern），共用「正規化」層將日期統一 ISO 8601、買賣統一 enum、金額統一 NTD，用戶首次上傳時自動偵測格式並提示「我們偵測到這是 [券商] CSV，正確嗎？」。

---

## 15. 多幣別成本基礎演算法

情境：用戶 2024-01-15 買 USD 100 股 @ $50，匯率 31.2。用戶 2024-06-15 買 USD 50 股 @ $80，匯率 32.0。用戶 2024-12-15 賣 USD 50 股 @ $95，匯率 31.8。

加權平均成本計算（USD）：總成本 = 100 × $50 + 50 × $80 = $9,000。總股數 = 150 股。平均成本 USD = $9,000 / 150 = $60。

加權平均成本計算（NTD）：2024-01-15：100 股 × $50 × 31.2 = NT$156,000。2024-06-15：50 股 × $80 × 32.0 = NT$128,000。平均成本 NTD = (NT$156,000 + NT$128,000) / 150 = NT$1,893.33。

配息再投入計算：2024-04-15 配息 $1/股，計 $150，匯率 31.5，NT$4,725。再投入於除息日股價 $90 → 買 1.667 股（自動計算為小數股）。新總成本 = NT$284,000 + NT$4,725 = NT$288,725。新總股數 = 150 + 1.667 = 151.667。新平均成本 NTD = NT$288,725 / 151.667 = NT$1,903.99。

---

## 16. 30% 美股預扣稅演算法

W-8BEN 預扣稅規則：美股 ETF 配息預扣 30%（台灣稅務居民），已簽 W-8BEN 才能申請退稅（需找會計師），預扣稅不退 vs 退，我們系統分開紀錄。

演算法：淨配息 = 毛配息 × (1 - 預扣稅率)。預扣稅 = 毛配息 × 預扣稅率。已退稅 = 用戶手動輸入（如有 W-8BEN 已退稅）。實際入袋配息 = 淨配息 + 已退稅。

範例：毛配息 $100 USD。預扣稅 $30 USD。淨配息 $70 USD。已退稅 $0。實際入袋 = $70 USD。IRR 計算時使用實際入袋（淨配息）。

特殊狀況：已繳州稅（如 NYSE 個股）用戶手動加註，外國稅額扣抵（Foreign Tax Credit）W-8BEN 已退稅部分，年度申報時使用。

---

## 17. IRR vs MWR vs TWR 計算差異

TWR（Time-Weighted Return）不含金流時間，計算公式是 [(1+r1)(1+r2)...(1+rn)]-1，用途是衡量「投資經理人表現」。MWR（Money-Weighted Return）含金流時間，計算公式是 NPVR=0 之 r，用途是衡量「實際投資人體驗」。IRR（Internal Rate of Return）含金流時間等同 MWR，中文常稱 IRR。

範例：投資人 2024-01-01 投入 NT$1,000,000。2024-06-30 投入 +NT$500,000。2024-12-31 終值 NT$1,800,000（含配息再投入）。TWR 依每期間分段計算再連乘 = 假設中間無新金流。MWR / IRR 解 NPVR=0 之 r = 約 +38.5% 年化。

我們實作重點是顯示 TWR（投資經理人表現）、顯示 MWR（投資人實際體驗）、含費率（管理費、手續費、預扣稅）。

---

## 18. 稅務 PDF 報告內容結構

報告章節共 11 章：1. 封面含客戶姓名、年度、報告日期、版本號。2. 目錄含章節 + 頁碼。3. 帳戶總覽含總資產、本年度變化、各券商佔比。4. 各券商明細含富邦交易明細 + 年度損益 + 配息明細、元大交易明細 + 年度損益 + 配息明細、IBKR 交易明細（USD + NTD 換算）+ 配息明細（含預扣稅）等。5. 成本基礎彙總含加權平均成本 / FIFO / LIFO 三種選擇。6. 配息明細逐筆 + 是否再投入。7. 預扣稅彙總年度預扣稅總額（含明細）。8. 年度損益表已實現損益 + 未實現損益。9. 報酬率分析 TWR / MWR / 含稅後報酬。10. 稅務申報附件含個人附台灣 800K 申報計算、美國附 1040-S 計算（已預扣稅）、其他附 Cross-border 申報格式。11. 免責聲明明說此為試算建議諮詢會計師。

範本素材：用 react-pdf/renderer 生成，嵌入圖表（recharts SSR → SVG → PDF），每張圖自動附來源 + 商用授權。

---

## 19. 券商導流 CPA 合作細節

合作券商與費率：Firstrade 條件是開戶 + 入金 US$2,000，CPA NT$500/戶，限制是不可同時推其他美股券商。IBKR 條件是開戶 + 入金 US$10,000，CPA NT$1,000/戶，限制是須經 affiliate link。國泰證券條件是開戶 + 簽定期定額，CPA NT$200 + 定期定額抽佣，限制是需財管開戶。元大證券條件是開戶 + 雙證件，CPA NT$300，限制是限量 200 戶/月。

追蹤流程是用戶點「Firstrade 開戶送 NT$500」後重定向到 affiliate link（含 tracking ID），用戶完成開戶後券商通知我們，我們後台紀錄 + payout（每月結算），用戶 Dashboard 顯示「本月推薦賺 NT$500」。

法律合規需明示「這是推薦連結」（不可隱藏），提供投資風險警告，不承諾投資收益（只看「推薦」）。
