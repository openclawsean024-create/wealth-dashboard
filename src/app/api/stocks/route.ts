import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

const yahooFinance = new YahooFinance();

const SYMBOLS = ['2330.TW', '2317.TW', 'BTC-USD'];

export async function GET() {
  try {
    const prices: Record<string, any> = {};

    const results = await Promise.allSettled(
      SYMBOLS.map(async (symbol) => {
        const quote = await yahooFinance.quote(symbol);
        return { symbol, data: quote };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        prices[result.value.symbol] = result.value.data;
      }
    }

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock prices' }, { status: 500 });
  }
}
