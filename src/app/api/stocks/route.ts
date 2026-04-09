import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SYMBOLS = ['2330.TW', '2317.TW', 'BTC-USD'];

export async function GET() {
  try {
    const prices: Record<string, any> = {};

    const results = await Promise.allSettled(
      SYMBOLS.map(async (symbol) => {
        // Use Yahoo Finance v8 API directly - no auth required for quotes
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WealthDashboard/1.0)',
          },
          next: { revalidate: 60 },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { symbol, data };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { symbol, data } = result.value;
        const chart = data?.chart?.result?.[0];
        const meta = chart?.meta;
        prices[symbol] = {
          regularMarketPrice: meta?.regularMarketPrice || meta?.previousClose || 0,
          regularMarketPreviousClose: meta?.regularMarketPreviousClose,
          currency: meta?.currency,
          symbol,
        };
      }
    }

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock prices' }, { status: 500 });
  }
}
