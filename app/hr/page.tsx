import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { getDict } from "@/lib/i18n";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  description:
    "Crembers uparuje pravog skipera s pravim brodom. Pošaljite zahtjev, pretražimo bazu posade, a jave vam se samo skiperi spremni za isplovljavanje.",
  alternates: { canonical: "/hr" },
  openGraph: {
    title: `${site.name} — ${site.slogan}`,
    description: "Uparivanje skipera za Jadran i šire.",
    url: `https://${site.domain}/hr`,
  },
};

export default function Page() {
  return <HomePage dict={getDict("hr")} locale="hr" />;
}
