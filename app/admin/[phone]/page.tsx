import Link from "next/link";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/admin/AutoRefresh";
import ReplyForm from "@/components/admin/ReplyForm";
import { requireAdmin } from "@/lib/admin/auth";
import { getConversation, markRead } from "@/lib/admin/data";
import { fullTime } from "@/lib/admin/time";
import { dates, formatCv } from "@/lib/bot/format";
import { BOAT_OPTIONS, optionLabel } from "@/lib/bot/forms";
import { setHuman } from "../actions";

const STATUS: Record<string, string> = { sent: "⏳ čeka", accepted: "✅ prihvatio", declined: "❌ odbio" };

// WhatsApp-style *bold* → <strong>, keeping everything else as plain text.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
        /^\*[^*\n]+\*$/.test(part) ? <strong key={i}>{part.slice(1, -1)}</strong> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

export default async function Conversation({ params }: { params: Promise<{ phone: string }> }) {
  await requireAdmin();
  const { phone } = await params;
  if (!/^\d{6,15}$/.test(phone)) notFound();
  const conv = await getConversation(phone);
  if (!conv) notFound();
  await markRead(phone);
  const { contact: c, messages, skipper, charter, offers } = conv;
  const title = skipper?.full_name ?? charter?.company ?? c.name ?? `+${c.phone}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <AutoRefresh />
      <section className="flex h-[calc(100dvh-6.5rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <Link href="/admin" className="text-mist hover:text-ink" aria-label="Natrag">
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold">{title}</h1>
            <a href={`https://wa.me/${c.phone}`} className="text-sm text-mist hover:text-sea">
              +{c.phone}
            </a>
          </div>
          <form action={setHuman.bind(null, c.phone, !c.human)}>
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                c.human ? "bg-sea text-white hover:bg-deep" : "border border-ink/15 text-ink hover:bg-foam"
              }`}
            >
              {c.human ? "↩︎ Vrati botu" : "✋ Preuzmi razgovor"}
            </button>
          </form>
        </div>

        {c.human && (
          <p className="bg-sand/10 px-4 py-2 text-sm text-ink/80">Razgovor je preuzet — bot ovoj osobi ne odgovara.</p>
        )}

        {/* column-reverse keeps the view scrolled to the newest message */}
        <ol className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto px-4 py-4">
          {messages.length === 0 && <li className="text-sm text-mist">Nema spremljenih poruka.</li>}
          {[...messages].reverse().map((m) => (
            <li key={m.id} className={`flex ${m.direction === "in" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-[15px] ${
                  m.direction === "in" ? "bg-foam text-ink" : m.author === "admin" ? "bg-sea text-white" : "bg-sea/10 text-ink"
                }`}
              >
                <Rich text={m.body} />
                <div className={`mt-1 text-right text-[11px] ${m.author === "admin" ? "text-white/70" : "text-mist"}`}>
                  {m.author === "bot" ? "bot · " : m.author === "admin" ? "ti · " : ""}
                  {fullTime(m.created_at)}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="border-t border-ink/10 p-3">
          <ReplyForm phone={c.phone} open={c.window_open} />
          {c.window_open && c.window_closes && (
            <p className="mt-1 text-xs text-mist">Možeš pisati slobodno do {fullTime(c.window_closes)}.</p>
          )}
        </div>
      </section>

      <aside className="space-y-4 text-sm">
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <h2 className="mb-2 font-semibold">Profil</h2>
          <p className="text-mist">
            {c.role === "skipper" ? "Skiper" : c.role === "charter" ? "Charter tvrtka" : "Još nije odabrao ulogu"}
            {c.lang && ` · ${c.lang.toUpperCase()}`}
            {c.state === "form" && " · ispunjava obrazac"}
          </p>
          {skipper && (
            <div className="mt-3 whitespace-pre-wrap">
              <Rich text={formatCv(skipper, "hr")} />
              {!skipper.complete && <p className="mt-2 text-sand">CV nije dovršen.</p>}
              {!skipper.active && <p className="mt-2 text-sand">Ponude pauzirane.</p>}
            </div>
          )}
          {charter && (
            <div className="mt-3 space-y-0.5">
              <p className="font-medium">{charter.company}</p>
              <p>{charter.contact_name}</p>
              <p>{charter.email}</p>
            </div>
          )}
        </div>

        {offers.length > 0 && (
          <div className="rounded-2xl border border-ink/10 bg-white p-4">
            <h2 className="mb-2 font-semibold">{c.role === "charter" ? "Upiti" : "Primljene ponude"}</h2>
            <ul className="space-y-2">
              {offers.map((o) => (
                <li key={o.id}>
                  <span className="font-medium">#{o.id}</span> {o.base} · {dates(o)} · {optionLabel(BOAT_OPTIONS, o.boat_type, "hr")}
                  <br />
                  <span className="text-mist">
                    {c.role === "charter"
                      ? `poslano ${o.sent} · ✅ ${o.acc} · ❌ ${o.dec}${o.status === "closed" ? " · zatvoren" : ""}`
                      : STATUS[o.recipient_status ?? ""] ?? o.recipient_status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
