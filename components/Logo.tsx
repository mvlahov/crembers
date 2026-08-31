import Link from "next/link";
import { Helm } from "./icons";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

export default function Logo({ locale }: { locale: Locale }) {
  const home = locale === "en" ? "/" : `/${locale}`;
  return (
    <Link
      href={home}
      className="group inline-flex items-center gap-2.5 text-ink"
      aria-label={`${site.name} — home`}
    >
      <Helm className="h-7 w-7 text-sea transition-transform duration-500 group-hover:rotate-45" />
      <span className="text-lg font-semibold tracking-tight">{site.name}</span>
    </Link>
  );
}
