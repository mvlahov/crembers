import Logo from "./Logo";
import { site } from "@/lib/site";
import type { Dict, Locale } from "@/lib/i18n";

export default function Footer({ dict, locale }: { dict: Dict; locale: Locale }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/5 bg-foam">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="space-y-2">
          <Logo locale={locale} />
          <p className="max-w-sm text-sm text-mist">{dict.footer.tagline}</p>
        </div>
        <div className="text-sm text-mist sm:text-right">
          <a
            href={`mailto:${site.email}`}
            className="font-medium text-sea transition-colors hover:text-deep"
          >
            {site.email}
          </a>
          <p className="mt-2">
            © {year} {site.legalHolder || site.name}. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
