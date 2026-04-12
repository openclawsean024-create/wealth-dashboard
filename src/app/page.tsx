import DashboardClient from './DashboardClient';
import type { StockHolding, CryptoHolding } from './DashboardClient';

// Server Component — fetches data directly (no client-side fetch timing issues)
export default async function Page() {
  const BASE = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  let stockPrices: Record<string, { regularMarketPrice?: number }> = {};
  let cryptoPrices: Record<string, { usd?: number }> = {};

  try {
    const [stockRes, cryptoRes] = await Promise.all([
      fetch(`${BASE}/api/stocks`, { cache: 'no-store' }),
      fetch(`${BASE}/api/crypto`, { cache: 'no-store' }),
    ]);
    const stockData = await stockRes.json() as { prices?: Record<string, { regularMarketPrice?: number }> };
    const cryptoData = await cryptoRes.json() as { prices?: Record<string, { usd?: number }> };
    if (stockData.prices) stockPrices = stockData.prices;
    if (cryptoData.prices) cryptoPrices = cryptoData.prices;
  } catch (e) {
    console.error('Server-side fetch failed:', e);
  }

  const STOCK_HOLDINGS: StockHolding[] = [
    { symbol: '2330.TW', name: '台積電', shares: 100, avgCost: 580, category: 'Equity' },
    { symbol: '2317.TW', name: '鴻海', shares: 200, avgCost: 148, category: 'Equity' },
    { symbol: 'BTC-USD', name: 'Bitcoin ETF', shares: 50, avgCost: 42000, category: 'ETF' },
  ];

  const CRYPTO_HOLDINGS: CryptoHolding[] = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', amount: 0.85, avgCost: 62000, category: 'Store of Value' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', amount: 4.2, avgCost: 2800, category: 'Layer 1' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', amount: 25, avgCost: 95, category: 'Layer 1' },
  ];

  const initialStocks = STOCK_HOLDINGS.map(s => {
    const priceData = stockPrices[s.symbol];
    const currentPrice = priceData?.regularMarketPrice || s.avgCost;
    const value = currentPrice * s.shares;
    const cost = s.avgCost * s.shares;
    const gain = value - cost;
    const gainPercent = s.avgCost > 0 ? ((currentPrice - s.avgCost) / s.avgCost) * 100 : 0;
    return { ...s, currentPrice, value, gain, gainPercent };
  });

  const initialCrypto = CRYPTO_HOLDINGS.map(c => {
    const currentPrice = cryptoPrices[c.id]?.usd || c.avgCost;
    const value = currentPrice * c.amount;
    const cost = c.avgCost * c.amount;
    const gain = value - cost;
    const gainPercent = c.avgCost > 0 ? ((currentPrice - c.avgCost) / c.avgCost) * 100 : 0;
    return { ...c, currentPrice, value, gain, gainPercent };
  });

  return <DashboardClient initialStocks={initialStocks} initialCrypto={initialCrypto} />;
}
