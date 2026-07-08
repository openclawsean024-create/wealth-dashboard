import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://wealth-dashboard-iota.vercel.app";
const siteTitle = "Wealth Dashboard — 你的個人資產中心";
const siteDescription = "整合銀行、證券、加密資產於單一儀表板。雲端同步、多幣別、即時報價、隱私模式、PDF/Excel 匯出。Free + Pro NT$149/月。";

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Wealth Dashboard",
  },
  description: siteDescription,
  keywords: [
    "個人資產管理", "資產儀表板", "wealth dashboard", "投資組合",
    "股票報價", "加密貨幣", "多幣別", "雲端同步", "資產配置",
    "個人理財", "理財工具", "net worth tracker",
  ],
  authors: [{ name: "Wealth Dashboard" }],
  creator: "Wealth Dashboard",
  publisher: "Wealth Dashboard",
  applicationName: "Wealth Dashboard",
  generator: "Next.js",
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "finance",
  classification: "Personal Finance",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: "Wealth Dashboard",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Wealth Dashboard — 你的個人資產中心",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2310B981'/%3E%3Ctext x='16' y='23' font-size='18' text-anchor='middle' fill='white' font-family='system-ui' font-weight='800'%3EW%3C/text%3E%3C/svg%3E",
        sizes: "32x32",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'%3E%3Crect width='180' height='180' rx='40' fill='%2310B981'/%3E%3Ctext x='90' y='130' font-size='100' text-anchor='middle' fill='white' font-family='system-ui' font-weight='800'%3EW%3C/text%3E%3C/svg%3E",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wealth",
  },
  formatDetection: { telephone: false },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Wealth Dashboard",
  url: siteUrl,
  description: siteDescription,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any (Web)",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  inLanguage: "zh-TW",
  isAccessibleForFree: true,
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "TWD" },
    { "@type": "Offer", name: "Pro", price: "149", priceCurrency: "TWD" },
  ],
  featureList: [
    "銀行/股票/加密資產聚合儀表板",
    "雲端跨裝置同步",
    "多幣別切換 (TWD/USD/BTC/ETH)",
    "即時股價 (60s polling)",
    "甜甜圈圖資產配置",
    "損益表 + 交易紀錄",
    "PDF/Excel 匯出",
    "隱私模式 (Ctrl+H)",
    "JSON 匯出/匯入",
  ],
  creator: {
    "@type": "Organization",
    name: "Wealth Dashboard",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
