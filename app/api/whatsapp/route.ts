// WhatsApp Cloud API webhook. Set the callback URL in Meta to https://<domain>/api/whatsapp
import { handleInbound } from "@/lib/bot/engine";
import { parseWebhook, verifySignature } from "@/lib/bot/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Meta calls this once, when you register the webhook.
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (secret && !verifySignature(raw, req.headers.get("x-hub-signature-256"), secret)) {
    return new Response("Bad signature", { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  // Process before answering: on Vercel the function stops once the response is sent.
  // Errors are logged, not returned — a non-200 makes Meta retry the whole batch.
  for (const m of parseWebhook(body)) {
    try {
      await handleInbound(m);
    } catch (e) {
      console.error("webhook message failed", m.id, e);
    }
  }
  return new Response("OK", { status: 200 });
}
