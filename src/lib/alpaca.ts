/**
 * Alpaca API service — US stocks/options account + positions
 * Docs: https://docs.alpaca.markets/
 */

import type { AlpacaKeys } from './api-keys';

export interface AlpacaPosition {
  symbol: string;
  qty: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  avgEntryPrice: number;
  currentPrice: number;
}

export interface AlpacaAccount {
  accountNumber: string;
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  status: string;
}

export interface AlpacaPortfolio {
  account: AlpacaAccount;
  positions: AlpacaPosition[];
  syncedAt: string;
}

async function alpacaFetch(path: string, keys: AlpacaKeys): Promise<any> {
  const url = `https://paper-api.alpaca.markets/v2${path}`;
  const res = await fetch(url, {
    headers: {
      'APCA-API-KEY-ID': keys.apiKey,
      'APCA-API-SECRET-KEY': keys.secretKey,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Alpaca API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchAlpacaAccount(keys: AlpacaKeys): Promise<AlpacaAccount> {
  const data = await alpacaFetch('/account', keys);
  return {
    accountNumber: data.account_number || '',
    equity: parseFloat(data.equity || '0'),
    cash: parseFloat(data.cash || '0'),
    buyingPower: parseFloat(data.buying_power || '0'),
    portfolioValue: parseFloat(data.portfolio_value || '0'),
    status: data.status || 'UNKNOWN',
  };
}

export async function fetchAlpacaPositions(keys: AlpacaKeys): Promise<AlpacaPosition[]> {
  const data = await alpacaFetch('/positions', keys);
  return (data || []).map((p: any) => ({
    symbol: p.symbol,
    qty: parseFloat(p.qty || '0'),
    marketValue: parseFloat(p.market_value || '0'),
    unrealizedPL: parseFloat(p.unrealized_pl || '0'),
    unrealizedPLPercent: parseFloat(p.unrealized_pl_percent || '0') * 100,
    avgEntryPrice: parseFloat(p.avg_entry_cost || '0'),
    currentPrice: parseFloat(p.current_price || '0'),
  }));
}

export async function fetchAlpacaPortfolio(keys: AlpacaKeys): Promise<AlpacaPortfolio> {
  const [account, positions] = await Promise.all([
    fetchAlpacaAccount(keys),
    fetchAlpacaPositions(keys),
  ]);

  return {
    account,
    positions,
    syncedAt: new Date().toISOString(),
  };
}