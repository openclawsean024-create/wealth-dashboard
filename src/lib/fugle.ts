/**
 * 富果 Fugle Trade API — Taiwan stock brokerage
 * Docs: https://developer.fugle.tw/docs/trading/introduction
 *
 * Auth: API Key in X-API-KEY header
 * Base: https://api.fugle.tw/trade/v1.0
 *
 * Note: Fugle Trade API requires prior registration at
 * https://developer.fugle.tw — free plan available.
 */

import type { FugleKeys } from './api-keys';

export interface FugleInventoryItem {
  stockNo: string;
  stockName: string;
  quantity: number;       // 庫存股數（張 × 1000）
  avgCostPrice: number;   // 平均成本
  currentPrice?: number;  // 現在價格（從另一支 API 取）
  marketValue?: number;   // 市值
  unrealizedPnl?: number; // 未實現損益
}

export interface FugleAccount {
  cashBalance: number;          // 可用資金 (TWD)
  totalMarketValue: number;     // 持股市值 (TWD)
  totalAssets: number;          // 總資產 (TWD)
  inventories: FugleInventoryItem[];
  syncedAt: string;
}

interface FugleBalanceResponse {
  data?: {
    availableBalance?: string | number;
    totalBalance?: string | number;
  };
}

interface RawInventory {
  stockNo?: string;
  stockName?: string;
  qty?: string | number;
  costPrice?: string | number;
  biddingPrice?: string | number;
  unrealizedProfit?: string | number;
}

interface FugleInventoryResponse {
  data?: RawInventory[];
}

async function fugleRequest<T>(keys: FugleKeys, path: string): Promise<T> {
  const res = await fetch(`https://api.fugle.tw/trade/v1.0${path}`, {
    headers: {
      'X-API-KEY': keys.apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { message?: string }).message;
    throw new Error(msg || `Fugle API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchFugleAccount(keys: FugleKeys): Promise<FugleAccount> {
  const [balanceRes, inventoryRes] = await Promise.all([
    fugleRequest<FugleBalanceResponse>(keys, '/trade/balance').catch(() => null),
    fugleRequest<FugleInventoryResponse>(keys, '/trade/inventories').catch(() => null),
  ]);

  const cashBalance = balanceRes?.data?.availableBalance
    ? parseFloat(String(balanceRes.data.availableBalance))
    : 0;

  const inventories: FugleInventoryItem[] = (inventoryRes?.data ?? []).map((item: RawInventory) => {
    const qty = parseFloat(String(item.qty ?? 0));
    const costPrice = parseFloat(String(item.costPrice ?? 0));
    const currentPrice = item.biddingPrice ? parseFloat(String(item.biddingPrice)) : undefined;
    const marketValue = currentPrice != null ? qty * currentPrice : undefined;
    const unrealizedPnl = item.unrealizedProfit
      ? parseFloat(String(item.unrealizedProfit))
      : undefined;

    return {
      stockNo: item.stockNo ?? '',
      stockName: item.stockName ?? item.stockNo ?? '',
      quantity: qty,
      avgCostPrice: costPrice,
      currentPrice,
      marketValue,
      unrealizedPnl,
    };
  });

  const totalMarketValue = inventories.reduce((sum, i) => sum + (i.marketValue ?? 0), 0);
  const totalAssets = cashBalance + totalMarketValue;

  return {
    cashBalance,
    totalMarketValue,
    totalAssets,
    inventories,
    syncedAt: new Date().toISOString(),
  };
}
