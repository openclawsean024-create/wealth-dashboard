export type PlanId = "free" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    assets: number; // 資產上限
    priceUpdates: "daily" | "realtime";
    currencies: string[];
    exportFormats: ("json" | "csv" | "pdf" | "excel")[];
    subAccounts: number;
  };
  cta: string;
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "免費版",
    tagline: "個人資產管理入門",
    price: { monthly: 0, yearly: 0 },
    features: [
      "最多 6 筆資產",
      "雲端同步",
      "跨裝置存取（電腦、手機、平板）",
      "一鍵匯出 JSON",
      "隱私模式 (Ctrl+H)",
      "資產配置甜甜圈圖",
      "30 日歷史趨勢",
    ],
    limits: {
      assets: 6,
      priceUpdates: "daily",
      currencies: ["TWD"],
      exportFormats: ["json"],
      subAccounts: 0,
    },
    cta: "免費開始",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "活躍投資者首選",
    price: { monthly: 149, yearly: 1490 },
    features: [
      "無限資產",
      "即時股價更新（Yahoo Finance）",
      "即時加密貨幣報價（CoinGecko）",
      "多幣別即時換算（TWD / USD / BTC / ETH）",
      "完整交易紀錄 + 損益表",
      "匯出 PDF / Excel",
      "雲端同步（裝置無上限）",
      "隱私模式 + 自訂資產類別",
      "優先客服（24h 內回覆）",
    ],
    limits: {
      assets: Infinity,
      priceUpdates: "realtime",
      currencies: ["TWD", "USD", "BTC", "ETH", "JPY", "CNY"],
      exportFormats: ["json", "csv", "pdf", "excel"],
      subAccounts: 0,
    },
    cta: "升級 Pro",
    featured: true,
  },
  {
    id: "business",
    name: "Business",
    tagline: "小型事務所、理財顧問",
    price: { monthly: 399, yearly: 3990 },
    features: [
      "包含 Pro 全部功能",
      "多帳號管理（最多 5 個子帳號）",
      "資產組合報告（PDF 白標）",
      "API 存取（讀寫資產資料）",
      "審計日誌 + 雙因素認證",
      "Slack 整合（每日摘要通知）",
      "客製化品牌 logo / 域名",
      "專屬客戶經理",
    ],
    limits: {
      assets: Infinity,
      priceUpdates: "realtime",
      currencies: ["TWD", "USD", "BTC", "ETH", "JPY", "CNY", "EUR", "GBP"],
      exportFormats: ["json", "csv", "pdf", "excel"],
      subAccounts: 5,
    },
    cta: "聯絡業務",
  },
];

export function getPlan(id: PlanId | string | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}