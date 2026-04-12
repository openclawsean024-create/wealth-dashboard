import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Free exchange rate API - USDCNY is actually USDTWD on this API
    const res = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      throw new Error(`Exchange rate API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({
      rates: {
        TWD: data.rates?.TWD || 31.5,
        USD: 1,
      },
      base: 'USD',
    });
  } catch (error) {
    console.error('Exchange rate API error:', error);
    // Fallback to approximate rate
    return NextResponse.json({
      rates: { TWD: 31.5, USD: 1 },
      base: 'USD',
      fallback: true,
    });
  }
}
