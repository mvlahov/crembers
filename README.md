# Crembers

Landing page for **crembers.com** — skipper matching for the Adriatic and beyond.
A request comes in, it is matched against a database of skipper CVs, the top five
are asked on WhatsApp whether they're interested, and everyone who says yes has
their CV sent to whoever made the request.

This repository is the **landing page only**. The matching engine, the CV
database and the WhatsApp automation are not part of it yet.

Built on the same stack as `plutamo` and `elementame`: Next.js (App Router) +
Tailwind, content and translations kept as TypeScript data in `lib/`.

## Run locally

```bash
sh setup.sh      # installs dependencies
npm run dev      # http://localhost:3000
```

Languages: `/` (EN), `/hr`, `/de`.

## Where things live

```
app/
  layout.tsx        root layout, metadata
  page.tsx          EN home
  hr/page.tsx       HR home
  de/page.tsx       DE home
  icon.svg          favicon (ship's wheel)
  sitemap.ts robots.ts
components/
  Header, Footer, HomePage, Logo, LanguageSwitcher, HeroArt, icons
lib/
  site.ts           name, slogan, domain, email, WhatsApp, legal holder
  i18n.ts           all copy, one dictionary per language (en / hr / de)
```

## Editing content

- **Text** — everything is in `lib/i18n.ts`. Edit one dictionary; the layout
  never holds hard-coded strings, so a new language is a change in that one file.
- **Brand / contact** — `lib/site.ts`. Set `whatsapp` (international format,
  digits only) to reveal the WhatsApp button; set `legalHolder` for the footer.
- **Slogan** — `site.slogan` (`Match. Confirm. Sail.`) is the same on every
  language and is never translated.

## Known limitations

- `<html lang>` is fixed to `en` (single root layout), same as plutamo. Content
  on `/hr` and `/de` is translated; `hreflang` alternates are set in metadata.
- No form yet — the CTAs point to email (and WhatsApp when configured). Wiring a
  real request form is the next step, together with the matching backend.

## Deploy

Vercel, production branch `main`, same as plutamo/elementame.

## Next steps

1. Request form (owner side) → feeds the matching engine.
2. Skipper sign-up form → writes into the CV database.
3. Matching + WhatsApp automation (the actual product).
4. Legal holder in `lib/site.ts`, privacy policy and terms before collecting data.
