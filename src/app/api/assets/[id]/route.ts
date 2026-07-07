import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  value: z.number().finite().optional(),
  costBasis: z.number().finite().nullable().optional(),
  category: z.enum(["cash", "stock", "fund", "crypto", "real-estate", "other"]).optional(),
  currency: z.string().min(1).max(8).optional(),
  institution: z.string().max(80).nullable().optional(),
  symbol: z.string().max(20).nullable().optional(),
  quantity: z.number().finite().nullable().optional(),
  avgPrice: z.number().finite().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // 確認這個資產是這個用戶的
  const existing = await db.asset.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.asset.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ asset: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await db.asset.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.asset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}