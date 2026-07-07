import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "升級方案 — Wealth Dashboard",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?redirect=/checkout");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-muted)]">載入中...</div>}>
      <CheckoutClient userEmail={session.user.email} />
    </Suspense>
  );
}