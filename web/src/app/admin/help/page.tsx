import { AdminHelpContent } from "@/components/admin-help-content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Help",
};

export default function AdminHelpPage() {
  return (
    <main className="admin-content mx-auto min-h-screen w-full max-w-7xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-white/90 p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Admin Help
        </p>
        <h1 className="mt-2 text-4xl text-forest">Help and Instructions</h1>
        <p className="mt-2 max-w-3xl text-sm text-foreground/75">
          Use this page when you want the full guide on phone, when you need to
          resume a section you were reading, or when you want a larger reading
          view than the desktop help panel.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/admin"
            className="rounded-xl border border-forest/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
          >
            Back to Main Admin
          </Link>
          <Link
            href="/admin/content"
            className="rounded-xl border border-forest/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
          >
            Open Content Editor
          </Link>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-rose/20 bg-white/90 p-6">
        <AdminHelpContent variant="page" />
      </section>
    </main>
  );
}
