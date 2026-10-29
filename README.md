# Crembers

Landing page for **crembers.com** — skipper matching for the Adriatic and beyond.
A request comes in, it is matched against a database of skipper CVs, every
matching skipper is asked on WhatsApp whether they're interested, and everyone
who says yes has their CV sent to whoever made the request.

This repository holds the **landing page** and the **WhatsApp bot** (CV database,
matching, messaging) — see [WhatsApp bot](#whatsapp-bot) below.

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

1. Landing copy still says "the top five matches are contacted" — the bot now
   contacts every match; align the text (or cap the broadcast).
2. Set `site.whatsapp` in `lib/site.ts` once the number is live on the API.
3. Legal holder in `lib/site.ts`, privacy policy and terms before collecting data.

## WhatsApp bot

Everything happens in WhatsApp chats with one number; there is no web form and
no third-party automation service. Own logic in `lib/bot/`, own Postgres database.

**Skipper:** writes to the number → picks a language (EN / HR) → "I'm a skipper" →
fills the CV in 10 steps → waits. When a matching request comes in they get it
with three buttons: **Accept** (CV + phone go to the charter company), **Decline**,
**Edit CV** (then the offer is shown again). The menu has: show / edit CV,
pause offers, language, delete my data.

**Charter company:** writes to the number → language → "Charter company" →
company name, contact, email (once) → the request in 9 steps (base, check-in,
check-out, boat type, model, required languages, min. experience, fee, notes) →
checks the summary → **Send**. The request goes at once to *every* skipper whose
CV matches, and the company receives the CV of each one who accepts, as they accept.
The menu has: new request, my requests (with accepted / declined / waiting counts,
and closing a request), company details, language, delete my data.

**Matching** (`MATCH` in `lib/bot/engine.ts`): CV complete, offers not paused,
speaks *all* required languages, has driven that boat type, at least the minimum
years of experience. A skipper who joins (or edits the CV, or un-pauses) while a
matching request is still open receives it too. Requests close when the company
closes them or on the check-in date.

Typed commands in any state: `MENU` / `IZBORNIK`, `DELETE` / `OBRIŠI`.

### Where things live

```
app/api/whatsapp/route.ts   webhook (Meta calls it for every incoming message)
lib/bot/
  engine.ts      conversation flow, matching, broadcasting
  forms.ts       the CV / company / request questions + answer validation
  texts.ts       every bot message, EN + HR
  format.ts      how a CV and a request look as text
  outbound.ts    24h window handling + outbox
  whatsapp.ts    Cloud API client, webhook parsing, signature check
  db.ts          Postgres connection
db/schema.sql    tables (run with npm run db:migrate)
scripts/         local chat simulator and end-to-end test
```

To change a question, add a language or a licence / boat type, edit `forms.ts` and
`texts.ts` — the flow adapts. A new CV field also needs a column in `db/schema.sql`.

### WhatsApp rules that shape the design

- **24-hour window.** You can only send free-form messages to someone who wrote to
  the number in the last 24 hours. Offers to skippers and CVs to companies often
  fall outside it, so the bot then sends one approved **template** ("You have a
  new update from Crembers: … [Open]") and keeps the real messages in the `outbox`
  table. When the person taps *Open* (or writes anything), the queued messages are
  delivered. Templates are the only part that costs money (Meta bills per template
  message; replies within the 24h window are free).
- **The number.** A number used by the Cloud API cannot at the same time be a normal
  WhatsApp account on a phone. Either dedicate the number to the API, or use it in
  the **WhatsApp Business app** and connect it to the API via *coexistence*
  (then you keep seeing the chats in the app).

### Setup (one time)

1. **Database (free):** create a Postgres database on [Neon](https://neon.tech)
   (or Vercel → Storage → Neon, or Supabase). Copy the connection string.
2. `cp .env.example .env.local`, put the connection string in `DATABASE_URL`, then
   `npm run db:migrate` to create the tables.
3. **Meta:** on developers.facebook.com create an app of type *Business*, add the
   **WhatsApp** product, add and verify your phone number, create a *System User*
   with a permanent token (permissions `whatsapp_business_messaging`,
   `whatsapp_business_management`). Fill in `WHATSAPP_TOKEN`,
   `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET` and a made-up
   `WHATSAPP_VERIFY_TOKEN`.
4. **Template:** in WhatsApp Manager → Message templates create `crembers_update`,
   category *Utility*, in **English (en)** and **Croatian (hr)**:
   - EN body: `You have a new update from Crembers: {{1}}. Tap the button to see it.`
   - HR body: `Imate novu obavijest od Crembersa: {{1}}. Dodirnite gumb za prikaz.`
   - one **Quick reply** button: `Open` / `Otvori`
5. **Vercel:** add all variables from `.env.example` to the project, deploy.
6. **Webhook:** in the app → WhatsApp → Configuration set the callback URL to
   `https://crembers.com/api/whatsapp`, the verify token from step 3, and
   subscribe to the **messages** field.

Your data lives in your own database — browse it in the Neon console (tables
`skippers`, `charters`, `offers`, `offer_recipients`).

### Trying it without WhatsApp

With any Postgres in `DATABASE_URL` (a local one is fine):

```bash
npm run bot:chat
```

Then type messages as different people, e.g. `385911111111: hi`, and tap buttons by
typing their id in brackets, e.g. `[role:skipper]` or `[offer:accept:1]`.

`npm run bot:test` runs the full skipper + charter scenario end to end.
**It wipes the database in `DATABASE_URL`**, so it only runs against `localhost`
(or with `ALLOW_WIPE=1`).
