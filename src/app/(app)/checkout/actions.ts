"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PlanId } from "@/lib/plans";

export type UpgradeState = {
  ok?: boolean;
  error?: string;
} | undefined;

export async function upgradePlanAction(
  _prev: UpgradeState,
  formData: FormData
): Promise<UpgradeState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "請先登入" };
  }

  const planId = (formData.get("planId")?.toString() ?? "pro") as PlanId;
  if (!["free", "pro", "business"].includes(planId)) {
    return { error: "無效的方案" };
  }

  // 目前 MVP：直接更新 Subscription.plan（不經 Stripe — placeholder 階段）
  // 真實金流會在 Session 4 之後接 Stripe Checkout
  await db.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      plan: planId,
      status: "active",
    },
    update: {
      plan: planId,
      status: "active",
    },
  });

  redirect("/dashboard?upgraded=" + planId);
}

export async function downgradeToFreeAction(): Promise<UpgradeState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "請先登入" };
  }

  await db.subscription.update({
    where: { userId: session.user.id },
    data: { plan: "free", status: "active" },
  });

  redirect("/dashboard?downgraded=free");
}