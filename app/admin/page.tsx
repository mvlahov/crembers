import Link from "next/link";
import AutoRefresh from "@/components/admin/AutoRefresh";
import { requireAdmin } from "@/lib/admin/auth";
import { listConversations, type Filter } from "@/lib/admin/data";
import { shortTime } from "@/lib/admin/time";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Svi" },
  { id: "skipper", label: "Skiperi" },
  { id: "charter", label: "Charter tvrtke" },
  { id: "human", label: "Preuzeti" },
];

const ROLE: Record<string, string> = { skipper: "Skiper", charter: "Charter" };

export default async function Inbox({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireAdmin();
  const { f } = await searchParams;
  const filter = (FILTERS.some((x) => x.id === f) ? f : "all") as Filter;
  const rows = await listConversations(filter);

  return (
    <div className="space-y-4">
      <AutoRefresh />
      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((x) => (
          <Link
            key={x.id}
            href={x.id === "all" ? "/admin" : `/admin?f=${x.id}`}
            className={`rounded-full px-4 py-1.5 text-sm ${x.id === filter ? "bg-ink text-white" : "bg-white text-ink/80 hover:bg-white/60"}`}
          >
            {x.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-mist">Još nema razgovora.</p>
      ) : (
        <ul className="divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          {rows.map((r) => (
            <li key={r.phone}>
              <Link href={`/admin/${r.phone}`} className="flex items-start gap-3 px-4 py-3 hover:bg-foam">
                <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${r.unread ? "bg-sea" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`truncate ${r.unread ? "font-semibold" : "font-medium"}`}>
                      {r.display ?? r.name ?? `+${r.phone}`}
                    </span>
                    {r.role && <span className="rounded bg-foam px-1.5 text-xs text-mist">{ROLE[r.role]}</span>}
                    {r.human && <span className="rounded bg-sand/15 px-1.5 text-xs text-sand">Preuzet</span>}
                    <span className="ml-auto shrink-0 text-xs text-mist">{shortTime(r.last_at)}</span>
                  </div>
                  <p className="truncate text-sm text-mist">
                    {r.last_author !== "user" && (r.last_author === "admin" ? "Ti: " : "Bot: ")}
                    {r.last_body.split("\n")[0]}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
