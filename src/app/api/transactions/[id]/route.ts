import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  // 確保只刪自己的
  const tx = await db.transaction.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!tx) {
    return NextResponse.json({ error: "transaction not found" }, { status: 404 });
  }

  await db.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}