/**
 * Wise API service — international bank account balances
 * Docs: https://developer.wise.com/
 */

import type { WiseKeys } from './api-keys';

export interface WiseBalance {
  currency: string;
  amount: number;
  availableAmount: number;
}

export interface WiseProfile {
  id: string;
  fullName: string;
  email: string;
}

export interface WiseAccount {
  profiles: WiseProfile[];
  balances: WiseBalance[];
  syncedAt: string;
}

async function wiseFetch(path: string, keys: WiseKeys): Promise<any> {
  const url = `https://api.wise.com${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${keys.apiToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Wise API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchWiseProfiles(keys: WiseKeys): Promise<WiseProfile[]> {
  const data = await wiseFetch('/v1/profiles', keys);
  return (data || []).map((p: any) => ({
    id: p.id,
    fullName: p.fullName,
    email: p.email,
  }));
}

export async function fetchWiseBalances(keys: WiseKeys): Promise<WiseBalance[]> {
  const profiles = await fetchWiseProfiles(keys);
  if (!profiles.length) return [];

  // Store the first profile ID if not already set
  const profileId = keys.profileId || profiles[0].id;

  const data = await wiseFetch(`/v1/profiles/${profileId}/balances`, keys);
  return (data || []).map((b: any) => ({
    currency: b.currency,
    amount: parseFloat(b.amount || '0'),
    availableAmount: parseFloat(b.availableAmount || b.amount || '0'),
  }));
}

export async function fetchWiseAccount(keys: WiseKeys): Promise<WiseAccount> {
  const profiles = await fetchWiseProfiles(keys);
  const balances = profiles.length > 0 ? await fetchWiseBalances(keys) : [];

  return {
    profiles,
    balances,
    syncedAt: new Date().toISOString(),
  };
}