// End-to-end test of the whole conversation against a real (local / throwaway) database.
//   DATABASE_URL=postgres://… npm run bot:test        (WIPES that database!)
// Add VERBOSE=1 to print the full chat transcript.
import assert from "assert/strict";
import { closeDb, q } from "../lib/bot/db";
import { inbound, loadEnv, render, resetDb, type Sent } from "./harness";

loadEnv();
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? "") && !process.env.ALLOW_WIPE) {
  console.error("Refusing to wipe a non-local database. Use a local DATABASE_URL or set ALLOW_WIPE=1.");
  process.exit(1);
}
process.env.ADMIN_PHONE = "385990000000";
process.env.WHATSAPP_TEMPLATE = "crembers_update";

const A = "385911111111"; // skipper, EN — en+de, sail+cat, 8 years
const B = "385922222222"; // skipper, HR — en+hr, sail+cat, 3 years
const C = "385933333333"; // skipper, EN — German only → does not match
const D = "385944444444"; // skipper who joins after the request went out
const X = "385955555555"; // charter company, HR

const year = new Date().getFullYear() + 1;
const verbose = !!process.env.VERBOSE;

async function say(from: string, input: string): Promise<Sent[]> {
  const out = await inbound(from, input);
  if (verbose) console.log(`\n◀ ${from}: ${input}\n` + out.map(render).join("\n\n"));
  return out;
}
const body = (s: Sent) => s.payload.text?.body ?? s.payload.interactive?.body?.text ?? "";
const last = (out: Sent[]) => body(out[out.length - 1]);
const ids = (s: Sent): string[] =>
  s.payload.interactive?.action?.buttons?.map((b: any) => b.reply.id) ??
  s.payload.interactive?.action?.sections?.[0]?.rows?.map((r: any) => r.id) ??
  [];

async function skipperCv(phone: string, lang: "en" | "hr", answers: string[]) {
  await say(phone, "Hi");
  await say(phone, `[lang:${lang}]`);
  await say(phone, "[role:skipper]");
  let out: Sent[] = [];
  for (const a of answers) out = await say(phone, a);
  return out;
}

async function main() {
  await resetDb();

  // ── skipper A, with a few wrong answers on the way ──
  let out = await say(A, "Hello");
  assert.deepEqual(ids(out[0]), ["lang:en", "lang:hr"]);
  await say(A, "[lang:en]");
  out = await say(A, "[role:skipper]");
  assert.match(body(out[1]), /\(1\/10\).*full name/);
  await say(A, "Ante Anić");
  out = await say(A, "1700");
  assert.match(body(out[0]), /between 1940 and/);
  await say(A, "1985");
  await say(A, "Croatian");
  out = await say(A, "not-an-email");
  assert.match(body(out[0]), /email/);
  await say(A, "ante@example.com");
  out = await say(A, "1, 99");
  assert.match(body(out[0]), /option numbers/);
  out = await say(A, "1 2");
  assert.deepEqual(ids(out[0]), ["choice:hr_b", "choice:yacht", "choice:icc", "choice:rya", "choice:other"]);
  await say(A, "[choice:icc]");
  await say(A, "8");
  await say(A, "1,2");
  await say(A, "Split");
  out = await say(A, "-");
  assert.match(body(out[0]), /CV is saved/);
  assert.match(body(out[0]), /English, German/);

  // ── skipper B (Croatian), choices typed as numbers ──
  out = await skipperCv(B, "hr", ["Boris Babić", "1990", "Hrvatsko", "boris@example.com", "1,4", "1", "3", "1,2", "Zadar", "Dugogodišnji skiper."]);
  assert.match(body(out[0]), /CV je spremljen/);

  // ── skipper C, German only ──
  await skipperCv(C, "en", ["Claus", "1980", "German", "c@example.com", "2", "3", "20", "2", "Pula", "-"]);

  // ── charter X ──
  await say(X, "Bok");
  await say(X, "[lang:hr]");
  out = await say(X, "[role:charter]");
  assert.match(body(out[1]), /Naziv tvrtke/);
  await say(X, "Adria Charter d.o.o.");
  await say(X, "Ivana");
  out = await say(X, "ivana@adria.hr");
  assert.match(body(out[0]), /Baza \/ marina/);
  await say(X, "ACI Marina Split");
  out = await say(X, "01.01.2000");
  assert.match(body(out[0]), /prošao/);
  await say(X, `12.07.${year}`);
  out = await say(X, `10.07.${year}`);
  assert.match(body(out[0]), /Check-out mora biti nakon/);
  out = await say(X, `19.07.${year}`);
  assert.deepEqual(ids(out[0]).length, 4); // boat types → list
  await say(X, "[choice:cat]");
  await say(X, "Lagoon 42");
  await say(X, "1");
  await say(X, "3");
  await say(X, "1300 EUR/tjedan");
  out = await say(X, "Obiteljski charter, 6 osoba.");
  assert.deepEqual(ids(out[0]), ["draft:send", "draft:restart", "draft:cancel"]);
  assert.match(body(out[0]), /Adria Charter/);

  out = await say(X, "[draft:send]");
  const offers = out.filter((s) => ids(s).includes("offer:accept:1"));
  assert.deepEqual(offers.map((s) => s.to).sort(), [A, B], "A and B match, C (German only) does not");
  assert.ok(!body(offers[0]).includes("Adria Charter"), "skippers don't see the company name");
  assert.match(body(out.find((s) => s.to === X)!), /poslan je skiperima koji mu odgovaraju \(\*2\*\)/);
  assert.ok(out.some((s) => s.to === "385990000000" && s.payload.type === "template"), "admin notified via template");

  // ── A accepts → X gets A's CV ──
  out = await say(A, "[offer:accept:1]");
  assert.match(body(out[0]), /applied for offer #1/);
  const cv = out.find((s) => s.to === X)!;
  assert.match(body(cv), /Skiper je prihvatio vaš upit #1/);
  assert.match(body(cv), /Ante Anić/);
  assert.match(body(cv), /wa\.me\/385911111111/);
  out = await say(A, "[offer:accept:1]");
  assert.match(body(out[0]), /already accepted/);

  // ── B edits the CV from the offer, then declines ──
  out = await say(B, "[offer:edit:1]");
  assert.ok(ids(out[0]).includes("edit:cv:experience_years:1"));
  await say(B, "[edit:cv:experience_years:1]");
  out = await say(B, "10");
  assert.match(body(out[0]), /Ažurirano/);
  assert.deepEqual(ids(out[1]), ["offer:accept:1", "offer:decline:1", "offer:edit:1"], "offer shown again");
  out = await say(B, "[offer:decline:1]");
  assert.match(body(out[0]), /odbili ste ponudu #1/);
  assert.equal((await q(`select experience_years from skippers where phone = $1`, [B]))[0].experience_years, 10);

  // ── X is outside the 24h window; D joins later and accepts ──
  await q(`update contacts set last_inbound_at = now() - interval '2 days' where phone = $1`, [X]);
  out = await skipperCv(D, "en", ["Dino", "1995", "Slovenian", "d@example.com", "1", "4", "5", "2", "Rovinj", "-"]);
  assert.ok(out.some((s) => s.to === D && ids(s).includes("offer:accept:1")), "late skipper gets the open request");
  out = await say(D, "[offer:accept:1]");
  const tpl = out.find((s) => s.to === X)!;
  assert.equal(tpl.payload.type, "template", "outside the window → template");
  assert.equal(tpl.payload.template.language.code, "hr");
  assert.equal((await q(`select count(*)::int n from outbox where phone = $1`, [X]))[0].n, 1);
  out = await say(X, "[notify:open]");
  assert.equal(out.length, 1);
  assert.match(body(out[0]), /Dino/);

  // ── X: my requests, stats, close ──
  out = await say(X, "[my:offers]");
  assert.deepEqual(ids(out[0]), ["myoffer:1"]);
  out = await say(X, "[myoffer:1]");
  assert.match(body(out[0]), /Poslano 3 · ✅ 2 prihvatilo · ❌ 1 odbilo · ⏳ 0 čeka/);
  out = await say(X, "[close:1]");
  assert.match(body(out[0]), /zatvoren/);
  out = await say(B, "[offer:accept:1]");
  assert.match(body(out[0]), /više nije dostupna/);

  // ── menu, pause, typed command, duplicate delivery ──
  out = await say(A, "menu");
  assert.ok(ids(out[0]).includes("cv:pause"));
  await say(A, "[cv:pause]");
  assert.equal((await q(`select active from skippers where phone = $1`, [A]))[0].active, false);
  const before = (await q(`select count(*)::int n from processed_messages`))[0].n;
  assert.equal((await inbound(A, "hi", "wamid.dup")).length > 0, true);
  assert.equal((await inbound(A, "hi", "wamid.dup")).length, 0, "same message id is ignored");
  assert.equal((await q(`select count(*)::int n from processed_messages`))[0].n, before + 1);

  // ── delete ──
  out = await say(B, "Obriši");
  assert.deepEqual(ids(out[0]), ["del:yes", "del:no"]);
  await say(B, "[del:yes]");
  assert.equal((await q(`select count(*)::int n from skippers where phone = $1`, [B]))[0].n, 0);
  out = await say(B, "Hi again");
  assert.deepEqual(ids(out[0]), ["lang:en", "lang:hr"], "starts over");

  console.log("✓ all bot scenarios passed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
