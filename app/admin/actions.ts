"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, requireAdmin, safeEqual, sessionToken, tokenFor } from "@/lib/admin/auth";
import { q } from "@/lib/bot/db";
import { send } from "@/lib/bot/whatsapp";

export async function login(form: FormData) {
  const token = sessionToken();
  const given = String(form.get("password") ?? "");
  if (!token || !safeEqual(tokenFor(given), token)) {
    await new Promise((r) => setTimeout(r, 1000)); // slows down guessing
    redirect("/admin/login?e=1");
  }
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
  redirect("/admin/login");
}

// Replying takes the chat over: the bot stays silent for this person until "Return to bot".
export async function reply(phone: string, text: string): Promise<{ error?: string }> {
  await requireAdmin();
  const body = text.trim();
  if (!body) return { error: "Poruka je prazna." };
  if (body.length > 4096) return { error: "Poruka je preduga (najviše 4096 znakova)." };
  const [c] = await q<{ open: boolean }>(
    `select coalesce(last_inbound_at > now() - interval '24 hours', false) as open from contacts where phone = $1`,
    [phone],
  );
  if (!c) return { error: "Kontakt ne postoji." };
  if (!c.open) return { error: "Prošlo je više od 24 sata od zadnje poruke te osobe — WhatsApp dopušta samo template poruke." };
  try {
    await send(phone, { type: "text", text: body }, "admin");
  } catch (e) {
    return { error: `WhatsApp je odbio poruku: ${(e as Error).message}` };
  }
  await q(`update contacts set human = true, admin_read_at = now() where phone = $1`, [phone]);
  revalidatePath(`/admin/${phone}`);
  return {};
}

export async function setHuman(phone: string, human: boolean) {
  await requireAdmin();
  await q(`update contacts set human = $2 where phone = $1`, [phone, human]);
  revalidatePath(`/admin/${phone}`);
  revalidatePath("/admin");
}
