import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Dict, Locale } from "@/lib/i18n";

export default function Header({ dict, locale }: { dict: Dict; locale: Locale }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-5 sm:px-8">
        <Logo locale={locale} />

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 text-sm text-mist md:flex">
            <a href="#how" className="transition-colors hover:text-sea">
              {dict.nav.howItWorks}
            </a>
            <a href="#skippers" className="transition-colors hover:text-sea">
              {dict.nav.forSkippers}
            </a>
            <a href="#contact" className="transition-colors hover:text-sea">
              {dict.nav.contact}
            </a>
          </nav>
          <LanguageSwitcher current={locale} />
        </div>
      </div>
    </header>
  );
}
