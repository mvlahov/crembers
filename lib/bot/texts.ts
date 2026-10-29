// Every message the bot sends, per language. Placeholders: {name}.
// Adding a language = adding one dictionary here plus labels in forms.ts.

export const LANGS = ["en", "hr"] as const;
export type Lang = (typeof LANGS)[number];
export type L10n = Record<Lang, string>;

const en = {
  // Sent before a language is chosen, so it is bilingual on purpose.
  langPrompt: "👋 Welcome to Crembers!\nPlease choose your language.\n\nDobrodošli u Crembers! Odaberite jezik.",

  rolePrompt: "Are you a *skipper* looking for charters, or a *charter company* looking for a skipper?",
  btnSkipper: "⛵ I'm a skipper",
  btnCharter: "🏢 Charter company",

  skipperIntro:
    "Great! I'll guide you through your CV in {n} short steps.\n\n" +
    "Your data is stored only to match you with charter offers, and is shared with a charter company " +
    "only when you accept its offer. Type *MENU* for options or *DELETE* to remove all your data at any time.",
  charterIntro:
    "Great! First a few details about your company, then the request itself.\n\n" +
    "Your request goes to every skipper in our database who matches it, and you receive the CV of " +
    "each one who accepts — right here. Type *MENU* for options or *DELETE* to remove your data.",

  progress: "({i}/{n})",
  hintSkip: "Send *-* to skip.",
  hintMulti: "Reply with the numbers, e.g. *1, 3*",
  hintDate: "Format: DD.MM.YYYY",
  hintChoose: "Choose",
  hintEditCancel: "Type *MENU* to cancel.",

  errText: "Please answer with a text message.",
  errRequired: "Please type an answer.",
  errLong: "Please keep it under {max} characters.",
  errNumber: "Please send a number between {min} and {max}.",
  errEmail: "That doesn't look like an email address.",
  errDate: "Please send a date as DD.MM.YYYY, e.g. 12.07.2027.",
  errPast: "That date is in the past.",
  errCheckout: "Check-out must be after check-in ({date}).",
  errChoice: "Please pick one of the options.",
  errMulti: "Please reply with the option numbers, e.g. 1, 3.",

  cvSaved: "✅ Your CV is saved! When a charter request that matches your profile comes in, I'll send it to you here.",
  updated: "✅ Updated.",
  cvTitle: "📄 *Your CV*",
  cvIncomplete: "Your CV isn't finished yet — let's continue.",

  menuText: "What would you like to do?",
  menuButton: "Menu",
  menuOffersActive: "Offers: active ✅",
  menuOffersPaused: "Offers: paused ⏸",
  rowShowCv: "Show my CV",
  rowEditCv: "Edit my CV",
  rowPause: "Pause offers",
  rowResume: "Resume offers",
  rowNewOffer: "New skipper request",
  rowMyOffers: "My requests",
  rowCompany: "Company details",
  rowLang: "Language / Jezik",
  rowDelete: "Delete my data",
  paused: "⏸ Paused. You won't receive offers until you resume them in the menu.",
  resumed: "▶️ You'll receive offers again.",

  editPick: "Which part of your CV do you want to change?",
  editButton: "Fields",

  offerHeader: "⛵ *New charter offer #{id}*",
  offerFooter: "If you accept, your CV and phone number are sent to the charter company, which will contact you directly.",
  btnAccept: "✅ Accept",
  btnDecline: "❌ Decline",
  btnEditCv: "✏️ Edit CV",
  accepted: "✅ You applied for offer #{id}. Your CV has been sent to the charter company — they will contact you directly. Good luck!",
  declined: "OK, you declined offer #{id}. You'll keep receiving new offers.",
  alreadyAccepted: "You have already accepted offer #{id}.",
  offerGone: "Sorry, offer #{id} is no longer available.",
  noticeOffer: "new charter offer #{id}: {dates}, {base}",

  confirmOffer: "Please check your request:\n\n{summary}\n\nSend it to all matching skippers?",
  btnSend: "📤 Send",
  btnRestart: "🔁 Start over",
  btnCancel: "✖️ Cancel",
  offerSent: "📤 Request #{id} sent to *{n}* matching skippers. You'll receive the CV of each skipper who accepts, right here.",
  offerNoMatch:
    "Request #{id} is saved, but no skipper matches it right now. Skippers who join and match will receive it " +
    "automatically while it is open. Fewer required languages or less experience widen the search.",
  draftCancelled: "Request discarded.",
  myOffersEmpty: "You have no requests yet.",
  myOffersText: "Your latest requests:",
  myOffersButton: "Requests",
  offerStats: "Sent to {sent} · ✅ {acc} accepted · ❌ {dec} declined · ⏳ {wait} waiting",
  offerClosedTag: "🔒 Closed",
  btnClose: "🔒 Close request",
  btnMenu: "Menu",
  closed: "🔒 Request #{id} is closed. Skippers can no longer apply.",
  cvForCharter: "🧑‍✈️ *A skipper accepted your request #{id}* ({dates}, {base})",
  contactSkipper: "Contact: https://wa.me/{phone}",
  noticeCv: "a skipper accepted your request #{id}",

  adminNewOffer: "📥 New request #{id} from {company} → sent to {n} skippers.\n\n{summary}",
  adminAccepted: "✅ {name} accepted request #{id} ({company}).",
  noticeAdmin: "activity on request #{id}",

  deleteConfirm: "This permanently deletes all your data (CV, requests). Are you sure?",
  btnDeleteYes: "🗑 Yes, delete",
  btnDeleteNo: "No",
  deleted: "🗑 All your data has been deleted. Send any message to start again.",
  error: "⚠️ Something went wrong. Please try again or type MENU.",
  fallback: "Type *MENU* to see what you can do.",

  // Field labels used when printing a CV or a request.
  years: "years",
  minYears: "min. {n} years of experience",
};

export type TextKey = keyof typeof en;

const hr: Record<TextKey, string> = {
  langPrompt: en.langPrompt,

  rolePrompt: "Jeste li *skiper* koji traži angažman ili *charter tvrtka* koja traži skipera?",
  btnSkipper: "⛵ Skiper sam",
  btnCharter: "🏢 Charter tvrtka",

  skipperIntro:
    "Odlično! Provest ću vas kroz CV u {n} kratkih koraka.\n\n" +
    "Vaši podaci spremaju se samo radi spajanja s charter ponudama i charter tvrtki se šalju tek kad " +
    "prihvatite njezinu ponudu. Upišite *IZBORNIK* za opcije ili *OBRIŠI* za brisanje svih podataka.",
  charterIntro:
    "Odlično! Prvo nekoliko podataka o tvrtki, zatim sam upit.\n\n" +
    "Upit ide svim skiperima iz baze koji mu odgovaraju, a CV svakog koji prihvati stiže vam ovdje. " +
    "Upišite *IZBORNIK* za opcije ili *OBRIŠI* za brisanje podataka.",

  progress: "({i}/{n})",
  hintSkip: "Pošaljite *-* za preskakanje.",
  hintMulti: "Odgovorite brojevima, npr. *1, 3*",
  hintDate: "Format: DD.MM.GGGG",
  hintChoose: "Odaberi",
  hintEditCancel: "Upišite *IZBORNIK* za odustajanje.",

  errText: "Molim odgovorite tekstualnom porukom.",
  errRequired: "Molim upišite odgovor.",
  errLong: "Molim do {max} znakova.",
  errNumber: "Molim pošaljite broj između {min} i {max}.",
  errEmail: "To ne izgleda kao e-mail adresa.",
  errDate: "Molim pošaljite datum kao DD.MM.GGGG, npr. 12.07.2027.",
  errPast: "Taj datum je već prošao.",
  errCheckout: "Check-out mora biti nakon check-ina ({date}).",
  errChoice: "Molim odaberite jednu od opcija.",
  errMulti: "Molim odgovorite brojevima opcija, npr. 1, 3.",

  cvSaved: "✅ CV je spremljen! Kad stigne charter upit koji odgovara vašem profilu, poslat ću vam ga ovdje.",
  updated: "✅ Ažurirano.",
  cvTitle: "📄 *Vaš CV*",
  cvIncomplete: "CV još nije dovršen — nastavimo.",

  menuText: "Što želite napraviti?",
  menuButton: "Izbornik",
  menuOffersActive: "Ponude: aktivne ✅",
  menuOffersPaused: "Ponude: pauzirane ⏸",
  rowShowCv: "Prikaži moj CV",
  rowEditCv: "Uredi moj CV",
  rowPause: "Pauziraj ponude",
  rowResume: "Nastavi ponude",
  rowNewOffer: "Novi upit za skipera",
  rowMyOffers: "Moji upiti",
  rowCompany: "Podaci o tvrtki",
  rowLang: "Jezik / Language",
  rowDelete: "Obriši moje podatke",
  paused: "⏸ Pauzirano. Nećete primati ponude dok ih ne uključite u izborniku.",
  resumed: "▶️ Ponovno ćete primati ponude.",

  editPick: "Koji dio CV-a želite promijeniti?",
  editButton: "Polja",

  offerHeader: "⛵ *Nova charter ponuda #{id}*",
  offerFooter: "Ako prihvatite, vaš CV i broj telefona šalju se charter tvrtki, koja će vas kontaktirati izravno.",
  btnAccept: "✅ Prihvaćam",
  btnDecline: "❌ Odbijam",
  btnEditCv: "✏️ Uredi CV",
  accepted: "✅ Prijavili ste se na ponudu #{id}. CV je poslan charter tvrtki — kontaktirat će vas izravno. Sretno!",
  declined: "U redu, odbili ste ponudu #{id}. I dalje ćete primati nove ponude.",
  alreadyAccepted: "Ponudu #{id} ste već prihvatili.",
  offerGone: "Nažalost, ponuda #{id} više nije dostupna.",
  noticeOffer: "nova charter ponuda #{id}: {dates}, {base}",

  confirmOffer: "Molim provjerite upit:\n\n{summary}\n\nPoslati ga svim skiperima koji odgovaraju?",
  btnSend: "📤 Pošalji",
  btnRestart: "🔁 Ispočetka",
  btnCancel: "✖️ Odustani",
  offerSent: "📤 Upit #{id} poslan je skiperima koji mu odgovaraju (*{n}*). CV svakog skipera koji prihvati stiže vam ovdje.",
  offerNoMatch:
    "Upit #{id} je spremljen, ali trenutno mu ne odgovara nijedan skiper. Novi skiperi koji odgovaraju primit će ga " +
    "automatski dok je otvoren. Manje traženih jezika ili iskustva proširuje pretragu.",
  draftCancelled: "Upit je odbačen.",
  myOffersEmpty: "Još nemate upita.",
  myOffersText: "Vaši zadnji upiti:",
  myOffersButton: "Upiti",
  offerStats: "Poslano {sent} · ✅ {acc} prihvatilo · ❌ {dec} odbilo · ⏳ {wait} čeka",
  offerClosedTag: "🔒 Zatvoren",
  btnClose: "🔒 Zatvori upit",
  btnMenu: "Izbornik",
  closed: "🔒 Upit #{id} je zatvoren. Skiperi se više ne mogu prijaviti.",
  cvForCharter: "🧑‍✈️ *Skiper je prihvatio vaš upit #{id}* ({dates}, {base})",
  contactSkipper: "Kontakt: https://wa.me/{phone}",
  noticeCv: "skiper je prihvatio vaš upit #{id}",

  adminNewOffer: "📥 Novi upit #{id} od {company} → poslan skiperima: {n}.\n\n{summary}",
  adminAccepted: "✅ {name} prihvatio je upit #{id} ({company}).",
  noticeAdmin: "aktivnost na upitu #{id}",

  deleteConfirm: "Ovo trajno briše sve vaše podatke (CV, upite). Jeste li sigurni?",
  btnDeleteYes: "🗑 Da, obriši",
  btnDeleteNo: "Ne",
  deleted: "🗑 Svi vaši podaci su obrisani. Pošaljite bilo koju poruku za ponovni početak.",
  error: "⚠️ Nešto je pošlo po zlu. Pokušajte ponovno ili upišite IZBORNIK.",
  fallback: "Upišite *IZBORNIK* za opcije.",

  years: "god.",
  minYears: "min. {n} god. iskustva",
};

const dict: Record<Lang, Record<TextKey, string>> = { en, hr };

export function asLang(v: unknown): Lang {
  return LANGS.includes(v as Lang) ? (v as Lang) : "en";
}

export function t(lang: Lang, key: TextKey, vars: Record<string, string | number> = {}): string {
  return dict[lang][key].replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

// Typed commands, matched without case or diacritics.
const COMMANDS: Record<string, "menu" | "delete"> = {
  menu: "menu", izbornik: "menu", meni: "menu", start: "menu", help: "menu", pomoc: "menu",
  delete: "delete", obrisi: "delete", izbrisi: "delete",
};

export function command(text: string): "menu" | "delete" | null {
  const k = text.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  return COMMANDS[k] ?? null;
}
