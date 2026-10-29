// The conversation logic: every inbound WhatsApp message ends up in handleInbound().
//
// Skipper:  language → role → CV form → waits for offers → Accept / Decline / Edit CV
// Charter:  language → role → company form → request form → confirm → broadcast to
//           every matching skipper → receives the CV of each skipper who accepts
import { q } from "./db";
import { dates, formatCv, formatOffer, type Offer, type Skipper } from "./format";
import { ask, CHARTER_FORM, CV_FORM, FORMS, parse, showDate, type FormId } from "./forms";
import { deliver, eachLimit, flushOutbox } from "./outbound";
import { asLang, command, t, type Lang } from "./texts";
import { NOTIFY_PAYLOAD, send, type Inbound, type Out } from "./whatsapp";

type Role = "skipper" | "charter";
type FormState = { form: FormId; i: number; draft: Record<string, unknown>; only?: string; offerId?: number };
type Contact = {
  phone: string;
  name: string | null;
  lang: Lang | null;
  role: Role | null;
  state: string;
  state_data: any;
};

const L = (c: Contact): Lang => asLang(c.lang);
const say = (c: Contact, out: Out) => send(c.phone, out);
const text = (s: string): Out => ({ type: "text", text: s });
// Run a handler and report the reply as handled.
const done = async (p: Promise<unknown>) => (await p, true);
const today = () => new Date().toISOString().slice(0, 10);

async function setState(c: Contact, state: string, data: object = {}): Promise<void> {
  c.state = state;
  c.state_data = data;
  await q(`update contacts set state = $2, state_data = $3 where phone = $1`, [c.phone, state, JSON.stringify(data)]);
}

const getSkipper = async (phone: string) => (await q<Skipper>(`select * from skippers where phone = $1`, [phone]))[0];
const getCharter = async (phone: string) =>
  (await q<{ company: string; contact_name: string; email: string }>(`select * from charters where phone = $1`, [phone]))[0];
const getOffer = async (id: number) => (await q<Offer>(`select * from offers where id = $1`, [id]))[0];

// ── entry point ─────────────────────────────────────────────────────────────

export async function handleInbound(m: Inbound): Promise<void> {
  // WhatsApp may deliver the same webhook more than once.
  const fresh = await q(`insert into processed_messages (id) values ($1) on conflict do nothing returning id`, [m.id]);
  if (!fresh.length) return;

  const [c] = await q<Contact>(
    `insert into contacts (phone, name, last_inbound_at) values ($1, $2, now())
     on conflict (phone) do update set name = coalesce(excluded.name, contacts.name), last_inbound_at = now()
     returning phone, name, lang, role, state, state_data`,
    [m.from, m.name ?? null],
  );

  try {
    const hadQueued = await flushOutbox(c.phone);
    if (m.reply === NOTIFY_PAYLOAD) {
      if (!hadQueued) await showMenu(c);
      return;
    }
    await route(c, m);
  } catch (e) {
    console.error("bot error", m.from, e);
    await say(c, text(t(L(c), "error"))).catch(() => {});
  }
}

async function route(c: Contact, m: Inbound): Promise<void> {
  const reply = m.reply ?? "";
  const typed = m.text?.trim() ?? "";
  const cmd = typed ? command(typed) : null;

  if (cmd === "delete" || reply === "menu:delete") return askDelete(c);
  if (reply === "del:yes") return deleteContact(c);
  if (reply.startsWith("lang:")) return setLang(c, reply.slice(5));
  if (!c.lang) {
    const guess = ({ hr: "hr", hrvatski: "hr", croatian: "hr", en: "en", english: "en" } as Record<string, string>)[typed.toLowerCase()];
    return guess ? setLang(c, guess) : askLang(c);
  }
  if (reply.startsWith("role:") && !c.role) return setRole(c, reply.slice(5) as Role);
  if (!c.role) return askRole(c);
  if (cmd === "menu" || reply === "menu" || reply === "del:no") return showMenu(c, true);

  if (reply && !reply.startsWith("choice:") && (await handleReply(c, reply))) return;
  if (c.state === "form") return answerForm(c, { text: m.text, reply: m.reply });
  if (c.state === "offer_confirm") return askConfirm(c);
  return showMenu(c);
}

// ── language, role, delete ──────────────────────────────────────────────────

async function askLang(c: Contact) {
  await setState(c, "lang");
  await say(c, {
    type: "buttons",
    text: t("en", "langPrompt"),
    buttons: [
      { id: "lang:en", title: "English" },
      { id: "lang:hr", title: "Hrvatski" },
    ],
  });
}

async function setLang(c: Contact, lang: string) {
  c.lang = asLang(lang);
  await q(`update contacts set lang = $2 where phone = $1`, [c.phone, c.lang]);
  return c.role ? showMenu(c) : askRole(c);
}

async function askRole(c: Contact) {
  await setState(c, "role");
  await say(c, {
    type: "buttons",
    text: t(L(c), "rolePrompt"),
    buttons: [
      { id: "role:skipper", title: t(L(c), "btnSkipper") },
      { id: "role:charter", title: t(L(c), "btnCharter") },
    ],
  });
}

async function setRole(c: Contact, role: Role) {
  if (role !== "skipper" && role !== "charter") return askRole(c);
  c.role = role;
  await q(`update contacts set role = $2 where phone = $1`, [c.phone, role]);
  if (role === "skipper") {
    await say(c, text(t(L(c), "skipperIntro", { n: CV_FORM.length })));
    return startForm(c, "cv");
  }
  await say(c, text(t(L(c), "charterIntro")));
  return startForm(c, "charter");
}

async function askDelete(c: Contact) {
  await say(c, {
    type: "buttons",
    text: t(L(c), "deleteConfirm"),
    buttons: [
      { id: "del:yes", title: t(L(c), "btnDeleteYes") },
      { id: "del:no", title: t(L(c), "btnDeleteNo") },
    ],
  });
}

async function deleteContact(c: Contact) {
  // A deleted charter's open requests can no longer be answered.
  await q(`update offers set status = 'closed' where charter_phone = $1`, [c.phone]);
  await q(`delete from contacts where phone = $1`, [c.phone]); // cascades to CV, outbox, recipients
  await say(c, text(t(L(c), "deleted")));
}

// ── menu ────────────────────────────────────────────────────────────────────

async function showMenu(c: Contact, explicit = false): Promise<void> {
  const lang = L(c);
  const st = c.state_data as FormState;
  const profileForm: FormId = c.role === "skipper" ? "cv" : "charter";
  const profile = c.role === "skipper" ? (await getSkipper(c.phone))?.complete : !!(await getCharter(c.phone));

  // No menu until the profile exists: continue (or restart) the profile form.
  if (!profile) {
    if (c.state === "form" && st.form === profileForm && !st.only) return askCurrent(c, explicit ? undefined : "cvIncomplete");
    return startForm(c, profileForm);
  }
  await setState(c, "idle");

  if (c.role === "skipper") {
    const s = (await getSkipper(c.phone))!;
    return say(c, {
      type: "list",
      text: `${t(lang, "menuText")}\n${t(lang, s.active ? "menuOffersActive" : "menuOffersPaused")}`,
      button: t(lang, "menuButton"),
      rows: [
        { id: "cv:show", title: t(lang, "rowShowCv") },
        { id: "cv:edit", title: t(lang, "rowEditCv") },
        s.active ? { id: "cv:pause", title: t(lang, "rowPause") } : { id: "cv:resume", title: t(lang, "rowResume") },
        { id: "menu:lang", title: t(lang, "rowLang") },
        { id: "menu:delete", title: t(lang, "rowDelete") },
      ],
    });
  }
  return say(c, {
    type: "list",
    text: t(lang, "menuText"),
    button: t(lang, "menuButton"),
    rows: [
      { id: "new:offer", title: t(lang, "rowNewOffer") },
      { id: "my:offers", title: t(lang, "rowMyOffers") },
      { id: "charter:edit", title: t(lang, "rowCompany") },
      { id: "menu:lang", title: t(lang, "rowLang") },
      { id: "menu:delete", title: t(lang, "rowDelete") },
    ],
  });
}

// Button / list replies. Returns false for anything it does not recognise.
async function handleReply(c: Contact, reply: string): Promise<boolean> {
  const [kind, a, b, d] = reply.split(":");
  const lang = L(c);
  const skipper = c.role === "skipper";

  if (reply === "menu:lang") return done(askLang(c));

  if (skipper) {
    if (reply === "cv:show") {
      const s = await getSkipper(c.phone);
      if (!s?.complete) return done(showMenu(c));
      await say(c, text(`${t(lang, "cvTitle")}\n\n${formatCv(s, lang)}`));
      return done(showMenu(c));
    }
    if (reply === "cv:edit") return done(editList(c));
    if (reply === "cv:pause" || reply === "cv:resume") {
      const active = reply === "cv:resume";
      await q(`update skippers set active = $2 where phone = $1`, [c.phone, active]);
      await say(c, text(t(lang, active ? "resumed" : "paused")));
      if (active) await catchUpOffers(c.phone);
      return done(showMenu(c));
    }
    if (kind === "offer" && ["accept", "decline", "edit"].includes(a)) {
      const id = Number(b);
      if (a === "accept") await acceptOffer(c, id);
      else if (a === "decline") await declineOffer(c, id);
      else await editList(c, id);
      return true;
    }
    if (kind === "edit" && a === "cv" && CV_FORM.some((f) => f.key === b)) {
      const s = await getSkipper(c.phone);
      await startForm(c, "cv", { draft: { ...s }, only: b, offerId: d ? Number(d) : undefined });
      return true;
    }
    return false;
  }

  // charter
  if (reply === "new:offer") return done(startForm(c, "offer"));
  if (reply === "my:offers") return done(myOffers(c));
  if (reply === "charter:edit") {
    await say(c, {
      type: "list",
      text: t(lang, "menuText"),
      button: t(lang, "editButton"),
      rows: CHARTER_FORM.map((f) => ({ id: `edit:charter:${f.key}`, title: f.label[lang] })),
    });
    return true;
  }
  if (kind === "edit" && a === "charter" && CHARTER_FORM.some((f) => f.key === b)) {
    await startForm(c, "charter", { draft: { ...(await getCharter(c.phone)) }, only: b });
    return true;
  }
  if (kind === "myoffer") return done(viewOffer(c, Number(a)));
  if (kind === "close") return done(closeOffer(c, Number(a)));
  if (kind === "draft") {
    if (c.state !== "offer_confirm") return done(showMenu(c));
    if (a === "send") return done(sendOffer(c));
    if (a === "restart") return done(startForm(c, "offer"));
    await setState(c, "idle");
    await say(c, text(t(lang, "draftCancelled")));
    return done(showMenu(c));
  }
  return false;
}

// ── forms ───────────────────────────────────────────────────────────────────

async function startForm(c: Contact, form: FormId, opts: { draft?: object; only?: string; offerId?: number } = {}) {
  const i = opts.only ? FORMS[form].findIndex((f) => f.key === opts.only) : 0;
  const st: FormState = { form, i, draft: { ...opts.draft }, only: opts.only, offerId: opts.offerId };
  await setState(c, "form", st);
  return askCurrent(c);
}

async function askCurrent(c: Contact, note?: "cvIncomplete") {
  const st = c.state_data as FormState;
  const fields = FORMS[st.form];
  if (note) await say(c, text(t(L(c), note)));
  return say(c, ask(fields[st.i], L(c), st.only ? undefined : { i: st.i + 1, n: fields.length }, st.only ? "hintEditCancel" : undefined));
}

async function answerForm(c: Contact, input: { text?: string; reply?: string }) {
  const st = c.state_data as FormState;
  const fields = FORMS[st.form];
  const field = fields[st.i];
  if (!field) return showMenu(c);

  const r = parse(field, input, L(c), st.draft);
  if (!r.ok) {
    await say(c, text(r.error));
    return askCurrent(c);
  }
  st.draft[field.key] = r.value;
  if (st.only) return finishEdit(c, st, field.key, r.value);

  st.i += 1;
  if (st.i < fields.length) {
    await setState(c, "form", st);
    return askCurrent(c);
  }
  return finishForm(c, st);
}

async function finishForm(c: Contact, st: FormState) {
  const lang = L(c);
  const d = st.draft;
  if (st.form === "cv") {
    const cols = CV_FORM.map((f) => f.key);
    await q(
      `insert into skippers (phone, ${cols.join(", ")}, complete) values ($1, ${cols.map((_, i) => `$${i + 2}`).join(", ")}, true)
       on conflict (phone) do update set ${cols.map((k) => `${k} = excluded.${k}`).join(", ")}, complete = true, updated_at = now()`,
      [c.phone, ...cols.map((k) => d[k] ?? null)],
    );
    await setState(c, "idle");
    const s = (await getSkipper(c.phone))!;
    await say(c, text(`${t(lang, "cvSaved")}\n\n${formatCv(s, lang)}`));
    await catchUpOffers(c.phone);
    return;
  }
  if (st.form === "charter") {
    await q(
      `insert into charters (phone, company, contact_name, email) values ($1, $2, $3, $4)
       on conflict (phone) do update set company = $2, contact_name = $3, email = $4, updated_at = now()`,
      [c.phone, d.company, d.contact_name, d.email],
    );
    return startForm(c, "offer");
  }
  await setState(c, "offer_confirm", { draft: d });
  return askConfirm(c);
}

// Changing one field of an existing CV / company profile.
async function finishEdit(c: Contact, st: FormState, key: string, value: unknown) {
  const table = st.form === "cv" ? "skippers" : "charters";
  await q(`update ${table} set ${key} = $2, updated_at = now() where phone = $1`, [c.phone, value]);
  await setState(c, "idle");
  await say(c, text(t(L(c), "updated")));

  if (st.form !== "cv") return showMenu(c);
  if (st.offerId) {
    // Came here from an offer: show it again so they can answer.
    const [r] = await q(`select status from offer_recipients where offer_id = $1 and skipper_phone = $2`, [st.offerId, c.phone]);
    const o = await getOffer(st.offerId);
    if (r && r.status !== "accepted" && o && isOpen(o)) return say(c, offerMessage(o, L(c)));
  }
  await say(c, text(`${t(L(c), "cvTitle")}\n\n${formatCv((await getSkipper(c.phone))!, L(c))}`));
  await catchUpOffers(c.phone);
}

async function editList(c: Contact, offerId?: number) {
  const lang = L(c);
  await say(c, {
    type: "list",
    text: t(lang, "editPick"),
    button: t(lang, "editButton"),
    rows: CV_FORM.map((f) => ({ id: `edit:cv:${f.key}${offerId ? `:${offerId}` : ""}`, title: f.label[lang] })),
  });
}

// ── charter: requests ───────────────────────────────────────────────────────

async function askConfirm(c: Contact) {
  const lang = L(c);
  const draft = c.state_data.draft;
  const company = (await getCharter(c.phone))?.company ?? null;
  await say(c, {
    type: "buttons",
    text: t(lang, "confirmOffer", { summary: formatOffer({ ...draft, company }, lang, true) }),
    buttons: [
      { id: "draft:send", title: t(lang, "btnSend") },
      { id: "draft:restart", title: t(lang, "btnRestart") },
      { id: "draft:cancel", title: t(lang, "btnCancel") },
    ],
  });
}

const MATCH = `
  s.complete and s.active and c.role = 'skipper'
  and s.languages @> o.languages
  and o.boat_type = any (s.boat_types)
  and coalesce(s.experience_years, 0) >= o.min_experience`;

const isOpen = (o: Offer) => o.status === "open" && o.check_in > today();

async function sendOffer(c: Contact) {
  const lang = L(c);
  const d = c.state_data.draft;
  const charter = await getCharter(c.phone);
  const [o] = await q<Offer>(
    `insert into offers (charter_phone, company, base, check_in, check_out, boat_type, boat, languages, min_experience, fee, notes)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning *`,
    [c.phone, charter?.company ?? null, d.base, d.check_in, d.check_out, d.boat_type, d.boat ?? null, d.languages ?? [], d.min_experience ?? 0, d.fee ?? null, d.notes ?? null],
  );
  await setState(c, "idle");

  const recipients = await q<{ phone: string }>(
    `select s.phone from offers o, skippers s join contacts c on c.phone = s.phone
      where o.id = $1 and s.phone <> o.charter_phone and ${MATCH}`,
    [o.id],
  );
  await eachLimit(recipients, 8, (r) => offerTo(r.phone, o));

  await say(c, text(t(lang, recipients.length ? "offerSent" : "offerNoMatch", { id: o.id, n: recipients.length })));
  await notifyAdmin((l) => t(l, "adminNewOffer", { id: o.id, company: o.company ?? "?", n: recipients.length, summary: formatOffer(o, l, true) }), o.id);
}

// Send one offer to one skipper (records it, respects the 24h window).
async function offerTo(phone: string, o: Offer) {
  const added = await q(
    `insert into offer_recipients (offer_id, skipper_phone) values ($1, $2) on conflict do nothing returning offer_id`,
    [o.id, phone],
  );
  if (!added.length) return;
  await deliver(phone, (lang) => ({
    messages: [offerMessage(o, lang)],
    notice: t(lang, "noticeOffer", { id: o.id, dates: dates(o), base: o.base }),
  }));
}

function offerMessage(o: Offer, lang: Lang): Out {
  return {
    type: "buttons",
    text: `${t(lang, "offerHeader", { id: o.id })}\n\n${formatOffer(o, lang)}\n\n${t(lang, "offerFooter")}`,
    buttons: [
      { id: `offer:accept:${o.id}`, title: t(lang, "btnAccept") },
      { id: `offer:decline:${o.id}`, title: t(lang, "btnDecline") },
      { id: `offer:edit:${o.id}`, title: t(lang, "btnEditCv") },
    ],
  };
}

// A skipper who just finished / changed their CV or resumed gets still-open matching offers.
async function catchUpOffers(phone: string) {
  const offers = await q<Offer>(
    `select o.* from offers o, skippers s join contacts c on c.phone = s.phone
      where s.phone = $1 and o.status = 'open' and o.check_in > current_date
        and o.charter_phone is distinct from s.phone and ${MATCH}
        and not exists (select 1 from offer_recipients r where r.offer_id = o.id and r.skipper_phone = s.phone)
      order by o.check_in limit 5`,
    [phone],
  );
  for (const o of offers) await offerTo(phone, o);
}

type OfferRow = Offer & { sent: number; acc: number; dec: number };

async function myOffers(c: Contact) {
  const lang = L(c);
  const rows = await q<OfferRow>(
    `select o.*, count(r.*)::int as sent,
            count(*) filter (where r.status = 'accepted')::int as acc,
            count(*) filter (where r.status = 'declined')::int as dec
       from offers o left join offer_recipients r on r.offer_id = o.id
      where o.charter_phone = $1 group by o.id order by o.created_at desc limit 10`,
    [c.phone],
  );
  if (!rows.length) {
    await say(c, text(t(lang, "myOffersEmpty")));
    return showMenu(c);
  }
  await say(c, {
    type: "list",
    text: t(lang, "myOffersText"),
    button: t(lang, "myOffersButton"),
    rows: rows.map((o) => ({
      id: `myoffer:${o.id}`,
      title: `#${o.id} ${showDate(o.check_in).slice(0, 5)} ${o.base}`,
      description: isOpen(o) ? `✅ ${o.acc} · ❌ ${o.dec} · ⏳ ${o.sent - o.acc - o.dec}` : t(lang, "offerClosedTag"),
    })),
  });
}

async function viewOffer(c: Contact, id: number) {
  const lang = L(c);
  const [o] = await q<OfferRow>(
    `select o.*, count(r.*)::int as sent,
            count(*) filter (where r.status = 'accepted')::int as acc,
            count(*) filter (where r.status = 'declined')::int as dec
       from offers o left join offer_recipients r on r.offer_id = o.id
      where o.id = $1 and o.charter_phone = $2 group by o.id`,
    [id, c.phone],
  );
  if (!o) return showMenu(c);
  const stats = t(lang, "offerStats", { sent: o.sent, acc: o.acc, dec: o.dec, wait: o.sent - o.acc - o.dec });
  const body = `*#${o.id}*${isOpen(o) ? "" : ` · ${t(lang, "offerClosedTag")}`}\n\n${formatOffer(o, lang, true)}\n\n${stats}`;
  await say(c, {
    type: "buttons",
    text: body,
    buttons: [
      ...(isOpen(o) ? [{ id: `close:${o.id}`, title: t(lang, "btnClose") }] : []),
      { id: "menu", title: t(lang, "btnMenu") },
    ],
  });
}

async function closeOffer(c: Contact, id: number) {
  const done = await q(`update offers set status = 'closed' where id = $1 and charter_phone = $2 returning id`, [id, c.phone]);
  if (done.length) await say(c, text(t(L(c), "closed", { id })));
  return showMenu(c);
}

// ── skipper: answering an offer ─────────────────────────────────────────────

async function acceptOffer(c: Contact, id: number) {
  const lang = L(c);
  const o = await getOffer(id);
  const [r] = await q<{ status: string }>(`select status from offer_recipients where offer_id = $1 and skipper_phone = $2`, [id, c.phone]);
  if (!o || !r || !isOpen(o)) return say(c, text(t(lang, "offerGone", { id })));
  if (r.status === "accepted") return say(c, text(t(lang, "alreadyAccepted", { id })));

  await q(`update offer_recipients set status = 'accepted', responded_at = now() where offer_id = $1 and skipper_phone = $2`, [id, c.phone]);
  await say(c, text(t(lang, "accepted", { id })));

  const s = (await getSkipper(c.phone))!;
  if (o.charter_phone) {
    await deliver(o.charter_phone, (l) => ({
      messages: [
        text(`${t(l, "cvForCharter", { id, dates: dates(o), base: o.base })}\n\n${formatCv(s, l)}\n\n${t(l, "contactSkipper", { phone: s.phone })}`),
      ],
      notice: t(l, "noticeCv", { id }),
    }));
  }
  await notifyAdmin((l) => t(l, "adminAccepted", { id, name: s.full_name ?? s.phone, company: o.company ?? "?" }), id);
}

async function declineOffer(c: Contact, id: number) {
  const lang = L(c);
  const [r] = await q<{ status: string }>(`select status from offer_recipients where offer_id = $1 and skipper_phone = $2`, [id, c.phone]);
  if (!r) return say(c, text(t(lang, "offerGone", { id })));
  if (r.status === "accepted") return say(c, text(t(lang, "alreadyAccepted", { id })));
  await q(`update offer_recipients set status = 'declined', responded_at = now() where offer_id = $1 and skipper_phone = $2`, [id, c.phone]);
  await say(c, text(t(lang, "declined", { id })));
}

// ── owner notifications ─────────────────────────────────────────────────────

// ADMIN_PHONE (digits, e.g. 385911234567) gets a short note about new requests and acceptances.
async function notifyAdmin(msg: (lang: Lang) => string, offerId: number) {
  const admin = process.env.ADMIN_PHONE?.replace(/\D/g, "");
  if (!admin) return;
  await q(`insert into contacts (phone) values ($1) on conflict do nothing`, [admin]);
  await deliver(admin, (l) => ({ messages: [text(msg(l))], notice: t(l, "noticeAdmin", { id: offerId }) })).catch((e) =>
    console.error("admin notify failed", e),
  );
}
