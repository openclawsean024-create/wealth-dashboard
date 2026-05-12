/**
 * OKX Exchange API service — reads trading account balances
 * Docs: https://www.okx.com/docs-v5/en/
 *
 * Auth: HMAC-SHA256
 *   Signature = Base64( HMAC-SHA256(secret, timestamp + method + path + body) )
 *   Headers: OK-ACCESS-KEY, OK-ACCESS-SIGN, OK-ACCESS-TIMESTAMP, OK-ACCESS-PASSPHRASE
 */

import type { OkxKeys } from './api-keys';
import type { OkxAccount, OkxBalance } from './sync-to-assets';

async function hmacSha256Base64(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function okxRequest<T>(keys: OkxKeys, path: string): Promise<T> {
  const timestamp = new Date().toISOString();
  const method = 'GET';
  const body = '';
  const signMsg = `${timestamp}${method}${path}${body}`;
  const sign = await hmacSha256Base64(keys.secretKey, signMsg);

  const res = await fetch(`https://www.okx.com${path}`, {
    headers: {
      'OK-ACCESS-KEY': keys.apiKey,
      'OK-ACCESS-SIGN': sign,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': keys.passphrase,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { msg?: string }).msg || `OKX API error: ${res.status}`
    );
  }

  const json = await res.json() as { code: string; msg?: string; data: T };
  if (json.code !== '0') throw new Error(json.msg || `OKX error code: ${json.code}`);
  return json.data;
}

interface RawOkxDetail {
  ccy: string;
  availBal: string;
  frozenBal: string;
}

interface RawOkxBalance {
  details?: RawOkxDetail[];
}

export async function fetchOkxAccount(keys: OkxKeys): Promise<OkxAccount> {
  const data = await okxRequest<RawOkxBalance[]>(keys, '/api/v5/account/balance');

  // data is an array; the first element contains all balances
  const raw = Array.isArray(data) ? data[0] : data;
  const details: RawOkxDetail[] = raw?.details ?? [];

  const balances: OkxBalance[] = details
    .map(d => ({
      currency: d.ccy,
      available: parseFloat(d.availBal) || 0,
      frozen: parseFloat(d.frozenBal) || 0,
      total: (parseFloat(d.availBal) || 0) + (parseFloat(d.frozenBal) || 0),
    }))
    .filter(b => b.total > 0);

  return { balances, syncedAt: new Date().toISOString() };
}
