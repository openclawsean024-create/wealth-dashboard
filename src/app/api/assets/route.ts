import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const assetSchema = z.object({
  name: z.string().min(1).max(120),
  value: z.number().finite(),
  costBasis: z.number().finite().optional(),
  category: z.enum(["cash", "stock", "fund", "crypto", "real-estate", "other"]),
  currency: z.string().min(1).max(8).default("TWD"),
  institution: z.string().max(80).optional(),
  symbol: z.string().max(20).optional(),
  quantity: z.number().finite().optional(),
  avgPrice: z.number().finite().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const assets = await db.asset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ assets });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Plan limit: free tier max 6 assets
  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (sub?.plan === "free") {
    const count = await db.asset.count({ where: { userId: session.user.id } });
    if (count >= 6) {
      return NextResponse.json(
        { error: "免費版上限 6 筆資產，升級 Pro 無限。" },
        { status: 403 }
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = assetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const created = await db.asset.create({
    data: { ...parsed.data, userId: session.user.id },
  });
  return NextResponse.json({ asset: created }, { status: 201 });
}