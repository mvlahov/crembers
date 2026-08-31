import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { getDict } from "@/lib/i18n";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  description:
    "Crembers bringt den richtigen Skipper auf das richtige Boot. Schicken Sie Ihre Anforderungen, wir durchsuchen unsere Crew-Datenbank, und nur segelbereite Skipper melden sich bei Ihnen.",
  alternates: { canonical: "/de" },
  openGraph: {
    title: `${site.name} — ${site.slogan}`,
    description: "Skipper-Vermittlung für die Adria und darüber hinaus.",
    url: `https://${site.domain}/de`,
  },
};

export default function Page() {
  return <HomePage dict={getDict("de")} locale="de" />;
}
