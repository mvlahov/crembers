// WhatsApp Cloud API: outgoing messages, webhook parsing, signature check.
import { createHmac, timingSafeEqual } from "crypto";
import { q } from "./db";

export type Out =
  | { type: "text"; text: string }
  | { type: "buttons"; text: string; buttons: { id: string; title: string }[] }
  | { type: "list"; text: string; button: string; rows: { id: string; title: string; description?: string }[] };

export type Inbound = {
  id: string;
  from: string;
  name?: string;
  text?: string; // typed text
  reply?: string; // id of a tapped button / list row / template quick reply
  label?: string; // title of that button / row, as the person saw it
  media?: string; // type of a message the bot can't read (image, audio, …)
};

export type Author = "bot" | "admin";

// Payload of the template quick-reply button ("Open"); tapping it flushes the outbox.
export const NOTIFY_PAYLOAD = "notify:open";

export type Transport = (to: string, payload: Record<string, unknown>) => Promise<void>;

const env = (k: string, d = "") => process.env[k] ?? d;

const graphTransport: Transport = async (to, payload) => {
  const url = `https://graph.facebook.com/${env("WHATSAPP_API_VERSION", "v23.0")}/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, ...payload }),
  });
  if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${await res.text()}`);
};

let transport: Transport = graphTransport;

// Tests and the local simulator swap the real API for a fake one.
export function setTransport(t: Transport): void {
  transport = t;
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function toPayload(out: Out): Record<string, unknown> {
  if (out.type === "text") return { type: "text", text: { body: clip(out.text, 4096), preview_url: false } };
  if (out.type === "buttons")
    return {
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: clip(out.text, 1024) },
        action: {
          buttons: out.buttons.slice(0, 3).map((b) => ({ type: "reply", reply: { id: b.id, title: clip(b.title, 20) } })),
        },
      },
    };
  return {
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: clip(out.text, 1024) },
      action: {
        button: clip(out.button, 20),
        sections: [
          {
            title: clip(out.button, 24),
            rows: out.rows.slice(0, 10).map((r) => ({
              id: r.id,
              title: clip(r.title, 24),
              ...(r.description ? { description: clip(r.description, 72) } : {}),
            })),
          },
        ],
      },
    },
  };
}

// Plain-text version of a message, as stored for the admin inbox.
export function describe(out: Out): string {
  if (out.type === "text") return out.text;
  if (out.type === "buttons") return `${out.text}\n${out.buttons.map((b) => `[${b.title}]`).join(" ")}`;
  return `${out.text}\n≡ ${out.rows.map((r) => r.title).join(" · ")}`;
}

// Store a message in the history. Never fails the caller; skips unknown / deleted contacts.
export async function logMessage(phone: string, direction: "in" | "out", author: "user" | Author, body: string) {
  await q(
    `insert into messages (phone, direction, author, body)
     select $1, $2, $3, $4 where exists (select 1 from contacts where phone = $1)`,
    [phone, direction, author, body],
  ).catch((e) => console.error("message log failed", e));
}

export async function send(to: string, out: Out, author: Author = "bot"): Promise<void> {
  await transport(to, toPayload(out));
  await logMessage(to, "out", author, describe(out));
}

// Template message: the only thing WhatsApp lets you send outside the 24h window.
// Returns false when no template is configured.
export async function sendTemplate(to: string, lang: string, notice: string): Promise<boolean> {
  const name = env("WHATSAPP_TEMPLATE", "crembers_update");
  if (!name) return false;
  await transport(to, {
    type: "template",
    template: {
      name,
      language: { code: lang },
      components: [
        // Template parameters may not contain newlines or long runs of spaces.
        { type: "body", parameters: [{ type: "text", text: clip(notice.replace(/\s+/g, " ").trim(), 200) }] },
        { type: "button", sub_type: "quick_reply", index: "0", parameters: [{ type: "payload", payload: NOTIFY_PAYLOAD }] },
      ],
    },
  });
  await logMessage(to, "out", "bot", `📨 Template: ${notice}`);
  return true;
}

export function parseWebhook(body: any): Inbound[] {
  const out: Inbound[] = [];
  for (const entry of body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value ?? {};
      const names = new Map<string, string>();
      for (const c of value.contacts ?? []) names.set(c.wa_id, c.profile?.name);
      for (const m of value.messages ?? []) {
        const msg: Inbound = { id: m.id, from: m.from, name: names.get(m.from) };
        if (m.type === "text") msg.text = m.text?.body;
        else if (m.type === "interactive") {
          const r = m.interactive?.button_reply ?? m.interactive?.list_reply;
          msg.reply = r?.id;
          msg.label = r?.title;
        } else if (m.type === "button") {
          msg.reply = m.button?.payload;
          msg.label = m.button?.text;
        } else msg.media = m.type;
        out.push(msg);
      }
    }
  }
  return out;
}

export function verifySignature(raw: string, header: string | null, secret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"));
  const given = Buffer.from(header.slice(7));
  return expected.length === given.length && timingSafeEqual(expected, given);
}
