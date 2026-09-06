"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const registerSchema = z.object({
  name: z.string().min(1, "請輸入姓名").max(60),
  email: z.string().email("Email 格式錯誤"),
  password: z.string().min(8, "密碼至少 8 碼").max(100),
});

export type ActionState = {
  ok?: boolean;
  error?: string;
} | undefined;

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "輸入錯誤" };
    }
    const { name, email, password } = parsed.data;

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      return { error: "此 Email 已被註冊" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        subscription: {
          create: { plan: "free", status: "active" },
        },
      },
    });

    // 自動登入 — 用 redirect: true 讓 Auth.js 自己處理 cookie + redirect
    // 這個會 throw NEXT_REDIRECT，所以後面的程式碼不會執行
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    // 不會到這裡（被 redirect 中斷）
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { message?: string; digest?: string };
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.includes("NEXT_REDIRECT")) {
      throw e;
    }
    if (e instanceof AuthError) {
      if (e.type === "CredentialsSignin") {
        return { error: "Email 或密碼錯誤" };
      }
      return { error: "註冊成功但自動登入失敗，請手動登入" };
    }
    console.error("registerAction error:", e);
    return { error: err?.message ?? "註冊失敗" };
  }
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    if (!email || !password) {
      return { error: "請輸入 Email 與密碼" };
    }

    // 自動登入 — Auth.js 內部 throw NEXT_REDIRECT 處理 cookie + 跳轉
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { ok: true };
  } catch (e: unknown) {
    if (e instanceof AuthError) {
      if (e.type === "CredentialsSignin") {
        return { error: "Email 或密碼錯誤" };
      }
      return { error: "登入失敗，請稍後再試" };
    }
    // NEXT_REDIRECT 是正常 redirect，不是錯誤
    const err = e as { message?: string; digest?: string };
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.includes("NEXT_REDIRECT")) {
      throw e;
    }
    console.error("loginAction error:", e);
    return { error: err?.message ?? "登入失敗" };
  }
}