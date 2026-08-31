import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: `${site.name} — ${site.slogan}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Crembers matches the right skipper to the right boat. Send your requirements, we search our crew database, and only skippers ready to sail reach you.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      hr: "/hr",
      de: "/de",
    },
  },
  openGraph: {
    title: `${site.name} — ${site.slogan}`,
    description:
      "Skipper matching for the Adriatic and beyond. Tell us what you need; the ones ready to sail come to you.",
    url: `https://${site.domain}`,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
