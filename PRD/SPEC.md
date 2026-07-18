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
| M3 | 100 付費 + 5 券商導流 | 50K MRR |
| M6 | 500 付費 + **5 稅務顧問 + 50 券商導流** | 300K MRR |
| M12 | 3000 付費 + **30 稅務顧問 + 500 券商導流** | **2M MRR** |

**Unit Economics**：
- 個人 NT$199 × 3,000 = NT$597K MRR
- 稅務顧問 NT$999 × 30 = NT$30K MRR
- 券商導流 NT$500 × 500 = NT$250K MRR（一次性 / 年）
- 合計 NT$877K MRR（M12 保守）

### 1.5 ⭐ Non-Goals

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

### 3.1 MVP（P0 — v3.0 銳化）

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

### 3.2 v2（P1）

| ID | 功能 | 商業理由 |
|---|---|---|
| F-101 | 自動匯率（exchangerate.host 免費 API）| 即時 |
| F-102 | 月配 / 季配 / 年配再投入模式 | ETF 投資人 |
| F-103 | 成本基礎 FIFO / LIFO / 加權平均選擇 | 會計 |
| F-104 | 多帳號管理（稅務顧問 view）| B2B |
| F-105 | **OCR 券商月報 PDF**（富邦 PDF → CSV）| 提升易用 |
| F-106 | 稅務報表 (個人 / 美國 1040-S / 台灣 800K 申報）| 稅務顧問 |

### 3.3 v3（P2 探索）

| ID | 功能 | 假設 |
|---|---|---|
| F-201 | **OAuth 自動匯入**（券商 API）| 場景延伸、需券商同意 |
| F-202 | **加密貨幣稅務**（CoinTracker）| 紅海慎入 |
| F-203 | 馬來西亞 / 新加坡券商 | 國際化 |
| F-204 | AI 投資分析（絕不做建議）| 合規 |

### 3.4 ⭐ Acceptance Criteria

```
AC-01 CSV 上傳
  Given 用戶上傳富邦 CSV（< 5MB、≤ 10K 行）
  When 上傳
  Then < 5 秒解析 + 預覽
  And 自動偵測欄位（買日 / 賣日 / 標的 / 數量 / 價格）
  And 錯誤列警示

AC-02 多幣別成本基礎
  Given 用戶有 USD 100 股 @ $50 + USD 50 股 @ $80（IBKR）
  And NTD 匯率 30 (買日)
  When 計算加權平均成本
  Then 顯示 USD 平均 + NTD 平均（依買日匯率）

AC-03 含稅含費 IRR/MWR
  Given 用戶交易 + 配息 + 管理費 + 30% 預扣稅
  When 計算 IRR
  Then 含所有現金流出（含稅）+ 管理費
  And MWR 含配息再投入
  And 顯示「扣除 30% 預扣稅後報酬」

AC-04 配息再投入
  Given 用戶選「配息再投入」
  When 配息記錄載入
  Then 自動用除息日收盤價買入計算股數
  And 影響成本基礎（每股成本 ↑）

AC-05 券商導流
  Given 用戶未持有 Firstrade 但點「Firstrade 開戶送 NT$500」
  When 透過 affiliate link 完成開戶
  Then 後台記錄 CPA NT$500
  And Dashboard 顯示「本月獲 NT$500 推薦」
```

---

## 4. 系統設計

### 4.1 技術棧

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

### 4.2 架構

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

### 4.3 Prisma Schema

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

### 4.4 API

| Method | Path | 用途 |
|---|---|
| POST | `/api/upload` | 上傳 CSV |
| GET | `/api/accounts` | 列表 |
| POST | `/api/accounts` | 新增券商 |
| GET | `/api/cost-basis/:symbol` | 多幣別成本基礎 |
| GET | `/api/irr?period=` | IRR/MWR |
| GET | `/api/reports/tax` | 稅務 PDF |
| POST | `/api/affiliate/click` | 導流紀錄 |
| GET | `/api/fx` | 匯率（cache 24hr） |

---

## 5. 非功能性需求

### 5.1 性能
- 5MB CSV 上傳 < 5 秒
- 10K 行交易計算 < 10 秒（Inngest）
- Dashboard LCP < 1.5s

### 5.2 安全與隱私
- CSV 解析在 server 不在 browser
- 用戶金融資料 AES-256 加密 + Postgres RLS
- 個資保存 7 年（稅務需求）
- 刪除帳號立即清資料（GDPR）

### 5.3 ⭐ 降級機制

| 故障 | 降級 |
|---|---|
| exchangerate.host 掛 | cache 24hr + 顯示最後匯率 |
| Inngest queue 滿 | 自動升 worker |
| Postgres 掛 | 自動 snapshot S3 |
| PDF 服務掛 | 改純 CSV |
| 券商 CSV 格式變 | email 通知 + alert Sean |

### 5.4 擴展性
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

### 7.2 ⭐ ADR

**ADR-001 為何不做即時報價？**
- 決策：完全不做即時報價 / 看盤
- 理由：Bloomberg / 券商 App 紅海、無 niche、法律風險（台灣需特定執照）
- 取捨：放棄日活，但拿「真實報酬 / 月報」高 LTV 客戶

**ADR-002 為何用 exchangerate.host 而非 cron job？**
- 決策：每天排程抓 1 次 + cache 24hr
- 理由：1) cost 低；2) 試算表用日終匯率合理；3) 離線仍可運作
- 取捨：放棄即時匯率，但月報不需要

**ADR-003 為何做 CSV 而不是 OAuth 自動匯入？**
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

### 8.2 Sprint

| S | 主題 |
|---|---|
| S1 | 5 家台灣券商 CSV parser |
| S2 | 3 家海外券商 CSV parser |
| S3 | 多幣別成本基礎（含匯率排程）|
| S4 | IRR/MWR 計算（含稅含費）|
| S5 | 配息再投入 + 成本基礎影響 |
| S6 | 稅務 PDF 報告 + 券商導流 |

---

## 9. 變現 + 定價心理學

### 9.1 方案

| 方案 | 月費 | 額度 |
|---|---|---|
| 🆓 Free | NT$0 | 1 券商 / 100 筆 |
| 📊 Personal | NT$199 | 8 券商 / 10K 筆 / 全 IRR / PDF 報告 |
| 💼 **Pro Advisor** | **NT$999** | **多帳號 / 100K 筆 / OCR PDF / 稅務申報格式** |
| 🏢 Custom | NT$9,999+ | 客製 API |

### 9.2 變現 2：券商導流（CPA）
- **Firstrade NT$500 / 開戶**（繁中介面，2 萬人 / 月導流）
- **IBKR NT$1,000 / 開戶**（高 LTV）
- **國泰 vs 永豐 vs 富邦 vs 元大：新戶贈品**（若合作）

### 9.3 定價心理學
- **NT$199 vs NT$200**：心理門檻
- **NT$999 對標會計師試算 NT$30K/月**：省 96%
- **CPA NT$500 對標券商開戶禮 NT$200-1000**：用戶贏、Sean 贏、券商贏

---

## 10. 附錄

### 10.1 Quadrant

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

## 11. ⭐ 市場驗證計畫

### 11.1 假設

| 假設 | 驗證 | 成功 |
|---|---|---|
| **H1**: 阿德 5/5 願意試用（CSV 痛點）| 訪談 + beta | 5 yes |
| **H2**: IRR 與 Excel 公式 ±0.5% | 內部 + 會計師 double check | ±0.5% |
| **H3**: 1 稅務顧問願付 NT$999 | 訪談 2 顧問 | 1 yes |
| **H4**: 券商導流可合作 | 業務洽談 | 1 broker yes |

### 11.2 訪談（W1-2）
- 3 雙券商個人用戶（阿德、小琪、Kevin）
- 2 會計師 / 稅務顧問
- 2 券商財管人員

---

## 12. ⭐ 失敗模式 SOP

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

## 13. ⭐ MetaGPT / spec-kit 對齊

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

## 15. ⭐ 深度市調報告 (Sweet Spot 5 問)

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
