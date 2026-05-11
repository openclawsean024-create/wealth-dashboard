/**
 * MAX Exchange (MaiCoin) API service — Taiwan's largest crypto exchange
 * Docs: https://max.maicoin.com/documents/api_list
 *
 * Auth: HMAC-SHA256
 *   payload = Base64( JSON.stringify({ path, nonce, ...params }) )
 *   signature = HMAC-SHA256(secretKey, payload).hex
 *   Headers: X-MAX-ACCESSKEY, X-MAX-PAYLOAD, X-MAX-SIGNATURE
 */

import type { MaxKeys } from './api-keys';

export interface MaxBalance {
  currency: string;
  balance: number;
  locked: number;
  total: number;
}

export interface MaxAccount {
  balances: MaxBalance[];
  syncedAt: string;
}

async function hmacSha256Hex(secretKey: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

async function maxRequest<T>(keys: MaxKeys, path: string, params: Record<string, string | number> = {}): Promise<T> {
  const nonce = Date.now();
  const payload = toBase64(JSON.stringify({ path, nonce, ...params }));
  const signature = await hmacSha256Hex(keys.secretKey, payload);

  const res = await fetch(`https://max-api.maicoin.com${path}`, {
    headers: {
      'X-MAX-ACCESSKEY': keys.apiKey,
      'X-MAX-PAYLOAD': payload,
      'X-MAX-SIGNATURE': signature,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ||
      `MAX API error: ${res.status}`
    );
  }

  return res.json() as Promise<T>;
}

interface RawMaxAccount {
  currency: string;
  balance: string;
  locked: string;
  type: string;
}

export async function fetchMaxAccount(keys: MaxKeys): Promise<MaxAccount> {
  const accounts = await maxRequest<RawMaxAccount[]>(keys, '/api/v2/members/accounts');

  const balances: MaxBalance[] = accounts
    .map(a => ({
      currency: a.currency.toUpperCase(),
      balance: parseFloat(a.balance),
      locked: parseFloat(a.locked),
      total: parseFloat(a.balance) + parseFloat(a.locked),
    }))
    .filter(a => a.total > 0);

  return { balances, syncedAt: new Date().toISOString() };
}
