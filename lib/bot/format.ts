// Turning DB rows into readable WhatsApp text.
import { BOAT_OPTIONS, CV_FORM, LANGUAGE_OPTIONS, LICENCE_OPTIONS, OFFER_FORM, optionLabel, showDate, type Field } from "./forms";
import { t, type Lang } from "./texts";

export type Skipper = {
  phone: string;
  full_name: string | null;
  birth_year: number | null;
  nationality: string | null;
  email: string | null;
  languages: string[];
  licence: string | null;
  experience_years: number | null;
  boat_types: string[];
  base: string | null;
  about: string | null;
  complete: boolean;
  active: boolean;
};

export type Offer = {
  id: number;
  charter_phone: string | null;
  company: string | null;
  base: string;
  check_in: string;
  check_out: string;
  boat_type: string;
  boat: string | null;
  languages: string[];
  min_experience: number;
  fee: string | null;
  notes: string | null;
  status: "open" | "closed";
};

const label = (form: Field[], key: string, lang: Lang) => form.find((f) => f.key === key)!.label[lang];
const langs = (ids: string[], lang: Lang) => ids.map((id) => optionLabel(LANGUAGE_OPTIONS, id, lang)).join(", ");

export const dates = (o: Pick<Offer, "check_in" | "check_out">) => `${showDate(o.check_in)} – ${showDate(o.check_out)}`;

export function formatCv(s: Skipper, lang: Lang): string {
  const L = (k: string) => label(CV_FORM, k, lang);
  const head = [s.birth_year, s.nationality].filter(Boolean).join(", ");
  return [
    `👤 *${s.full_name ?? "—"}*${head ? ` (${head})` : ""}`,
    `📞 +${s.phone}`,
    s.email && `✉️ ${s.email}`,
    `🗣 ${L("languages")}: ${langs(s.languages, lang) || "—"}`,
    s.licence && `🪪 ${L("licence")}: ${optionLabel(LICENCE_OPTIONS, s.licence, lang)}`,
    s.experience_years != null && `🧭 ${L("experience_years")}: ${s.experience_years} ${t(lang, "years")}`,
    `⛵ ${L("boat_types")}: ${s.boat_types.map((b) => optionLabel(BOAT_OPTIONS, b, lang)).join(", ") || "—"}`,
    s.base && `📍 ${L("base")}: ${s.base}`,
    s.about && `📝 ${s.about}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// Request details. `forCharter` adds the company line (skippers don't see who is asking).
export function formatOffer(o: Omit<Offer, "id" | "charter_phone" | "status">, lang: Lang, forCharter = false): string {
  const L = (k: string) => label(OFFER_FORM, k, lang);
  return [
    forCharter && o.company && `🏢 ${o.company}`,
    `📍 ${o.base}`,
    `📅 ${dates(o)}`,
    `⛵ ${optionLabel(BOAT_OPTIONS, o.boat_type, lang)}${o.boat ? `, ${o.boat}` : ""}`,
    o.languages.length && `🗣 ${L("languages")}: ${langs(o.languages, lang)}`,
    o.min_experience > 0 && `🧭 ${t(lang, "minYears", { n: o.min_experience })}`,
    o.fee && `💶 ${o.fee}`,
    o.notes && `📝 ${o.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
}
