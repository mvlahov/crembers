import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin/auth";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Inbox", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <div className="flex min-h-screen flex-col bg-foam">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold tracking-tight text-ink">
            Crembers <span className="font-normal text-mist">· Inbox</span>
          </Link>
          {admin && (
            <form action={logout}>
              <button className="text-sm text-mist hover:text-ink">Odjava</button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-5">{children}</main>
    </div>
  );
}
