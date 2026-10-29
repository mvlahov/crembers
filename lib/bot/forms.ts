// Step-by-step forms (skipper CV, charter company, skipper request) as data.
// The engine asks one field at a time; parse() validates the answer.
import { t, type L10n, type Lang, type TextKey } from "./texts";
import type { Out } from "./whatsapp";

export type Option = { id: string; label: L10n };
type Kind = "text" | "int" | "email" | "date" | "choice" | "multi";
type Draft = Record<string, unknown>;

export type Field = {
  key: string;
  kind: Kind;
  label: L10n; // short name, used in CVs, summaries and the edit list
  prompt: L10n; // the question
  optional?: boolean;
  min?: number;
  max?: number;
  maxLen?: number;
  options?: Option[];
  check?: (value: unknown, draft: Draft, lang: Lang) => string | null; // cross-field validation
};

export const LANGUAGE_OPTIONS: Option[] = [
  { id: "en", label: { en: "English", hr: "Engleski" } },
  { id: "de", label: { en: "German", hr: "Njemački" } },
  { id: "it", label: { en: "Italian", hr: "Talijanski" } },
  { id: "hr", label: { en: "Croatian", hr: "Hrvatski" } },
  { id: "fr", label: { en: "French", hr: "Francuski" } },
  { id: "es", label: { en: "Spanish", hr: "Španjolski" } },
  { id: "nl", label: { en: "Dutch", hr: "Nizozemski" } },
  { id: "pl", label: { en: "Polish", hr: "Poljski" } },
  { id: "cs", label: { en: "Czech", hr: "Češki" } },
  { id: "sl", label: { en: "Slovenian", hr: "Slovenski" } },
  { id: "hu", label: { en: "Hungarian", hr: "Mađarski" } },
  { id: "ru", label: { en: "Russian", hr: "Ruski" } },
];

export const BOAT_OPTIONS: Option[] = [
  { id: "sail", label: { en: "Sailboat", hr: "Jedrilica" } },
  { id: "cat", label: { en: "Catamaran", hr: "Katamaran" } },
  { id: "motor", label: { en: "Motor yacht", hr: "Motorna jahta" } },
  { id: "gulet", label: { en: "Gulet", hr: "Gulet" } },
];

export const LICENCE_OPTIONS: Option[] = [
  { id: "hr_b", label: { en: "Boat leader B (HR)", hr: "Voditelj brodice B" } },
  { id: "yacht", label: { en: "Yacht master ≤100 GT (HR)", hr: "Zapovjednik jahte ≤100 BT" } },
  { id: "icc", label: { en: "ICC", hr: "ICC" } },
  { id: "rya", label: { en: "RYA Yachtmaster", hr: "RYA Yachtmaster" } },
  { id: "other", label: { en: "Other", hr: "Ostalo" } },
];

const thisYear = new Date().getFullYear();

export const CV_FORM: Field[] = [
  { key: "full_name", kind: "text", maxLen: 80, label: { en: "Name", hr: "Ime" }, prompt: { en: "What is your *full name*?", hr: "Kako se zovete (*ime i prezime*)?" } },
  { key: "birth_year", kind: "int", min: 1940, max: thisYear - 18, label: { en: "Born", hr: "Rođen/a" }, prompt: { en: "Your *year of birth*?", hr: "*Godina rođenja*?" } },
  { key: "nationality", kind: "text", maxLen: 40, label: { en: "Nationality", hr: "Državljanstvo" }, prompt: { en: "Your *nationality*?", hr: "Vaše *državljanstvo*?" } },
  { key: "email", kind: "email", label: { en: "Email", hr: "E-mail" }, prompt: { en: "Your *email* address?", hr: "Vaša *e-mail* adresa?" } },
  { key: "languages", kind: "multi", options: LANGUAGE_OPTIONS, label: { en: "Languages", hr: "Jezici" }, prompt: { en: "Which *languages* do you speak?", hr: "Koje *jezike* govorite?" } },
  { key: "licence", kind: "choice", options: LICENCE_OPTIONS, label: { en: "Licence", hr: "Dozvola" }, prompt: { en: "Your highest *skipper licence*?", hr: "Vaša najviša *skiperska dozvola*?" } },
  { key: "experience_years", kind: "int", min: 0, max: 60, label: { en: "Experience", hr: "Iskustvo" }, prompt: { en: "How many *years of experience* as a skipper?", hr: "Koliko *godina iskustva* imate kao skiper?" } },
  { key: "boat_types", kind: "multi", options: BOAT_OPTIONS, label: { en: "Boats", hr: "Brodovi" }, prompt: { en: "Which *boat types* can you skipper?", hr: "Koje *vrste brodova* vozite?" } },
  { key: "base", kind: "text", maxLen: 60, label: { en: "Base", hr: "Baza" }, prompt: { en: "Where are you *based* (town / marina)?", hr: "Gdje ste *bazirani* (grad / marina)?" } },
  { key: "about", kind: "text", maxLen: 500, optional: true, label: { en: "About", hr: "O meni" }, prompt: { en: "A few words *about you* (routes, references, certificates)?", hr: "Nekoliko riječi *o sebi* (rute, reference, certifikati)?" } },
];

export const CHARTER_FORM: Field[] = [
  { key: "company", kind: "text", maxLen: 80, label: { en: "Company", hr: "Tvrtka" }, prompt: { en: "Your *company name*?", hr: "*Naziv tvrtke*?" } },
  { key: "contact_name", kind: "text", maxLen: 80, label: { en: "Contact", hr: "Kontakt" }, prompt: { en: "Your *name* (contact person)?", hr: "Vaše *ime* (kontakt osoba)?" } },
  { key: "email", kind: "email", label: { en: "Email", hr: "E-mail" }, prompt: { en: "Company *email*?", hr: "*E-mail* tvrtke?" } },
];

export const OFFER_FORM: Field[] = [
  { key: "base", kind: "text", maxLen: 80, label: { en: "Base", hr: "Baza" }, prompt: { en: "Charter *base / marina*?", hr: "*Baza / marina* chartera?" } },
  { key: "check_in", kind: "date", label: { en: "Check-in", hr: "Check-in" }, prompt: { en: "*Check-in* date?", hr: "Datum *check-ina*?" } },
  {
    key: "check_out", kind: "date", label: { en: "Check-out", hr: "Check-out" }, prompt: { en: "*Check-out* date?", hr: "Datum *check-outa*?" },
    check: (v, d, lang) => (String(v) <= String(d.check_in) ? t(lang, "errCheckout", { date: showDate(String(d.check_in)) }) : null),
  },
  { key: "boat_type", kind: "choice", options: BOAT_OPTIONS, label: { en: "Boat type", hr: "Vrsta broda" }, prompt: { en: "*Boat type*?", hr: "*Vrsta broda*?" } },
  { key: "boat", kind: "text", maxLen: 80, optional: true, label: { en: "Boat", hr: "Brod" }, prompt: { en: "*Boat model / length* (e.g. Lagoon 42)?", hr: "*Model / duljina broda* (npr. Lagoon 42)?" } },
  { key: "languages", kind: "multi", options: LANGUAGE_OPTIONS, label: { en: "Languages", hr: "Jezici" }, prompt: { en: "Which *languages* must the skipper speak? (all of them are required)", hr: "Koje *jezike* skiper mora govoriti? (traže se svi odabrani)" } },
  { key: "min_experience", kind: "int", min: 0, max: 60, label: { en: "Min. experience", hr: "Min. iskustvo" }, prompt: { en: "*Minimum years* of skipper experience? (0 = any)", hr: "*Minimalno godina* skiperskog iskustva? (0 = bilo koje)" } },
  { key: "fee", kind: "text", maxLen: 80, optional: true, label: { en: "Fee", hr: "Honorar" }, prompt: { en: "Skipper *fee* (e.g. 1200 EUR/week)?", hr: "*Honorar* skipera (npr. 1200 EUR/tjedan)?" } },
  { key: "notes", kind: "text", maxLen: 500, optional: true, label: { en: "Notes", hr: "Napomene" }, prompt: { en: "Anything else the skipper should know?", hr: "Još nešto što skiper treba znati?" } },
];

export const FORMS = { cv: CV_FORM, charter: CHARTER_FORM, offer: OFFER_FORM } as const;
export type FormId = keyof typeof FORMS;

export const showDate = (iso: string) => iso.split("-").reverse().join(".");

export function optionLabel(options: Option[] | undefined, id: string, lang: Lang): string {
  return options?.find((o) => o.id === id)?.label[lang] ?? id;
}

// The question for one field, as a WhatsApp message.
export function ask(field: Field, lang: Lang, progress?: { i: number; n: number }, extra?: TextKey): Out {
  const lines = [(progress ? t(lang, "progress", progress) + " " : "") + field.prompt[lang]];
  const opts = field.options ?? [];
  if (field.kind === "multi") {
    lines.push("", ...opts.map((o, i) => `${i + 1}. ${o.label[lang]}`), "", t(lang, "hintMulti"));
  }
  if (field.kind === "date") lines.push(t(lang, "hintDate"));
  if (field.optional) lines.push(t(lang, "hintSkip"));
  if (extra) lines.push(t(lang, extra));
  const text = lines.join("\n");

  if (field.kind === "choice" && opts.length <= 3)
    return { type: "buttons", text, buttons: opts.map((o) => ({ id: `choice:${o.id}`, title: o.label[lang] })) };
  if (field.kind === "choice")
    return { type: "list", text, button: t(lang, "hintChoose"), rows: opts.map((o) => ({ id: `choice:${o.id}`, title: o.label[lang] })) };
  return { type: "text", text };
}

type Parsed = { ok: true; value: unknown } | { ok: false; error: string };

function matchOption(opts: Option[], token: string): string | undefined {
  const n = Number(token);
  if (Number.isInteger(n) && n >= 1 && n <= opts.length) return opts[n - 1].id;
  const k = token.toLowerCase();
  return opts.find((o) => o.id === k || Object.values(o.label).some((l) => l.toLowerCase() === k))?.id;
}

function parseDate(s: string): string | null {
  let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})\.?$/);
  let [d, mo, y] = m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  if (!m && (m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) [y, mo, d] = [+m[1], +m[2], +m[3]];
  if (!m) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

export function parse(field: Field, input: { text?: string; reply?: string }, lang: Lang, draft: Draft): Parsed {
  const err = (key: TextKey, vars?: Record<string, string | number>): Parsed => ({ ok: false, error: t(lang, key, vars) });
  const opts = field.options ?? [];
  const text = (input.text ?? "").trim();

  let value: unknown;
  if (field.kind === "choice") {
    const id = input.reply?.startsWith("choice:") ? input.reply.slice(7) : matchOption(opts, text);
    if (!id || !opts.some((o) => o.id === id)) return err("errChoice");
    value = id;
  } else {
    if (input.text === undefined) return err("errText");
    if (field.optional && (text === "-" || text === "–")) return { ok: true, value: null };
    if (!text) return err("errRequired");
    switch (field.kind) {
      case "text":
        if (text.length > (field.maxLen ?? 200)) return err("errLong", { max: field.maxLen ?? 200 });
        value = text;
        break;
      case "int": {
        const n = Number(text.replace(/[^\d-]/g, ""));
        if (!/\d/.test(text) || !Number.isInteger(n) || n < field.min! || n > field.max!)
          return err("errNumber", { min: field.min!, max: field.max! });
        value = n;
        break;
      }
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) return err("errEmail");
        value = text.toLowerCase();
        break;
      case "date": {
        const iso = parseDate(text);
        if (!iso) return err("errDate");
        if (iso < new Date().toISOString().slice(0, 10)) return err("errPast");
        value = iso;
        break;
      }
      case "multi": {
        const ids = text.split(/[\s,;]+/).filter(Boolean).map((tok) => matchOption(opts, tok));
        if (!ids.length || ids.some((id) => !id)) return err("errMulti");
        value = [...new Set(ids as string[])];
        break;
      }
    }
  }
  const problem = field.check?.(value, draft, lang);
  return problem ? { ok: false, error: problem } : { ok: true, value };
}
