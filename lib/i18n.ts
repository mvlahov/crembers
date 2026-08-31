// All copy lives here, one dictionary per language. The layout components read
// from a Dict and never hold hard-coded text, so adding or editing a language
// is a change in this one file.

export type Locale = "en" | "hr" | "de";

export const locales: Locale[] = ["en", "hr", "de"];

export type Step = { title: string; body: string };

export type Side = {
  kicker: string;
  title: string;
  body: string;
  points: string[];
  cta: string;
};

export type Dict = {
  htmlLang: string;
  label: string; // shown in the language switcher
  nav: {
    howItWorks: string;
    forSkippers: string;
    contact: string;
  };
  hero: {
    intro: string;
    ctaNeed: string;
    ctaSkipper: string;
    note: string;
  };
  client: Side;
  skipper: Side;
  how: {
    kicker: string;
    title: string;
    clientTitle: string;
    clientSteps: Step[];
    skipperTitle: string;
    skipperSteps: Step[];
  };
  why: {
    title: string;
    points: { title: string; body: string }[];
  };
  contact: {
    kicker: string;
    title: string;
    body: string;
    emailCta: string;
    whatsappCta: string;
  };
  footer: {
    tagline: string;
    rights: string;
  };
};

const en: Dict = {
  htmlLang: "en",
  label: "EN",
  nav: {
    howItWorks: "How it works",
    forSkippers: "For skippers",
    contact: "Contact",
  },
  hero: {
    intro:
      "The fastest way to put the right skipper on the right boat. Tell us what you need — we match it against our crew database and bring you only the people who are ready to sail.",
    ctaNeed: "I need a skipper",
    ctaSkipper: "I'm a skipper",
    note: "Adriatic-based · offshore and charter · sail and power",
  },
  client: {
    kicker: "For owners, charters & agencies",
    title: "I need a skipper",
    body:
      "Skip the group chats and the endless CVs. Send your requirements once and let the database do the shortlisting.",
    points: [
      "Match on the things that matter: licences, endorsements, hull type, waters, languages, dates.",
      "The top five matches are contacted automatically — you only hear from the ones who say yes.",
      "Their full CVs land in your inbox. You compare and choose.",
    ],
    cta: "Send a request",
  },
  skipper: {
    kicker: "For captains & crew",
    title: "I'm a skipper",
    body:
      "One profile, kept current, and the jobs come to you. No cold applications, no scrolling listings.",
    points: [
      "Build a structured profile — licences, sea time, boats, languages, availability.",
      "Get a WhatsApp the moment a job fits your profile.",
      "Tap yes and your CV goes straight to the client. That's it.",
    ],
    cta: "Join the database",
  },
  how: {
    kicker: "How it works",
    title: "From request to handshake, mostly automatic.",
    clientTitle: "If you need a skipper",
    clientSteps: [
      {
        title: "Tell us what you need",
        body:
          "Boat, dates, waters, licences, languages — the criteria that make or break the fit.",
      },
      {
        title: "We match the database",
        body:
          "Every profile is ranked against your criteria. The top five get a WhatsApp asking if they're interested.",
      },
      {
        title: "Meet the ones who say yes",
        body:
          "Everyone who taps yes has their CV sent straight to you. You compare and pick.",
      },
    ],
    skipperTitle: "If you are a skipper",
    skipperSteps: [
      {
        title: "Join the database",
        body: "One structured profile so the right jobs can find you.",
      },
      {
        title: "Get pinged when a job fits",
        body: "A WhatsApp message the moment a request matches your profile.",
      },
      {
        title: "Tap yes",
        body: "Your CV goes to the client. No cold applications.",
      },
    ],
  },
  why: {
    title: "Why Crembers",
    points: [
      {
        title: "Fit, not volume",
        body:
          "Matching is on hard criteria — licences, endorsements, waters — so you compare people who actually qualify.",
      },
      {
        title: "Only warm leads",
        body:
          "You never chase anyone. Every CV you receive comes from a skipper who already said yes to your job.",
      },
      {
        title: "Built by people who sail",
        body:
          "Run from the Adriatic by a licensed skipper who knows what a good match on the water really means.",
      },
    ],
  },
  contact: {
    kicker: "Get started",
    title: "Ready when you are.",
    body:
      "Tell us whether you're looking for a skipper or looking to be found. We'll take it from there.",
    emailCta: "Email us",
    whatsappCta: "WhatsApp",
  },
  footer: {
    tagline: "Skipper matching for the Adriatic and beyond.",
    rights: "All rights reserved.",
  },
};

const hr: Dict = {
  htmlLang: "hr",
  label: "HR",
  nav: {
    howItWorks: "Kako radi",
    forSkippers: "Za skipere",
    contact: "Kontakt",
  },
  hero: {
    intro:
      "Najbrži način da pravi skiper dođe na pravi brod. Recite nam što trebate — usporedimo to s našom bazom posade i dovedemo vam samo one koji su spremni isploviti.",
    ctaNeed: "Trebam skipera",
    ctaSkipper: "Ja sam skiper",
    note: "S Jadrana · charter i offshore · jedra i motor",
  },
  client: {
    kicker: "Za vlasnike, chartere i agencije",
    title: "Trebam skipera",
    body:
      "Preskočite grupne razgovore i hrpe životopisa. Pošaljite zahtjev jednom i pustite bazu da napravi uži izbor.",
    points: [
      "Uparivanje po onome što je bitno: dozvole, ovlaštenja, tip broda, akvatorij, jezici, datumi.",
      "Prvih pet podudaranja kontaktiramo automatski — javljaju vam se samo oni koji pristanu.",
      "Njihovi cjeloviti životopisi stižu vam u inbox. Vi uspoređujete i birate.",
    ],
    cta: "Pošalji zahtjev",
  },
  skipper: {
    kicker: "Za zapovjednike i posadu",
    title: "Ja sam skiper",
    body:
      "Jedan profil, održavan, i poslovi dolaze vama. Bez hladnih prijava, bez prelistavanja oglasa.",
    points: [
      "Izgradite strukturiran profil — dozvole, plovidbeni staž, brodovi, jezici, dostupnost.",
      "Dobijete WhatsApp čim se pojavi posao koji odgovara vašem profilu.",
      "Kliknete 'da' i vaš životopis ide ravno naručitelju. To je sve.",
    ],
    cta: "Upiši se u bazu",
  },
  how: {
    kicker: "Kako radi",
    title: "Od upita do rukovanja, uglavnom automatski.",
    clientTitle: "Ako trebate skipera",
    clientSteps: [
      {
        title: "Recite nam što trebate",
        body:
          "Brod, datumi, akvatorij, dozvole, jezici — kriteriji o kojima ovisi podudaranje.",
      },
      {
        title: "Uspoređujemo s bazom",
        body:
          "Svaki profil rangira se prema vašim kriterijima. Prvih pet dobiva WhatsApp s pitanjem jesu li zainteresirani.",
      },
      {
        title: "Upoznajte one koji pristanu",
        body:
          "Svima koji kliknu 'da' životopis šaljemo ravno vama. Vi uspoređujete i birate.",
      },
    ],
    skipperTitle: "Ako ste skiper",
    skipperSteps: [
      {
        title: "Upišite se u bazu",
        body: "Jedan strukturiran profil da vas pravi poslovi pronađu.",
      },
      {
        title: "Javimo se kad posao odgovara",
        body: "WhatsApp poruka čim se upit poklopi s vašim profilom.",
      },
      {
        title: "Kliknete 'da'",
        body: "Vaš životopis ide naručitelju. Bez hladnih prijava.",
      },
    ],
  },
  why: {
    title: "Zašto Crembers",
    points: [
      {
        title: "Podudaranje, ne količina",
        body:
          "Uparujemo po tvrdim kriterijima — dozvole, ovlaštenja, akvatorij — pa uspoređujete ljude koji stvarno kvalificiraju.",
      },
      {
        title: "Samo topli kontakti",
        body:
          "Nikoga ne jurite. Svaki životopis koji primite dolazi od skipera koji je već rekao 'da' vašem poslu.",
      },
      {
        title: "Rade ga ljudi koji plove",
        body:
          "Vodi ga s Jadrana licencirani skiper koji zna što dobro podudaranje na moru zaista znači.",
      },
    ],
  },
  contact: {
    kicker: "Krenimo",
    title: "Spremni kad i vi.",
    body:
      "Javite nam tražite li skipera ili želite da vas pronađu. Ostalo je na nama.",
    emailCta: "Pošalji e-mail",
    whatsappCta: "WhatsApp",
  },
  footer: {
    tagline: "Uparivanje skipera za Jadran i šire.",
    rights: "Sva prava pridržana.",
  },
};

const de: Dict = {
  htmlLang: "de",
  label: "DE",
  nav: {
    howItWorks: "So funktioniert's",
    forSkippers: "Für Skipper",
    contact: "Kontakt",
  },
  hero: {
    intro:
      "Der schnellste Weg, den richtigen Skipper auf das richtige Boot zu bringen. Sagen Sie uns, was Sie brauchen — wir gleichen es mit unserer Crew-Datenbank ab und bringen Ihnen nur die, die bereit sind auszulaufen.",
    ctaNeed: "Ich brauche einen Skipper",
    ctaSkipper: "Ich bin Skipper",
    note: "Von der Adria · Charter und Offshore · Segel und Motor",
  },
  client: {
    kicker: "Für Eigner, Charter & Agenturen",
    title: "Ich brauche einen Skipper",
    body:
      "Sparen Sie sich die Gruppenchats und die endlosen Lebensläufe. Schicken Sie Ihre Anforderungen einmal und lassen Sie die Datenbank die Vorauswahl treffen.",
    points: [
      "Abgleich nach dem, worauf es ankommt: Scheine, Befähigungen, Bootstyp, Reviere, Sprachen, Termine.",
      "Die fünf besten Treffer werden automatisch kontaktiert — Sie hören nur von denen, die zusagen.",
      "Ihre vollständigen Lebensläufe landen in Ihrem Postfach. Sie vergleichen und wählen.",
    ],
    cta: "Anfrage senden",
  },
  skipper: {
    kicker: "Für Kapitäne & Crew",
    title: "Ich bin Skipper",
    body:
      "Ein Profil, aktuell gehalten, und die Jobs kommen zu Ihnen. Keine kalten Bewerbungen, kein Durchscrollen von Anzeigen.",
    points: [
      "Erstellen Sie ein strukturiertes Profil — Scheine, Seemeilen, Boote, Sprachen, Verfügbarkeit.",
      "Erhalten Sie eine WhatsApp, sobald ein Job zu Ihrem Profil passt.",
      "Tippen Sie auf Ja und Ihr Lebenslauf geht direkt an den Kunden. Das war's.",
    ],
    cta: "In die Datenbank eintragen",
  },
  how: {
    kicker: "So funktioniert's",
    title: "Von der Anfrage zum Handschlag, größtenteils automatisch.",
    clientTitle: "Wenn Sie einen Skipper brauchen",
    clientSteps: [
      {
        title: "Sagen Sie uns, was Sie brauchen",
        body:
          "Boot, Termine, Reviere, Scheine, Sprachen — die Kriterien, die über die Passung entscheiden.",
      },
      {
        title: "Wir gleichen die Datenbank ab",
        body:
          "Jedes Profil wird nach Ihren Kriterien bewertet. Die besten fünf erhalten eine WhatsApp mit der Frage, ob sie interessiert sind.",
      },
      {
        title: "Lernen Sie die kennen, die zusagen",
        body:
          "Wer auf Ja tippt, dessen Lebenslauf schicken wir direkt an Sie. Sie vergleichen und wählen.",
      },
    ],
    skipperTitle: "Wenn Sie Skipper sind",
    skipperSteps: [
      {
        title: "In die Datenbank eintragen",
        body: "Ein strukturiertes Profil, damit die richtigen Jobs Sie finden.",
      },
      {
        title: "Benachrichtigung, wenn es passt",
        body: "Eine WhatsApp, sobald eine Anfrage zu Ihrem Profil passt.",
      },
      {
        title: "Auf Ja tippen",
        body: "Ihr Lebenslauf geht an den Kunden. Keine kalten Bewerbungen.",
      },
    ],
  },
  why: {
    title: "Warum Crembers",
    points: [
      {
        title: "Passung, nicht Masse",
        body:
          "Abgeglichen wird nach harten Kriterien — Scheine, Befähigungen, Reviere — damit Sie Menschen vergleichen, die wirklich qualifiziert sind.",
      },
      {
        title: "Nur warme Kontakte",
        body:
          "Sie laufen niemandem hinterher. Jeder Lebenslauf kommt von einem Skipper, der Ihrem Job bereits zugesagt hat.",
      },
      {
        title: "Von Leuten gebaut, die segeln",
        body:
          "Betrieben von der Adria aus, von einem lizenzierten Skipper, der weiß, was eine gute Passung auf dem Wasser bedeutet.",
      },
    ],
  },
  contact: {
    kicker: "Loslegen",
    title: "Bereit, wenn Sie es sind.",
    body:
      "Sagen Sie uns, ob Sie einen Skipper suchen oder gefunden werden möchten. Den Rest übernehmen wir.",
    emailCta: "E-Mail schreiben",
    whatsappCta: "WhatsApp",
  },
  footer: {
    tagline: "Skipper-Vermittlung für die Adria und darüber hinaus.",
    rights: "Alle Rechte vorbehalten.",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, hr, de };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
