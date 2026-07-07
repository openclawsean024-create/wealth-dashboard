import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardClient from "./DashboardClient";
import type { Asset } from "./DashboardClient";

// Server Component — auth guard + 從 DB 撈用戶資產
export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // 從雲端 DB 撈這個用戶的資產
  const dbAssets = await db.asset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  // 如果用戶還沒有資產（剛註冊），給一組 demo 範本讓他看 dashboard 不會空白
  let initialAssets: Asset[] = dbAssets.map((a) => ({
    id: a.id,
    name: a.name,
    value: a.value,
    costBasis: a.costBasis ?? undefined,
    category: a.category as Asset["category"],
    currency: a.currency,
    institution: a.institution ?? undefined,
    symbol: a.symbol ?? undefined,
    quantity: a.quantity ?? undefined,
    avgPrice: a.avgPrice ?? undefined,
    updatedAt: a.updatedAt.toISOString(),
  }));

  if (initialAssets.length === 0) {
    // Seed demo data（第一次進 dashboard）
    const seed = [
      { name: "玉山銀行 數位存款", category: "cash", value: 520000, costBasis: 520000, currency: "TWD", institution: "玉山銀行" },
      { name: "王道銀行 存款帳戶", category: "cash", value: 280000, costBasis: 280000, currency: "TWD", institution: "王道銀行" },
      { name: "台北市 信義區公寓", category: "real-estate", value: 5800000, costBasis: 4500000, currency: "TWD", institution: "自住" },
      { name: "台積電 2330", category: "stock", value: 950000, costBasis: 580000, currency: "TWD", institution: "元大證券", symbol: "2330.TW", quantity: 1000, avgPrice: 580 },
      { name: "NVIDIA", category: "stock", value: 360000, costBasis: 280000, currency: "TWD", institution: "Firstrade", symbol: "NVDA", quantity: 50, avgPrice: 180 },
      { name: "Bitcoin", category: "crypto", value: 720000, costBasis: 425000, currency: "TWD", institution: "Binance", symbol: "BTC", quantity: 0.85, avgPrice: 50000 },
      { name: "Ethereum", category: "crypto", value: 150000, costBasis: 95000, currency: "TWD", institution: "Binance", symbol: "ETH", quantity: 4.2, avgPrice: 2260 },
    ];
    for (const s of seed) {
      await db.asset.create({
        data: { ...s, userId: session.user.id },
      });
    }
    const seeded = await db.asset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
    initialAssets = seeded.map((a) => ({
      id: a.id,
      name: a.name,
      value: a.value,
      costBasis: a.costBasis ?? undefined,
      category: a.category as Asset["category"],
      currency: a.currency,
      institution: a.institution ?? undefined,
      symbol: a.symbol ?? undefined,
      quantity: a.quantity ?? undefined,
      avgPrice: a.avgPrice ?? undefined,
      updatedAt: a.updatedAt.toISOString(),
    }));
  }

  return (
    <DashboardClient
      userEmail={session.user.email}
      initialAssets={initialAssets}
    />
  );
}