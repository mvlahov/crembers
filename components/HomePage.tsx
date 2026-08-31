import Header from "./Header";
import Footer from "./Footer";
import HeroArt from "./HeroArt";
import { ArrowRight, Check, Mail, WhatsApp, Helm } from "./icons";
import { site, whatsappLink } from "@/lib/site";
import type { Dict, Locale, Side, Step } from "@/lib/i18n";

function SideCard({ side, id, highlight }: { side: Side; id?: string; highlight?: boolean }) {
  return (
    <div
      id={id}
      className={`flex flex-col rounded-2xl border p-7 sm:p-8 ${
        highlight
          ? "border-sea/20 bg-white shadow-[0_1px_40px_-12px_rgba(18,85,126,0.25)]"
          : "border-ink/10 bg-white"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sea">
        {side.kicker}
      </span>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
        {side.title}
      </h3>
      <p className="mt-3 text-mist">{side.body}</p>
      <ul className="mt-6 space-y-3">
        {side.points.map((p, i) => (
          <li key={i} className="flex gap-3 text-[15px] text-ink/80">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-sea" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <a
        href="#contact"
        className="group mt-7 inline-flex items-center gap-2 self-start rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-deep"
      >
        {side.cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

function StepList({ title, steps }: { title: string; steps: Step[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <ol className="mt-5 space-y-5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sea/10 text-sm font-semibold text-sea">
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-mist">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HomePage({ dict, locale }: { dict: Dict; locale: Locale }) {
  const wa = whatsappLink();

  return (
    <>
      <Header dict={dict} locale={locale} />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-96 bg-gradient-to-b from-foam to-transparent" />
          <div className="mx-auto grid max-w-content items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sea">
                {site.region}
              </p>
              <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
                {site.slogan}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
                {dict.hero.intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-sea px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-deep"
                >
                  {dict.hero.ctaNeed}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#skippers"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-sea hover:text-sea"
                >
                  {dict.hero.ctaSkipper}
                </a>
              </div>
              <p className="mt-6 text-sm text-mist/80">{dict.hero.note}</p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroArt className="h-auto w-full max-w-sm" />
            </div>
          </div>
        </section>

        {/* TWO SIDES */}
        <section id="sides" className="bg-foam">
          <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-6 md:grid-cols-2">
              <SideCard side={dict.client} highlight />
              <SideCard side={dict.skipper} id="skippers" />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how">
          <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-24">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sea">
                {dict.how.kicker}
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {dict.how.title}
              </h2>
            </div>
            <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
              <StepList title={dict.how.clientTitle} steps={dict.how.clientSteps} />
              <StepList title={dict.how.skipperTitle} steps={dict.how.skipperSteps} />
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {dict.why.title}
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {dict.why.points.map((p, i) => (
                <div key={i}>
                  <Helm className="h-7 w-7 text-sand" />
                  <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact">
          <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-2xl rounded-3xl border border-ink/10 bg-foam px-6 py-12 text-center sm:px-12">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sea">
                {dict.contact.kicker}
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {dict.contact.title}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-mist">{dict.contact.body}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-sea px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-deep"
                >
                  <Mail className="h-4 w-4" />
                  {dict.contact.emailCta}
                </a>
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-sea hover:text-sea"
                  >
                    <WhatsApp className="h-4 w-4" />
                    {dict.contact.whatsappCta}
                  </a>
                )}
              </div>
              <p className="mt-6 text-sm text-mist">{site.email}</p>
            </div>
          </div>
        </section>
      </main>

      <Footer dict={dict} locale={locale} />
    </>
  );
}
