import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Inventory",
};

export default function AdminInventoryPage() {
  return (
    <main className="admin-content mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-surface p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Inventory Shortcut
        </p>
        <h1 className="mt-2 text-4xl text-forest">Product Inventory</h1>
        <p className="mt-2 text-sm text-foreground/75">
          Inventory controls now live on the main admin dashboard under Product Inventory.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/admin#product-inventory"
            className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-forest transition-colors hover:bg-gold hover:text-white"
          >
            Open Product Inventory
          </Link>
          <Link
            href="/admin"
            className="rounded-xl border border-forest/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
          >
            Back to Main Admin
          </Link>
        </div>
      </header>
    </main>
  );
}
