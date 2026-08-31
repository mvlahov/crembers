// Central brand + contact constants. Change here, it propagates everywhere.

export const site = {
  name: "Crembers",
  // Slogan is the same on every language, it is never translated.
  slogan: "Match. Confirm. Sail.",
  domain: "crembers.com",
  email: "info@crembers.com",
  // WhatsApp number in international format, digits only (no +, no spaces).
  // Empty string hides the WhatsApp button. Fill when the line is live.
  whatsapp: "",
  // Legal holder shown in the footer. Empty until confirmed.
  legalHolder: "",
  // Base of operations shown in copy.
  region: "Croatia · Adriatic",
} as const;

// Helper: build a wa.me link only when a number is configured.
export function whatsappLink(text?: string): string | null {
  if (!site.whatsapp) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${site.whatsapp}${q}`;
}
