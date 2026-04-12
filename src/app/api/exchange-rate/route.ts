import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// exchangerate-api.com free tier - no API key needed for basic usage
const FX_SOURCE = 'https://api.exchangerate-api.com/v4/latest/USD';

export async function GET() {
  try {
    const res = await fetch(FX_SOURCE, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const rates = data.rates || {};

    return NextResponse.json({
      base: 'USD',
      rates: {
        USD: 1,
        TWD: rates.TWD || 31.5,
        HKD: rates.HKD || 7.82,
        JPY: rates.JPY || 149.5,
        EUR: rates.EUR || 0.92,
      },
      timestamp: data.time_last_update_utc || null,
    });
  } catch (error) {
    // Fallback to approximate rates
    return NextResponse.json({
      base: 'USD',
      rates: { USD: 1, TWD: 31.5, HKD: 7.82, JPY: 149.5, EUR: 0.92 },
      fallback: true,
    });
  }
}
