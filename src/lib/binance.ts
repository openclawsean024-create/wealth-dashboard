/**
 * Binance API service — reads spot balances
 * Docs: https://developers.binance.com/docs
 * Uses Web Crypto API (browser-compatible, no Node.js dependencies)
 */

import type { BinanceKeys } from './api-keys';

export interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface BinanceSpotBalances {
  balances: BinanceBalance[];
  totalUSD?: number;
  syncedAt: string;
}

async function hmacSha256(secretKey: string, queryString: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(queryString);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchBinanceSpotBalances(keys: BinanceKeys): Promise<BinanceSpotBalances> {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;

  const signature = await hmacSha256(keys.secretKey, queryString);

  const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`;

  const res = await fetch(url, {
    headers: {
      'X-MBX-APIKEY': keys.apiKey,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || `Binance API error: ${res.status}`);
  }

  const data = await res.json();

  const balances: BinanceBalance[] = (data.balances || [])
    .filter((b: { asset: string; free: string; locked: string }) => {
      const free = parseFloat(b.free);
      const locked = parseFloat(b.locked);
      return free + locked > 0;
    })
    .map((b: { asset: string; free: string; locked: string }) => ({
      asset: b.asset,
      free: parseFloat(b.free),
      locked: parseFloat(b.locked),
      total: parseFloat(b.free) + parseFloat(b.locked),
    }));

  return {
    balances,
    syncedAt: new Date().toISOString(),
  };
}

/**
 * Fetch prices to convert balances to USD
 * Uses public Binance ticker endpoint (no signature needed)
 */
export async function fetchBinancePrices(): Promise<Record<string, number>> {
  const res = await fetch('https://api.binance.com/api/v3/ticker/price');
  if (!res.ok) throw new Error(`Binance ticker error: ${res.status}`);
  const data = await res.json();

  const prices: Record<string, number> = {};
  for (const item of data) {
    prices[item.symbol] = parseFloat(item.price);
  }
  return prices;
}
