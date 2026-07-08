import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  pro: 500,
  business: Infinity,
};

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const txs = await db.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 200,
  });
  return NextResponse.json({ transactions: txs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { assetId, type, amount, currency, note, date } = body ?? {};

  // 驗證
  if (!type || !["buy", "sell", "dividend", "deposit", "withdrawal"].includes(type)) {
    return NextResponse.json({ error: "invalid type (buy/sell/dividend/deposit/withdrawal)" }, { status: 400 });
  }
  if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be positive number" }, { status: 400 });
  }
  const currencyStr = typeof currency === "string" && currency.length === 3 ? currency.toUpperCase() : "TWD";

  // plan limit check
  const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });
  const plan = subscription?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const count = await db.transaction.count({ where: { userId: session.user.id } });
  if (count >= limit) {
    return NextResponse.json(
      { error: `交易紀錄已達 ${plan} 方案上限 ${limit === Infinity ? "∞" : limit} 筆`, upgrade: plan === "free" },
      { status: 403 }
    );
  }

  // 驗證 assetId 屬於這個 user
  if (assetId) {
    const asset = await db.asset.findFirst({ where: { id: assetId, userId: session.user.id } });
    if (!asset) {
      return NextResponse.json({ error: "asset not found or not owned" }, { status: 404 });
    }
  }

  const tx = await db.transaction.create({
    data: {
      userId: session.user.id,
      assetId: assetId ?? null,
      type,
      amount,
      currency: currencyStr,
      note: note ?? null,
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json({ transaction: tx });
}