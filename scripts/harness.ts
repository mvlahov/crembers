// Shared by the local chat simulator and the test: fake WhatsApp, readable output.
import { readFileSync, existsSync } from "fs";
import { handleInbound } from "../lib/bot/engine";
import { q } from "../lib/bot/db";
import { setTransport } from "../lib/bot/whatsapp";

export function loadEnv() {
  if (existsSync(".env.local"))
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
}

export type Sent = { to: string; payload: any };
export const sent: Sent[] = [];
setTransport(async (to, payload) => {
  sent.push({ to, payload });
});

export async function resetDb() {
  await q(`drop table if exists messages, processed_messages, outbox, offer_recipients, offers, charters, skippers, contacts cascade`);
  await q(readFileSync("db/schema.sql", "utf8"));
}

let seq = 0;
// "[some:id]" taps a button / list row; anything else is typed text.
export async function inbound(from: string, input: string, id = `wamid.${process.pid}.${Date.now()}.${++seq}`): Promise<Sent[]> {
  const start = sent.length;
  const tap = input.match(/^\[(.+)\]$/);
  await handleInbound({ id, from, name: `User ${from.slice(-3)}`, ...(tap ? { reply: tap[1], label: tap[1] } : { text: input }) });
  return sent.slice(start);
}

export function render(s: Sent): string {
  const p = s.payload;
  const head = `→ ${s.to}`;
  if (p.type === "text") return `${head}\n${p.text.body}`;
  if (p.type === "template")
    return `${head} [TEMPLATE ${p.template.name}/${p.template.language.code}] "${p.template.components[0].parameters[0].text}" [Open]`;
  const i = p.interactive;
  if (i.type === "button") return `${head}\n${i.body.text}\n` + i.action.buttons.map((b: any) => `  [${b.reply.id}] ${b.reply.title}`).join("\n");
  return `${head}\n${i.body.text}\n  ≡ ${i.action.button}\n` + i.action.sections[0].rows.map((r: any) => `  [${r.id}] ${r.title}${r.description ? " — " + r.description : ""}`).join("\n");
}
