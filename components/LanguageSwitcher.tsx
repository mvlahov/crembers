import Link from "next/link";
import { dictionaries, locales, type Locale } from "@/lib/i18n";

// Fixed route per locale: en → "/", hr → "/hr", de → "/de".
function pathFor(locale: Locale): string {
  return locale === "en" ? "/" : `/${locale}`;
}

export default function LanguageSwitcher({ current }: { current: Locale }) {
  return (
    <nav aria-label="Language" className="flex items-center gap-1 text-sm">
      {locales.map((loc, i) => {
        const active = loc === current;
        return (
          <span key={loc} className="flex items-center">
            {i > 0 && <span className="px-0.5 text-mist/40">·</span>}
            <Link
              href={pathFor(loc)}
              hrefLang={loc}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "font-semibold text-ink"
                  : "text-mist transition-colors hover:text-sea"
              }
            >
              {dictionaries[loc].label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
