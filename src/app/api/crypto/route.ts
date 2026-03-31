import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CRYPTO_IDS = 'bitcoin,ethereum,solana';

export async function GET() {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_IDS}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ prices: data });
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto prices' }, { status: 500 });
  }
}
