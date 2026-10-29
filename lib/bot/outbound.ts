// Messages to people who did not just write to us (offers to skippers, CVs to charters).
//
// WhatsApp only allows free-form messages within 24h of the recipient's last message.
// Outside that window we park the messages in `outbox` and send one approved template
// ("You have a new update from Crembers: … [Open]"). Tapping Open — or writing anything —
// reopens the window and the parked messages are delivered.
import { q } from "./db";
import { asLang, type Lang } from "./texts";
import { send, sendTemplate, type Out } from "./whatsapp";

type Build = (lang: Lang) => { messages: Out[]; notice: string };

export async function deliver(phone: string, build: Build): Promise<void> {
  const [c] = await q<{ lang: string | null; open: boolean }>(
    `select lang, coalesce(last_inbound_at > now() - interval '23 hours 30 minutes', false) as open
       from contacts where phone = $1`,
    [phone],
  );
  if (!c) return;
  const lang = asLang(c.lang);
  const { messages, notice } = build(lang);

  if (c.open) {
    for (const m of messages) await send(phone, m);
    return;
  }
  const [{ n }] = await q<{ n: number }>(`select count(*)::int as n from outbox where phone = $1`, [phone]);
  for (const m of messages) await q(`insert into outbox (phone, payload) values ($1, $2)`, [phone, JSON.stringify(m)]);
  // One template per batch is enough; later messages just join the queue.
  if (n === 0) await sendTemplate(phone, lang, notice);
}

// Called on every inbound message. Returns true if anything was waiting.
export async function flushOutbox(phone: string): Promise<boolean> {
  const rows = await q<{ payload: Out }>(
    `with d as (delete from outbox where phone = $1 returning id, payload) select payload from d order by id`,
    [phone],
  );
  for (const r of rows) await send(phone, r.payload);
  return rows.length > 0;
}

// Run `fn` over items with limited parallelism (broadcasts to many skippers).
export async function eachLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next++];
      try {
        await fn(item);
      } catch (e) {
        console.error("delivery failed", e);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}
