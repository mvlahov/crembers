// Central brand + contact constants. Change here, it propagates everywhere.

export const site = {
  name: "Crembers",
  // Slogan is the same on every language, it is never translated.
  slogan: "Match. Confirm. Sail.",
  domain: "crembers.com",
  email: "info@crembers.com",
  // WhatsApp number in international format, digits only (no +, no spaces).
  // Empty string hides the WhatsApp button. Fill when the line is live.
  whatsapp: "385916035450",
  // Legal holder shown in the footer — same data as tuedos/lib/legal.ts.
  // Meta (WhatsApp business verification) checks that the brand site names the
  // registered business behind it.
  legalHolder: "Tuedos, obrt za usluge, vl. Mislav Vlahov",
  legalAddress: "Trnjanska cesta 71, 10000 Zagreb, Hrvatska",
  legalMbo: "97795950",
  // OIB (11 digits). Empty hides it.
  legalOib: "",
  legalSite: "https://tuedos.com",
  // Base of operations shown in copy.
  region: "Croatia · Adriatic",
} as const;

// Helper: build a wa.me link only when a number is configured.
export function whatsappLink(text?: string): string | null {
  if (!site.whatsapp) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${site.whatsapp}${q}`;
}
