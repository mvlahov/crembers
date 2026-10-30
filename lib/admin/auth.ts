// Admin inbox login: one password (ADMIN_PASSWORD), kept as a signed cookie.
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const COOKIE = "crembers_admin";

// Changing ADMIN_PASSWORD logs everyone out.
export function tokenFor(password: string): string {
  return createHmac("sha256", password).update("crembers-admin-v1").digest("hex");
}

export function sessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password ? tokenFor(password) : null;
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function isAdmin(): Promise<boolean> {
  const token = sessionToken();
  const value = (await cookies()).get(COOKIE)?.value;
  return !!token && !!value && safeEqual(value, token);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
