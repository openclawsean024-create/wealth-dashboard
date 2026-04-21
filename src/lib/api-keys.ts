/**
 * API Key storage helpers — localStorage only, never sent to any server
 */

const KEYS = {
  binance: 'wd_binance_keys',
  alpaca: 'wd_alpaca_keys',
  wise: 'wd_wise_keys',
} as const;

export interface BinanceKeys {
  apiKey: string;
  secretKey: string;
}

export interface AlpacaKeys {
  apiKey: string;
  secretKey: string;
}

export interface WiseKeys {
  apiToken: string;
  profileId: string;
}

function load<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const apiKeys = {
  binance: {
    get: (): BinanceKeys | null => load<BinanceKeys>(KEYS.binance),
    set: (keys: BinanceKeys) => save(KEYS.binance, keys),
    clear: () => typeof window !== 'undefined' && localStorage.removeItem(KEYS.binance),
  },
  alpaca: {
    get: (): AlpacaKeys | null => load<AlpacaKeys>(KEYS.alpaca),
    set: (keys: AlpacaKeys) => save(KEYS.alpaca, keys),
    clear: () => typeof window !== 'undefined' && localStorage.removeItem(KEYS.alpaca),
  },
  wise: {
    get: (): WiseKeys | null => load<WiseKeys>(KEYS.wise),
    set: (keys: WiseKeys) => save(KEYS.wise, keys),
    clear: () => typeof window !== 'undefined' && localStorage.removeItem(KEYS.wise),
  },
};
