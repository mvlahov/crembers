"use client";
import { useRef, useState, useTransition } from "react";
import { reply } from "@/app/admin/actions";

export default function ReplyForm({ phone, open }: { phone: string; open: boolean }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () =>
    start(async () => {
      const res = await reply(phone, text);
      if (res.error) setError(res.error);
      else {
        setText("");
        setError(undefined);
        ref.current?.focus();
      }
    });

  if (!open)
    return (
      <p className="rounded-xl bg-sand/10 px-4 py-3 text-sm text-ink/80">
        Prošlo je više od 24 sata od zadnje poruke ove osobe, pa joj WhatsApp ne dopušta slobodnu poruku. Možeš odgovoriti
        čim se ona ponovno javi.
      </p>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) submit();
      }}
      className="space-y-2"
    >
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (text.trim() && !pending) submit();
            }
          }}
          rows={2}
          placeholder="Napiši odgovor… (Enter šalje, Shift+Enter novi red)"
          className="min-h-[3rem] flex-1 resize-y rounded-xl border border-ink/15 px-3 py-2 text-[15px] focus:border-sea focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-deep disabled:opacity-40"
        >
          {pending ? "Šaljem…" : "Pošalji"}
        </button>
      </div>
      <p className="text-xs text-mist">Slanjem poruke preuzimaš razgovor: bot ovoj osobi ne odgovara dok ga ne vratiš.</p>
    </form>
  );
}
