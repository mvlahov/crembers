import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { e } = await searchParams;
  const configured = !!process.env.ADMIN_PASSWORD;
  return (
    <form action={login} className="mx-auto mt-16 max-w-sm space-y-4 rounded-2xl border border-ink/10 bg-white p-6">
      <h1 className="text-lg font-semibold">Prijava</h1>
      {!configured && <p className="text-sm text-red-700">ADMIN_PASSWORD nije postavljen u Vercelu.</p>}
      {e && <p className="text-sm text-red-700">Kriva lozinka.</p>}
      <input
        type="password"
        name="password"
        autoFocus
        required
        placeholder="Lozinka"
        className="w-full rounded-xl border border-ink/15 px-3 py-2 focus:border-sea focus:outline-none"
      />
      <button className="w-full rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white hover:bg-deep">Prijavi se</button>
    </form>
  );
}
