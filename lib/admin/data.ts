// Queries behind the admin inbox.
import { q } from "@/lib/bot/db";
import type { Offer, Skipper } from "@/lib/bot/format";

export type Filter = "all" | "skipper" | "charter" | "human";

export type ConversationRow = {
  phone: string;
  name: string | null;
  role: "skipper" | "charter" | null;
  display: string | null;
  human: boolean;
  last_body: string;
  last_author: "user" | "bot" | "admin";
  last_at: string;
  unread: boolean;
  window_open: boolean;
};

const WINDOW = `coalesce(c.last_inbound_at > now() - interval '24 hours', false)`;

export async function listConversations(filter: Filter): Promise<ConversationRow[]> {
  const where =
    filter === "skipper" ? `and c.role = 'skipper'` : filter === "charter" ? `and c.role = 'charter'` : filter === "human" ? `and c.human` : "";
  return q<ConversationRow>(
    `select c.phone, c.name, c.role, c.human, coalesce(s.full_name, ch.company) as display,
            m.body as last_body, m.author as last_author, m.created_at as last_at,
            coalesce(c.last_inbound_at > coalesce(c.admin_read_at, 'epoch'), false) as unread,
            ${WINDOW} as window_open
       from contacts c
       left join skippers s on s.phone = c.phone
       left join charters ch on ch.phone = c.phone
       join lateral (select body, author, created_at from messages where phone = c.phone order by id desc limit 1) m on true
      where true ${where}
      order by m.created_at desc
      limit 200`,
  );
}

export type Message = { id: number; direction: "in" | "out"; author: "user" | "bot" | "admin"; body: string; created_at: string };

export type ConversationDetail = {
  contact: {
    phone: string;
    name: string | null;
    role: "skipper" | "charter" | null;
    lang: string | null;
    state: string;
    human: boolean;
    window_open: boolean;
    window_closes: string | null;
  };
  messages: Message[];
  skipper?: Skipper;
  charter?: { company: string | null; contact_name: string | null; email: string | null };
  offers: (Offer & { recipient_status?: string; sent?: number; acc?: number; dec?: number })[];
};

export async function getConversation(phone: string): Promise<ConversationDetail | null> {
  const [contact] = await q<ConversationDetail["contact"]>(
    `select phone, name, role, lang, state, human, ${WINDOW} as window_open,
            c.last_inbound_at + interval '24 hours' as window_closes
       from contacts c where phone = $1`,
    [phone],
  );
  if (!contact) return null;
  const messages = (
    await q<Message>(`select * from (select * from messages where phone = $1 order by id desc limit 300) m order by id`, [phone])
  );
  const [skipper] = await q<Skipper>(`select * from skippers where phone = $1`, [phone]);
  const [charter] = await q<ConversationDetail["charter"] & {}>(`select company, contact_name, email from charters where phone = $1`, [phone]);
  const offers =
    contact.role === "charter"
      ? await q(
          `select o.*, count(r.*)::int as sent,
                  count(*) filter (where r.status = 'accepted')::int as acc,
                  count(*) filter (where r.status = 'declined')::int as dec
             from offers o left join offer_recipients r on r.offer_id = o.id
            where o.charter_phone = $1 group by o.id order by o.created_at desc limit 20`,
          [phone],
        )
      : await q(
          `select o.*, r.status as recipient_status from offer_recipients r join offers o on o.id = r.offer_id
            where r.skipper_phone = $1 order by r.sent_at desc limit 20`,
          [phone],
        );
  return { contact, messages, skipper, charter, offers: offers as ConversationDetail["offers"] };
}

export async function markRead(phone: string): Promise<void> {
  await q(`update contacts set admin_read_at = now() where phone = $1`, [phone]);
}
