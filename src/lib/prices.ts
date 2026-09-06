/**
 * 即時報價服務 — Wealth Dashboard Session 5
 * - 股票：Yahoo Finance (chart API，免 key)
 * - 加密：CoinGecko (free tier，免 key)
 * - FX：固定匯率（MVP 用；可升級為 exchangerate.host）
 * - 60s in-memory cache（避免 rate limit）
 */

export type DisplayCurrency = "TWD" | "USD" | "BTC" | "ETH";

export interface PriceQuote {
  symbol: string;
  price: number;          // 報價原幣 (USD for stock/crypto)
  currency: string;      // 報價幣別 (USD)
  change24h: number;     // 24h 漲跌 %（正=漲、負=跌）
  asOf: string;          // ISO timestamp
  source: "yahoo" | "coingecko" | "fx" | "cache";
}

// ─── 固定 FX（MVP；後續接 exchangerate.host） ────────────────────────────────
export const FX_TO_USD: Record<DisplayCurrency, number> = {
  USD: 1,
  TWD: 1 / 32.5,         // 1 USD = 32.5 TWD
  BTC: 1 / 67000,
  ETH: 1 / 3500,
};

export const FX_SYMBOL: Record<DisplayCurrency, string> = {
  TWD: "NT$",
  USD: "$",
  BTC: "₿",
  ETH: "Ξ",
};

export function convertToDisplay(
  amountUSD: number,
  display: DisplayCurrency
): number {
  return amountUSD / FX_TO_USD[display];
}

export function formatPrice(
  amountUSD: number,
  display: DisplayCurrency,
  opts: { decimals?: number; compact?: boolean } = {}
): string {
  const v = convertToDisplay(amountUSD, display);
  const decimals = opts.decimals ?? (display === "TWD" || display === "USD" ? 0 : 6);
  const sym = FX_SYMBOL[display];
  if (opts.compact && Math.abs(v) >= 1000) {
    if (Math.abs(v) >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(2)}M`;
    if (Math.abs(v) >= 1_000) return `${sym}${(v / 1_000).toFixed(2)}K`;
  }
  return `${sym}${v.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}`;
}

// ─── Symbol 識別：股票 vs 加密 ───────────────────────────────────────────────
export function classifySymbol(symbol: string): "stock" | "crypto" | "unknown" {
  const s = symbol.toUpperCase();
  if (s === "BTC" || s === "ETH" || s === "SOL" || s === "USDT" || s === "USDC") return "crypto";
  if (s.endsWith(".TW") || s.endsWith("-USD") || /^[A-Z]{1,5}$/.test(s)) return "stock";
  return "unknown";
}

export function toYahooSymbol(symbol: string): string {
  const s = symbol.toUpperCase();
  // 已帶後綴直接用
  if (s.endsWith(".TW") || s.endsWith("-USD") || s.includes("=")) return s;
  // 純英數（美股）保持原樣
  if (/^[A-Z]{1,5}$/.test(s)) return s;
  // 預設台股加 .TW
  return `${s}.TW`;
}

export function toCoingeckoId(symbol: string): string {
  const map: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    USDT: "tether",
    USDC: "usd-coin",
  };
  return map[symbol.toUpperCase()] ?? symbol.toLowerCase();
}

// ─── Yahoo Finance (chart API 免 key) ────────────────────────────────────────
async function fetchYahoo(symbol: string): Promise<PriceQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Wealth-Dashboard)" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: HTTP ${res.status}`);
  const json = (await res.json()) as Record<string, unknown>;
  const chart = json?.chart as { result?: Array<Record<string, unknown>> } | undefined;
  const result = chart?.result?.[0];
  if (!result) throw new Error(`Yahoo ${symbol}: empty result`);

  const meta = (result.meta ?? {}) as Record<string, unknown>;
  const indicators = (result.indicators ?? {}) as { quote?: Array<{ close?: number[] }> };
  const closeSlice = indicators.quote?.[0]?.close ?? [];
  const lastClose = closeSlice[closeSlice.length - 1];
  const price = (meta.regularMarketPrice as number | undefined) ?? lastClose;
  const prev = (meta.chartPreviousClose as number | undefined) ?? (meta.previousClose as number | undefined);
  if (price == null || prev == null) throw new Error(`Yahoo ${symbol}: missing price`);

  const change24h = ((price - prev) / prev) * 100;

  return {
    symbol,
    price,
    currency: (meta.currency as string) ?? "USD",
    change24h: Number(change24h.toFixed(2)),
    asOf: new Date(((meta.regularMarketTime as number | undefined) ?? Date.now() / 1000) * 1000).toISOString(),
    source: "yahoo",
  };
}

// ─── CoinGecko (free tier) ──────────────────────────────────────────────────
async function fetchCoingecko(symbol: string): Promise<PriceQuote> {
  const id = toCoingeckoId(symbol);
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`CoinGecko ${id}: HTTP ${res.status}`);
  const json = (await res.json()) as Record<string, Record<string, number>>;
  const row = json?.[id];
  if (!row || row.usd == null) throw new Error(`CoinGecko ${id}: missing price`);

  return {
    symbol: symbol.toUpperCase(),
    price: row.usd,
    currency: "USD",
    change24h: Number((row.usd_24h_change ?? 0).toFixed(2)),
    asOf: new Date((row.last_updated_at ?? Date.now() / 1000) * 1000).toISOString(),
    source: "coingecko",
  };
}

// ─── In-memory 60s cache ────────────────────────────────────────────────────
const CACHE = new Map<string, { quote: PriceQuote; at: number }>();
const CACHE_TTL_MS = 60_000;

export async function getQuote(symbol: string): Promise<PriceQuote> {
  const key = symbol.toUpperCase();
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { ...cached.quote, source: "cache" };
  }

  let quote: PriceQuote;
  const kind = classifySymbol(key);
  try {
    if (kind === "crypto") {
      quote = await fetchCoingecko(key);
    } else if (kind === "stock") {
      quote = await fetchYahoo(toYahooSymbol(key));
    } else {
      throw new Error(`Unknown symbol kind: ${key}`);
    }
  } catch (err) {
    // 失敗時若 cache 有舊值（即使過期）就回傳，避免 dashboard 整個掛掉
    if (cached) {
      console.warn(`[prices] fetch fail for ${key}, use stale cache:`, (err as Error).message);
      return { ...cached.quote, source: "cache" };
    }
    throw err;
  }

  CACHE.set(key, { quote, at: Date.now() });
  return quote;
}

export async function getQuotes(symbols: string[]): Promise<Record<string, PriceQuote | { error: string }>> {
  const out: Record<string, PriceQuote | { error: string }> = {};
  await Promise.all(
    symbols.map(async (s) => {
      try {
        out[s.toUpperCase()] = await getQuote(s);
      } catch (e) {
        out[s.toUpperCase()] = { error: (e as Error).message };
      }
    })
  );
  return out;
}