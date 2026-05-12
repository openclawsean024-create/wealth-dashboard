/**
 * sync-to-assets.ts
 * Converts API sync results into Asset[] for the dashboard.
 * Merging rule: synced assets (tagged by source) fully replace the previous
 * sync from the same source; manually-entered assets are never touched.
 */

import type { Asset } from '@/app/DashboardClient';
import type { BinanceSpotBalances } from './binance';
import type { MaxAccount } from './max';
import type { AlpacaPortfolio } from './alpaca';
import type { FugleAccount } from './fugle';
import type { WiseAccount } from './wise';

// ── Stablecoins ─────────────────────────────────────────────────────────────
const STABLECOINS = new Set([
  'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'GUSD', 'FDUSD',
  'PYUSD', 'USDD', 'FRAX', 'LUSD',
]);

// ── Symbol → CoinGecko ID ────────────────────────────────────────────────────
const SYMBOL_TO_CG_ID: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
  ADA: 'cardano', DOT: 'polkadot', MATIC: 'matic-network', POL: 'matic-network',
  LINK: 'chainlink', UNI: 'uniswap', AVAX: 'avalanche-2', ATOM: 'cosmos',
  LTC: 'litecoin', XRP: 'ripple', DOGE: 'dogecoin', SHIB: 'shiba-inu',
  TRX: 'tron', NEAR: 'near', APT: 'aptos', OP: 'optimism',
  ARB: 'arbitrum', PEPE: 'pepe', TON: 'the-open-network', SUI: 'sui',
  IMX: 'immutable-x', SAND: 'the-sandbox', MANA: 'decentraland',
  XLM: 'stellar', VET: 'vechain', ALGO: 'algorand', ETC: 'ethereum-classic',
  FIL: 'filecoin', ICP: 'internet-computer', GRT: 'the-graph',
  AAVE: 'aave', MKR: 'maker', COMP: 'compound-governance-token',
  CRV: 'curve-dao-token', SNX: 'havven', YFI: 'yearn-finance',
  SUSHI: 'sushi', '1INCH': '1inch', LDO: 'lido-dao',
  WLD: 'worldcoin-wld', STX: 'blockstack', BLUR: 'blur',
  JTO: 'jito-governance-token', PYTH: 'pyth-network',
};

// Approximate USD rates for fiat currencies (for Wise non-USD/TWD balances)
const FIAT_TO_USD: Record<string, number> = {
  USD: 1, TWD: 0.031, EUR: 1.08, GBP: 1.27, JPY: 0.0067,
  SGD: 0.74, HKD: 0.129, CNY: 0.138, KRW: 0.00073, CAD: 0.73,
  AUD: 0.65, CHF: 1.12, NZD: 0.60, THB: 0.028,
};

// ── Crypto price fetcher (CoinGecko free API) ────────────────────────────────
async function fetchCryptoPricesUSD(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  // Stablecoins → $1
  for (const s of symbols) {
    if (STABLECOINS.has(s)) prices[s] = 1;
  }

  const unknownSymbols = symbols.filter(s => !STABLECOINS.has(s));
  const ids = [...new Set(unknownSymbols.map(s => SYMBOL_TO_CG_ID[s]).filter(Boolean))];

  if (ids.length === 0) return prices;

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return prices;

    const data: Record<string, { usd: number }> = await res.json();
    for (const symbol of unknownSymbols) {
      const id = SYMBOL_TO_CG_ID[symbol];
      if (id && data[id]?.usd) prices[symbol] = data[id].usd;
    }
  } catch {
    // Return what we have (stablecoins at least)
  }

  return prices;
}

// ── Binance → Assets ────────────────────────────────────────────────────────
export async function convertBinanceToAssets(data: BinanceSpotBalances): Promise<Asset[]> {
  const symbols = data.balances.map(b => b.asset);
  const prices = await fetchCryptoPricesUSD(symbols);

  return data.balances
    .map(b => {
      const priceUSD = prices[b.asset] ?? 0;
      const valueUSD = b.total * priceUSD;
      return {
        id: `binance_${b.asset}`,
        name: `${b.asset}`,
        value: valueUSD,
        costBasis: valueUSD,
        category: 'crypto' as const,
        currency: 'USD',
        institution: 'Binance',
        source: 'binance' as const,
        updatedAt: data.syncedAt,
      };
    })
    .filter(a => a.value > 0.5);
}

// ── MAX → Assets ─────────────────────────────────────────────────────────────
export async function convertMaxToAssets(data: MaxAccount): Promise<Asset[]> {
  // MAX uses lowercase currency codes like 'btc', 'eth', 'usdt', 'twd'
  const symbols = data.balances.map(b => b.currency.toUpperCase());
  const prices = await fetchCryptoPricesUSD(symbols);

  return data.balances
    .map(b => {
      const symbol = b.currency.toUpperCase();
      // TWD balance → cash asset
      if (symbol === 'TWD') {
        return {
          id: 'max_twd',
          name: 'TWD',
          value: b.total,
          costBasis: b.total,
          category: 'cash' as const,
          currency: 'TWD',
          institution: 'MAX 交易所',
          source: 'max' as const,
          updatedAt: data.syncedAt,
        };
      }
      const priceUSD = prices[symbol] ?? 0;
      const valueUSD = b.total * priceUSD;
      return {
        id: `max_${symbol}`,
        name: symbol,
        value: valueUSD,
        costBasis: valueUSD,
        category: 'crypto' as const,
        currency: 'USD',
        institution: 'MAX 交易所',
        source: 'max' as const,
        updatedAt: data.syncedAt,
      };
    })
    .filter(a => a.value > 0.5);
}

// ── Alpaca → Assets ────────────────────────────────────────────────────────
export function convertAlpacaToAssets(data: AlpacaPortfolio): Asset[] {
  const assets: Asset[] = [];

  // Cash
  if (data.account.cash > 0.01) {
    assets.push({
      id: 'alpaca_cash',
      name: 'USD Cash',
      value: data.account.cash,
      costBasis: data.account.cash,
      category: 'cash',
      currency: 'USD',
      institution: 'Alpaca',
      source: 'alpaca' as const,
      updatedAt: data.syncedAt,
    });
  }

  // Positions
  for (const p of data.positions) {
    assets.push({
      id: `alpaca_${p.symbol}`,
      name: p.symbol,
      value: p.marketValue,
      costBasis: p.qty * p.avgEntryPrice,
      category: 'stock',
      currency: 'USD',
      institution: 'Alpaca',
      source: 'alpaca' as const,
      updatedAt: data.syncedAt,
    });
  }

  return assets;
}

// ── Fugle → Assets ────────────────────────────────────────────────────────
export function convertFugleToAssets(data: FugleAccount): Asset[] {
  const assets: Asset[] = [];

  if (data.cashBalance > 1) {
    assets.push({
      id: 'fugle_cash',
      name: '富果 現金',
      value: data.cashBalance,
      costBasis: data.cashBalance,
      category: 'cash',
      currency: 'TWD',
      institution: '富果',
      source: 'fugle' as const,
      updatedAt: data.syncedAt,
    });
  }

  for (const inv of data.inventories) {
    const value = inv.marketValue ?? inv.quantity * inv.avgCostPrice;
    if (value <= 0) continue;
    assets.push({
      id: `fugle_${inv.stockNo}`,
      name: `${inv.stockName} (${inv.stockNo})`,
      value,
      costBasis: inv.quantity * inv.avgCostPrice,
      category: 'stock',
      currency: 'TWD',
      institution: '富果',
      source: 'fugle' as const,
      updatedAt: data.syncedAt,
    });
  }

  return assets;
}

// ── Wise → Assets ──────────────────────────────────────────────────────────
export function convertWiseToAssets(data: WiseAccount): Asset[] {
  const assets: Asset[] = [];

  for (const b of data.balances) {
    const amount = parseFloat(String(b.amount));
    if (amount <= 0) continue;
    const currency = b.currency.toUpperCase();

    if (currency === 'TWD') {
      assets.push({ id: 'wise_twd', name: 'TWD', value: amount, costBasis: amount, category: 'cash', currency: 'TWD', institution: 'Wise', source: 'wise' as const, updatedAt: data.syncedAt });
      continue;
    }
    if (currency === 'USD') {
      assets.push({ id: 'wise_usd', name: 'USD', value: amount, costBasis: amount, category: 'cash', currency: 'USD', institution: 'Wise', source: 'wise' as const, updatedAt: data.syncedAt });
      continue;
    }
    // Other currencies → convert to USD
    const valueUSD = amount * (FIAT_TO_USD[currency] ?? 0);
    if (valueUSD < 0.5) continue;
    assets.push({ id: `wise_${currency.toLowerCase()}`, name: currency, value: valueUSD, costBasis: valueUSD, category: 'cash', currency: 'USD', institution: 'Wise', source: 'wise' as const, updatedAt: data.syncedAt });
  }

  return assets;
}

// ── OKX → Assets ───────────────────────────────────────────────────────────
export interface OkxBalance {
  currency: string;
  available: number;
  frozen: number;
  total: number;
}

export interface OkxAccount {
  balances: OkxBalance[];
  syncedAt: string;
}

export async function convertOkxToAssets(data: OkxAccount): Promise<Asset[]> {
  const symbols = data.balances.map(b => b.currency.toUpperCase());
  const prices = await fetchCryptoPricesUSD(symbols);

  return data.balances
    .map(b => {
      const symbol = b.currency.toUpperCase();
      const priceUSD = prices[symbol] ?? 0;
      const valueUSD = b.total * priceUSD;
      return {
        id: `okx_${symbol}`,
        name: symbol,
        value: valueUSD,
        costBasis: valueUSD,
        category: 'crypto' as const,
        currency: 'USD',
        institution: 'OKX',
        source: 'okx' as const,
        updatedAt: data.syncedAt,
      };
    })
    .filter(a => a.value > 0.5);
}

// ── Merge helper ─────────────────────────────────────────────────────────────
// Replace all assets from `source`, keep everything else (manual + other sources)
export function mergeAssets(existing: Asset[], synced: Asset[], source: string): Asset[] {
  const kept = existing.filter(a => (a as Asset & { source?: string }).source !== source);
  return [...kept, ...synced];
}
