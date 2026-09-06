import { NextRequest, NextResponse } from "next/server";
import { getQuotes, type DisplayCurrency, FX_TO_USD } from "@/lib/prices";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols") ?? "";
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ error: "symbols query param required (comma-separated)" }, { status: 400 });
  }
  if (symbols.length > 20) {
    return NextResponse.json({ error: "max 20 symbols per request" }, { status: 400 });
  }

  const quotes = await getQuotes(symbols);

  // 計算每個 symbol 在指定 display currency 的換後價格
  const display = (searchParams.get("display") ?? "TWD") as DisplayCurrency;
  const fxRate = FX_TO_USD[display] ?? FX_TO_USD.TWD;

  const enriched: Record<string, unknown> = {};
  for (const [sym, q] of Object.entries(quotes)) {
    if ("error" in q) {
      enriched[sym] = { error: q.error };
    } else {
      enriched[sym] = {
        ...q,
        displayPrice: q.price / fxRate,
        displayCurrency: display,
      };
    }
  }

  return NextResponse.json(
    {
      display,
      fxToUSD: fxRate,
      fetchedAt: new Date().toISOString(),
      quotes: enriched,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
      },
    }
  );
}